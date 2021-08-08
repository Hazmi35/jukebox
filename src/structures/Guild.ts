import { Client, Structures } from "discord.js";
import { ServerQueue } from "./ServerQueue";

Structures.extend("Guild", dJSGuild => class Guild extends dJSGuild {
    public queue: ServerQueue | null = null;
    public constructor(client: Client, data: Guild) { super(client, data); }
});
