import { BaseCommand } from "../structures/BaseCommand";
import { loopMode, ServerQueue } from "../structures/ServerQueue";
import { Util, VoiceChannel, Message, TextChannel, Guild, Collection, Snowflake, StageChannel } from "discord.js";
import { decodeHTML } from "entities";
import { ISong } from "../typings";
import { DefineCommand } from "../utils/decorators/DefineCommand";
import { isUserInTheVoiceChannel, isSameVoiceChannel, isValidVoiceChannel } from "../utils/decorators/MusicHelper";
import { createEmbed } from "../utils/createEmbed";
import { Video } from "../utils/YouTube/structures/Video";
import { resolveYTPlaylistID, resolveYTVideoID } from "../utils/YouTube/utils/YouTubeAPI/resolveYTURL";
import { AudioPlayerError, AudioPlayerStatus, createAudioResource, joinVoiceChannel, VoiceConnectionStatus } from "@discordjs/voice";

@DefineCommand({
    aliases: ["play-music", "add", "p"],
    name: "play",
    description: "Play some music",
    usage: "{prefix}play <yt video or playlist link / yt video name>"
})
export class PlayCommand extends BaseCommand {
    private readonly playlistAlreadyQueued: Collection<Snowflake, ISong[]> = new Collection();

    @isUserInTheVoiceChannel()
    @isValidVoiceChannel()
    @isSameVoiceChannel()
    public async execute(message: Message, args: string[]): Promise<any> {
        const voiceChannel = message.member!.voice.channel!;
        if (!args[0]) {
            return message.channel.send({
                embeds: [createEmbed("warn", `Invalid argument, type \`${this.client.config.prefix}help play\` for more info`)]
            });
        }
        const searchString = args.join(" ");
        const url = searchString.replace(/<(.+)>/g, "$1");

        if (message.guild?.queue !== null && voiceChannel.id !== message.guild?.queue.voiceChannel?.id) {
            return message.channel.send({
                embeds: [createEmbed("warn", `The music player is already playing to **${message.guild!.queue.voiceChannel!.name}** voice channel`)]
            });
        }

        let video: Video | null = null;
        let response: Collection<Snowflake, Message> | null = null;

        if (/^https?:\/\/((www|music)\.youtube\.com|youtube.com)\/playlist(.*)$/.exec(url)) {
            try {
                const id = resolveYTPlaylistID(url);
                if (!id) return message.channel.send({ embeds: [createEmbed("error", "Invalid YouTube Playlist URL")] });
                const playlist = await this.client.youtube.getPlaylist(id);
                const videos = await playlist.getVideos();
                let skippedVideos = 0;
                const addingPlaylistVideoMessage = await message.channel.send({
                    embeds: [
                        createEmbed("info", `Adding all tracks in playlist: **[${playlist.title}](${playlist.url})**, hang on...`)
                            .setThumbnail(playlist.thumbnailURL)
                    ]
                });
                for (const video of Object.values(videos)) {
                    if (video.isPrivate) {
                        skippedVideos++;
                        continue;
                    } else {
                        await this.handleVideo(video, message, voiceChannel, true);
                    }
                }
                if (skippedVideos !== 0) {
                    message.channel.send({
                        embeds: [createEmbed("warn", `${skippedVideos} track${skippedVideos >= 2 ? "s" : ""} are skipped because it's a private video`)]
                    }).catch(e => this.client.logger.error("PLAY_CMD_ERR:", e));
                }
                const playlistAlreadyQueued = this.playlistAlreadyQueued.get(message.guild.id);
                if (!this.client.config.allowDuplicate && Number(playlistAlreadyQueued?.length) > 0) {
                    let num = 1;
                    const songs = playlistAlreadyQueued!.map(s => `**${num++}.** **[${s.title}](${s.url})**`);
                    message.channel.send({
                        embeds: [
                            createEmbed("warn", `Over ${playlistAlreadyQueued!.length} track${playlistAlreadyQueued!.length >= 2 ? "s" : ""} are skipped because it was a duplicate` +
                            ` and this bot configuration disallow duplicated tracks in queue, please use \`${this.client.config.prefix}repeat\` instead`)
                                .setTitle("Already queued / duplicate")
                        ]
                    }).catch(e => this.client.logger.error("PLAY_CMD_ERR:", e));
                    const pages = this.client.util.paginate(songs.join("\n"));
                    let howManyMessage = 0;
                    for (const page of pages) {
                        howManyMessage++;
                        const embed = createEmbed(`warn`, page);
                        if (howManyMessage === 1) embed.setTitle("Duplicated tracks");
                        await message.channel.send({ embeds: [embed] });
                    }
                    this.playlistAlreadyQueued.delete(message.guild.id);
                }
                message.channel.messages.fetch(addingPlaylistVideoMessage.id, { cache: false })
                    .then(m => m.delete()).catch(e => this.client.logger.error("YT_PLAYLIST_ERR:", e));
                if (skippedVideos === playlist.itemCount) {
                    return message.channel.send({
                        embeds: [
                            createEmbed("error", `Failed to load playlist **[${playlist.title}](${playlist.url})** because all of the items are private videos`)
                                .setThumbnail(playlist.thumbnailURL)
                        ]
                    });
                }
                return message.channel.send({
                    embeds: [
                        createEmbed("info", `All tracks in playlist: **[${playlist.title}](${playlist.url})**, has been added to the queue!`)
                            .setThumbnail(playlist.thumbnailURL)
                    ]
                });
            } catch (e) {
                this.client.logger.error("YT_PLAYLIST_ERR:", new Error(e.stack));
                return message.channel.send({ embeds: [createEmbed("error", `I could not load the playlist!\nError: \`${e.message}\``)] });
            }
        }
        try {
            const id = resolveYTVideoID(url);
            if (!id) return message.channel.send({ embeds: [createEmbed("error", "Invalid YouTube Video URL")] });
            video = await this.client.youtube.getVideo(id);
        } catch (e) {
            try {
                const videos = await this.client.youtube.searchVideos(searchString, this.client.config.searchMaxResults);
                if (videos.length === 0) return message.channel.send({ embeds: [createEmbed("warn", "I could not obtain any search results!")] });

                if (videos.length === 1 || this.client.config.disableSongSelection) {
                    video = await this.client.youtube.getVideo(videos[0].id);
                } else {
                    let index = 0;
                    const msg = await message.channel.send({
                        embeds: [
                            createEmbed("info")
                                .setAuthor("Tracks Selection")
                                .setDescription(
                                    `${videos.map(video => `**${++index} -** ${this.cleanTitle(video.title)}`).join("\n")}\n` +
                                "*Type `cancel` or `c` to cancel tracks selection*"
                                )
                                .setThumbnail(message.client.user?.displayAvatarURL() as string)
                                .setFooter("Please select one of the results ranging from 1-12")
                        ]
                    });
                    try {
                        response = await message.channel.awaitMessages({
                            filter: (msg2: Message) => {
                                if (message.author.id !== msg2.author.id) return false;
                                if (msg2.content === "cancel" || msg2.content === "c") return true;
                                return Number(msg2.content) > 0 && Number(msg2.content) < 13;
                            },
                            max: 1,
                            time: this.client.config.selectTimeout,
                            errors: ["time"]
                        });
                        msg.delete().catch(e => this.client.logger.error("PLAY_CMD_ERR:", e));
                        setTimeout(() => response?.first()?.delete().catch(e => e), 3000); // do nothing
                    } catch (error) {
                        msg.delete().catch(e => this.client.logger.error("PLAY_CMD_ERR:", e));
                        return message.channel.send({ embeds: [createEmbed("error", "No or invalid value entered, tracks selection canceled.")] });
                    }
                    if (response.first()?.content === "c" || response.first()?.content === "cancel") {
                        return message.channel.send({ embeds: [createEmbed("info", "Tracks selection canceled.")] });
                    }
                    const videoIndex = parseInt(response.first()?.content as string);
                    video = await this.client.youtube.getVideo(videos[videoIndex - 1].id);
                }
            } catch (err) {
                this.client.logger.error("YT_SEARCH_ERR:", err);
                return message.channel.send({ embeds: [createEmbed("error", `I could not obtain any search results!\nError: \`${err.message}\``)] });
            }
        }
        return this.handleVideo(video, message, voiceChannel);
    }

    private async handleVideo(video: Video, message: Message, voiceChannel: VoiceChannel | StageChannel, playlist = false): Promise<any> {
        const song: ISong = {
            id: video.id,
            title: this.cleanTitle(video.title),
            url: video.url,
            thumbnail: video.thumbnailURL
        };
        if (message.guild?.queue) {
            if (!this.client.config.allowDuplicate && message.guild.queue.songs.find(s => s.id === song.id)) {
                if (playlist) {
                    const playlistAlreadyQueued = this.playlistAlreadyQueued.get(message.guild.id) ?? [];
                    playlistAlreadyQueued.push(song);
                    this.playlistAlreadyQueued.set(message.guild.id, playlistAlreadyQueued);
                    return undefined;
                }
                return message.channel.send({
                    embeds: [
                        createEmbed("warn", `Track **[${song.title}](${song.url})** is already queued, and this bot configuration disallow duplicated tracks in queue, ` +
                        `please use \`${this.client.config.prefix}repeat\` instead`)
                            .setTitle("Already queued / duplicate")
                            .setThumbnail(song.thumbnail)
                    ]
                });
            }
            message.guild.queue.songs.addSong(song);
            if (!playlist) {
                message.channel.send({
                    embeds: [createEmbed("info", `✅ Track **[${song.title}](${song.url})** has been added to the queue`).setThumbnail(song.thumbnail)]
                }).catch(e => this.client.logger.error("PLAY_CMD_ERR:", e));
            }
        } else {
            message.guild!.queue = new ServerQueue(message.channel as TextChannel, voiceChannel);
            message.guild?.queue.songs.addSong(song);
            if (!playlist) {
                message.channel.send({
                    embeds: [createEmbed("info", `✅ Track **[${song.title}](${song.url})** has been added to the queue`).setThumbnail(song.thumbnail)]
                }).catch(e => this.client.logger.error("PLAY_CMD_ERR:", e));
            }
            try {
                const connection = await joinVoiceChannel({
                    channelId: voiceChannel.id,
                    guildId: message.guild!.id,
                    adapterCreator: message.guild!.voiceAdapterCreator,
                    selfDeaf: true
                });
                message.guild!.queue.connection = connection;
            } catch (error) {
                message.guild?.queue.songs.clear();
                message.guild!.queue = null;
                this.client.logger.error("PLAY_CMD_ERR:", error);
                message.channel.send({ embeds: [createEmbed("error", `Error: Could not join the voice channel!\nReason: \`${error.message}\``)] })
                    .catch(e => this.client.logger.error("PLAY_CMD_ERR:", e));
                return undefined;
            }
            this.play(message.guild!).catch(err => {
                message.channel.send({ embeds: [createEmbed("error", `Error while trying to play music\nReason: \`${err.message}\``)] })
                    .catch(e => this.client.logger.error("PLAY_CMD_ERR:", e));
                return this.client.logger.error("PLAY_CMD_ERR:", err);
            });
        }
        return message;
    }

    private async play(guild: Guild): Promise<any> {
        const serverQueue = guild.queue!;
        const song = serverQueue.songs.first();
        if (!song) {
            serverQueue.oldMusicMessage = null; serverQueue.oldVoiceStateUpdateMessage = null;
            serverQueue.textChannel?.send({
                embeds: [createEmbed("info", `⏹ Queue is finished! Use "${guild.client.config.prefix}play" to play more music`)]
            }).catch(e => this.client.logger.error("PLAY_ERR:", e));
            serverQueue.connection?.disconnect();
            return guild.queue = null;
        }

        const songData = await this.client.youtube.downloadVideo(song.url, {
            cache: this.client.config.cacheYoutubeDownloads,
            cacheMaxLength: this.client.config.cacheMaxLengthAllowed,
            skipFFmpeg: true
        });

        const playerResource = createAudioResource(songData, { inlineVolume: false }); // TODO: Add config for this.

        songData.on("error", err => { err.message = `YTDLError: ${err.message}`; serverQueue.player.emit("error", new AudioPlayerError(err, playerResource)); });

        serverQueue.player.play(playerResource);
        serverQueue.connection?.subscribe(serverQueue.player);

        if (songData.cache) this.client.logger.info(`${this.client.shard ? `[Shard #${this.client.shard.ids[0]}]` : ""} Using cache for music "${song.title}" on ${guild.name}`);

        serverQueue.connection?.on("stateChange", (_, newState) => {
            if (newState.status === VoiceConnectionStatus.Disconnected || newState.status === VoiceConnectionStatus.Destroyed) {
                guild.queue = null;
                serverQueue.player.stop();
                return undefined;
            }
        });

        serverQueue.player.on("stateChange", (_, newState) => {
            if (newState.status === AudioPlayerStatus.Playing) {
                serverQueue.playing = true;
                this.client.logger.info(`${this.client.shard ? `[Shard #${this.client.shard.ids[0]}]` : ""} Track: "${song.title}" on ${guild.name} started`);
                serverQueue.textChannel?.send({ embeds: [createEmbed("info", `▶ Start playing: **[${song.title}](${song.url})**`).setThumbnail(song.thumbnail)] })
                    .then(m => serverQueue.oldMusicMessage = m.id)
                    .catch(e => this.client.logger.error("PLAY_ERR:", e));
                return undefined;
            }
            if (newState.status === AudioPlayerStatus.Idle) {
                this.client.logger.info(`${this.client.shard ? `[Shard #${this.client.shard.ids[0]}]` : ""} Track: "${song.title}" on ${guild.name} ended`);
                if (serverQueue.loopMode === loopMode.off) {
                    serverQueue.songs.deleteFirst();
                } else if (serverQueue.loopMode === loopMode.all) {
                    serverQueue.songs.deleteFirst(); serverQueue.songs.addSong(song);
                }
                serverQueue.textChannel?.send({ embeds: [createEmbed("info", `⏹ Stop playing: **[${song.title}](${song.url})**`).setThumbnail(song.thumbnail)] })
                    .then(m => serverQueue.oldMusicMessage = m.id)
                    .catch(e => this.client.logger.error("PLAY_ERR:", e))
                    .finally(() => {
                        this.play(guild).catch(e => {
                            serverQueue.textChannel?.send({ embeds: [createEmbed("error", `Error while trying to play music\nReason: \`${e}\``)] })
                                .catch(e => this.client.logger.error("PLAY_ERR:", e));
                            serverQueue.connection?.disconnect();
                            return this.client.logger.error("PLAY_ERR:", e);
                        });
                    });
                return undefined;
            }
        });

        serverQueue.player.on("error", err => {
            serverQueue.textChannel?.send({ embeds: [createEmbed("error", `Error while playing music\nReason: \`${err.message}\``)] })
                .catch(e => this.client.logger.error("PLAY_CMD_ERR:", e));
            serverQueue.connection?.disconnect();
            guild.queue = null;
            this.client.logger.error("PLAY_ERR:", err);
        });
    }

    private cleanTitle(title: string): string {
        return Util.escapeMarkdown(decodeHTML(title));
    }
}
