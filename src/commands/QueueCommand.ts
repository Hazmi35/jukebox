import { BaseCommand } from "../structures/BaseCommand";
import { DefineCommand } from "../utils/decorators/DefineCommand";
import { isMusicQueueExists } from "../utils/decorators/MusicHelper";
import { createEmbed } from "../utils/createEmbed";
import { Message, TextChannel } from "discord.js";

@DefineCommand({
    aliases: ["q"],
    name: "queue",
    description: "Show the current queue",
    usage: "{prefix}queue"
})
export class QueueCommand extends BaseCommand {
    @isMusicQueueExists()
    public async execute(message: Message): Promise<any> {
        const embed = createEmbed("info")
            .setTitle("Music Queue")
            .setThumbnail(message.client.user?.avatarURL() as string);

        let num = 1;
        const tracks = message.guild!.queue!.tracks.map(s => `**${num++}.** **[${s.metadata.title}](${s.metadata.url})**`)!;
        const pages = this.client.util.chunk(tracks, 15);
        let index = 0;

        embed.setDescription(pages[index].join("\n"));

        const msg = await message.channel.send({ embeds: [embed] });

        if (Number(pages.length > 1)) {
            embed.setFooter(`Page ${index + 1} of ${pages.length}`, "https://raw.githubusercontent.com/Hazmi35/jukebox/main/.github/images/info.png");

            const reactions = ["◀️", "▶️"];
            await reactions.forEach(r => msg.react(r));
            await msg.edit({ content: " ", embeds: [embed] });

            const isMessageManageable = (msg.channel as TextChannel).permissionsFor(msg.client.user!)?.has("MANAGE_MESSAGES");
            const collector = msg.createReactionCollector({
                filter: (reaction, user) => reactions.includes(reaction.emoji.name!) && user.id === message.author.id,
                time: 80 * 1000,
                max: Infinity
            });
            collector
                .on("collect", (reaction, user) => {
                    if (isMessageManageable) reaction.users.remove(user).catch(e => this.client.logger.error("QUEUE_CMD_ERR:", e));
                    switch (reaction.emoji.name!) {
                        case "◀️":
                            if (index === 0) return undefined;
                            index--;
                            break;

                        case "▶️":
                            if (index + 1 === pages.length) return undefined;
                            index++;
                            break;
                    }
                    embed
                        .setDescription(pages[index].join("\n"))
                        .setFooter(`Page ${index + 1} of ${pages.length}`, "https://raw.githubusercontent.com/Hazmi35/jukebox/main/.github/images/info.png");
                    msg.edit({ content: " ", embeds: [embed] }).catch(e => this.client.logger.error("QUEUE_CMD_ERR:", e));
                })
                .on("end", () => {
                    if (isMessageManageable) msg.reactions.removeAll().catch(e => this.client.logger.error("QUEUE_CMD_ERR:", e));
                });
        }
    }
}
