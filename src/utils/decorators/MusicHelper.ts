import { Inhibit } from "./Inhibit";
import { createEmbed } from "../createEmbed";

export function isMusicQueueExists(): any {
    return Inhibit(message => {
        if (message.guild?.queue === null) return message.channel.send({ embeds: [createEmbed("warn", "There is nothing playing.")] });
    });
}

export function isSameVoiceChannel(): any {
    return Inhibit(message => {
        if (!message.guild?.me?.voice.channel) return undefined;
        const botVoiceChannel = message.guild.queue?.voiceChannel?.id ?? message.guild.me.voice.channel.id;
        if (message.member?.voice.channel?.id !== botVoiceChannel) {
            return message.channel.send({
                embeds: [createEmbed("warn", "You need to be in the same voice channel as mine")]
            });
        }
    });
}

export function isUserInTheVoiceChannel(): any {
    return Inhibit(message => {
        if (!message.member?.voice.channel) {
            return message.channel.send({
                embeds: [createEmbed("warn", "I'm sorry, but you need to be in a voice channel to do that")]
            });
        }
    });
}

export function isValidVoiceChannel(): any {
    return Inhibit(message => {
        const voiceChannel = message.member?.voice.channel;
        const perms = voiceChannel?.permissionsFor(message.guild!.me!);
        if (voiceChannel?.id === message.guild?.me?.voice.channel?.id) return undefined;
        if (!voiceChannel?.joinable) {
            return message.channel.send({ embeds: [createEmbed("error", "I'm sorry, but I can't connect to your voice channel, make sure I have the proper permissions!")] });
        }
        if (voiceChannel.type === "GUILD_STAGE_VOICE" && !perms?.has("REQUEST_TO_SPEAK")) { // TODO: Stage Channel Moderators requires permissions other than Manage Channels, please see https://discord.com/developers/docs/resources/stage-instance#definitions
            if (!perms?.has("MANAGE_CHANNELS")) return message.channel.send({ embeds: [createEmbed("error", `I'm sorry, but I need to have "Request to Speak" or "Manage Channels" permission for joining Stage Channels!`)] });
        }
        if (voiceChannel.type === "GUILD_VOICE" && voiceChannel.speakable) {
            return message.channel.send({ embeds: [createEmbed("error", "I'm sorry, but I can't speak in that voice channel. make sure I have the proper permissions!")] });
        }
    });
}
