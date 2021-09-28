import { BaseCommand } from "../structures/BaseCommand";
import { DefineCommand } from "../utils/decorators/DefineCommand";
import { isUserInTheVoiceChannel, isMusicQueueExists, isSameVoiceChannel } from "../utils/decorators/MusicHelper";
import { createEmbed } from "../utils/createEmbed";
import { Message } from "discord.js";

@DefineCommand({
    name: "resume",
    description: "Resume the music player",
    usage: "{prefix}resume",
    aliases: ["unpause"]
})
export class ResumeCommand extends BaseCommand {
    @isUserInTheVoiceChannel()
    @isMusicQueueExists()
    @isSameVoiceChannel()
    public execute(message: Message): any {
        if (message.guild?.queue?.playing) {
            message.channel.send({ embeds: [createEmbed("warn", "❗ The music player is not paused!")] }).catch(e => this.client.logger.error("RESUME_CMD_ERR:", e));
        } else {
            message.guild?.queue?.player!.unpause();
            message.channel.send({ embeds: [createEmbed("info", "▶ The music player resumed")] }).catch(e => this.client.logger.error("RESUME_CMD_ERR:", e));
        }
    }
}
