import { Client as OClient, ClientEvents, Guild as OGuild, Message } from "discord.js";
import { Jukebox } from "../structures/Jukebox";
import { ServerQueue } from "../structures/ServerQueue";

export interface ICommandComponent {
    meta: {
        aliases?: string[];
        cooldown?: number;
        disable?: boolean;
        path?: string;
        name: string;
        description?: string;
        usage?: string;
    };
    execute(message: Message, args: string[]): any;
}
export interface IEvent {
    name: keyof ClientEvents;
    execute(...args: any): any;
}
declare module "discord.js" {
    // @ts-expect-error Override
    export interface Client extends OClient {
        readonly config: Jukebox["config"];
        readonly logger: Jukebox["logger"];
        readonly commands: Jukebox["commands"];
        readonly events: Jukebox["events"];
        readonly util: Jukebox["util"];
        readonly queue: Jukebox["queue"];

        build(token: string): Promise<this>;
    }
    // @ts-expect-error Override
    export interface Guild extends OGuild {
        queue: ServerQueue | null;
    }
}
export interface ITrackMetadata {
    id: string;
    title: string;
    url: string;
    thumbnail: string;
    inlineVolume: boolean;
}

