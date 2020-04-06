import { Structures, Collection } from "discord.js";
import { IGuild, IServerQueue } from "../typings";
import Jukebox from "./Jukebox";

Structures.extend("Guild", DJSGuild => {
    class ServerQueue implements IServerQueue {
        readonly connection: IServerQueue["connection"] = null;
        readonly songs: IServerQueue["songs"] = new Collection();
        public volume: IServerQueue["volume"] = 50;
        public playing: IServerQueue["playing"] = false;
        constructor(readonly textChannel: IServerQueue["textChannel"], readonly voiceChannel: IServerQueue["voiceChannel"]) {

        }
    }
    return class Guild extends DJSGuild implements IGuild {
        public client!: IGuild["client"];
        private queue: IServerQueue | null = null;
        constructor(client: Jukebox, data: object) {
            super(client, data);
        }
        public getQueue(): IServerQueue | null {
            return this.queue;
        }
        public setQueue(newQueue: IServerQueue | null): IServerQueue | null {
            if (newQueue === null) this.queue = null;
            this.queue = new ServerQueue();
        }
    };
});