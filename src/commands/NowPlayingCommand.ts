import { BaseCommand } from "../structures/BaseCommand";
import { IMessage } from "../../typings";
import { DefineCommand } from "../utils/decorators/DefineCommand";
import { isMusicQueueExists } from "../utils/decorators/MusicHelper";
import { createEmbed } from "../utils/createEmbed";

@DefineCommand({
    aliases: ["np", "now-playing"],
    name: "nowplaying",
    description: "Send info about the current music player",
    usage: "{prefix}nowplaying"
})
export class NowPlayingCommand extends BaseCommand {
    @isMusicQueueExists()
    public execute(message: IMessage): any {
        const song = message.guild?.queue?.songs.first();
        return message.channel.send(
            createEmbed("info", `${message.guild?.queue?.playing ? "▶ Now playing:" : "⏸ Now playing (paused):"} ` +
                `**[${song?.title as string}](${song?.url as string})**`)
                .setThumbnail(song?.thumbnail as string)
        );
    }
}
