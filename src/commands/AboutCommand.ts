import { BaseCommand } from "../structures/BaseCommand";
import { Message, version } from "discord.js";
import { uptime as osUptime } from "os";
import { DefineCommand } from "../utils/decorators/DefineCommand";
import { createEmbed } from "../utils/createEmbed";
import { IAboutCommandData } from "../typings";

@DefineCommand({
    aliases: ["botinfo", "info", "stats"],
    name: "about",
    description: lang => lang.COMMAND_ABOUT_META_DESCRIPTION(),
    usage: () => "{prefix}about"
})
export class AboutCommand extends BaseCommand {
    public async execute(message: Message): Promise<void> {
        // TODO: Revamp About Command to use embed fields
        const data: IAboutCommandData = {
            stats: {
                channelCount: await this.client.util.getChannelsCount(),
                guildsCount: await this.client.util.getGuildsCount(),
                playersCount: await this.client.util.getTotalPlaying(),
                memory: this.getMemoryUsage(),
                uptimes: {
                    os: this.client.util.formatMS(osUptime() * 1000),
                    process: this.client.util.formatMS(process.uptime() * 1000),
                    bot: this.client.util.formatMS(this.client.uptime!)
                }
            },
            shard: {
                count: this.client.shard ? `${this.client.shard.count}` : this.client.lang.NOT_AVAILABLE(),
                id: this.client.shard ? `${this.client.shard.ids[0]}` : this.client.lang.NOT_AVAILABLE()
            },
            bot: {
                platform: process.platform,
                arch: process.arch,
                versions: {
                    nodejs: process.version,
                    discordjs: `v${version}`,
                    ffmpeg: `v${this.client.util.getFFmpegVersion().replaceAll("_", "-")}`,
                    // eslint-disable-next-line @typescript-eslint/no-base-to-string
                    ytdlp: (await this.client.ytdl("--version")).toString(),
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    bot: (await this.client.util.getPackageJSON()).version as string
                },
                opusEncoder: (await this.client.util.getOpusEncoderName()).replaceAll("_", "-")
            }
        };

        message.channel.send({
            embeds: [
                createEmbed("info", this.client.lang.COMMAND_ABOUT_EMBED_DESCRIPTION(data))
                    .setAuthor({ name: this.client.lang.COMMAND_ABOUT_EMBED_AUTHOR(this.client.user!.username) })
            ]
        }).catch(e => this.client.logger.error(e));
    }

    public getMemoryUsage(): NodeJS.MemoryUsage {
        return Object.fromEntries(Object.entries(process.memoryUsage()).map(([key, val]) => [key, this.client.util.bytesToSize(Number(val))])) as unknown as NodeJS.MemoryUsage;
    }
}
