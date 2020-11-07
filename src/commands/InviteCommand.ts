import BaseCommand from "../structures/BaseCommand";
import { MessageEmbed } from "discord.js";
import { ICommandComponent, IMessage } from "../../typings";
import Jukebox from "../structures/Jukebox";
import { DefineCommand } from "../utils/decorators/DefineCommand";

@DefineCommand({
    name: "invite",
    description: "Send the bot's invite link",
    usage: "{prefix}invite"
})
export default class InviteCommand extends BaseCommand {
    public constructor(public client: Jukebox, public meta: ICommandComponent["meta"]) {
        super(client, Object.assign(meta, { disable: client.config.disableInviteCmd }));
    }

    public async execute(message: IMessage): Promise<void> {
        message.channel.send(
            new MessageEmbed().addField("Discord bot invite link", `[Click here](${await this.client.generateInvite({ permissions: 53857345 })})`)
                .setColor("#00FF00")
        ).catch(e => this.client.logger.error("PLAY_CMD_ERR:", e));
    }
}
