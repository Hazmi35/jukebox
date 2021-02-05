import { Structures } from "discord.js";
import { IGuild } from "../../typings";
import { Jukebox } from "./Jukebox";
import { ServerQueue } from "./ServerQueue";

Structures.extend("Guild", dJSGuild => class Guild extends dJSGuild implements IGuild {
    public client!: IGuild["client"];
    public queue: ServerQueue | null = null;
    public constructor(client: Jukebox, data: Guild) { super(client, data); }
});
