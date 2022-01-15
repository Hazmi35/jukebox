import { DefineEvent } from "../utils/decorators/DefineEvent";
import { createEmbed } from "../utils/createEmbed";
import { BaseEvent } from "../structures/BaseEvent";
import { Message } from "discord.js";

@DefineEvent("messageCreate")
export class MessageCreateEvent extends BaseEvent {
    public async execute(message: Message): Promise<any> {
        if (message.author.bot || message.channel.type !== "GUILD_TEXT") return message;

        if (message.content.toLowerCase().startsWith(this.client.config.prefix)) return this.client.commands.handle(message);

        if (this.client.util.getUserIDFromMention(message.content) === message.client.user!.id) {
            return message.channel.send({
                embeds: [createEmbed("info", message.client.lang.MESSAGE_EVENT_ON_MENTION(message.client.config.prefix))]
            });
        }
    }
}
