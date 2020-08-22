import BaseCommand from "../structures/BaseCommand";
import Jukebox from "../structures/Jukebox";
import { IMessage } from "../../typings";
import { MessageEmbed } from "discord.js";

export default class PlayCommand extends BaseCommand {
    public constructor(public client: Jukebox, public readonly path: string) {
        super(client, path, { aliases: ["commands", "cmds"] }, {
            name: "help",
            description: "Shows the help menu",
            usage: "{prefix}help [command]"
        });
    }

    public execute(message: IMessage, args: string[]): void {
        const command = message.client.commandsHandler.commands.get(args[0]) ?? message.client.commandsHandler.commands.get(message.client.commandsHandler.aliases.get(args[0])!);
        if (command) {
            message.channel.send(new MessageEmbed()
                .setTitle(`Help for ${command.help.name} command`)
                .setThumbnail("https://hzmi.xyz/assets/images/question_mark.png")
                .addFields({ name: "Name", value: `\`${command.help.name}\``, inline: true },
                    { name: "Description", value: command.help.description, inline: true },
                    { name: "Aliases", value: `${command.conf.aliases!.length > 0 ? command.conf.aliases!.map(c => `\`${c}\``).join(", ") : "None."}`, inline: true },
                    { name: "Usage", value: `\`${command.help.usage!.replace(/{prefix}/g, message.client.config.prefix)}\``, inline: false })
                .setColor("#00FF00")
                .setTimestamp());
        } else {
            message.channel.send(new MessageEmbed()
                .setTitle("Help Menu")
                .setColor("#00FF00")
                .setThumbnail(message.client.user!.displayAvatarURL())
                .setDescription(message.client.commandsHandler.commands.map(c => `\`${c.help.name}\``).join(" "))
                .setTimestamp()
                .setFooter(`Use ${message.client.config.prefix}help <command> to get more info on a specific command!`, "https://hzmi.xyz/assets/images/390511462361202688.png"));
        }
    }
}
