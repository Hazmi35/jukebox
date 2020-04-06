import { Structures } from "discord.js";
import { IGuild, IQueueManager, IQueueConstruct } from "../typings";
import Jukebox from "./Jukebox";
import MusicManager from "./QueueManager";

Structures.extend("Guild", DJSGuild => {
    return class Guild extends DJSGuild implements IGuild {
        public client!: IGuild["client"];
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
        }
    };
});