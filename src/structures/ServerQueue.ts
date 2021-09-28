import { SongManager } from "../utils/SongManager";
import { Guild, Snowflake, StageChannel, TextChannel, Util, VoiceChannel } from "discord.js";
import { AudioPlayer, AudioPlayerError, AudioPlayerStatus, AudioResource, createAudioPlayer, createAudioResource, entersState, VoiceConnection, VoiceConnectionStatus } from "@discordjs/voice";
import { createEmbed } from "../utils/createEmbed";
import { Jukebox } from "./Jukebox";

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

export class ServerQueue {
    public connection: VoiceConnection | null = null;
    public currentPlayer: AudioPlayer | null = null;
    public currentResource: AudioResource | null = null;
    public readonly songs = new SongManager();
    public volume = 0;
    public loopMode = loopMode.disable;
    public timeout: NodeJS.Timeout | null = null;
    private _lastMusicMessageID: Snowflake | null = null;
    private _lastVoiceStateUpdateMessageID: Snowflake | null = null;
    public constructor(public client: Jukebox, public textChannel: TextChannel | null = null, public voiceChannel: VoiceChannel | StageChannel | null = null) {
        this.volume = textChannel!.client.config.defaultVolume;
        Object.defineProperties(this, {
            timeout: {
                enumerable: false
            },
            _lastMusicMessageID: {
                enumerable: false
            },
            _lastVoiceStateUpdateMessageID: {
                enumerable: false
            }
        });
    }

    public async play(guild: Guild): Promise<any> {
        const serverQueue = guild.queue;
        if (!serverQueue) return undefined;
        if (serverQueue.currentPlayer === null) serverQueue.currentPlayer = createAudioPlayer(); // TODO: Consider reusing AudioPlayer in the refactored Queue System
        const song = serverQueue.songs.first();
        if (!song) {
            serverQueue.oldMusicMessage = null; serverQueue.oldVoiceStateUpdateMessage = null;
            serverQueue.textChannel?.send({
                embeds: [createEmbed("info", `⏹ Queue is finished! Use "${guild.client.config.prefix}play" to play more music`)]
            }).catch(e => this.client.logger.error("PLAY_ERR:", e));
            serverQueue.connection?.disconnect();
            return guild.queue = null;
        }

        // TODO: Recreate YTDL Caching
        const songData = await song.download();

        // TODO: Store Song metadata inside here.
        serverQueue.currentResource = createAudioResource<any>(songData, { inlineVolume: this.client.config.enableInlineVolume });

        songData.on("error", err => { err.message = `YTDLError: ${err.message}`; });

        serverQueue.connection?.subscribe(serverQueue.currentPlayer);

        // Wait for 15 seconds for the connection to be ready.
        entersState(serverQueue.connection!, VoiceConnectionStatus.Ready, 15 * 1000)
            .then(() => serverQueue.currentPlayer!.play(serverQueue.currentResource!))
            .catch(e => {
                if (e.message === "The operation was aborted") e.message = "Could not establish a voice connection within 15 seconds.";
                serverQueue.currentPlayer!.emit("error", new AudioPlayerError(e, serverQueue.currentResource!));
            });

        serverQueue.currentPlayer.on("stateChange", (oldState, newState) => {
            if (newState.status === AudioPlayerStatus.Playing) {
                if (oldState.status === AudioPlayerStatus.Paused) return undefined;
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
                        serverQueue.currentPlayer = null;
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

        serverQueue.currentPlayer.on("error", err => {
            serverQueue.textChannel?.send({ embeds: [createEmbed("error", `Error while playing music\nReason: \`${err.message}\``)] })
                .catch(e => this.client.logger.error("PLAY_CMD_ERR:", e));
            serverQueue.connection?.disconnect();
            guild.queue = null;
            this.client.logger.error("PLAY_ERR:", err);
        });
    }

    public toJSON(): any {
        return Util.flatten(this);
    }

    public get playing(): boolean {
        return this.currentPlayer!.state.status === AudioPlayerStatus.Playing;
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
