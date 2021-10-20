import { BaseCommand } from "../structures/BaseCommand";
import { Message } from "discord.js";
import { DefineCommand } from "../utils/decorators/DefineCommand";
import { createEmbed } from "../utils/createEmbed";
import { images } from "../constants/images";

@DefineCommand({
    aliases: ["commands", "cmds"],
    name: "help",
    description: lang => lang.COMMAND_HELP_META_DESCRIPTION(),
    usage: lang => `{prefix}help [${lang.COMMAND_HELP_META_ARGS()[0]}]`
})
export class HelpCommand extends BaseCommand {
    public execute(message: Message, args: string[]): void {
        const command = message.client.commands.get(args[0]) ??
            message.client.commands.get(message.client.commands.aliases.get(args[0])!);
        if (command && !command.meta.disable) {
            message.channel.send({
                embeds: [
                    createEmbed("info")
                        .setTitle(`Information for the ${command.meta.name} command`)
                        .setThumbnail(images.questionMark)
                        .addFields([
                            { name: "Name", value: `\`${command.meta.name}\``, inline: true },
                            { name: "Description", value: command.meta.description!(this.client.lang), inline: true },
                            { name: "Aliases", value: `${Number(command.meta.aliases?.length) > 0 ? command.meta.aliases?.map(c => `\`${c}\``).join(", ") as string : "None."}`, inline: true },
                            { name: "Usage", value: `\`${command.meta.usage!(this.client.lang).replace(/{prefix}/g, message.client.config.prefix)}\``, inline: false }
                        ])
                ]
            }).catch(e => this.client.logger.error("HELP_CMD_ERR:", e));
        } else {
            message.channel.send({
                embeds: [
                    createEmbed("info", message.client.commands.filter(cmd => !cmd.meta.disable && cmd.meta.name !== "eval").map(c => `\`${c.meta.name}\``).join(" "))
                        .setTitle("Help Menu")
                        .setThumbnail(message.client.user?.displayAvatarURL() as string)
                        .setFooter(`Use ${message.client.config.prefix}help <command> to get more info on a specific command!`, images.info)
                ]
            }).catch(e => this.client.logger.error("HELP_CMD_ERR:", e));
        }
    }
}
