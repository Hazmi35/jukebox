import { BaseCommand } from "../structures/BaseCommand";
import { DefineCommand } from "../utils/decorators/DefineCommand";
import { isUserInTheVoiceChannel, isMusicQueueExists, isSameVoiceChannel } from "../utils/decorators/MusicHelper";
import { createEmbed } from "../utils/createEmbed";
import { Message } from "discord.js";

@DefineCommand({
    aliases: ["randomize", "shuffle-queue"],
    name: "shuffle",
    description: lang => lang.COMMAND_SHUFFLE_META_DESCRIPTION(),
    usage: () => "{prefix}shuffle"
})
export class ShuffleCommand extends BaseCommand {
    @isUserInTheVoiceChannel()
    @isMusicQueueExists()
    @isSameVoiceChannel()
    public execute(message: Message): any {
        message.guild!.queue?.tracks.shuffle();

        message.channel.send({
            embeds: [createEmbed("info", message.client.lang.COMMAND_SHUFFLE_SUCCESS())]
        }).catch(e => this.client.logger.error(e));
    }
}
