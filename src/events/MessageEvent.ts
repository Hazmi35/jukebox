import { DefineEvent } from "../utils/decorators/DefineEvent";
import { createEmbed } from "../utils/createEmbed";
import { BaseEvent } from "../structures/BaseEvent";
import { Message } from "discord.js";

@DefineEvent("message")
export class MessageEvent extends BaseEvent {
    public async execute(message: Message): Promise<any> {
        if (message.author.bot || message.channel.type !== "text") return message;

        if (message.content.toLowerCase().startsWith(this.client.config.prefix)) return this.client.commands.handle(message);

        if ((await this.client.util.getUserFromMention(message.content))?.id === message.client.user?.id) {
            return message.channel.send(
                createEmbed("info", `Hi, I'm a simple music bot, see my commands with \`${this.client.config.prefix}help\``)
            );
        }
    }
}
