/* eslint-disable no-eval */
import { BaseCommand } from "../structures/BaseCommand";
import { Message } from "discord.js";
import { inspect } from "util";
import { DefineCommand } from "../utils/decorators/DefineCommand";
import { createEmbed } from "../utils/createEmbed";

@DefineCommand({
    aliases: ["ev", "js-exec", "e", "evaluate"],
    cooldown: 0,
    description: lang => lang.COMMAND_EVAL_META_DESCRIPTION(),
    name: "eval",
    usage: lang => `{prefix}eval <${lang.COMMAND_EVAL_META_ARGS()[0]}>`
})
export class EvalCommand extends BaseCommand {
    public async execute(message: Message, args: string[]): Promise<any> {
        const msg = message;
        const client = this.client;

        if (!client.config.owners.includes(msg.author.id)) {
            return message.channel.send({ embeds: [createEmbed("error", "❗ This command is limited to the bot owner only")] });
        }

        const embed = createEmbed("info")
            .addField("Input", `\`\`\`js\n${args.join(" ")}\`\`\``);

        try {
            const code = args.slice(0).join(" ");
            if (!code) return message.channel.send({ embeds: [createEmbed("error", "No js code was provided")] });
            let evaled = await eval(code);

            if (typeof evaled !== "string") {
                evaled = inspect(evaled, {
                    depth: 0
                });
            }

            const output = this.clean(evaled as string);
            if (output.length > 1024) {
                const hastebin = await client.util.hastebin(output);
                embed.addField("Output", `${hastebin}.js`);
            } else { embed.addField("Output", `\`\`\`js\n${output}\`\`\``); }
            void message.channel.send({ embeds: [embed] });
        } catch (e: any) {
            const error = this.clean(e as string);
            if (error.length > 1024) {
                const hastebin = await client.util.hastebin(error);
                embed.addField("Error", `${hastebin}.js`);
            } else { embed.setColor("#FF0000").addField("Error", `\`\`\`js\n${error}\`\`\``); }
            message.channel.send({ embeds: [embed] }).catch(e => client.logger.error("EVAL_CMD_MSG_ERR:", e));
            client.logger.error("EVAL_CMD_ERR:", e);
        }

        return message;
    }

    private clean(text: string): string {
        if (typeof text === "string") {
            return text
                .replace(new RegExp(process.env.SECRET_DISCORD_TOKEN!, "g"), "[REDACTED]")
                .replace(/`/g, `\`${String.fromCharCode(8203)}`)
                .replace(/@/g, `@${String.fromCharCode(8203)}`);
        } return text;
    }
}
