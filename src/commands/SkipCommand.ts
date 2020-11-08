import BaseCommand from "../structures/BaseCommand";
import Jukebox from "../structures/Jukebox";
import { ICommandComponent, IMessage } from "../../typings";
import { DefineCommand } from "../utils/decorators/DefineCommand";
import { isUserInTheVoiceChannel, isMusicPlaying, isSameVoiceChannel } from "../utils/decorators/MusicHelper";
import { createEmbed } from "../utils/createEmbed";

@DefineCommand({
    aliases: ["s"],
    name: "skip",
    description: "Skip the current song",
    usage: "{prefix}skip"
})
export default class SkipCommand extends BaseCommand {
    public constructor(public client: Jukebox, public meta: ICommandComponent["meta"]) { super(client, meta); }

    @isUserInTheVoiceChannel()
    @isMusicPlaying()
    @isSameVoiceChannel()
    public execute(message: IMessage): any {
        message.guild!.queue!.playing = true;
        message.guild!.queue?.connection?.dispatcher.resume();
        message.guild!.queue?.connection?.dispatcher.end();

        message.channel.send(
            createEmbed("info", `⏭ Skipped [**${message.guild?.queue?.songs.first()?.title as string}**](${message.guild?.queue?.songs.first()?.url as string}})`)
        )
            .catch(e => this.client.logger.error("SKIP_CMD_ERR:", e));
    }
}
