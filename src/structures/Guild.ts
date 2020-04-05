import { Structures } from "discord.js";
import { IGuild, IServerQueue } from "../typings";
import Jukebox from "./Jukebox";

Structures.extend("Guild", DJSGuild => {
    return class Guild extends DJSGuild implements IGuild {
        public client!: IGuild["client"];
        public queue!: IServerQueue | null;
        constructor(client: Jukebox, data: object) {
            super(client, data);
        }
        //  Getter Setter
        public getQueue(): IServerQueue | null {
            return this.queue;
        }
        public setQueue(newQueue: IServerQueue | null): IServerQueue | null {
            if (newQueue === null) this.queue = null;
            else Object.assign(this.queue, newQueue);
            return this.queue;
        }
    };
});