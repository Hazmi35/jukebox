import { BaseCommand } from "../structures/BaseCommand";
import { IMessage } from "../typings";
import { DefineCommand } from "../utils/decorators/DefineCommand";
import { isUserInTheVoiceChannel, isMusicQueueExists, isSameVoiceChannel } from "../utils/decorators/MusicHelper";
import { createEmbed } from "../utils/createEmbed";

@DefineCommand({
    aliases: ["st"],
    name: "stop",
    description: "Stop the queue",
    usage: "{prefix}stop"
})
export class StopCommand extends BaseCommand {
    @isUserInTheVoiceChannel()
    @isMusicQueueExists()
    @isSameVoiceChannel()
    public execute(message: IMessage): any {
        message.guild!.queue!.oldMusicMessage = null; message.guild!.queue!.oldVoiceStateUpdateMessage = null;
        message.guild?.queue?.voiceChannel?.leave();
        message.guild!.queue = null;

        message.channel.send(createEmbed("info", "⏹ Queue stopped."))
            .catch(e => this.client.logger.error("STOP_CMD_ERR:", e));
    }
}
