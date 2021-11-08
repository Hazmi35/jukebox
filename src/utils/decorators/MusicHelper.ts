import { Inhibit } from "./Inhibit";
import { createEmbed } from "../createEmbed";
import { VoiceChannel } from "discord.js";

export function isMusicQueueExists(): any {
    return Inhibit(message => {
        if (message.guild?.queue === null) return message.channel.send({ embeds: [createEmbed("warn", message.client.lang.MUSIC_HELPER_QUEUE_DOES_NOT_EXISTS())] });
    });
}

export function isSameVoiceChannel(): any {
    return Inhibit(message => {
        if (!message.guild?.me?.voice.channel) return undefined;
        const botVoiceChannel = message.guild.queue?.voiceChannel?.id ?? message.guild.me.voice.channel.id;
        if (message.member?.voice.channel?.id !== botVoiceChannel) {
            return message.channel.send({
                embeds: [createEmbed("warn", message.client.lang.MUSIC_HELPER_NEED_TO_BE_ON_THE_SAME_VC())]
            });
        }
    });
}

export function isUserInTheVoiceChannel(): any {
    return Inhibit(message => {
        if (!message.member?.voice.channel) {
            return message.channel.send({
                embeds: [createEmbed("warn", message.client.lang.MUSIC_HELPER_USER_NOT_IN_VC())]
            });
        }
    });
}

export function isValidVoiceChannel(): any {
    return Inhibit(message => {
        const voiceChannel = message.member?.voice.channel;
        if (voiceChannel?.id === message.guild?.me?.voice.channel?.id) return undefined;
        if (!voiceChannel?.joinable) {
            return message.channel.send({ embeds: [createEmbed("error", message.client.lang.MUSIC_HELPER_BOT_CANT_CONNECT())] });
        }
        if (!(voiceChannel as VoiceChannel).speakable) {
            return message.channel.send({ embeds: [createEmbed("error", message.client.lang.MUSIC_HELPER_BOT_CANT_SPEAK())] });
        }
    });
}
