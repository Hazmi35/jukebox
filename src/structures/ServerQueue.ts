/* eslint-disable no-underscore-dangle, @typescript-eslint/unbound-method */
import { IServerQueue } from "../typings";
import SongManager from "../utils/SongManager";
import { VoiceConnection } from "discord.js";

export default class ServerQueue implements IServerQueue {
    readonly songs: IServerQueue["songs"] = new SongManager();
    public volume: IServerQueue["volume"] = 50;
    public playing: IServerQueue["playing"] = false;
    public connection: IServerQueue["connection"] = null;
    constructor(public textChannel: IServerQueue["textChannel"] = null,
        public voiceChannel: IServerQueue["voiceChannel"] = null) {
        this.voiceChannel!._join = this.voiceChannel!.join;
        this.voiceChannel!.join = async (): Promise<VoiceConnection> => {
            return this.connection = await this.voiceChannel!._join();
        };
    }
}