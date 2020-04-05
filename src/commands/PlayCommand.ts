/* eslint-disable @typescript-eslint/no-unused-vars */
import BaseCommand from "../structures/BaseCommand";
import BotClient from "../structures/Jukebox";
import ytdl from "ytdl-core";
import { IMessage, IServerQueue, ISong, IGuild } from "../typings";


export default class PlayCommand extends BaseCommand {
    constructor(public client: BotClient, readonly path: string) {
        super(client, path, {}, {
            name: "play",
            description: "Play some musics",
            "usage": "{prefix}play <yt video or playlist link / yt video name>"
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

        if (!message.guild!.getQueue()) {
            const queueConstruct: IServerQueue = {
                textChannel: message.channel,
                voiceChannel,
                connection: null,
                songs: [],
                volume: 100,
                playing: true
            };
            queueConstruct.songs.push(song);
            message.guild!.setQueue(queueConstruct);
            try {
                const connection = await voiceChannel.join();
                queueConstruct.connection = connection;
                this.play(message.guild!, queueConstruct.songs[0]);
                if (!voiceChannel.speakable) {
                    voiceChannel.leave();
                    return message.channel.send("I'm sorry but I can't speak in this voice channel. make sure I have the proper permissions");
                }
            } catch (error) {
                this.client.log.error("PLAY_COMMAND", error);
                message.guild!.setQueue(null);
                message.channel.send(`Error: Could not join the voice channel. reason: \`${error}\``);
                return undefined;
            }
        } else {
            message.guild!.getQueue()!.songs.push(song);
            return message.channel.send(`Song **${song.title}** has been added to the queue`);
        }

        return message;
    }
    private play(guild: IGuild, song: ISong): any {
        if (!song) {
            guild.getQueue()!.connection!.disconnect();
            return guild.setQueue(null);
        }

        guild.getQueue()!.connection!.voice.setSelfDeaf(true);
        const dispatcher = guild.getQueue()!.connection!.play(ytdl(song.url, ))
            .on("finish", () => {
                this.client.log.info("Song ended!");
                guild.getQueue()!.songs.shift();
                this.play(guild, guild.getQueue()!.songs[0]);
            }).on("error", (err: Error) => {
                this.client.log.error("PLAY_ERROR", err);
            });

        dispatcher.setVolumeLogarithmic(guild.getQueue()!.volume / 100);
    }
}
