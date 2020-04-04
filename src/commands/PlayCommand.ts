/* eslint-disable @typescript-eslint/no-unused-vars */
import BaseCommand from "../structures/BaseCommand";
import BotClient from "../structures/Jukebox";
import { Message } from "discord.js";
import ytdl from "ytdl-core";


export default class PlayCommand extends BaseCommand {
    constructor(public client: BotClient, readonly path: string) {
        super(client, path, {}, {
            name: "play",
            description: "Play some musics",
            "usage": "{prefix}play <yt video or playlist link / yt video name>"
        });
    }
    public async execute(message: Message, args: string[]): Promise<any> {
        const voiceChannel = message.member!.voice.channel;
        if (!voiceChannel) return message.channel.send("I'm sorry but you need to be in a voice channel to play music");
        const permissions = voiceChannel.permissionsFor(message.guild!.me!);
        if (!permissions!.has("CONNECT")) return message.channel.send("I'm sorry but I can't connect to your voice channel, make sure I have the proper permissions!");
        try {
            const connection = await voiceChannel.join();
            connection.voice.setSelfDeaf(true);
            if (!permissions!.has("SPEAK")) {
                voiceChannel.leave();
                return message.channel.send("I'm sorry but I can't speak in this voice channel. make sure I have the proper permissions");
            }
            const dispatcher = connection.play(ytdl(args[0], { filter: "audioonly" }))
                .on("finish", () => {
                    this.client.log.info("Song ended!");
                    voiceChannel.leave();
                })
                .on("error", (err) => {
                    this.client.log.error("PLAY_COMMAND_DISPATCHER: ", err);
                });
            dispatcher.setVolumeLogarithmic(100 / 100);
        } catch (error) {
            this.client.log.error("PLAY_COMMAND: ", error);
            message.channel.send(`Error: Could not join the voice channel. reason: \`${error}\``);
            return undefined;
        }

        return message;
    }
}