/* eslint-disable @typescript-eslint/no-unused-vars */
import BaseCommand from "../structures/BaseCommand";
import BotClient from "../structures/Jukebox";
import ytdl from "ytdl-core";
import { IMessage, ISong, IGuild, IVoiceChannel } from "../typings";
import ServerQueue from "../structures/ServerQueue";
import { Util } from "discord.js";


export default class PlayCommand extends BaseCommand {
    constructor(public client: BotClient, readonly path: string) {
        super(client, path, {}, {
            name: "play",
            description: "Play some musics",
            usage: "{prefix}play <yt video or playlist link / yt video name>"
        });
    }
    public async execute(message: IMessage, args: string[]): Promise<any> {
        const voiceChannel = message.member!.voice.channel as IVoiceChannel;
        if (!voiceChannel) return message.channel.send("I'm sorry but you need to be in a voice channel to play music");
        if (!voiceChannel.joinable) return message.channel.send("I'm sorry but I can't connect to your voice channel, make sure I have the proper permissions!");

        if (!args[0]) return message.channel.send("Please give me the youtube link");
        const searchString = args.join(" ");
        const url = searchString.replace(/<(.+)>/g, "$1");

        try {
            var video = await this.client.youtube.getVideo(url);
        } catch (e) {
            try {
                const videos = await this.client.youtube.searchVideos(searchString, 1);
                var video = await this.client.youtube.getVideo(videos[0].url);
            } catch (err) {
                this.client.log.error("YT_SEARCH_ERR: ", err);
                return message.channel.send("I could not obtain any search results!");
            }
        }
        const song: ISong = { // TODO: Youtube search and song selection
            id: video.id,
            title: Util.escapeMarkdown(video.title),
            url: `https://youtube.com/watch?v=${video.id}`
        };
        if (!message.guild!.queue) {
            message.guild!.queue = new ServerQueue(message.channel, voiceChannel);
            message.guild!.queue.songs.addSong(song);
            try {
                await message.guild!.queue.voiceChannel!.join();
            } catch (error) {
                message.guild!.queue = null;
                this.client.log.error("PLAY_COMMAND: ", error);
                message.channel.send(`Error: Could not join the voice channel. reason: \`${error}\``);
                return undefined;
            }
            this.play(message.guild!);
            if (!voiceChannel.speakable) {
                voiceChannel.leave();
                return message.channel.send("I'm sorry but I can't speak in this voice channel. make sure I have the proper permissions");
            }
        } else {
            message.guild!.queue.songs.addSong(song);
            return message.channel.send(`Song **${song.title}** has been added to the queue`);
        }

        return message;
    }
    private play(guild: IGuild): any {
        const serverQueue = guild.queue!;
        const song = serverQueue.songs.first();
        if (!song) {
            serverQueue.connection!.disconnect();
            return guild.queue = null;
        }

        serverQueue.connection!.voice.setSelfDeaf(true);
        const dispatcher = guild.queue!.connection!.play(ytdl(song.url, { filter: "audioonly" }))
            .on("start", () => {
                serverQueue.playing = true;
                this.client.log.info(`${this.client.shard ? `[Shard #${this.client.shard.ids}]` : ""} Song: ${song.title} started`);
                serverQueue.textChannel!.send(`Start playing: **${song.title}**`);
            })
            .on("finish", () => {
                this.client.log.info(`${this.client.shard ? `[Shard #${this.client.shard.ids}]` : ""} Song: ${song.title} ended`);
                serverQueue.textChannel!.send(`Stop playing: **${song.title}**`);
                serverQueue.songs.deleteFirst();
                this.play(guild);
            }).on("error", (err: Error) => {
                this.client.log.error("PLAY_ERROR: ", err);
            });

        dispatcher.setVolumeLogarithmic(guild.queue!.volume / 100);
    }
}
