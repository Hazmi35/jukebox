import { BaseCommand } from "../structures/BaseCommand";
import { DefineCommand } from "../utils/decorators/DefineCommand";
import { isUserInTheVoiceChannel, isMusicQueueExists, isSameVoiceChannel } from "../utils/decorators/MusicHelper";
import { createEmbed } from "../utils/createEmbed";
import { satisfies } from "semver";
import { Message } from "discord.js";

@DefineCommand({
    name: "resume",
    description: "Resume the music player",
    usage: "{prefix}resume"
})
export class ResumeCommand extends BaseCommand {
    @isUserInTheVoiceChannel()
    @isMusicQueueExists()
    @isSameVoiceChannel()
    public execute(message: Message): any {
        if (message.guild?.queue?.playing) {
            message.channel.send(createEmbed("warn", "❗ The music player is not paused!")).catch(e => this.client.logger.error("RESUME_CMD_ERR:", e));
        } else {
            message.guild!.queue!.playing = true;
            message.guild?.queue?.connection?.dispatcher.resume();
            // TODO: Revert this change after the issue #494 is fixed
            if (satisfies(process.version, ">=14.17.0")) {
                message.guild?.queue?.connection?.dispatcher.pause();
                message.guild?.queue?.connection?.dispatcher.resume();
            }
            message.channel.send(createEmbed("info", "▶ The music player resumed")).catch(e => this.client.logger.error("RESUME_CMD_ERR:", e));
        }
    }
}
