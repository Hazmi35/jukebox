import { BaseCommand } from "../structures/BaseCommand";
import { Message, version } from "discord.js";
import { uptime as osUptime } from "os";
import { DefineCommand } from "../utils/decorators/DefineCommand";
import { createEmbed } from "../utils/createEmbed";

@DefineCommand({
    aliases: ["botinfo", "info", "stats"],
    name: "about",
    description: "Send the bot's info",
    usage: "{prefix}about"
})
export class AboutCommand extends BaseCommand {
    public async execute(message: Message): Promise<void> {
        message.channel.send({
            embeds: [
                createEmbed("info",
                    this.client.lang.COMMAND_ABOUT_EMBED_DESCRIPTION(
                        await this.client.util.getChannelsCount(),
                        await this.client.util.getGuildsCount(),
                        this.client.shard ? `${this.client.shard.count}` : this.client.lang.NOT_AVAILABLE(),
                        this.client.shard ? `${this.client.shard.ids[0]}` : this.client.lang.NOT_AVAILABLE(),
                        await this.client.util.getTotalPlaying(),
                        process.platform,
                        process.arch,
                        this.client.util.formatMS(osUptime() * 1000),
                        this.client.util.bytesToSize(process.memoryUsage().rss),
                        this.client.util.bytesToSize(process.memoryUsage().heapTotal),
                        this.client.util.bytesToSize(process.memoryUsage().heapUsed),
                        this.client.util.formatMS(process.uptime() * 1000),
                        this.client.util.formatMS(this.client.uptime!),
                        process.version,
                        `v${version}`,
                        `v${this.client.util.getFFmpegVersion().replaceAll("_", "-")}`,
                        (await this.client.ytdl("--version") as any).toString() as string,
                        (await this.client.util.getOpusEncoderName()).replaceAll("_", "-"),
                        (await this.client.util.getPackageJSON()).version as string
                    )).setAuthor(this.client.lang.COMMAND_ABOUT_EMBED_AUTHOR(this.client.user!.username))
            ]
        }).catch(e => this.client.logger.error("ABOUT_CMD_ERR:", e));
    }
}
