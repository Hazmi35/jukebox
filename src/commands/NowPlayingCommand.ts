import { BaseCommand } from "../structures/BaseCommand";
import { DefineCommand } from "../utils/decorators/DefineCommand";
import { isMusicQueueExists } from "../utils/decorators/MusicHelper";
import { createEmbed } from "../utils/createEmbed";
import { Message } from "discord.js";
import { loopMode, loopModeTypes } from "../constants/loopMode";
import { images } from "../constants/images";

@DefineCommand({
    aliases: ["np", "now-playing"],
    name: "nowplaying",
    description: "Send info about the current music player",
    usage: "{prefix}nowplaying"
})
export class NowPlayingCommand extends BaseCommand {
    @isMusicQueueExists()
    public execute(message: Message): any {
        const track = message.guild?.queue?.tracks.first();
        const embed = createEmbed("info",
            `${message.guild?.queue?.playing ? "▶ Now playing:" : "⏸ Now playing (paused):"} ` +
            `**[${track?.metadata.title as string}](${track?.metadata.url as string})**`)
            .setThumbnail(track?.metadata.thumbnail as string);

        if (message.guild?.queue?.loopMode !== loopMode.disable) embed.setFooter(`Repeating mode: ${loopModeTypes[message.guild!.queue!.loopMode]}`, images.info);
        return message.channel.send({ embeds: [embed] });
    }
}
