import { BaseCommand } from "../structures/BaseCommand";
import { Message } from "discord.js";
import { DefineCommand } from "../utils/decorators/DefineCommand";
import { createEmbed } from "../utils/createEmbed";
import { images } from "../constants/images";

@DefineCommand({
    aliases: ["commands", "cmds"],
    name: "help",
    description: lang => lang.COMMAND_HELP_META_DESCRIPTION(),
    usage: lang => `{prefix}help [${lang.COMMAND_HELP_META_ARGS(0)}]`
})
export class HelpCommand extends BaseCommand {
    public execute(message: Message, args: string[]): void {
        const command = message.client.commands.get(args[0]) ??
            message.client.commands.get(message.client.commands.aliases.get(args[0])!);
        if (command && !command.meta.disable) {
            message.channel.send({
                embeds: [
                    createEmbed("info")
                        .setTitle(this.client.lang.COMMAND_HELP_EXTENDED_EMBED_TITLE(command.meta.name))
                        .setThumbnail(images.questionMark)
                        .addFields([
                            { name: this.client.lang.COMMAND_HELP_EXTENDED_EMBED_CMD_NAME(), value: `\`${command.meta.name}\``, inline: true },
                            { name: this.client.lang.COMMAND_HELP_EXTENDED_EMBED_CMD_DESC(), value: command.meta.description!(this.client.lang), inline: true },
                            {
                                name: this.client.lang.COMMAND_HELP_EXTENDED_EMBED_CMD_ALIASES(),
                                value: `${Number(command.meta.aliases?.length) > 0
                                    // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
                                    ? command.meta.aliases?.map(c => `\`${c}\``).join(", ")!
                                    : this.client.lang.NOT_AVAILABLE()}`,
                                inline: true
                            },
                            {
                                name: this.client.lang.COMMAND_HELP_EXTENDED_EMBED_CMD_USAGE(),
                                value: `\`${command.meta.usage!(this.client.lang).replace(/{prefix}/g, message.client.config.prefix)}\``,
                                inline: false
                            }
                        ])
                ]
            }).catch(e => this.client.logger.error(e));
        } else {
            message.channel.send({
                embeds: [
                    createEmbed("info", message.client.commands.filter(cmd => !cmd.meta.disable && cmd.meta.name !== "eval").map(c => `\`${c.meta.name}\``).join(" "))
                        .setTitle(this.client.lang.COMMAND_HELP_EMBED_TITLE())
                        .setThumbnail(message.client.user!.displayAvatarURL())
                        .setFooter({ text: this.client.lang.COMMAND_HELP_EMBED_FOOTER(message.client.config.prefix), iconURL: images.info })
                ]
            }).catch(e => this.client.logger.error(e));
        }
    }
}
