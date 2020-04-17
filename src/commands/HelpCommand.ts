/* eslint-disable @typescript-eslint/no-unused-vars */
import BaseCommand from "../structures/BaseCommand";
import BotClient from "../structures/Jukebox";
import { IMessage } from "../typings";
import { MessageEmbed, Message } from "discord.js";

export default class PlayCommand extends BaseCommand {
    constructor(public client: BotClient, readonly path: string) {
        super(client, path, { aliases: ["commands", "cmds"] }, {
            name: "help",
            description: "Send help menu",
            usage: "{prefix}help"
        });
    }
    public execute(message: IMessage, args: string[]): void {
        const command = message.client.commandsHandler.commands.get(args[0]);
        if (!command) {
            message.channel.send(new MessageEmbed()
                .setAuthor("Help Menu", message.client.user!.displayAvatarURL())
                .setColor("#00FF00")
                .setDescription(message.client.commandsHandler.commands.map(c => `\`${c.help.name}\``).join(" "))
                .setTimestamp()
                .setFooter(`Use ${message.client.config.prefix}help <command> to get more info on specific command!`));
        } else {
            message.channel.send(new MessageEmbed()
                .setAuthor(`Help for ${command.help.name}`)
                .setColor("#00FF00")
                .setTimestamp());
        }
    }
}