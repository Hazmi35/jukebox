import { Client as OClient, ClientEvents, Guild as OGuild } from "discord.js";
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
    execute(message: IMessage, args: string[]): any;
}
export interface IListener {
    name: keyof ClientEvents;
    execute(...args: any): any;
}
declare module "discord.js" {
    export interface Client extends OClient {
        public readonly config: Jukebox["config"];
        public readonly logger: Jukebox["logger"];
        public readonly commands: Jukebox["commands"];
        public readonly listeners: Jukebox["listeners"];
        public readonly youtube: Jukebox["youtube"];

        public async build(token: string): Promise<this>;
        public async getGuildsCount(): Promise<number>;
        public async getChannelsCount(filter = true): Promise<number>;
        public async getUsersCount(filter = true): Promise<number>;
        public async getTotalPlaying(): Promise<number>;
        public async getTotalMemory(type: keyof NodeJS.MemoryUsage): Promise<number>;
    }
    export interface Guild extends OGuild {
        queue: ServerQueue | null;
    }
}
export interface ISong {
    id: string;
    title: string;
    url: string;
    thumbnail: string;
}
