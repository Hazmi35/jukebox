import { joinVoiceChannel } from "@discordjs/voice";
import { Message, StageChannel, TextChannel, Util, VoiceChannel, Collection, Snowflake } from "discord.js";
import { decodeHTML } from "entities";
import { URL } from "url";
import { Client, LiveVideo, MixPlaylist, Playlist, Video, VideoCompact } from "youtubei";
import { BaseCommand } from "../structures/BaseCommand";
import { ServerQueue } from "../structures/ServerQueue";
import { YouTubeTrack } from "../structures/YouTubeTrack";
import { ITrackMetadata } from "../typings";
import { createEmbed, hexColorsType } from "../utils/createEmbed";
import { DefineCommand } from "../utils/decorators/DefineCommand";
import { isSameVoiceChannel, isUserInTheVoiceChannel, isValidVoiceChannel } from "../utils/decorators/MusicHelper";

@DefineCommand({
    aliases: ["play-music", "add", "p"],
    name: "play",
    description: lang => lang.COMMAND_PLAY_META_DESCRIPTION(),
    usage: lang => `{prefix}play <${lang.COMMAND_PLAY_META_ARGS(0)}>`
})
export class PlayCommand extends BaseCommand {
    private readonly youtubeHostnames = ["youtu.be", "youtube.com", "www.youtube.com", "music.youtube.com"];
    private readonly youtube = new Client();
    private readonly playlistAlreadyQueued: Collection<Snowflake, ITrackMetadata[]> = new Collection();

    @isUserInTheVoiceChannel()
    @isValidVoiceChannel()
    @isSameVoiceChannel()
    public async execute(message: Message, args: string[]): Promise<any> {
        const voiceChannel = message.member!.voice.channel!;

        if (!args[0]) {
            return message.channel.send({
                embeds: [createEmbed("error", this.client.lang.COMMAND_INVALID_ARGS(message.client.config.prefix, this.meta.name))]
            });
        }

        const searchString = args.join(" ");
        const parsedUrl = this.getURL(searchString);
        const youtubeURL = this.youtubeHostnames.includes(parsedUrl?.hostname as string) ? parsedUrl : undefined;

        if (message.guild!.queue !== null && voiceChannel.id !== message.guild!.queue.voiceChannel?.id) {
            return message.channel.send({
                embeds: [createEmbed("warn", this.client.lang.COMMAND_PLAY_ALREADY_PLAYING(message.guild!.queue.voiceChannel!.name))]
            });
        }

        try {
            let trackResource: Video | LiveVideo | undefined = undefined;
            if (parsedUrl) {
                if (youtubeURL) {
                    if (youtubeURL.hostname === "youtu.be") {
                        trackResource = await this.youtube.getVideo(youtubeURL.pathname.slice(1));
                    } else if (youtubeURL.pathname === "/watch" && youtubeURL.searchParams.has("v")) {
                        trackResource = await this.youtube.getVideo(youtubeURL.searchParams.get("v")!);
                        if (youtubeURL.searchParams.has("list")) {
                            const index = Number(youtubeURL.searchParams.get("index") ?? -1);
                            this.loadYouTubePlaylist(youtubeURL.searchParams.get("list")!, message, voiceChannel, true, index)
                                .catch(e => this.client.logger.error("PLAY_CMD_ERR:", e));
                        }
                    } else if (youtubeURL.pathname === "/playlist" && youtubeURL.searchParams.has("list")) {
                        return this.loadYouTubePlaylist(youtubeURL.searchParams.get("list")!, message, voiceChannel);
                    } else {
                        return message.channel.send({
                            embeds: [createEmbed("error", this.client.lang.COMMAND_PLAY_INVALID_YOUTUBE_URL())]
                        });
                    }
                } else {
                    return message.channel.send({
                        embeds: [createEmbed("error", this.client.lang.COMMAND_PLAY_INVALID_SOURCE())]
                    });
                }
            } else {
                const searchResults = await this.createSearchPrompt(searchString, message);
                if (searchResults === "canceled") return undefined;
                trackResource = searchResults;
            }
            if (trackResource === undefined) {
                return message.channel.send({
                    embeds: [createEmbed("error", this.client.lang.COMMAND_PLAY_COULD_NOT_RESOLVE_RESOURCE())]
                });
            }
            await this.handleVideo(trackResource, message, voiceChannel);
        } catch (error: any) {
            // TODO: Remove this next line if https://github.com/SuspiciousLookingOwl/youtubei/issues/37 is resolved.
            if (error.message === "Cannot read properties of undefined (reading 'find')") error = new Error(this.client.lang.COMMAND_PLAY_RESOURCE_NOT_FOUND());
            else this.client.logger.error("PLAY_ERR:", error);

            message.channel.send({ embeds: [createEmbed("error", this.client.lang.COMMAND_PLAY_RESOURCE_PROCESSING_ERR(error.message as string))] })
                .catch(e => this.client.logger.error("PLAY_CMD_ERR:", e));
        }
    }

    private async handleVideo(
        resource: handleVideoResourceType,
        message: Message,
        voiceChannel: VoiceChannel | StageChannel,
        playlist = false,
        restPlaylist = false
    ): Promise<any> {
        // NOTE: handleVideo function can only add YouTube videos, for now.
        const metadata = {
            id: resource.id,
            thumbnail: resource.thumbnails.best!,
            title: this.cleanTitle(resource.title),
            url: this.generateYouTubeURL(resource.id, "video")
        };
        const addedTrackMsg = (metadata: ITrackMetadata): void => {
            message.channel.send({
                embeds: [createEmbed("info", this.client.lang.COMMAND_PLAY_TRACK_ADDED(metadata.title, metadata.url)).setThumbnail(metadata.thumbnail)]
            }).catch(e => this.client.logger.error("PLAY_CMD_ERR:", e));
        };
        if (message.guild?.queue) {
            const track = new YouTubeTrack(message.guild.queue, metadata, this.client.config.enableInlineVolume);
            if (!this.client.config.allowDuplicate && message.guild.queue.tracks.find(s => s.metadata.id === metadata.id)) {
                if (playlist) {
                    const playlistAlreadyQueued = this.playlistAlreadyQueued.get(message.guild.id) ?? [];
                    playlistAlreadyQueued.push(metadata);
                    this.playlistAlreadyQueued.set(message.guild.id, playlistAlreadyQueued);
                    return undefined;
                }
                return message.channel.send({
                    embeds: [
                        createEmbed("warn", this.client.lang.COMMAND_PLAY_ALREADY_QUEUED_MSG(metadata.title, metadata.url, message.client.config.prefix))
                            .setTitle(this.client.lang.COMMAND_PLAY_ALREADY_QUEUED_TITLE())
                            .setThumbnail(metadata.thumbnail)
                    ]
                });
            }
            message.guild.queue.tracks.add(track);
            if (!playlist) addedTrackMsg(metadata);
        } else {
            if (restPlaylist) return undefined;
            message.guild!.queue = new ServerQueue(this.client, message.guild!, message.channel as TextChannel, voiceChannel);
            const track = new YouTubeTrack(message.guild!.queue, metadata, this.client.config.enableInlineVolume);
            message.guild!.queue.tracks.add(track);
            if (!playlist) addedTrackMsg(metadata);
            try {
                const connection = await joinVoiceChannel({
                    channelId: voiceChannel.id,
                    guildId: message.guild!.id,
                    adapterCreator: message.guild!.voiceAdapterCreator,
                    selfDeaf: true
                });
                message.guild!.queue.connection = connection;
            } catch (error: any) {
                message.guild?.queue.tracks.clear();
                message.guild!.queue = null;
                this.client.logger.error("HANDLE_VIDEO_ERR:", error);
                message.channel.send({ embeds: [createEmbed("error", this.client.lang.COMMAND_PLAY_COULD_NOT_JOIN_VC(error.message as string))] })
                    .catch(e => this.client.logger.error("HANDLE_VIDEO_ERR:", e));
                return undefined;
            }
            message.guild?.queue.play(track);
        }
    }

    private async loadYouTubePlaylist(id: string, message: Message, voiceChannel: VoiceChannel | StageChannel, watchEndpoint = false, index = 1): Promise<any> {
        const playlist = await this.youtube.getPlaylist(id);
        if (playlist === undefined) return message.channel.send({ embeds: [createEmbed("error", this.client.lang.COMMAND_PLAY_YOUTUBE_PLAYLIST_NOT_FOUND())] });
        if (playlist.videoCount === 0) return message.channel.send({ embeds: [createEmbed("error", this.client.lang.COMMAND_PLAY_YOUTUBE_PLAYLIST_EMPTY())] });
        if (playlist instanceof MixPlaylist) {
            return message.channel.send({ embeds: [createEmbed("error", this.client.lang.COMMAND_PLAY_YOUTUBE_RD_PLAYLIST_NOT_SUPPORTED())] });
        }

        const playlistTitle = `**[${playlist.title}](${this.generateYouTubeURL(playlist.id, "playlist")})**`;

        let addingPlaylistVideoMessage;
        let successMsg = this.client.lang.COMMAND_PLAY_YOUTUBE_PLAYLIST_SUCCESS(playlistTitle);
        const sendMsg = async (msg: string, type: hexColorsType): Promise<Message> => message.channel.send({
            embeds: [
                createEmbed(type, msg)
                    .setThumbnail(playlist.videos[0].thumbnails.best!)
            ]
        });

        if (watchEndpoint) {
            const { metadata } = message.guild!.queue!.tracks.first()!;
            const videoTitle = `**[${metadata.title}](${this.generateYouTubeURL(metadata.id, "video")})**`;

            addingPlaylistVideoMessage = await sendMsg(this.client.lang.COMMAND_PLAY_YOUTUBE_PLAYLIST_ADDING_VIDEOS_FROM(videoTitle, playlistTitle), "info");
            successMsg = this.client.lang.COMMAND_PLAY_YOUTUBE_PLAYLIST_SUCCESS2(playlistTitle, videoTitle);
        } else {
            addingPlaylistVideoMessage = await sendMsg(this.client.lang.COMMAND_PLAY_YOUTUBE_PLAYLIST_ADDING_ALL_VIDEOS(playlistTitle), "info");

            // Add the first video first.
            const firstVideo = await this.youtube.getVideo(playlist.videos[0].id);
            if (!firstVideo) {
                await sendMsg(this.client.lang.COMMAND_PLAY_YOUTUBE_PLAYLIST_ADDING_FIRST_VIDEOS_ERR(playlistTitle), "error");
                return addingPlaylistVideoMessage.delete();
            }
            await this.handleVideo(firstVideo, message, voiceChannel, true, false);
        }

        const videos = await this.loadYouTubePlaylistVideos(playlist, message, index, message.guild!.queue!.tracks.first()!.metadata.id);
        if (!videos) {
            await sendMsg(this.client.lang.COMMAND_PLAY_YOUTUBE_PLAYLIST_ADDING_REST_VIDEOS_ERR(playlistTitle), "error");
            return addingPlaylistVideoMessage.delete();
        }
        for (const video of videos) {
            if (message.guild?.queue === null) return addingPlaylistVideoMessage.delete();
            await this.handleVideo(video, message, voiceChannel, true, true);
        }

        const alreadyQueued = this.playlistAlreadyQueued.get(message.guild!.id) ?? [];
        if (alreadyQueued.length !== 0) {
            let num = 1;
            const tracks = alreadyQueued.map(t => `**${num++}.** **[${t.title}](${this.generateYouTubeURL(t.id, "video")})**`);
            message.channel.send({
                embeds: [createEmbed("warn", this.client.lang.COMMAND_PLAY_ALREADY_QUEUED_MSG2(alreadyQueued.length, message.client.config.prefix))]
            }).catch(e => this.client.logger.error("PLAYLIST_LOAD_ERR:", e));
            const pages = this.client.util.paginate(tracks.join("\n"));
            let howManyMessage = 0;
            for (const page of pages) {
                howManyMessage++;
                const embed = createEmbed("warn", page as string);
                if (howManyMessage === 1) embed.setTitle(this.client.lang.COMMAND_PLAY_ALREADY_QUEUED_TITLE2());
                await message.channel.send({ embeds: [embed] });
            }
            this.playlistAlreadyQueued.delete(message.guild!.id);
        }

        await sendMsg(successMsg, "info");
        return addingPlaylistVideoMessage.delete();
    }

    private async loadYouTubePlaylistVideos(playlist: Playlist, message: Message, startIndex: number, currentId: string): Promise<VideoCompact[] | undefined> {
        try {
            await playlist.next(0);
            const { videos } = playlist;
            if (startIndex === -1) startIndex = videos.findIndex(s => s.id === currentId) + 1;
            return videos.slice(startIndex, videos.length);
        } catch (e: any) {
            this.client.logger.error("LOAD_PLAYLIST_ERR:", new Error(e.stack as string));
            message.channel.send({ embeds: [createEmbed("error", this.client.lang.COMMAND_PLAY_YOUTUBE_PLAYLIST_LOAD_ERR(e.message as string))] })
                .catch(e => this.client.logger.error("LOAD_PLAYLIST_ERR:", new Error(e as string)));
            return undefined;
        }
    }

    private async createSearchPrompt(searchString: string, message: Message): Promise<Video | LiveVideo | "canceled" | undefined> {
        const videos = await this.youtube.search(searchString, { type: "video" }) as unknown as VideoCompact[];
        if (videos.length === 0) {
            await message.channel.send({ embeds: [createEmbed("warn", this.client.lang.COMMAND_PLAY_YOUTUBE_SEARCH_NO_RESULTS())] });
            return undefined;
        }
        if (videos.length === 1 || this.client.config.disableTrackSelection) return this.youtube.getVideo(videos[0].id);

        let index = 0;
        const videosSliced = videos.slice(0, this.client.config.searchMaxResults);
        const msg = await message.channel.send({
            embeds: [
                createEmbed("info")
                    .setAuthor(this.client.lang.COMMAND_PLAY_YOUTUBE_SEARCH_RESULTS_EMBED_TITLE())
                    .setDescription(
                        `${videosSliced.map(video => `**${++index} -** ${this.cleanTitle(video.title)}`).join("\n")}\n` +
                    `*${this.client.lang.COMMAND_PLAY_YOUTUBE_SEARCH_RESULTS_CANCEL_MSG()}*`
                    )
                    .setThumbnail(message.client.user?.displayAvatarURL() as string)
                    .setFooter(this.client.lang.COMMAND_PLAY_YOUTUBE_SEARCH_RESULTS_EMBED_FOOTER(videosSliced.length))
            ]
        });

        try {
            const response = await message.channel.awaitMessages({
                filter: msg2 => {
                    if (msg2.author.id !== message.author.id) return false;
                    if (msg2.content === "cancel" || msg2.content === "c") return true;
                    return Number(msg2.content) > 0 && Number(msg2.content) < (this.client.config.searchMaxResults + 1);
                },
                max: 1,
                time: this.client.config.selectTimeout,
                errors: ["time"]
            });
            msg.delete().catch(e => this.client.logger.error("CREATE_SEARCH_PROMPT_ERR:", e));
            response.first()?.delete().catch(e => e); // do nothing

            if (response.first()?.content === "c" || response.first()?.content === "cancel") {
                await message.channel.send({ embeds: [createEmbed("info", this.client.lang.COMMAND_PLAY_YOUTUBE_SEARCH_CANCELED())] });
                return "canceled";
            }

            const videoIndex = parseInt(response.first()!.content);
            return this.youtube.getVideo(videos[videoIndex - 1].id);
        } catch (error) {
            msg.delete().catch(e => this.client.logger.error("CREATE_SEARCH_PROMPT_ERR:", e));
            message.channel.send({ embeds: [createEmbed("error", this.client.lang.COMMAND_PLAY_YOUTUBE_SEARCH_INVALID_INPUT())] })
                .catch(e => this.client.logger.error("CREATE_SEARCH_PROMPT_ERR:", e));
            return undefined;
        }
    }

    private cleanTitle(title: string): string {
        return Util.escapeMarkdown(decodeHTML(title));
    }

    private generateYouTubeURL(id: string, type: "playlist" | "video"): string {
        return type === "video" ? `https://youtube.com/watch?v=${id}` : `https://youtube.com/playlist?list=${id}`;
    }

    private getURL(string: string): URL | undefined {
        if (!string.startsWith("http://") && !string.startsWith("https://")) return undefined;

        return new URL(string);
    }
}

type handleVideoResourceType = Video | LiveVideo | VideoCompact;
