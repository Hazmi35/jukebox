import { SongManager } from "../utils/SongManager";
import { Snowflake, StageChannel, TextChannel, Util, VoiceChannel } from "discord.js";
import { AudioPlayer, AudioPlayerStatus, VoiceConnection } from "@discordjs/voice";

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
    public readonly songs = new SongManager();
    public volume = 0;
    public loopMode = loopMode.disable;
    public timeout: NodeJS.Timeout | null = null;
    private _lastMusicMessageID: Snowflake | null = null;
    private _lastVoiceStateUpdateMessageID: Snowflake | null = null;
    public constructor(public textChannel: TextChannel | null = null, public voiceChannel: VoiceChannel | StageChannel | null = null) {
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
