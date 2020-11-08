import BaseCommand from "../structures/BaseCommand";
import { ICommandComponent, IMessage } from "../../typings";
import Jukebox from "../structures/Jukebox";
import { DefineCommand } from "../utils/decorators/DefineCommand";
import { isMusicPlaying } from "../utils/decorators/MusicHelper";
import { createEmbed } from "../utils/createEmbed";

@DefineCommand({
    aliases: ["np", "now-playing"],
    name: "nowplaying",
    description: "Send an info about the current playing song",
    usage: "{prefix}nowplaying"
})
export default class NowPlayingCommand extends BaseCommand {
    public constructor(public client: Jukebox, public meta: ICommandComponent["meta"]) { super(client, meta); }

    @isMusicPlaying()
    public execute(message: IMessage): any {
        return message.channel.send(createEmbed("info", `${message.guild?.queue?.playing ? "▶ Now playing:" : "⏸ Now playing (paused):"} ` +
                `**[${message.guild?.queue?.songs.first()?.title as string}](${message.guild?.queue?.songs.first()?.url as string})**`));
    }
}
