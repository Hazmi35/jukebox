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
                createEmbed("info", `
\`\`\`asciidoc
Cached users count  :: ${await this.client.util.getUsersCount()}
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
FFmpeg version      :: v${this.client.util.getFFmpegVersion()}
YTDL-Core version   :: v${(await this.client.util.getPackageJSON("ytdl-core")).version}
Opus Encoder        :: ${(await this.getOpusEncoderName())}
Bot Version         :: v${(await this.client.util.getPackageJSON()).version}

Source code         :: https://sh.hzmi.xyz/jukebox
\`\`\`
                        `).setAuthor(`${this.client.user?.username as string} - Just a simple Discord music bot.`)
            ]
        }).catch(e => this.client.logger.error("ABOUT_CMD_ERR:", e));
    }

    public async getOpusEncoderName(): Promise<string> {
        if (this.client.util.doesFFmpegHasLibOpus()) {
            return `ffmpeg libopus ${this.client.util.getFFmpegVersion()}`;
        }

        const list = ["@discordjs/opus", "opusscript"];
        const errorLog = [];
        for (const name of list) {
            try {
                await import(name); // Tries to import the module, if fails then the next line of code won't run
                const pkgMetadata = await this.client.util.getPackageJSON(name);
                return `${pkgMetadata.name} ${pkgMetadata.version}`;
            } catch (e) {
                errorLog.push(e);
            }
        }
        throw new Error(errorLog.join("\n"));
    }
}
