import { ColorResolvable, MessageEmbed, MessageEmbedOptions } from "discord.js";

export type hexColorsType = "error" | "info" | "warn";
const hexColors: Record<hexColorsType, ColorResolvable> = {
    info: "#00FF00",
    warn: "#FFFF00",
    error: "#FF0000"
};

export function createEmbed(type: hexColorsType, message?: string, messageEmbedOptions?: MessageEmbedOptions): MessageEmbed {
    const embed = new MessageEmbed(messageEmbedOptions)
        .setColor(hexColors[type]);

    if (message) embed.setDescription(message);

    return embed;
}
