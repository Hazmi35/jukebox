/* eslint-disable @typescript-eslint/no-unused-vars */
import BaseCommand from "../structures/BaseCommand";
import BotClient from "../structures/Jukebox";
import ytdl from "ytdl-core";
import { IMessage, ISong, IGuild } from "../typings";


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
            message.guild!.constructQueue(message.channel, voiceChannel);
            message.guild!.getQueue()!.addSong(song);
            try {
                await message.guild!.getQueue()!.connect();
            } catch (error) {
<<<<<<< HEAD
                message.guild!.destroyQueue();
                this.client.log.error("PLAY_COMMAND: ", error);
=======
                message.guild!.setQueue(null);
                this.client.log.error("PLAY_COMMAND", error);
>>>>>>> parent of 1f5703d... New Features + Let's redesign the IServerQueue (not finished)
                message.channel.send(`Error: Could not join the voice channel. reason: \`${error}\``);
                return undefined;
            }
            this.play(message.guild!);
            if (!voiceChannel.speakable) {
                voiceChannel.leave();
                return message.channel.send("I'm sorry but I can't speak in this voice channel. make sure I have the proper permissions");
            }
        } else {
            message.guild!.getQueue()!.addSong(song);
            return message.channel.send(`Song **${song.title}** has been added to the queue`);
        }

        return message;
    }
<<<<<<< HEAD
=======
    private play(guild: IGuild): any {
        const song = guild.getQueue()!.songs[0];
        if (!song) {
            guild.getQueue()!.connection!.disconnect();
            return guild.setQueue(null);
        }

        guild.getQueue()!.connection!.voice.setSelfDeaf(true);
        const dispatcher = guild.getQueue()!.connection!.play(ytdl(song.url, ))
            .on("finish", () => {
                this.client.log.info("Song ended!");
                guild.getQueue()!.songs.shift();
                this.play(guild);
            }).on("error", (err: Error) => {
                this.client.log.error("PLAY_ERROR", err);
            });

        dispatcher.setVolumeLogarithmic(guild.getQueue()!.volume / 100);
    }
>>>>>>> parent of 1f5703d... New Features + Let's redesign the IServerQueue (not finished)
}
