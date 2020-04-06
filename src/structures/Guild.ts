import { Structures } from "discord.js";
<<<<<<< HEAD
import { IGuild, IQueueManager, IQueueConstruct } from "../typings";
=======
import { IGuild, IServerQueue } from "../typings";
>>>>>>> parent of 1f5703d... New Features + Let's redesign the IServerQueue (not finished)
import Jukebox from "./Jukebox";
import MusicManager from "./QueueManager";

Structures.extend("Guild", DJSGuild => {
    return class Guild extends DJSGuild implements IGuild {
        public client!: IGuild["client"];
<<<<<<< HEAD
        private queue: IQueueManager | null = null;
        constructor(client: Jukebox, data: object) {
            super(client, data);
        }
        public getQueue(): IQueueManager | null {
            return this.queue;
        }
        public constructQueue(
            textChannel: IQueueConstruct["textChannel"],
            voiceChannel: IQueueConstruct["voiceChannel"]): IQueueManager {
            return this.queue = new MusicManager(textChannel, voiceChannel);
        }
        public destroyQueue(): null {
            return this.queue = null;
=======
        public queue: IServerQueue | null = null;
        constructor(client: Jukebox, data: object) {
            super(client, data);
        }
        //  Getter Setter
        public getQueue(): IServerQueue | null {
            return this.queue;
        }
        public setQueue(newQueue: IServerQueue | null): IServerQueue | null {
            if (newQueue === null) this.queue = null;
            else if (this.queue === null) this.queue = newQueue;
            else Object.assign(this.queue, newQueue);
            return this.queue;
>>>>>>> parent of 1f5703d... New Features + Let's redesign the IServerQueue (not finished)
        }
    };
});