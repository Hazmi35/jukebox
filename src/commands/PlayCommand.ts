/* eslint-disable @typescript-eslint/no-unused-vars */
import BaseCommand from "../structures/BaseCommand";
import BotClient from "../structures/Jukebox";
import ytdl from "ytdl-core";
import { IMessage, IServerQueue, ISong } from "../typings";


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
        const permissions = voiceChannel.permissionsFor(message.guild!.me!);
        if (!permissions!.has("CONNECT")) return message.channel.send("I'm sorry but I can't connect to your voice channel, make sure I have the proper permissions!");

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
            message.client.queue.set(message.guild!.id, queueConstruct);
            queueConstruct.songs.push(song);
            try {
                const connection = await voiceChannel.join();
                queueConstruct.connection = connection;
                this.play(message, queueConstruct.songs[0]);
                if (!permissions!.has("SPEAK")) {
                    voiceChannel.leave();
                    return message.channel.send("I'm sorry but I can't speak in this voice channel. make sure I have the proper permissions");
                }
            } catch (error) {
                this.client.log.error("PLAY_COMMAND: ", error);
                this.client.queue.delete(message.guild!.id);
                message.channel.send(`Error: Could not join the voice channel. reason: \`${error}\``);
                return undefined;
            }
        } else {
            message.guild!.getQueue()!.songs.push(song);
            return message.channel.send(`Song **${song.title}** has been added to the queue`);
        }

        return message;
    }
    private play(message: IMessage, song: ISong): void {
        if (!song) {
            message.guild!.getQueue()!.connection!.disconnect();
            this.client.queue.delete(message.guild!.id);
        }

        if (!message.guild!.getQueue()) return message.member!.voice.channel!.leave();

        message.guild!.getQueue()!.connection!.voice.setSelfDeaf(true);
        const dispatcher = message.guild!.getQueue()!.connection!.play(ytdl(song.url, ))
            .on("finish", () => {
                this.client.log.info("Song ended!");
                message.guild!.getQueue()!.songs.shift();
                this.play(message, message.guild!.getQueue()!.songs[0]);
            }).on("error", (err: Error) => {
                this.client.log.error("PLAY_ERROR: ", err);
            });

        dispatcher.setVolumeLogarithmic(message.guild!.getQueue()!.volume / 100);
    }
}
