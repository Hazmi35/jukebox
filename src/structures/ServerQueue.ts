import { TrackManager } from "../utils/TrackManager";
import { Guild, Snowflake, StageChannel, TextChannel, Util, VoiceChannel } from "discord.js";
import { AudioPlayer, AudioPlayerError, AudioPlayerStatus, createAudioPlayer, entersState, VoiceConnection, VoiceConnectionStatus } from "@discordjs/voice";
import { createEmbed } from "../utils/createEmbed";
import { Jukebox } from "./Jukebox";
import { Track } from "../structures/Track";

export enum loopMode {
    off = 0,
    one = 1,
    all = 2,

    // ALIASES
    queue = all,
    "*" = all,

    current = one,
    trackonly = one,

    none = off,
    disable = off
}

const nonEnum = { enumerable: false };

export class ServerQueue {
    public connection: VoiceConnection | null = null;
    public readonly player: AudioPlayer = createAudioPlayer();
    public readonly tracks = new TrackManager();
    public loopMode = loopMode.disable;
    public timeout: NodeJS.Timeout | null = null;
    private _currentTrack: Track | undefined = undefined;
    private _volume = 0;
    private _lastMusicMessageID: Snowflake | null = null;
    private _lastVoiceStateUpdateMessageID: Snowflake | null = null;
    public constructor(
        public client: Jukebox,
        public guild: Guild,
        public textChannel: TextChannel | null = null,
        public voiceChannel: VoiceChannel | StageChannel | null = null
    ) {
        Object.defineProperties(this, {
            _currentTrack: nonEnum,
            _lastMusicMessageID: nonEnum,
            _lastVoiceStateUpdateMessageID: nonEnum,
            _volume: nonEnum,
            timeout: nonEnum
        });

        this._volume = textChannel!.client.config.defaultVolume;

        this.player.on("stateChange", async (oldState, newState) => {
            this._currentTrack = this.tracks.first();
            // This usually happens when stop command is being used
            if (!this._currentTrack) {
                this.oldMusicMessage = null; this.oldVoiceStateUpdateMessage = null;
                this.connection?.disconnect();
                this.guild.queue = null;
                return;
            }

            const { metadata } = this._currentTrack;
            if (newState.status === AudioPlayerStatus.Playing) {
                if (oldState.status === AudioPlayerStatus.Paused) return undefined;
                this._currentTrack.setVolume(this.client.config.defaultVolume / this.client.config.maxVolume);
                this.client.logger.info(`${this.client.shard ? `[Shard #${this.client.shard.ids[0]}]` : ""} Track: "${metadata.title}" on ${this.guild.name} started`);
                this.textChannel?.send({ embeds: [createEmbed("info", `▶ Start playing: **[${metadata.title}](${metadata.url})**`).setThumbnail(metadata.thumbnail)] })
                    .then(m => this.oldMusicMessage = m.id)
                    .catch(e => this.client.logger.error("PLAY_ERR:", e));
                return undefined;
            }
            if (newState.status === AudioPlayerStatus.Idle) {
                // Handle loop/repeat feature
                if (this.loopMode !== loopMode.one) { // If the loopMode is not one, then
                    this.tracks.deleteFirst(); // Delete the first track
                    if (this.loopMode === loopMode.all) this.tracks.add(metadata); // If the loopMode is all, then add the track back to the end of queue
                }
                const nextTrack = this.tracks.first();

                this.client.logger.info(`${this.client.shard ? `[Shard #${this.client.shard.ids[0]}]` : ""} Track: "${metadata.title}" on ${this.guild.name} ended`);
                this.textChannel?.send({ embeds: [createEmbed("info", `⏹ Stop playing: **[${metadata.title}](${metadata.url})**`).setThumbnail(metadata.thumbnail)] })
                    .then(m => this.oldMusicMessage = m.id)
                    .catch(e => this.client.logger.error("PLAY_ERR:", e))
                    .finally(() => {
                        if (!nextTrack) {
                            this.oldMusicMessage = null; this.oldVoiceStateUpdateMessage = null;
                            this.textChannel?.send({
                                embeds: [createEmbed("info", `⏹ Queue is finished! Use "${this.guild.client.config.prefix}play" to play more music`)]
                            }).catch(e => this.client.logger.error("PLAY_ERR:", e));
                            this.connection?.disconnect();
                            return this.guild.queue = null;
                        }
                        this.play(nextTrack).catch(e => {
                            this.textChannel?.send({ embeds: [createEmbed("error", `Error while trying to play music\nReason: \`${e}\``)] })
                                .catch(e => this.client.logger.error("PLAY_ERR:", e));
                            this.connection?.disconnect();
                            return this.client.logger.error("PLAY_ERR:", e);
                        });
                    });
                return undefined;
            }
        });

        this.player.on("error", err => {
            this.textChannel?.send({ embeds: [createEmbed("error", `Error while playing music\nReason: \`${err.message}\``)] })
                .catch(e => this.client.logger.error("PLAY_CMD_ERR:", e));
            this.connection?.disconnect();
            this.guild.queue = null;
            this.client.logger.error("PLAY_ERR:", err);
        });
    }

    public async play(track: Track): Promise<any> {
        this.connection?.subscribe(this.player);

        const resource = await track.createAudioResource();

        // Wait for 15 seconds for the connection to be ready.
        entersState(this.connection!, VoiceConnectionStatus.Ready, 15 * 1000)
            .then(() => this.player.play(resource))
            .catch(e => {
                if (e.message === "The operation was aborted") e.message = "Could not establish a voice connection within 15 seconds.";
                this.player.emit("error", new AudioPlayerError(e, resource));
            });
    }

    public toJSON(): any {
        return Util.flatten(this);
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
                .catch(e => this.textChannel?.client.logger.error("DELETE_OLD_MUSIC_MESSAGE_ERR:", e));
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
                .catch(e => this.textChannel?.client.logger.error("DELETE_OLD_VOICE_STATE_UPDATE_MESSAGE_ERR:", e));
        }
        this._lastVoiceStateUpdateMessageID = id;
    }
}
