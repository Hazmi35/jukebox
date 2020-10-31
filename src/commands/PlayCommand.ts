/* eslint-disable block-scoped-var, @typescript-eslint/restrict-template-expressions */
import BaseCommand from "../structures/BaseCommand";
import ServerQueue from "../structures/ServerQueue";
import ytdl from "../utils/YoutubeDownload";
import { Util, MessageEmbed } from "discord.js";
import { decodeHTML } from "entities";
import type { VoiceChannel } from "discord.js";
import type Jukebox from "../structures/Jukebox";
import type { IMessage, ISong, IGuild } from "../../typings";
import type { Video } from "../utils/YoutubeAPI/structures/Video";

export default class PlayCommand extends BaseCommand {
    public constructor(public client: Jukebox, public readonly path: string) {
        super(client, path, { aliases: ["play-music", "add", "p"] }, {
            name: "play",
            description: "Play some music",
            usage: "{prefix}play <yt video or playlist link / yt video name>"
        });
    }

    public async execute(message: IMessage, args: string[]): Promise<any> {
        const voiceChannel = message.member?.voice.channel;
        if (!voiceChannel) return message.channel.send(new MessageEmbed().setDescription("I'm sorry but you need to be in a voice channel to play music").setColor("#FFFF00"));
        if (!voiceChannel.joinable) {
            return message.channel.send(
                new MessageEmbed().setDescription("I'm sorry but I can't connect to your voice channel, make sure I have the proper permissions!").setColor("#FF0000")
            );
        }
        if (!voiceChannel.speakable) {
            voiceChannel.leave();
            return message.channel.send(new MessageEmbed().setDescription("I'm sorry but I can't speak in this voice channel. make sure I have the proper permissions")
                .setColor("#FF0000"));
        }
        if (!args[0]) {
            return message.channel.send(
                new MessageEmbed().setDescription(`Invalid args, type \`${this.client.config.prefix}help play\` for more info`).setColor("#00FF00")
            );
        }
        const searchString = args.join(" ");
        const url = searchString.replace(/<(.+)>/g, "$1");

        if (message.guild?.queue !== null && voiceChannel.id !== message.guild?.queue.voiceChannel?.id) {
            return message.channel.send(new MessageEmbed()
                .setDescription(`Music on this server is already playing to: **${message.guild?.queue.voiceChannel?.name}** voice channel`)
                .setColor("#FFFF00"));
        }

        if (/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/.exec(url)) {
            const playlist = await this.client.youtube.getPlaylistByURL(url);
            const videos = await playlist.getVideos();
            let skippedVideos = 0;
            message.channel.send(new MessageEmbed().setDescription(`Adding all videos in playlist: **[${playlist.title}](${playlist.url})**, Hang on...`).setColor("#00FF00"))
                .catch(e => this.client.logger.error("PLAY_CMD_ERR:", e));
            for (const video of Object.values(videos)) {
                if (video.privacyStatus === "private") {
                    skippedVideos++;
                    continue;
                } else {
                    const video2 = await this.client.youtube.getVideo(video.id);
                    await this.handleVideo(video2, message, voiceChannel, true);
                }
            }
            if (skippedVideos !== 0) {
                message.channel.send(
                    new MessageEmbed()
                        .setDescription(`${skippedVideos >= 2 ? `${skippedVideos} videos` : `${skippedVideos} video`} are skipped because it's a private video`)
                        .setColor("#FFFF00")
                ).catch(e => this.client.logger.error("PLAY_CMD_ERR:", e));
            }
            return message.channel.send(new MessageEmbed().setDescription(`All videos in playlist: **[${playlist.title}](${playlist.url})**, has been added to the queue!`).setColor("#00FF00"));
        }
        try {
            // eslint-disable-next-line no-var, block-scoped-var
            var video = await this.client.youtube.getVideoByURL(url);
        } catch (e) {
            try {
                const videos = await this.client.youtube.searchVideos(searchString, 12);
                if (videos.length === 0) return message.channel.send(new MessageEmbed().setDescription("I could not obtain any search results!").setColor("#FFFF00"));
                let index = 0;
                const msg = await message.channel.send(new MessageEmbed()
                    .setAuthor("Song Selection")
                    .setDescription(`${videos.map(video => `**${++index} -** ${this.cleanTitle(video.title)}`).join("\n")}\n` +
                        "*Type `cancel` or `c` to cancel song selection*")
                    .setThumbnail(message.client.user?.displayAvatarURL() as string)
                    .setColor("#00FF00")
                    .setFooter("Please provide a value to select one of the search results ranging from 1-12"));
                try {
                    // eslint-disable-next-line no-var
                    var response = await message.channel.awaitMessages((msg2: IMessage) => {
                        if (message.author.id !== msg2.author.id) return false;

                        if (msg2.content === "cancel" || msg2.content === "c") return true;
                        return Number(msg2.content) > 0 && Number(msg2.content) < 13;
                    }, {
                        max: 1,
                        time: 20000,
                        errors: ["time"]
                    });
                    msg.delete().catch(e => this.client.logger.error("PLAY_CMD_ERR:", e));
                    response.first()?.delete({ timeout: 3000 }).catch(e => e); // do nothing
                } catch (error) {
                    msg.delete().catch(e => this.client.logger.error("PLAY_CMD_ERR:", e));
                    return message.channel.send(new MessageEmbed().setDescription("No or invalid value entered, song selection canceled.").setColor("#FF0000"));
                }
                if (response.first()?.content === "c" || response.first()?.content === "cancel") {
                    return message.channel.send(new MessageEmbed().setDescription("Song selection canceled").setColor("#00FF00"));
                }
                const videoIndex = parseInt(response.first()?.content as string, 10);
                // eslint-disable-next-line no-var
                video = await this.client.youtube.getVideo(videos[videoIndex - 1].id);
            } catch (err) {
                this.client.logger.error("YT_SEARCH_ERR: ", err);
                return message.channel.send(new MessageEmbed().setDescription("I could not obtain any search results!").setColor("#FFFF00"));
            }
        }
        return this.handleVideo(video, message, voiceChannel);
    }

    private async handleVideo(video: Video, message: IMessage, voiceChannel: VoiceChannel, playlist = false): Promise<any> {
        const song: ISong = {
            id: video.id,
            title: this.cleanTitle(video.title),
            url: video.url
        };
        if (message.guild?.queue) {
            if (!this.client.config.allowDuplicate && message.guild.queue.songs.find(s => s.id === song.id)) {
                return message.channel.send(new MessageEmbed()
                    .setTitle("Already queued.")
                    .setColor("#FFFF00")
                    .setDescription(`Song: **[${song.title}](${song.id})** is already queued, and this bot configuration disallow duplicated song in queue, ` +
                `please use \`${this.client.config.prefix}repeat\` instead`));
            }
            message.guild.queue.songs.addSong(song);
            if (playlist) return;
            message.channel.send(new MessageEmbed().setDescription(`✅ Song **[${song.title}](${song.url})** has been added to the queue`).setColor("#00FF00"))
                .catch(e => this.client.logger.error("PLAY_CMD_ERR:", e));
        } else {
            message.guild!.queue = new ServerQueue(message.channel, voiceChannel);
            message.guild?.queue.songs.addSong(song);
            try {
                const connection = await message.guild?.queue.voiceChannel?.join();
                message.guild!.queue.connection = connection!;
            } catch (error) {
                message.guild?.queue.songs.clear();
                message.guild!.queue = null;
                this.client.logger.error("PLAY_CMD_ERR:", error);
                message.channel.send(new MessageEmbed().setDescription(`Error: Could not join the voice channel. reason:\n\`${error}\``).setColor("#FF0000"))
                    .catch(e => this.client.logger.error("PLAY_CMD_ERR:", e));
                return undefined;
            }
            this.play(message.guild!).catch(err => {
                message.channel.send(new MessageEmbed().setDescription(`Error while trying to play music:\n\`${err}\``).setColor("#FF0000"))
                    .catch(e => this.client.logger.error("PLAY_CMD_ERR:", e));
                return this.client.logger.error("PLAY_CMD_ERR:", err);
            });
        }
        return message;
    }

    private async play(guild: IGuild): Promise<any> {
        const serverQueue = guild.queue!;
        const song = serverQueue.songs.first();
        if (!song) {
            serverQueue.textChannel?.send(
                new MessageEmbed().setDescription(`⏹ Queue is finished! Use "${guild.client.config.prefix}play" to play more songs`).setColor("#00FF00")
            ).catch(e => this.client.logger.error("PLAY_ERR:", e));
            serverQueue.connection?.disconnect();
            return guild.queue = null;
        }

        serverQueue.connection?.voice?.setSelfDeaf(true).catch(e => this.client.logger.error("PLAY_ERR:", e));
        const songData = await ytdl(song.url, { cache: this.client.config.cacheYoutubeDownloads, cacheMaxLength: this.client.config.cacheMaxLengthAllowed });

        if (songData.cache) this.client.logger.info(`${this.client.shard ? `[Shard #${this.client.shard.ids}]` : ""} Using cache for song "${song.title}" on ${guild.name}`);

        serverQueue.connection?.play(songData.stream, { type: songData.canDemux ? "webm/opus" : "unknown", bitrate: "auto", highWaterMark: 1 })
            .on("start", () => {
                serverQueue.playing = true;
                this.client.logger.info(`${this.client.shard ? `[Shard #${this.client.shard.ids}]` : ""} Song: "${song.title}" on ${guild.name} started`);
                serverQueue.textChannel?.send(new MessageEmbed().setDescription(`▶ Start playing: **[${song.title}](${song.url})**`).setColor("#00FF00"))
                    .catch(e => this.client.logger.error("PLAY_ERR:", e));
            })
            .on("finish", () => {
                this.client.logger.info(`${this.client.shard ? `[Shard #${this.client.shard.ids}]` : ""} Song: "${song.title}" on ${guild.name} ended`);
                // eslint-disable-next-line max-statements-per-line
                if (serverQueue.loopMode === 0) { serverQueue.songs.deleteFirst(); } else if (serverQueue.loopMode === 2) { serverQueue.songs.deleteFirst(); serverQueue.songs.addSong(song); }
                serverQueue.textChannel?.send(new MessageEmbed().setDescription(`⏹ Stop playing: **[${song.title}](${song.url})**`).setColor("#00FF00"))
                    .catch(e => this.client.logger.error("PLAY_ERR:", e));
                this.play(guild).catch(e => {
                    serverQueue.textChannel?.send(new MessageEmbed().setDescription(`Error while trying to play music:\n\`${e}\``).setColor("#FF0000"))
                        .catch(e => this.client.logger.error("PLAY_ERR:", e));
                    serverQueue.connection?.dispatcher.end();
                    return this.client.logger.error("PLAY_ERR:", e);
                });
            })
            .on("error", (err: Error) => {
                this.client.logger.error("PLAY_ERR:", err);
            })
            .setVolume(serverQueue.volume / guild.client.config.maxVolume);
    }

    private cleanTitle(title: string): string {
        return Util.escapeMarkdown(decodeHTML(title));
    }
}
