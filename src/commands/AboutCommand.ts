/* eslint-disable @typescript-eslint/no-unused-vars */
import BaseCommand from "../structures/BaseCommand";
import BotClient from "../structures/Jukebox";
import { Message, MessageEmbed } from "discord.js";
import { uptime as osUptime } from "os";
import { version } from "discord.js";

export default class PlayCommand extends BaseCommand {
    constructor(public client: BotClient, readonly path: string) {
        super(client, path, { aliases: ["botinfo"] }, {
            name: "about",
            description: "Send the bot's info",
            usage: "{prefix}about"
        });
    }
    public execute(message: Message, args: string[]): void { // TODO: Beautify this
        const embed = new MessageEmbed()
            .setAuthor(`${this.client.user!.username} - Just a simple Discord music bot.`)
            .setDescription(`
\`\`\`
Bot name: ${this.client.user!.username}
Users count: ${this.client.users.cache.size}
Channels count: ${this.client.channels.cache.filter(c => c.type !== "category" && c.type !== "dm").size}
Guilds count: ${this.client.guilds.cache.size}
Shards count: ${this.client.shard ? `${this.client.shard.count}` : "N/A"}
Shard ID: ${this.client.shard ? `${this.client.shard.ids}` : "N/A"}
Platform: ${process.platform}
Arch: ${process.arch}
OS Uptime: ${this.parseDur(osUptime() * 1000)}
Process Uptime: ${this.parseDur(Math.floor(process.uptime() * 1000))}
NodeJS version: v${process.version}
Bot Uptime: ${this.parseDur(this.client.uptime!)}
DiscordJS version: ${version}
Source code: https://github.com/Hazmi35/jukebox
\`\`\`
        `);
        message.channel.send(embed);
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
}