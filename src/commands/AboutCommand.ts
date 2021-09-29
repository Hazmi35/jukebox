import { BaseCommand } from "../structures/BaseCommand";
import { Message, version } from "discord.js";
import { uptime as osUptime } from "os";
import { DefineCommand } from "../utils/decorators/DefineCommand";
import { createEmbed } from "../utils/createEmbed";
import youtube from "youtube-dl-exec";

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
                createEmbed("info", `
\`\`\`asciidoc
Channels count      :: ${await this.client.util.getChannelsCount()}
Guilds count        :: ${await this.client.util.getGuildsCount()}
Shards count        :: ${this.client.shard ? `${this.client.shard.count}` : "N/A"}
Shard ID            :: ${this.client.shard ? `${this.client.shard.ids[0]}` : "N/A"}
Playing Music on    :: ${await this.client.util.getTotalPlaying()} guilds

Platform            :: ${process.platform}
Arch                :: ${process.arch}
OS Uptime           :: ${this.client.util.formatMS(osUptime() * 1000)}
Memory (RSS)        :: ${this.client.util.bytesToSize(process.memoryUsage().rss)} 
Memory (Heap Total) :: ${this.client.util.bytesToSize(process.memoryUsage().heapTotal)}
Memory (Heap Used)  :: ${this.client.util.bytesToSize(process.memoryUsage().heapUsed)}
Process Uptime      :: ${this.client.util.formatMS(process.uptime() * 1000)}
Bot Uptime          :: ${this.client.util.formatMS(this.client.uptime!)}

Node.js version     :: ${process.version}
Discord.js version  :: v${version}
FFmpeg version      :: v${this.client.util.getFFmpegVersion().replaceAll("_", "-")}
youtube-dl          :: ${process.env.YOUTUBE_DL_FILENAME!} ${(await youtube("--version") as any).toString()}
Opus Encoder        :: ${(await this.client.util.getOpusEncoderName()).replaceAll("_", "-")}
Bot Version         :: v${(await this.client.util.getPackageJSON()).version}

Source code         :: https://sh.hzmi.xyz/jukebox
\`\`\`
                        `).setAuthor(`${this.client.user?.username as string} - Just a simple Discord music bot.`)
            ]
        }).catch(e => this.client.logger.error("ABOUT_CMD_ERR:", e));
    }
}
