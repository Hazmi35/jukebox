import { Structures } from "discord.js";
import { IGuild, IServerQueue } from "../../typings";
import Jukebox from "./Jukebox";

Structures.extend("Guild", DJSGuild => {
    return class Guild extends DJSGuild implements IGuild {
        public client!: IGuild["client"];
        public queue: IServerQueue | null = null;
        constructor(client: Jukebox, data: Guild) { super(client, data); }
    };
});