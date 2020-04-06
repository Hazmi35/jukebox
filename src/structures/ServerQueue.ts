import { IServerQueue } from "../typings";
import SongManager from "./SongManager";

export default class ServerQueue implements IServerQueue {
    readonly songs: IServerQueue["songs"] = new SongManager();
    public volume: IServerQueue["volume"] = 50;
    public playing: IServerQueue["playing"] = false;
    public connection: IServerQueue["connection"] = null;
    constructor(public textChannel: IServerQueue["textChannel"] = null,
        public voiceChannel: IServerQueue["voiceChannel"] = null) {}
}