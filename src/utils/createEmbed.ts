import { MessageEmbed } from "discord.js";

export function createEmbed(type: "info" | "warn" | "error", message?: string): MessageEmbed {
    const hexColors = {
        info: "#00FF00",
        warn: "#FFFF00",
        error: "#FF0000"
    };
    const embed = new MessageEmbed()
        .setColor(hexColors[type]);

    if (message) embed.setDescription(message);

    return embed;
}
