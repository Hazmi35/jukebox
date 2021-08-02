/* eslint-disable sort-keys */
import { BaseCommand } from "../structures/BaseCommand";
import { IMessage } from "../../typings";
import { DefineCommand } from "../utils/decorators/DefineCommand";
import { isUserInTheVoiceChannel, isMusicQueueExists, isSameVoiceChannel } from "../utils/decorators/MusicHelper";
import { createEmbed } from "../utils/createEmbed";

@DefineCommand({
    aliases: ["loop", "music-loop", "music-repeat"],
    name: "repeat",
    description: "Repeat current music or the queue",
    usage: "{prefix}repeat [all | one | disable]"
})
export class RepeatCommand extends BaseCommand {
    @isUserInTheVoiceChannel()
    @isMusicQueueExists()
    @isSameVoiceChannel()
    public execute(message: IMessage, args: string[]): any {
        const modes: Record<any, 0 | 1 | 2> = {
            // Repeat All Music in Queue
            all: 2,
            queue: 2,
            "*": 2,
            2: 2,
            // Repeat current music
            current: 1,
            one: 1,
            musiconly: 1,
            1: 1,
            // Disable repeat
            disable: 0,
            none: 0,
            off: 0,
            0: 0
        };
        const modeTypes = ["disabled", "current music", "all music in the queue"];
        const modeEmoji = ["▶", "🔂", "🔁"];
        const mode = args[0] as string | undefined;
        if (mode === undefined) {
            message.channel.send(createEmbed("info", `Current mode: "${modeEmoji[message.guild!.queue!.loopMode]} Repeating **${modeTypes[message.guild!.queue!.loopMode]}**"`))
                .catch(e => this.client.logger.error("REPEAT_CMD_ERR:", e));
        } else if (Object.keys(modes).includes(mode)) {
            message.guild!.queue!.loopMode = modes[mode];
            message.channel.send(createEmbed("info", `${modeEmoji[message.guild!.queue!.loopMode]} Repeating **${modeTypes[message.guild!.queue!.loopMode]}**`))
                .catch(e => this.client.logger.error("REPEAT_CMD_ERR:", e));
        } else {
            message.channel.send(createEmbed("error", `Invalid value, see \`${this.client.config.prefix}help ${this.meta.name}\` for more info!`))
                .catch(e => this.client.logger.error("REPEAT_CMD_ERR:", e));
        }
    }
}
