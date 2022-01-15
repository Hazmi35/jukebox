/* eslint-disable no-eval */
import { BaseCommand } from "../structures/BaseCommand";
import { Message } from "discord.js";
import { inspect } from "util";
import { DefineCommand } from "../utils/decorators/DefineCommand";
import { createEmbed } from "../utils/createEmbed";
import { CustomError } from "../utils/CustomError";

@DefineCommand({
    aliases: ["ev", "js-exec", "e", "evaluate"],
    cooldown: 0,
    description: lang => lang.COMMAND_EVAL_META_DESCRIPTION(),
    name: "eval",
    usage: lang => `{prefix}eval <${lang.COMMAND_EVAL_META_ARGS(0)}>`
})
export class EvalCommand extends BaseCommand {
    public async execute(message: Message, args: string[]): Promise<any> {
        const msg = message;
        const client = this.client;

        if (!client.config.owners.includes(msg.author.id)) {
            return message.channel.send({ embeds: [createEmbed("error", client.lang.COMMAND_EVAL_NO_PERM())] });
        }

        const embed = createEmbed("info")
            .addField(client.lang.COMMAND_EVAL_INPUT_FIELD_NAME(), `\`\`\`js\n${args.join(" ")}\`\`\``);

        try {
            const code = args.slice(0).join(" ");
            if (!code) return await message.channel.send({ embeds: [createEmbed("error", client.lang.COMMAND_EVAL_NO_INPUT())] });
            let evaled = await eval(code);

            if (typeof evaled !== "string") {
                evaled = inspect(evaled, {
                    depth: 0
                });
            }

            const output = EvalCommand.clean(evaled as string);
            if (output.length > 1024) {
                const hastebin = await client.util.hastebin(output);
                embed.addField(client.lang.COMMAND_EVAL_OUTPUT_FIELD_NAME(), `${hastebin}.js`);
            } else { embed.addField(client.lang.COMMAND_EVAL_OUTPUT_FIELD_NAME(), `\`\`\`js\n${output}\`\`\``); }
            message.channel.send({ embeds: [embed] }).catch(e => client.logger.error(e));
        } catch (e: any) {
            const error = EvalCommand.clean(e as string);
            if (error.length > 1024) {
                const hastebin = await client.util.hastebin(error);
                embed.addField(client.lang.COMMAND_EVAL_ERROR_FIELD_NAME(), `${hastebin}.js`);
            } else { embed.setColor("#FF0000").addField(client.lang.COMMAND_EVAL_ERROR_FIELD_NAME(), `\`\`\`js\n${error}\`\`\``); }
            message.channel.send({ embeds: [embed] }).catch(e2 => client.logger.error(e2));
            client.logger.error(CustomError("EvalCommandError", e as string).stack);
        }

        return message;
    }

    private static clean(text: string): string {
        if (typeof text === "string") {
            return text
                .replace(new RegExp(process.env.SECRET_DISCORD_TOKEN!, "g"), "[REDACTED]")
                .replace(/`/g, `\`${String.fromCharCode(8203)}`)
                .replace(/@/g, `@${String.fromCharCode(8203)}`);
        } return text;
    }
}
