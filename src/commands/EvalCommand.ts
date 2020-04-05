/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-eval */
import BaseCommand from "../structures/BaseCommand";
import BotClient from "../structures/Jukebox";
import { IMessage, CommandComponent } from "../typings";
import { MessageEmbed } from "discord.js";
import { parse as parseUrl } from "url";

export default class EvalCommand extends BaseCommand {
    constructor(client: BotClient, readonly path: string) {
        super(client, path, {
            aliases: ["ev", "js-exec", "e", "evaluate"],
            cooldown: 0
        }, {
            name: "eval",
            description: "Only the developer can use this command.",
            usage: "{prefix}eval <some js code>"
        });
    }

    public async execute(message: IMessage, args: string[]): Promise<any> {
        const msg = message;
        const client = this.client;

        const embed = new MessageEmbed()
            .setColor("GREEN")
            .addField("Input", "```js\n" + args.join(" ") + "```");

        try {
            const code = args.slice(0).join(" ");
            if (!code) return message.channel.send("No js code was provided");
            let evaled = await eval(code);

            if (typeof evaled !== "string")
                evaled = require("util").inspect(evaled, {
                    depth: 0
                });

            const output = this.clean(evaled);
            if (output.length > 1024) {
                const hastebin = await this.hastebin(output);
                embed.addField("Output", hastebin);
            } else embed.addField("Output", "```js\n" + output + "```");
            message.channel.send(embed);
        } catch (e) {
            const error = this.clean(e);
            if (error.length > 1024) {
                const hastebin = await this.hastebin(error);
                embed.addField("Error", hastebin);
            } else embed.addField("Error", "```js\n" + error + "```");
            message.channel.send(embed);
        }

        return message;
    }

    private clean(text: string): string {
        if (typeof text === "string") {
            return text
                .replace(new RegExp(process.env.DISCORD_TOKEN!, "g"), "[REDACTED]")
                .replace(new RegExp(parseUrl(process.env.MONGODB_URI!).auth!, "g"), "[REDACTED]")
                .replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
        } else return text;
    }

    private async hastebin(text: string): Promise<string> {
        const { body } = await this.client.request.post("https://bin.hzmi.xyz/documents")
            .send(text);
        return `https://bin.hzmi.xyz/${body.key}`;
    }
}
