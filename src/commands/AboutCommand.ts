import BaseCommand from "../structures/BaseCommand";
import Jukebox from "../structures/Jukebox";
import { Message, MessageEmbed } from "discord.js";
import { uptime as osUptime } from "os";
import { version } from "discord.js";

export default class PlayCommand extends BaseCommand {
    constructor(public client: Jukebox, readonly path: string) {
        super(client, path, { aliases: ["botinfo", "info", "stats"] }, {
            name: "about",
            description: "Send the bot's info",
            usage: "{prefix}about"
        });
    }
    public async execute(message: Message): Promise<void> {
        message.channel.send(new MessageEmbed()
            .setAuthor(`${this.client.user!.username} - Just a simple Discord music bot.`)
            .setDescription(`
\`\`\`asciidoc
Users count         :: ${await this.client.getUsersCount()}
Channels count      :: ${await this.client.getChannelsCount()}
Guilds count        :: ${await this.client.getGuildsCount()}
Shards count        :: ${this.client.shard ? `${this.client.shard.count}` : "N/A"}
Shard ID            :: ${this.client.shard ? `${this.client.shard.ids}` : "N/A"}
Playing Music on    :: ${this.client.guilds.cache.filter((g: any) => g.queue !== null && g.queue.playing === true).size} guilds

Platform            :: ${process.platform}
Arch                :: ${process.arch}
OS Uptime           :: ${this.parseDur(osUptime() * 1000)}
Memory              :: ${this.bytesToSize(Math.round(process.memoryUsage().rss))}
Process Uptime      :: ${this.parseDur(Math.floor(process.uptime() * 1000))}
Bot Uptime          :: ${this.parseDur(this.client.uptime!)}

NodeJS version      :: ${process.version}
DiscordJS version   :: v${version}
Bot Version         :: v${require("../../package.json").version}

Source code         :: https://sh.hzmi.xyz/jukebox
\`\`\`
    `).setColor("#00FF00").setTimestamp());
    }
    private parseDur(ms: number): string {
        let seconds = ms / 1000;
        const days = parseInt((seconds / 86400).toString());
        seconds = seconds % 86400;
        const hours = parseInt((seconds / 3600).toString());
        seconds = seconds % 3600;
        const minutes = parseInt((seconds / 60).toString());
        seconds = parseInt((seconds % 60).toString());


        if (days) {
            return `${days} days ${hours} hours ${minutes} minutes ${seconds} seconds`;
        } else if (hours) {
            return `${hours} hours ${minutes} minutes ${seconds} seconds`;
        } else if (minutes) {
            return `${minutes} minutes ${seconds} seconds`;
        }
        return `${seconds} seconds`;
    }
    private bytesToSize(bytes: number): string { // Function From Rendang's util (https://github.com/Hazmi35/rendang)
        if (isNaN(bytes) && bytes != 0) throw new Error(`[bytesToSize] (bytes) Error: bytes is not a Number/Integer, received: ${typeof bytes}`);
        const sizes = ["B", "KiB", "MiB", "GiB", "TiB", "PiB"];
        if (bytes < 2 && bytes > 0) return `${bytes} Byte`;
        const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
        if (i == 0) return `${bytes} ${sizes[i]}`;
        if (sizes[i] === undefined) return `${bytes} ${sizes[sizes.length - 1]}`;
        return `${Number(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
    }
}