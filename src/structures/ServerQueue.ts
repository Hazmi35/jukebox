import { TrackManager } from "../utils/TrackManager";
import { Guild, Snowflake, StageChannel, TextChannel, Util, VoiceChannel } from "discord.js";
import { AudioPlayer, AudioPlayerError, AudioPlayerState, AudioPlayerStatus, createAudioPlayer, entersState, VoiceConnection, VoiceConnectionStatus } from "@discordjs/voice";
import { createEmbed } from "../utils/createEmbed";
import { Jukebox } from "./Jukebox";
import { Track, TrackType } from "../structures/Track";
import { repeatMode } from "../constants/repeatMode";
import { YouTubeTrack } from "./YouTubeTrack";
import { shuffleMode } from "../constants/shuffleMode";

const nonEnum = { enumerable: false };

export class ServerQueue {
    public connection: VoiceConnection | null = null;
    public readonly player: AudioPlayer = createAudioPlayer();
    public readonly tracks = new TrackManager(this);
    public repeatMode = repeatMode.disable;
    public shuffleMode = shuffleMode.disable;
    public timeout: NodeJS.Timeout | null = null;
    private _currentTrack: Track | undefined = undefined;
    private _volume = 0;
    private _lastMusicMessageID: Snowflake | null = null;
    private _lastVoiceStateUpdateMessageID: Snowflake | null = null;
    public constructor(
        public client: Jukebox,
        public guild: Guild,
        public textChannel: TextChannel | null = null,
        public voiceChannel: StageChannel | VoiceChannel | null = null
    ) {
        Object.defineProperties(this, {
            _currentTrack: nonEnum,
            _lastMusicMessageID: nonEnum,
            _lastVoiceStateUpdateMessageID: nonEnum,
            _volume: nonEnum,
            timeout: nonEnum
        });

        this._volume = textChannel!.client.config.defaultVolume;

        this.player.on("stateChange", (oldState, newState) => this.stateChange(oldState, newState));
        this.player.on("error", err => {
            this.textChannel?.send({ embeds: [createEmbed("error", this.client.lang.MUSIC_QUEUE_ERROR_WHILE_PLAYING(err.message))] })
                .catch(e => this.client.logger.error(e));
            this.connection?.disconnect();
            clearTimeout(this.timeout!);
            this.guild.queue = null;
            this.client.logger.error(err);
        });
    }

    public async play(track: Track): Promise<any> {
        this.connection?.subscribe(this.player);

        try {
            const { resource, process: ytdlProcess } = await track.createAudioResource();
            try {
                // Wait for 15 seconds for the connection to be ready.
                await entersState(this.connection!, VoiceConnectionStatus.Ready, 15 * 1000);
                this.player.play(resource);
            } catch (e: any) {
                ytdlProcess.kill();
                const err = e as Error;
                if (err.message === "The operation was aborted") err.message = this.client.lang.MUSIC_VOICE_HANDLER_COULDNT_ESTABLISH();
                this.player.emit("error", new AudioPlayerError(err, resource));
            }
        } catch (e: unknown) {
            this.player.emit("error", e as AudioPlayerError);
        }
    }

    public flatten(): any {
        return Object.assign(Util.flatten(this), { playing: this.playing });
    }

    public get volume(): number {
        return this._volume;
    }

    public set volume(newVolume: number) {
        this._currentTrack?.setVolume(newVolume / this.client.config.maxVolume);
        this._volume = newVolume;
    }

    public get playing(): boolean {
        return this.player.state.status === AudioPlayerStatus.Playing;
    }

    public get oldMusicMessage(): Snowflake | null {
        return this._lastMusicMessageID;
    }

    public set oldMusicMessage(id: Snowflake | null) {
        if (this._lastMusicMessageID !== null) {
            this.textChannel?.messages.fetch(this._lastMusicMessageID, { cache: false })
                .then(m => m.delete())
                .catch(e => this.textChannel?.client.logger.error(e));
        }
        this._lastMusicMessageID = id;
    }

    public get oldVoiceStateUpdateMessage(): Snowflake | null {
        return this._lastVoiceStateUpdateMessageID;
    }

    public set oldVoiceStateUpdateMessage(id: Snowflake | null) {
        if (this._lastVoiceStateUpdateMessageID !== null) {
            this.textChannel?.messages.fetch(this._lastVoiceStateUpdateMessageID, { cache: false })
                .then(m => m.delete())
                .catch(e => this.textChannel?.client.logger.error(e));
        }
        this._lastVoiceStateUpdateMessageID = id;
    }

    private stateChange(oldState: AudioPlayerState, newState: AudioPlayerState): any {
        this._currentTrack = this.tracks.first();

        // This usually happens when stop command is being used
        if (!this._currentTrack) {
            this.oldMusicMessage = null; this.oldVoiceStateUpdateMessage = null;
            this.connection?.disconnect();
            clearTimeout(this.timeout!);
            this.guild.queue = null;
            return;
        }

        const { metadata, type } = this._currentTrack;
        if (newState.status === AudioPlayerStatus.Playing) {
            if (oldState.status === AudioPlayerStatus.Paused) return undefined;

            this._currentTrack.setVolume(this.client.config.defaultVolume / this.client.config.maxVolume);

            this.client.logger.info(`Track: "${metadata.title}" on ${this.guild.name} started`);
            this.textChannel?.send({
                embeds: [createEmbed("info", this.client.lang.MUSIC_QUEUE_START_PLAYING(metadata.title, metadata.url)).setThumbnail(metadata.thumbnail)]
            }).then(m => this.oldMusicMessage = m.id).catch(e => this.client.logger.error(e));
            return undefined;
        }
        if (newState.status === AudioPlayerStatus.Idle) {
            // Handle loop/repeat feature
            if (this.repeatMode !== repeatMode.one) { // If the repeatMode is not one, then
                this.tracks.deleteFirst(); // Delete the first track

                if (this.repeatMode === repeatMode.all) {
                    let track;
                    if (type === TrackType.youtube) track = new YouTubeTrack(this, metadata, this.client.config.enableInlineVolume);
                    else track = new Track(this, metadata, this.client.config.enableInlineVolume);

                    this.tracks.add(track);
                }
            }

            const nextTrack = this.tracks.first();

            this.client.logger.info(`Track: "${metadata.title}" on ${this.guild.name} ended`);
            this.textChannel?.send({
                embeds: [createEmbed("info", this.client.lang.MUSIC_QUEUE_STOP_PLAYING(metadata.title, metadata.url)).setThumbnail(metadata.thumbnail)]
            }).then(m => this.oldMusicMessage = m.id)
                .catch(e => this.client.logger.error(e))
                .finally(() => {
                    if (!nextTrack) {
                        this.oldMusicMessage = null; this.oldVoiceStateUpdateMessage = null;
                        this.textChannel?.send({
                            embeds: [createEmbed("info", this.client.lang.MUSIC_QUEUE_FINISHED(this.guild.client.config.prefix))]
                        }).catch(e => this.client.logger.error(e));
                        this.connection?.disconnect();
                        clearTimeout(this.timeout!);
                        return this.guild.queue = null;
                    }

                    this.play(nextTrack).catch((e: any) => {
                        this.textChannel?.send({ embeds: [createEmbed("error", this.client.lang.MUSIC_QUEUE_ERROR_WHILE_PLAYING((e as Error).message))] })
                            .catch(e2 => this.client.logger.error(e2));
                        this.connection?.disconnect();
                        return this.client.logger.error(e);
                    });
                });
            return undefined;
        }
    }
}
