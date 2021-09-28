import { BaseCommand } from "../structures/BaseCommand";
import { ServerQueue } from "../structures/ServerQueue";
import { Util, VoiceChannel, Message, TextChannel, Collection, Snowflake, StageChannel } from "discord.js";
import { decodeHTML } from "entities";
import { ISong } from "../typings";
import { DefineCommand } from "../utils/decorators/DefineCommand";
import { isUserInTheVoiceChannel, isSameVoiceChannel, isValidVoiceChannel } from "../utils/decorators/MusicHelper";
import { createEmbed } from "../utils/createEmbed";
import { Client, LiveVideo, MixPlaylist, Video } from "youtubei";
import { generateYouTubePLURL, generateYouTubeVidURL } from "../utils/YouTubeURL";
import { createYouTubeResource } from "../utils/createYouTubeResource";
import { joinVoiceChannel } from "@discordjs/voice";

@DefineCommand({
    aliases: ["play-music", "add", "p"],
    name: "play",
    description: "Play some music",
    usage: "{prefix}play <yt video or playlist link / yt video name>"
})
export class PlayCommand extends BaseCommand {
    private readonly youtube = new Client();
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

        let video: Video | LiveVideo | undefined = undefined;
        let response: Collection<Snowflake, Message> | null = null;

        if (/^https?:\/\/((www|music)\.youtube\.com|youtube.com)\/playlist(.*)$/.exec(url)) {
            try {
                const playlist = await this.youtube.getPlaylist(url);
                if (playlist === undefined) throw new Error("Playlist not found");
                if (playlist instanceof MixPlaylist) {
                    return message.channel.send({
                        embeds: [
                            createEmbed("error", "RD / YouTube mix playlist is not supported yet. Please see [this issue](https://github.com/Hazmi35/jukebox/issues/594)")
                        ]
                    });
                }
                await playlist.next(0);
                const { videos } = playlist;
                const addingPlaylistVideoMessage = await message.channel.send({
                    embeds: [
                        createEmbed("info", `Adding all tracks in playlist: **[${playlist.title}](${generateYouTubePLURL(playlist.id)}})**, hang on...`)
                            .setThumbnail(playlist.videos[0].thumbnails.best!)
                    ]
                });
                for (const videoCompact of Object.values(videos)) {
                    const video = await this.youtube.getVideo(videoCompact.id);
                    await this.handleVideo(video!, message, voiceChannel, true);
                }
                const playlistAlreadyQueued = this.playlistAlreadyQueued.get(message.guild.id);
                if (!this.client.config.allowDuplicate && Number(playlistAlreadyQueued?.length) > 0) {
                    let num = 1;
                    const songs = playlistAlreadyQueued!.map(s => `**${num++}.** **[${s.metadata.title}](${s.metadata.url})**`);
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
                addingPlaylistVideoMessage.delete()
                    .catch(e => this.client.logger.error("YT_PLAYLIST_ERR:", e));
                return message.channel.send({
                    embeds: [
                        createEmbed("info", `All tracks in playlist: **[${playlist.title}](${generateYouTubePLURL(playlist.id)}})**, has been added to the queue!`)
                            .setThumbnail(playlist.videos[0].thumbnails.best!)
                    ]
                });
            } catch (e: any) {
                this.client.logger.error("YT_PLAYLIST_ERR:", new Error(e.stack));
                return message.channel.send({ embeds: [createEmbed("error", `I could not load the playlist!\nError: \`${e.message}\``)] });
            }
        }
        try {
            video = await this.youtube.getVideo(url);
            if (video === undefined) throw new Error("Video not found");
        } catch (e) {
            try {
                const videos = await this.youtube.search(searchString, { type: "video" });
                if (videos.length === 0) return message.channel.send({ embeds: [createEmbed("warn", "I could not obtain any search results!")] });
                if (videos.length === 1 || this.client.config.disableSongSelection) {
                    video = await this.youtube.getVideo(videos[0].id);
                    if (video === undefined) throw new Error("Video not found");
                } else {
                    let index = 0;
                    const msg = await message.channel.send({
                        embeds: [
                            createEmbed("info")
                                .setAuthor("Tracks Selection")
                                .setDescription(
                                    `${videos.slice(0, this.client.config.searchMaxResults).map(video => `**${++index} -** ${this.cleanTitle(video.title)}`).join("\n")}\n` +
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
                    video = await this.youtube.getVideo(videos[videoIndex - 1].id);
                    if (video === undefined) throw new Error("Video not found");
                }
            } catch (err: any) {
                this.client.logger.error("YT_SEARCH_ERR:", err);
                return message.channel.send({ embeds: [createEmbed("error", `I could not obtain any search results!\nError: \`${err.message}\``)] });
            }
        }
        return this.handleVideo(video, message, voiceChannel);
    }

    private async handleVideo(video: Video | LiveVideo, message: Message, voiceChannel: VoiceChannel | StageChannel, playlist = false): Promise<any> {
        const url = generateYouTubeVidURL(video.id);
        const song = await createYouTubeResource(url, {
            id: video.id,
            thumbnail: video.thumbnails.best!,
            title: this.cleanTitle(video.title),
            url
        });
        if (message.guild?.queue) {
            if (!this.client.config.allowDuplicate && message.guild.queue.songs.find(s => s.metadata.id === song.metadata.id)) {
                if (playlist) {
                    const playlistAlreadyQueued = this.playlistAlreadyQueued.get(message.guild.id) ?? [];
                    playlistAlreadyQueued.push(song);
                    this.playlistAlreadyQueued.set(message.guild.id, playlistAlreadyQueued);
                    return undefined;
                }
                return message.channel.send({
                    embeds: [
                        createEmbed("warn", `Track **[${song.metadata.title}](${song.metadata.url})** is already queued, and this bot configuration disallow duplicated tracks in queue, ` +
                        `please use \`${this.client.config.prefix}repeat\` instead`)
                            .setTitle("Already queued / duplicate")
                            .setThumbnail(song.metadata.thumbnail)
                    ]
                });
            }
            message.guild.queue.songs.addSong(song);
            if (!playlist) {
                message.channel.send({
                    embeds: [createEmbed("info", `✅ Track **[${song.metadata.title}](${song.metadata.url})** has been added to the queue`).setThumbnail(song.metadata.thumbnail)]
                }).catch(e => this.client.logger.error("PLAY_CMD_ERR:", e));
            }
        } else {
            message.guild!.queue = new ServerQueue(this.client, message.channel as TextChannel, voiceChannel);
            message.guild?.queue.songs.addSong(song);
            if (!playlist) {
                message.channel.send({
                    embeds: [createEmbed("info", `✅ Track **[${song.metadata.title}](${song.metadata.url})** has been added to the queue`).setThumbnail(song.metadata.thumbnail)]
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
            } catch (error: any) {
                message.guild?.queue.songs.clear();
                message.guild!.queue = null;
                this.client.logger.error("PLAY_CMD_ERR:", error);
                message.channel.send({ embeds: [createEmbed("error", `Error: Could not join the voice channel!\nReason: \`${error.message}\``)] })
                    .catch(e => this.client.logger.error("PLAY_CMD_ERR:", e));
                return undefined;
            }
            message.guild?.queue.play(message.guild).catch(err => {
                message.channel.send({ embeds: [createEmbed("error", `Error while trying to play music\nReason: \`${err.message}\``)] })
                    .catch(e => this.client.logger.error("PLAY_CMD_ERR:", e));
                return this.client.logger.error("PLAY_CMD_ERR:", err);
            });
        }
        return message;
    }

    private cleanTitle(title: string): string {
        return Util.escapeMarkdown(decodeHTML(title));
    }
}
