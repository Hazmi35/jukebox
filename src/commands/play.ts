import BaseCommand from "../structures/BaseCommand";
import BotClient from "../structures/Client";
import { Message } from "discord.js";

export default class PlayCommand extends BaseCommand {
    constructor(public client: BotClient, readonly path: string) {
        super(client, path, {
            aliases: ["p", "addmusic", "play-music", "playmusic"]
        }, {
            name: "play",
            description: "Play some musics",
            "usage": "{prefix}play <yt video or playlist link / yt video name>"
        });
    }
    public run(message: Message): void {}
}