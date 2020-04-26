/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-eval */
import BaseCommand from "../structures/BaseCommand";
import BotClient from "../structures/Jukebox";
import { IMessage } from "../typings";
import { MessageEmbed } from "discord.js";
import { request } from "https";

export default class EvalCommand extends BaseCommand {
    constructor(client: BotClient, readonly path: string) {
        super(client, path, {
            aliases: ["ev", "js-exec", "e", "evaluate"],
            cooldown: 0
        }, {
            name: "eval",
            description: "Only the bot owner can use this command.",
            usage: "{prefix}eval <some js code>"
        });
    }

    public async execute(message: IMessage, args: string[]): Promise<any> {
        const msg = message;
        const client = this.client;

        if (!client.config.owners.includes(msg.author.id)) return;

        const embed = new MessageEmbed()
            .setColor("#00FF00")
            .addField("Input", `\`\`\`js\n${args.join(" ")}\`\`\``);

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
                embed.addField("Output", `${hastebin}.js`);
            } else embed.addField("Output", `\`\`\`js\n${output}\`\`\``);
            message.channel.send(embed);
        } catch (e) {
            const error = this.clean(e);
            if (error.length > 1024) {
                const hastebin = await this.hastebin(error);
                embed.addField("Error", `${hastebin}.js`);
            } else embed.setColor("#FF0000").addField("Error", `\`\`\`js\n${error}\`\`\``);
            message.channel.send(embed);
        }

        return message;
    }

    private clean(text: string): string {
        if (typeof text === "string") {
            return text
                .replace(new RegExp(process.env.DISCORD_TOKEN!, "g"), "[REDACTED]")
                .replace(new RegExp(process.env.YT_API_KEY!, "g"), "[REDACTED]")
                .replace(/`/g, `\`${  String.fromCharCode(8203)}`).replace(/@/g, `@${  String.fromCharCode(8203)}`);
        } else return text;
    }

    private hastebin(text: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const req = request({ hostname: "bin.hzmi.xyz", path: "/documents", method: "POST", minVersion: "TLSv1.3" }, (res) => {
                let raw = "";
                res.on("data", chunk => raw += chunk);
                res.on("end", () => {
                    if (res.statusCode! >= 200 && res.statusCode! < 300) return resolve(`https://bin.hzmi.xyz/${JSON.parse(raw).key}`);
                    else return reject(`[hastebin] Error while trying to send data to https://bin.hzmi.xyz/documents, ${res.statusCode} ${res.statusMessage}`);
                });
            }).on("error", reject);
            req.write(typeof text === "object" ? JSON.stringify(text, null, 2) : text);
            req.end();
        });
    }
}
