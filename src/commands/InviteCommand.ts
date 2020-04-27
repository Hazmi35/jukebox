import BaseCommand from "../structures/BaseCommand";
import Jukebox from "../structures/Jukebox";
import { Message, MessageEmbed } from "discord.js";

export default class PlayCommand extends BaseCommand {
    constructor(public client: Jukebox, readonly path: string) {
        super(client, path, {}, {
            name: "invite",
            description: "Send the bot's invite link",
            usage: "{prefix}invite"
        });
    }
    public async execute(message: Message): Promise<void> {
        message.channel.send(new MessageEmbed().addField("Discord bot invite link", `[Click here](${await this.client.generateInvite(53857345)})`).setColor("#00FF00"));
    }
}