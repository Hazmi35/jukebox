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
            id: songInfo.video_id,
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
            } catch (error) {
                message.guild!.setQueue(null);
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
            message.guild!.getQueue()!.songs.push(song);
            return message.channel.send(`Song **${song.title}** has been added to the queue`);
        }

        return message;
    }
    private play(guild: IGuild): any {
        const serverQueue = guild.getQueue()!;

        const song = serverQueue.songs[0];
        if (!song) {
            serverQueue.connection!.disconnect();
            return guild.setQueue(null);
        }

        serverQueue.connection!.voice.setSelfDeaf(true);
        const dispatcher = serverQueue.connection!.play(ytdl(song.url, ))
            .on("start", () => {
                this.client.log.info(`${this.client.shard ? `[Shard #${this.client.shard.ids}]` : ""} Song: ${song.title} started`);
                serverQueue.textChannel.send(`Start playing: **${song.title}**`);
            })
            .on("stop", () => {
                serverQueue.songs = [];
                guild.setQueue(serverQueue);
                dispatcher.end();
            })
            .on("skip", () => {
                dispatcher.end();
            })
            .on("setVolume", (volume: number) => {
                serverQueue.volume = volume;
                serverQueue.connection!.dispatcher.setVolumeLogarithmic(volume / 100);
                guild.setQueue(serverQueue);
            })
            .on("finish", () => {
                this.client.log.info(`${this.client.shard ? `[Shard #${this.client.shard.ids}]` : ""} Song: ${song.title} ended`);
                serverQueue.textChannel.send(`Stop playing: **${song.title}**`);
                serverQueue.songs.shift();
                this.play(guild);
            }).on("error", (err: Error) => {
                this.client.log.error("PLAY_ERROR: ", err);
            });

        dispatcher.setVolumeLogarithmic(serverQueue.volume / 100);
    }
}
