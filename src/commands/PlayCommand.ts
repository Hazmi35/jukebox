/* eslint-disable block-scoped-var, @typescript-eslint/restrict-template-expressions */
import { BaseCommand } from "../structures/BaseCommand";
import { ServerQueue } from "../structures/ServerQueue";
import { Util, MessageEmbed, VoiceChannel } from "discord.js";
import { decodeHTML } from "entities";
import { IMessage, ISong, IGuild, ITextChannel } from "../../typings";
import { DefineCommand } from "../utils/decorators/DefineCommand";
import { isUserInTheVoiceChannel, isSameVoiceChannel, isValidVoiceChannel } from "../utils/decorators/MusicHelper";
import { createEmbed } from "../utils/createEmbed";
import { Video } from "../utils/YouTube/structures/Video";
import { resolveYTPlaylistID, resolveYTVideoID } from "../utils/YouTube/utils/YouTubeAPI/resolveYTURL";

@DefineCommand({
    aliases: ["play-music", "add", "p"],
    name: "play",
    description: "Play some music",
    usage: "{prefix}play <yt video or playlist link / yt video name>"
})
export class PlayCommand extends BaseCommand {
    private readonly _playlistAlreadyQueued: ISong[] = [];

    @isUserInTheVoiceChannel()
    @isValidVoiceChannel()
    @isSameVoiceChannel()
    public async execute(message: IMessage, args: string[]): Promise<any> {
        const voiceChannel = message.member!.voice.channel!;
        if (!args[0]) {
            return message.channel.send(
                createEmbed("warn", `Invalid argument, type \`${this.client.config.prefix}help play\` for more info`)
            );
        }
        const searchString = args.join(" ");
        const url = searchString.replace(/<(.+)>/g, "$1");

        if (message.guild?.queue !== null && voiceChannel.id !== message.guild?.queue.voiceChannel?.id) {
            return message.channel.send(
                createEmbed("warn", `The music player is already playing to **${message.guild?.queue.voiceChannel?.name}** voice channel`)
            );
        }

        if (/^https?:\/\/((www|music)\.youtube\.com|youtube.com)\/playlist(.*)$/.exec(url)) {
            try {
                const id = resolveYTPlaylistID(url);
                if (!id) return message.channel.send(createEmbed("error", "Invalid YouTube Playlist URL"));
                const playlist = await this.client.youtube.getPlaylist(id);
                const videos = await playlist.getVideos();
                let skippedVideos = 0;
                const addingPlaylistVideoMessage = await message.channel.send(
                    createEmbed("info", `Adding all videos in playlist: **[${playlist.title}](${playlist.url})**, hang on...`)
                        .setThumbnail(playlist.thumbnailURL)
                );
                for (const video of Object.values(videos)) {
                    if (video.isPrivate) {
                        skippedVideos++;
                        continue;
                    } else {
                        const video2 = await this.client.youtube.getVideo(video.id);
                        await this.handleVideo(video2, message, voiceChannel, true);
                    }
                }
                if (skippedVideos !== 0) {
                    message.channel.send(
                        createEmbed("warn", `${skippedVideos} ${skippedVideos >= 2 ? "videos" : "video"} are skipped because it's a private video`)
                    ).catch(e => this.client.logger.error("PLAY_CMD_ERR:", e));
                }
                if (this._playlistAlreadyQueued.length !== 0) {
                    let num = 1;
                    const songs = this._playlistAlreadyQueued.map(s => `**${num++}.** **[${s.title}](${s.url})**`);
                    message.channel.send(
                        createEmbed("warn", `Over ${this._playlistAlreadyQueued.length} ${this._playlistAlreadyQueued.length >= 2 ? "videos" : "video"} are skipped because it was a duplicate` +
                        ` and this bot configuration disallow duplicated music in queue, please use \`${this.client.config.prefix}repeat\` instead`)
                            .setTitle("Already queued / duplicate")
                    ).catch(e => this.client.logger.error("PLAY_CMD_ERR:", e));
                    const pages = this.paginate(songs.join("\n"));
                    let howManyMessage = 0;
                    for (const page of pages) {
                        howManyMessage++;
                        const embed = createEmbed(`warn`, page);
                        if (howManyMessage === 1) embed.setTitle("Duplicated music");
                        await message.channel.send(embed);
                    }
                    this._playlistAlreadyQueued.splice(0, this._playlistAlreadyQueued.length);
                }
                message.channel.messages.fetch(addingPlaylistVideoMessage.id, false).then(m => m.delete()).catch(e => this.client.logger.error("YT_PLAYLIST_ERR:", e));
                if (skippedVideos === playlist.itemCount) {
                    return message.channel.send(
                        createEmbed("error", `Failed to load playlist **[${playlist.title}](${playlist.url})** because all of the items are private videos`)
                            .setThumbnail(playlist.thumbnailURL)
                    );
                }
                return message.channel.send(
                    createEmbed("info", `All videos in playlist: **[${playlist.title}](${playlist.url})**, has been added to the queue!`)
                        .setThumbnail(playlist.thumbnailURL)
                );
            } catch (e) {
                this.client.logger.error("YT_PLAYLIST_ERR:", new Error(e.stack));
                return message.channel.send(createEmbed("error", `I could not load the playlist!\nError: \`${e.message}\``));
            }
        }
        try {
            const id = resolveYTVideoID(url);
            if (!id) return message.channel.send(createEmbed("error", "Invalid YouTube Video URL"));
            // eslint-disable-next-line no-var, block-scoped-var
            var video = await this.client.youtube.getVideo(id);
        } catch (e) {
            try {
                const videos = await this.client.youtube.searchVideos(searchString, this.client.config.searchMaxResults);
                if (videos.length === 0) return message.channel.send(createEmbed("warn", "I could not obtain any search results!"));

                if (videos.length === 1 || this.client.config.disableSongSelection) {
                    video = await this.client.youtube.getVideo(videos[0].id);
                } else {
                    let index = 0;
                    const msg = await message.channel.send(new MessageEmbed()
                        .setAuthor("Music Selection")
                        .setDescription(`${videos.map(video => `**${++index} -** ${this.cleanTitle(video.title)}`).join("\n")}\n` +
                        "*Type `cancel` or `c` to cancel music selection*")
                        .setThumbnail(message.client.user?.displayAvatarURL() as string)
                        .setColor("#00FF00")
                        .setFooter("Please select one of the results ranging from 1-12"));
                    try {
                    // eslint-disable-next-line no-var
                        var response = await message.channel.awaitMessages((msg2: IMessage) => {
                            if (message.author.id !== msg2.author.id) return false;

                            if (msg2.content === "cancel" || msg2.content === "c") return true;
                            return Number(msg2.content) > 0 && Number(msg2.content) < 13;
                        }, {
                            max: 1,
                            time: this.client.config.selectTimeout,
                            errors: ["time"]
                        });
                        msg.delete().catch(e => this.client.logger.error("PLAY_CMD_ERR:", e));
                        response.first()?.delete({ timeout: 3000 }).catch(e => e); // do nothing
                    } catch (error) {
                        msg.delete().catch(e => this.client.logger.error("PLAY_CMD_ERR:", e));
                        return message.channel.send(createEmbed("error", "No or invalid value entered, music selection canceled."));
                    }
                    if (response.first()?.content === "c" || response.first()?.content === "cancel") {
                        return message.channel.send(createEmbed("info", "Music selection canceled."));
                    }
                    const videoIndex = parseInt(response.first()?.content as string);
                    video = await this.client.youtube.getVideo(videos[videoIndex - 1].id);
                }
            } catch (err) {
                this.client.logger.error("YT_SEARCH_ERR:", err);
                return message.channel.send(createEmbed("error", `I could not obtain any search results!\nError: \`${err.message}\``));
            }
        }
        return this.handleVideo(video, message, voiceChannel);
    }

    private async handleVideo(video: Video, message: IMessage, voiceChannel: VoiceChannel, playlist = false): Promise<any> {
        const song: ISong = {
            id: video.id,
            title: this.cleanTitle(video.title),
            url: video.url,
            thumbnail: video.thumbnailURL
        };
        if (message.guild?.queue) {
            if (!this.client.config.allowDuplicate && message.guild.queue.songs.find(s => s.id === song.id)) {
                if (playlist) return this._playlistAlreadyQueued.push(song);
                return message.channel.send(
                    createEmbed("warn", `Music **[${song.title}](${song.url})** is already queued, and this bot configuration disallow duplicated music in queue, ` +
                `please use \`${this.client.config.prefix}repeat\` instead`)
                        .setTitle("Already queued / duplicate")
                        .setThumbnail(song.thumbnail)
                );
            }
            message.guild.queue.songs.addSong(song);
            if (!playlist) {
                message.channel.send(createEmbed("info", `✅ Music **[${song.title}](${song.url})** has been added to the queue`).setThumbnail(song.thumbnail))
                    .catch(e => this.client.logger.error("PLAY_CMD_ERR:", e));
            }
        } else {
            message.guild!.queue = new ServerQueue(message.channel as ITextChannel, voiceChannel);
            message.guild?.queue.songs.addSong(song);
            if (!playlist) {
                message.channel.send(createEmbed("info", `✅ Music **[${song.title}](${song.url})** has been added to the queue`).setThumbnail(song.thumbnail))
                    .catch(e => this.client.logger.error("PLAY_CMD_ERR:", e));
            }
            try {
                const connection = await message.guild!.queue.voiceChannel!.join();
                message.guild!.queue.connection = connection;
            } catch (error) {
                message.guild?.queue.songs.clear();
                message.guild!.queue = null;
                this.client.logger.error("PLAY_CMD_ERR:", error);
                message.channel.send(createEmbed("error", `Error: Could not join the voice channel!\nReason: \`${error.message}\``))
                    .catch(e => this.client.logger.error("PLAY_CMD_ERR:", e));
                return undefined;
            }
            this.play(message.guild!).catch(err => {
                message.channel.send(createEmbed("error", `Error while trying to play music\nReason: \`${err.message}\``))
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
            if (serverQueue.lastMusicMessageID !== null) serverQueue.textChannel?.messages.fetch(serverQueue.lastMusicMessageID, false).then(m => m.delete()).catch(e => this.client.logger.error("PLAY_ERR:", e));
            if (serverQueue.lastVoiceStateUpdateMessageID !== null) serverQueue.textChannel?.messages.fetch(serverQueue.lastVoiceStateUpdateMessageID, false).then(m => m.delete()).catch(e => this.client.logger.error("PLAY_ERR:", e));
            serverQueue.textChannel?.send(
                createEmbed("info", `⏹ Queue is finished! Use "${guild.client.config.prefix}play" to play more music`)
            ).catch(e => this.client.logger.error("PLAY_ERR:", e));
            serverQueue.connection?.disconnect();
            return guild.queue = null;
        }

        serverQueue.connection?.voice?.setSelfDeaf(true).catch(e => this.client.logger.error("PLAY_ERR:", e));
        const songData = await this.client.youtube.downloadVideo(song.url, {
            cache: this.client.config.cacheYoutubeDownloads,
            cacheMaxLength: this.client.config.cacheMaxLengthAllowed,
            skipFFmpeg: true
        });

        if (songData.cache) this.client.logger.info(`${this.client.shard ? `[Shard #${this.client.shard.ids}]` : ""} Using cache for music "${song.title}" on ${guild.name}`);

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        songData.on("error", err => { err.message = `YTDLError: ${err.message}`; serverQueue.connection?.dispatcher?.emit("error", err); });

        serverQueue.connection?.play(songData, { type: songData.info.canSkipFFmpeg ? "webm/opus" : "unknown", bitrate: "auto", highWaterMark: 1 })
            .on("start", () => {
                serverQueue.playing = true;
                this.client.logger.info(`${this.client.shard ? `[Shard #${this.client.shard.ids}]` : ""} Music: "${song.title}" on ${guild.name} started`);
                if (serverQueue.lastMusicMessageID !== null) serverQueue.textChannel?.messages.fetch(serverQueue.lastMusicMessageID, false).then(m => m.delete()).catch(e => this.client.logger.error("PLAY_ERR:", e));
                serverQueue.textChannel?.send(createEmbed("info", `▶ Start playing: **[${song.title}](${song.url})**`).setThumbnail(song.thumbnail))
                    .then(m => serverQueue.lastMusicMessageID = m.id)
                    .catch(e => this.client.logger.error("PLAY_ERR:", e));
            })
            .on("finish", () => {
                this.client.logger.info(`${this.client.shard ? `[Shard #${this.client.shard.ids}]` : ""} Music: "${song.title}" on ${guild.name} ended`);
                // eslint-disable-next-line max-statements-per-line
                if (serverQueue.loopMode === 0) { serverQueue.songs.deleteFirst(); } else if (serverQueue.loopMode === 2) { serverQueue.songs.deleteFirst(); serverQueue.songs.addSong(song); }
                if (serverQueue.lastMusicMessageID !== null) serverQueue.textChannel?.messages.fetch(serverQueue.lastMusicMessageID, false).then(m => m.delete()).catch(e => this.client.logger.error("PLAY_ERR:", e));
                serverQueue.textChannel?.send(createEmbed("info", `⏹ Stop playing: **[${song.title}](${song.url})**`).setThumbnail(song.thumbnail))
                    .then(m => serverQueue.lastMusicMessageID = m.id)
                    .catch(e => this.client.logger.error("PLAY_ERR:", e))
                    .finally(() => {
                        this.play(guild).catch(e => {
                            serverQueue.textChannel?.send(createEmbed("error", `Error while trying to play music\nReason: \`${e}\``))
                                .catch(e => this.client.logger.error("PLAY_ERR:", e));
                            serverQueue.connection?.dispatcher.end();
                            return this.client.logger.error("PLAY_ERR:", e);
                        });
                    });
            })
            .on("error", (err: Error) => {
                serverQueue.textChannel?.send(createEmbed("error", `Error while playing music\nReason: \`${err.message}\``))
                    .catch(e => this.client.logger.error("PLAY_CMD_ERR:", e));
                guild.queue?.voiceChannel?.leave();
                guild.queue = null;
                this.client.logger.error("PLAY_ERR:", err);
            })
            .setVolume(serverQueue.volume / guild.client.config.maxVolume);
    }

    private paginate(text: string, limit = 2000): any[] {
        const lines = text.trim().split("\n");
        const pages = [];
        let chunk = "";

        for (const line of lines) {
            if (chunk.length + line.length > limit && chunk.length > 0) {
                pages.push(chunk);
                chunk = "";
            }

            if (line.length > limit) {
                const lineChunks = line.length / limit;

                for (let i = 0; i < lineChunks; i++) {
                    const start = i * limit;
                    const end = start + limit;
                    pages.push(line.slice(start, end));
                }
            } else {
                chunk += `${line}\n`;
            }
        }

        if (chunk.length > 0) {
            pages.push(chunk);
        }

        return pages;
    }

    private cleanTitle(title: string): string {
        return Util.escapeMarkdown(decodeHTML(title));
    }
}
