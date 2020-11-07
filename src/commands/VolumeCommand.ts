import BaseCommand from "../structures/BaseCommand";
import { MessageEmbed } from "discord.js";
import { ICommandComponent, IMessage } from "../../typings";
import Jukebox from "../structures/Jukebox";
import { DefineCommand } from "../utils/decorators/DefineCommand";
import { isUserInTheVoiceChannel, isMusicPlaying, isSameVoiceChannel } from "../utils/decorators/MusicHelper";

@DefineCommand({
    aliases: ["vol"],
    name: "volume",
    description: "Show or change the music volume",
    usage: "{prefix}volume [new volume]"
})
export default class VolumeCommand extends BaseCommand {
    public constructor(public client: Jukebox, public meta: ICommandComponent["meta"]) { super(client, meta); }

    @isUserInTheVoiceChannel()
    @isMusicPlaying()
    @isSameVoiceChannel()
    public execute(message: IMessage, args: string[]): any {
        let volume = Number(args[0]);

        if (isNaN(volume)) return message.channel.send(new MessageEmbed().setDescription(`📶 The current volume is ${message.guild!.queue!.volume.toString()}`).setColor("#00FF00"));

        if (volume < 0) volume = 0;
        if (volume === 0) return message.channel.send(new MessageEmbed().setDescription("❗ Please pause the music instead of setting the volume to 0").setColor("#FFFF00"));
        if (Number(args[0]) > this.client.config.maxVolume) {
            return message.channel.send(
                new MessageEmbed().setDescription(`❗ Can't set the volume above ${this.client.config.maxVolume}`).setColor("#FFFF00")
            );
        }

        message.guild!.queue!.volume = Number(args[0]);
        message.guild!.queue!.connection?.dispatcher.setVolume(Number(args[0]) / this.client.config.maxVolume);
        message.channel.send(new MessageEmbed().setDescription(`📶 Volume set to ${args[0]}`).setColor("#00FF00")).catch(console.error);
    }
}
