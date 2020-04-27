import BaseCommand from "../structures/BaseCommand";
import Jukebox from "../structures/Jukebox";
import { IMessage } from "../../typings";
import { MessageEmbed } from "discord.js";

export default class VolumeCommand extends BaseCommand {
    constructor(public client: Jukebox, readonly path: string) {
        super(client, path, {}, {
            name: "queue",
            description: "Show the current queue",
            usage: "{prefix}queue"
        });
    }
    public execute(message: IMessage): any {
        if (!message.guild!.queue) return message.channel.send(new MessageEmbed().setDescription("There is nothing playing.").setColor("#FFFF00"));
        else {
            const embed = new MessageEmbed().setTitle("**Song Queue**").setColor("#00FF00").setThumbnail(message.client.user!.avatarURL()!);
            let num = 1;
            const songs = message.guild!.queue.songs.map(s => `**${num++}.** **${s.title}**`);
            if (message.guild!.queue.songs.size > 12) {
                const indexes: string[] = this.chunk(songs, 12);
                let index = 0;
                embed.setDescription(indexes[index]).setFooter(`Page ${index+1} of ${indexes.length}`, "https://hzmi.xyz/assets/images/390511462361202688.png");
                message.channel.send(embed).then(msg => {
                    msg.react("◀️").then(() => {
                        msg.react("▶️");
                        msg.createReactionCollector((reaction, user) => {
                            return reaction.emoji.name === "◀️" && user.id === message.author.id;
                        }, { time: 80 * 1000 }).on("collect", () => {
                            if (index === 0) return undefined;
                            index--;
                            embed.setDescription(indexes[index]).setFooter(`Page ${index+1} of ${indexes.length}`, "https://hzmi.xyz/assets/images/390511462361202688.png");
                            msg.edit(embed);
                        });
                        msg.createReactionCollector((reaction, user) => {
                            return reaction.emoji.name === "▶️" && user.id === message.author.id;
                        }, { time: 80 * 1000 }).on("collect", () => {
                            if (index+1 === indexes.length) return undefined;
                            index++;
                            embed.setDescription(indexes[index]).setFooter(`Page ${index+1} of ${indexes.length}`, "https://hzmi.xyz/assets/images/390511462361202688.png");
                            msg.edit(embed);
                        });
                    });
                });
            } else {
                message.channel.send(embed.setDescription(songs.join("\n")));
            }
        }
    }
    private chunk(array: Array<any> | string, chunkSize: number): Array<any> {
        const temp = [];
        for (let i = 0; i < array.length; i+= chunkSize) {
            temp.push(array.slice(i, i + chunkSize));
        }
        return temp;
    }
}