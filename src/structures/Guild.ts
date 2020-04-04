import { Structures } from "discord.js";
import { IGuild, IServerQueue } from "../typings";
import Jukebox from "./Jukebox";

Structures.extend("Guild", DJSGuild => {
    return class Guild extends DJSGuild implements IGuild {
        public client!: IGuild["client"];
        constructor(client: Jukebox, data: object) {
            super(client, data);
        }
        public getQueue(): IServerQueue | undefined {
            return this.client.queue.get(this.id);
        }
    };
});