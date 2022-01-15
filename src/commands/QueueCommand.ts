import { BaseCommand } from "../structures/BaseCommand";
import { DefineCommand } from "../utils/decorators/DefineCommand";
import { isMusicQueueExists } from "../utils/decorators/MusicHelper";
import { createEmbed } from "../utils/createEmbed";
import { EmbedFooterData, Message, TextChannel } from "discord.js";
import { images } from "../constants/images";

@DefineCommand({
    aliases: ["q"],
    name: "queue",
    description: lang => lang.COMMAND_QUEUE_META_DESCRIPTION(),
    usage: () => "{prefix}queue"
})
export class QueueCommand extends BaseCommand {
    @isMusicQueueExists()
    public async execute(message: Message): Promise<any> {
        const embed = createEmbed("info")
            .setTitle(message.client.lang.COMMAND_QUEUE_EMBED_TITLE())
            .setThumbnail(message.client.user!.displayAvatarURL())
            .setFooter(QueueCommand.generateFooter(message, false));

        let num = 1;
        const tracks = message.guild!.queue!.tracks.map(s => `**${num++}.** **[${s.metadata.title}](${s.metadata.url})**`)!;
        const pages = this.client.util.chunk(tracks, 15);
        let index = 0;

        embed.setDescription(pages[index].join("\n"));

        const msg = await message.channel.send({ embeds: [embed] });

        if (Number(pages.length > 1)) {
            embed.setFooter(QueueCommand.generateFooter(message, true, index, pages));

            const reactions = ["◀️", "▶️"];
            reactions.forEach(r => msg.react(r));
            await msg.edit({ content: " ", embeds: [embed] });

            const isMessageManageable = (msg.channel as TextChannel).permissionsFor(msg.client.user!)?.has("MANAGE_MESSAGES");
            const collector = msg.createReactionCollector({
                filter: (reaction, user) => reactions.includes(reaction.emoji.name!) && user.id === message.author.id,
                time: 80 * 1000,
                max: Infinity
            });
            collector
                .on("collect", (reaction, user) => {
                    if (isMessageManageable) reaction.users.remove(user).catch(e => this.client.logger.error(e));
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
                        .setFooter(QueueCommand.generateFooter(message, true, index, pages));
                    msg.edit({ content: " ", embeds: [embed] }).catch(e => this.client.logger.error(e));
                })
                .on("end", () => {
                    if (isMessageManageable) msg.reactions.removeAll().catch(e => this.client.logger.error(e));
                });
        }
    }

    // TODO: Add repeat mode info here too.
    private static generateFooter(message: Message, multiple: boolean, index = 0, pages: string[][] = []): EmbedFooterData {
        return {
            text: `${message.client.lang.COMMAND_QUEUE_EMBED_FOOTER(message.guild!.queue!.tracks.first()!.metadata.title)}` +
                  `${multiple ? ` | ${message.client.lang.COMMAND_QUEUE_EMBED_PAGES_MSG(index + 1, pages.length)}` : ""}`,
            iconURL: images.info
        };
    }
}
