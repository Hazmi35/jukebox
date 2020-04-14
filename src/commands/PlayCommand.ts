/* eslint-disable no-extra-parens */
/* eslint-disable @typescript-eslint/no-unused-vars */
import BaseCommand from "../structures/BaseCommand";
import BotClient from "../structures/Jukebox";
import ytdl from "ytdl-core-discord";
import { IMessage, ISong, IGuild } from "../typings";
import ServerQueue from "../structures/ServerQueue";
import { Util, VoiceChannel, MessageEmbed } from "discord.js";
import { AllHtmlEntities } from "html-entities";

const HtmlEntities = new AllHtmlEntities();

export default class PlayCommand extends BaseCommand {
    constructor(public client: BotClient, readonly path: string) {
        super(client, path, {}, {
            name: "play",
            description: "Play some musics",
            usage: "{prefix}play <yt video or playlist link / yt video name>"
        });
    }

    public async execute(message: IMessage, args: string[]): Promise<any> {
        const voiceChannel = message.member!.voice.channel;
        if (!voiceChannel) return message.channel.send("I'm sorry but you need to be in a voice channel to play music");
        if (!voiceChannel.joinable) return message.channel.send("I'm sorry but I can't connect to your voice channel, make sure I have the proper permissions!");

        if (!args[0]) return message.channel.send("Please give me the youtube link");
        const searchString = args.join(" ");
        const url = searchString.replace(/<(.+)>/g, "$1");

        if (/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/.exec(url)) {
            const playlist = await this.client.youtube.getPlaylist(url);
            const videos = await playlist.getVideos();
            let skikppedVideos = 0;
            message.channel.send(`Adding all videos in playlist: **${playlist.title}**, Hang on...`);
            for (const video of Object.values(videos)) {
                // eslint-disable-next-line no-extra-parens
                if ((video as any).raw.status.privacyStatus === "private") {
                    skikppedVideos++;
                    continue;
                } else {
                    const video2 = await this.client.youtube.getVideoByID((video as any).id); // TODO: Find or create typings for simple-youtube-api or wait for v6 released
                    await this.handleVideo(video2, message, voiceChannel, true);
                }
            }
            if (skikppedVideos !== 0) message.channel.send(`${skikppedVideos >= 2 ? `${skikppedVideos} videos` : `${skikppedVideos} video`} are skipped because it's a private video`);
            return message.channel.send(`All videos in playlist: **${playlist.title}**, has been added to the queue!`);
        } else {
            try {
                // eslint-disable-next-line no-var
                var video = await this.client.youtube.getVideo(url);
            } catch (e) {
                try {
                    const videos = await this.client.youtube.searchVideos(searchString, 12);
                    let index = 0;
                    const embed = new MessageEmbed()
                        .setAuthor("Song Selection") // TODO: Find or create typings for simple-youtube-api or wait for v6 released
                        .setDescription(`${videos.map((video: any) => `**${++index} -** ${HtmlEntities.decode(video.title)}`).join("\n")} \n *Type \`cancel\` or \`c\` to cancel song selection*`)
                        .setThumbnail(message.client.user!.displayAvatarURL())
                        .setColor("#00ff00")
                        .setFooter("Please provide a value to select one of the search results ranging from 1-12");
                    const msg = await message.channel.send(embed);
                    try {
                        // eslint-disable-next-line no-var
                        var response = await message.channel.awaitMessages((msg2: IMessage) => {
                            if (message.author.id !== msg2.author.id) return false;
                            else {
                                if (msg2.content === "cancel" || msg2.content === "c") return true;
                                else return Number(msg2.content) > 0 && Number(msg2.content) < 13;
                            }
                        }, {
                            max: 1,
                            time: 20000,
                            errors: ["time"]
                        });
                        msg.delete();
                        response.first()!.delete({ timeout: 3000 }).catch(e => e);
                    } catch (error) {
                        msg.delete();
                        message.channel.send(new MessageEmbed().setDescription("No or invalid value entered, song selection canceled.").setColor("#ff0000"));
                        return;
                    }
                    if (response.first()!.content === "c" || response.first()!.content === "cancel") {
                        message.channel.send(new MessageEmbed().setDescription("Song selection canceled").setColor("#ff0000"));
                        return;
                    } else {
                        const videoIndex = parseInt(response.first()!.content);
                        // eslint-disable-next-line no-var
                        var video = await this.client.youtube.getVideoByID(videos[videoIndex - 1].id);
                    }
                } catch (err) {
                    this.client.log.error("YT_SEARCH_ERR: ", err);
                    return message.channel.send("I could not obtain any search results!");
                }
            }
            return this.handleVideo(video, message, voiceChannel);
        }
    }

    private async handleVideo(video: any, message: IMessage, voiceChannel: VoiceChannel, playlist = false): Promise<any> { // TODO: Find or create typings for simple-youtube-api or wait for v6 released
        const song: ISong = {
            id: video.id,
            title: Util.escapeMarkdown(video.title),
            url: `https://youtube.com/watch?v=${video.id}`
        };

        if (!message.guild!.queue) {
            message.guild!.queue = new ServerQueue(message.channel, voiceChannel);
            message.guild!.queue.songs.addSong(song);
            try {
                const connection = await message.guild!.queue.voiceChannel!.join();
                message.guild!.queue.connection = connection;
            } catch (error) {
                message.guild!.queue = null;
                this.client.log.error("PLAY_COMMAND: ", error);
                message.channel.send(`Error: Could not join the voice channel. reason: \`${error}\``);
                return undefined;
            }
            this.play(message.guild!);
            if (!voiceChannel.speakable) {
                voiceChannel.leave();
                return message.channel.send("I'm sorry but I can't speak in this voice channel. make sure I have the proper permissions");
            }
        } else {
            message.guild!.queue.songs.addSong(song);
            if (playlist) return;
            return message.channel.send(`Song **${song.title}** has been added to the queue`);
        }

        return message;

    }

    private async play(guild: IGuild): Promise<any> {
        const serverQueue = guild.queue!;
        const song = serverQueue.songs.first();
        if (!song) {
            serverQueue.connection!.disconnect();
            return guild.queue = null;
        }

        serverQueue.connection!.voice.setSelfDeaf(true);
        // This fixes: https://github.com/discordjs/discord.js/issues/4027, highWatermark option is will be increased or decreased in the future
        // eslint-disable-next-line no-bitwise
        const dispatcher = guild.queue!.connection!.play(await ytdl(song.url, { highWaterMark: 1<<26 }), { type: "opus" })
            .on("start", () => {
                serverQueue.playing = true;
                this.client.log.info(`${this.client.shard ? `[Shard #${this.client.shard.ids}]` : ""} Song: "${song.title}" on ${guild.name} started`);
                serverQueue.textChannel!.send(`Start playing: **${song.title}**`);
            })
            .on("finish", () => {
                this.client.log.info(`${this.client.shard ? `[Shard #${this.client.shard.ids}]` : ""} Song: "${song.title}" on ${guild.name} ended`);
                if (serverQueue.loopMode === 0) serverQueue.songs.deleteFirst();
                else if (serverQueue.loopMode === 2) { serverQueue.songs.deleteFirst(); serverQueue.songs.addSong(song); }
                serverQueue.textChannel!.send(`Stop playing: **${song.title}**`);
                this.play(guild);
            }).on("error", (err: Error) => {
                this.client.log.error("PLAY_ERROR: ", err);
            });
        dispatcher.setVolume(guild.queue!.volume / guild.client.config.maxVolume);
    }
}
