import { MessageEmbed } from "discord.js";
import Jukebox from "../structures/Jukebox";
import { IMessage, ClientEventListener } from "../../typings";
import { DefineListener } from "../utils/decorators/DefineListener";

@DefineListener("message")
export default class MessageEvent implements ClientEventListener {
    public constructor(private readonly client: Jukebox, public name: ClientEventListener["name"]) {}

    public execute(message: IMessage): any {
        if (message.author.bot) return message;
        if (message.channel.type === "dm") return message;
        if (message.content === message.guild?.me?.toString()) {
            return message.channel.send(
                new MessageEmbed().setDescription(`Hi, I'm a simple music bot, see my commands with \`${this.client.config.prefix}help\``).setColor("#00FF00")
            );
        }
        if (!message.content.toLowerCase().startsWith(this.client.config.prefix)) return message;
        return this.client.CommandsHandler.handle(message);
    }
}
