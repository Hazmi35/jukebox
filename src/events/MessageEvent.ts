import Jukebox from "../structures/Jukebox";
import { IMessage, ClientEvent } from "../../typings";
import { MessageEmbed } from "discord.js";

export default class MessageEvent implements ClientEvent {
    public readonly name = "message";
    public constructor(private readonly client: Jukebox) {}

    public execute(message: IMessage): any {
        if (message.author.bot) return message;
        if (message.channel.type === "dm") return message;
        if (message.mentions.users.has(this.client.user!.id)) {
            return message.channel.send(
                new MessageEmbed().setDescription(`Hi, I'm a simple music bot, see my commands with \`${this.client.config.prefix}help\``).setColor("#00FF00")
            );
        }
        if (!message.content.startsWith(this.client.config.prefix)) return message;
        return this.client.commandsHandler.handle(message);
    }
}
