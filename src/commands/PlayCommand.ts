/* eslint-disable @typescript-eslint/no-unused-vars */
import BaseCommand from "../structures/BaseCommand";
import BotClient from "../structures/Jukebox";
import ytdl from "ytdl-core";
import { IMessage, ISong, IGuild, IServerQueue } from "../typings";
import { Collection } from "discord.js";
import SongManager from "../structures/SongManager";
import ServerQueue from "../structures/ServerQueue";


export default class PlayCommand extends BaseCommand {
    constructor(public client: BotClient, readonly path: string) {
        super(client, path, {}, {
            name: "play",
            description: "Play some musics",
            usage: "{prefix}play <yt video or playlist link / yt video name>"
        });
    }
    public async execute(message: IMessage, args: string[]): Promise<any> {
        const voiceChannel = message.member!.voice.channel;
        if (!voiceChannel) return message.channel.send("I'm sorry but you need to be in a voice channel to play music");
        if (!voiceChannel.joinable) return message.channel.send("I'm sorry but I can't connect to your voice channel, make sure I have the proper permissions!");

        if (!args[0]) return message.channel.send("Please give me the youtube link");
        const songInfo = await ytdl.getInfo(args[0]);
        const song: ISong = {
            title: songInfo.title,
            url: songInfo.video_url
        };
        if (!message.guild!.queue) {
            message.guild!.queue = new ServerQueue(message.channel, voiceChannel);
            message.guild!.queue.songs.addSong(song);
            try {
                const connection = await voiceChannel.join();
                message.guild!.queue.connection = connection;
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
        console.log(serverQueue);
        if (!song) {
            serverQueue.connection!.disconnect();
            return guild.queue = null;
        }

        serverQueue.connection!.voice.setSelfDeaf(true);
        const dispatcher = guild.queue!.connection!.play(ytdl(song.url))
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
