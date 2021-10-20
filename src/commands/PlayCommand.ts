import { joinVoiceChannel } from "@discordjs/voice";
import { Message, StageChannel, TextChannel, Util, VoiceChannel, Collection, Snowflake } from "discord.js";
import { decodeHTML } from "entities";
import { URL } from "url";
import { Client, LiveVideo, MixPlaylist, Playlist, Video, VideoCompact } from "youtubei";
import { BaseCommand } from "../structures/BaseCommand";
import { ServerQueue } from "../structures/ServerQueue";
import { YouTubeTrack } from "../structures/YouTubeTrack";
import { ITrackMetadata } from "../typings";
import { createEmbed } from "../utils/createEmbed";
import { DefineCommand } from "../utils/decorators/DefineCommand";
import { isSameVoiceChannel, isUserInTheVoiceChannel, isValidVoiceChannel } from "../utils/decorators/MusicHelper";

@DefineCommand({
    aliases: ["play-music", "add", "p"],
    name: "play",
    description: lang => lang.COMMAND_PLAY_META_DESCRIPTION(),
    usage: lang => `{prefix}play <${lang.COMMAND_PLAY_META_ARGS()[0]}>`
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
                embeds: [createEmbed("warn", `Invalid argument, type \`${this.client.config.prefix}help play\` for more info`)]
            });
        }

        const searchString = args.join(" ");
        const parsedUrl = this.getURL(searchString);
        const youtubeURL = this.youtubeHostnames.includes(parsedUrl?.hostname as string) ? parsedUrl : undefined;

        if (message.guild!.queue !== null && voiceChannel.id !== message.guild!.queue.voiceChannel?.id) {
            return message.channel.send({
                embeds: [createEmbed("warn", `The music player is already playing to **${message.guild!.queue.voiceChannel!.name}** voice channel`)]
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
                            const index = Number(youtubeURL.searchParams.get("index") ?? 1);
                            this.loadPlaylist(youtubeURL.searchParams.get("list")!, message, voiceChannel, true, index)
                                .catch(e => this.client.logger.error("PLAY_CMD_ERR:", e));
                        }
                    } else if (youtubeURL.pathname === "/playlist" && youtubeURL.searchParams.has("list")) {
                        return this.loadPlaylist(youtubeURL.searchParams.get("list")!, message, voiceChannel);
                    } else {
                        return message.channel.send({
                            embeds: [createEmbed("error", `⚠️ Invalid YouTube URL`)]
                        });
                    }
                } else {
                    return message.channel.send({
                        embeds: [createEmbed("error", "⚠️ Jukebox currently only supports YouTube as a source.")]
                    });
                }
            } else {
                const searchResults = await this.createSearchPrompt(searchString, message);
                if (searchResults === "canceled") return undefined;
                trackResource = searchResults;
            }
            if (trackResource === undefined) {
                return message.channel.send({
                    embeds: [createEmbed("error", `⚠️ Could not resolve the track resource`)]
                });
            }
            await this.handleVideo(trackResource, message, voiceChannel);
        } catch (error: any) {
            // TODO: Remove this next line if https://github.com/SuspiciousLookingOwl/youtubei/issues/37 is resolved.
            if (error.message === "Cannot read properties of undefined (reading 'find')") error = new Error("404 YouTube Item not found.");
            else this.client.logger.error("PLAY_ERR:", error);

            message.channel.send({ embeds: [createEmbed("error", `Error while processing track resource\nReason: \`${error.message}\``)] })
                .catch(e => this.client.logger.error("PLAY_CMD_ERR:", e));
        }
    }

    private async handleVideo(resource: Video | LiveVideo, message: Message, voiceChannel: VoiceChannel | StageChannel, playlist = false, restPlaylist = false): Promise<any> {
        // NOTE: handleVideo function can only add YouTube videos, for now.
        const metadata = {
            id: resource.id,
            thumbnail: resource.thumbnails.best!,
            title: this.cleanTitle(resource.title),
            url: this.generateYouTubeURL(resource.id, "video")
        };
        const addedTrackMsg = (metadata: ITrackMetadata): void => {
            message.channel.send({
                embeds: [createEmbed("info", `✅ Track **[${metadata.title}](${metadata.url})** has been added to the queue`).setThumbnail(metadata.thumbnail)]
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
                        createEmbed("warn",
                            `Track **[${metadata.title}](${metadata.url})** is already queued, and this bot configuration disallow duplicated tracks in queue, ` +
                            `please use \`${this.client.config.prefix}repeat\` instead`)
                            .setTitle("Already queued / duplicate")
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
                    // @ts-expect-error Discord.js problem, not mine.
                    adapterCreator: message.guild!.voiceAdapterCreator,
                    selfDeaf: true
                });
                message.guild!.queue.connection = connection;
            } catch (error: any) {
                message.guild?.queue.tracks.clear();
                message.guild!.queue = null;
                this.client.logger.error("HANDLE_VIDEO_ERR:", error);
                message.channel.send({ embeds: [createEmbed("error", `Error: Could not join the voice channel!\nReason: \`${error.message}\``)] })
                    .catch(e => this.client.logger.error("HANDLE_VIDEO_ERR:", e));
                return undefined;
            }
            message.guild?.queue.play(track);
        }
    }

    private async loadPlaylist(id: string, message: Message, voiceChannel: VoiceChannel | StageChannel, watchEndpoint = false, index = 1): Promise<any> {
        const playlist = await this.youtube.getPlaylist(id);
        if (playlist === undefined) return message.channel.send({ embeds: [createEmbed("error", "⚠️ Playlist not found")] });
        if (playlist.videos.length === 0) return message.channel.send({ embeds: [createEmbed("error", "⚠️ The specified playlist is empty.")] });
        if (playlist instanceof MixPlaylist) {
            return message.channel.send({
                embeds: [
                    createEmbed("error", "RD / YouTube mix playlist is not supported yet. Please see [this issue](https://github.com/Hazmi35/jukebox/issues/594)")
                ]
            });
        }

        let addingPlaylistVideoMessage;
        const playlistTitle = `**[${playlist.title}](${this.generateYouTubeURL(playlist.id, "playlist")})**`;

        // Add the first video first.
        if (watchEndpoint) {
            addingPlaylistVideoMessage = await message.channel.send({
                embeds: [
                    createEmbed("info", `Adding all tracks starting from number ${index + 1} video in playlist: ${playlistTitle}, hang on...`)
                        .setThumbnail(playlist.videos[0].thumbnails.best!)

                ]
            });
        } else {
            addingPlaylistVideoMessage = await message.channel.send({
                embeds: [
                    createEmbed("info", `Adding all tracks in playlist: ${playlistTitle}, hang on...`)
                        .setThumbnail(playlist.videos[0].thumbnails.best!)
                ]
            });
            const firstVideo = await this.youtube.getVideo(playlist.videos[0].id);
            if (!firstVideo) {
                await message.channel.send({
                    embeds: [
                        createEmbed("error", `⚠️ Could not add the first video of the playlist`)
                            .setThumbnail(playlist.videos[0].thumbnails.best!)
                    ]
                });
                return addingPlaylistVideoMessage.delete();
            }
            await this.handleVideo(firstVideo, message, voiceChannel, true, false);
        }

        // Add the rest of the videos.
        const videos = await this.loadRestVideosFromPlaylist(playlist, message, index);
        if (!videos) {
            await message.channel.send({
                embeds: [
                    createEmbed("error", `⚠️ Could not add the rest videos of the playlist`)
                        .setThumbnail(playlist.videos[0].thumbnails.best!)
                ]
            });
            return addingPlaylistVideoMessage.delete();
        }
        for (const video of videos) {
            if (message.guild?.queue === null) return addingPlaylistVideoMessage.delete();
            await this.handleVideo(video, message, voiceChannel, true, true);
        }
        const alradyQueued = this.playlistAlreadyQueued.get(message.guild!.id) ?? [];
        if (alradyQueued.length !== 0) {
            let num = 1;
            const tracks = alradyQueued.map(t => `**${num++}.** **[${t.title}](${this.generateYouTubeURL(t.id, "video")})**`);
            message.channel.send({
                embeds: [
                    createEmbed("warn",
                        `Over ${alradyQueued.length} track${alradyQueued.length >= 2 ? "s" : ""} are skipped because it was a duplicate` +
                            ` and this bot configuration disallow duplicated tracks in queue, please use \`${this.client.config.prefix}repeat\` instead`)
                        .setTitle("Already queued / duplicate")
                ]
            }).catch(e => this.client.logger.error("PLAYLIST_LOAD_ERR:", e));
            const pages = this.client.util.paginate(tracks.join("\n"));
            let howManyMessage = 0;
            for (const page of pages) {
                howManyMessage++;
                const embed = createEmbed(`warn`, page as string);
                if (howManyMessage === 1) embed.setTitle("Duplicated tracks");
                await message.channel.send({ embeds: [embed] });
            }
            this.playlistAlreadyQueued.delete(message.guild!.id);
        }
        message.channel.send({
            embeds: [
                createEmbed("info", `All tracks in playlist: ${playlistTitle}, has been added to the queue!`)
                    .setThumbnail(playlist.videos[0].thumbnails.best!)
            ]
        }).catch(e => this.client.logger.error("PLAYLIST_LOAD_ERR:", e));
        return addingPlaylistVideoMessage.delete();
    }

    private async loadRestVideosFromPlaylist(playlist: Playlist, message: Message, startIndex: number): Promise<loadPlaylistReturn | undefined> {
        const results: loadPlaylistReturn = [];
        try {
            await playlist.next(0);
            const { videos } = playlist;
            for (const videoCompact of Object.values(videos)) {
                const video = await this.youtube.getVideo(videoCompact.id);
                await results.push(video!);
            }
            return results.slice(startIndex, results.length);
        } catch (e: any) {
            this.client.logger.error("LOAD_PLAYLIST_ERR:", new Error(e.stack as string));
            message.channel.send({ embeds: [createEmbed("error", `I could not load the playlist!\nError: \`${e.message}\``)] })
                .catch(e => this.client.logger.error("LOAD_PLAYLIST_ERR:", new Error(e as string)));
            return undefined;
        }
    }

    private async createSearchPrompt(searchString: string, message: Message): Promise<Video | LiveVideo | "canceled" | undefined> {
        const videos = await this.youtube.search(searchString, { type: "video" }) as unknown as VideoCompact[];
        if (videos.length === 0) {
            await message.channel.send({ embeds: [createEmbed("warn", "I could not obtain any search results!")] });
            return undefined;
        }
        if (videos.length === 1 || this.client.config.disableTrackSelection) return this.youtube.getVideo(videos[0].id);

        let index = 0;
        const videosSliced = videos.slice(0, this.client.config.searchMaxResults);
        const msg = await message.channel.send({
            embeds: [
                createEmbed("info")
                    .setAuthor("Tracks Selection")
                    .setDescription(
                        `${videosSliced.map(video => `**${++index} -** ${this.cleanTitle(video.title)}`).join("\n")}\n` +
                    "*Type `cancel` or `c` to cancel tracks selection*"
                    )
                    .setThumbnail(message.client.user?.displayAvatarURL() as string)
                    .setFooter(`Please select one of the results ranging from 1-${videosSliced.length}`)
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
                await message.channel.send({ embeds: [createEmbed("info", "Tracks selection canceled.")] });
                return "canceled";
            }

            const videoIndex = parseInt(response.first()!.content);
            return this.youtube.getVideo(videos[videoIndex - 1].id);
        } catch (error) {
            msg.delete().catch(e => this.client.logger.error("CREATE_SEARCH_PROMPT_ERR:", e));
            message.channel.send({ embeds: [createEmbed("error", "No or invalid value entered, tracks selection canceled.")] })
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

type loadPlaylistReturn = (Video | LiveVideo)[];
