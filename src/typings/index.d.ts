import { Client as OClient, ClientEvents, Guild as OGuild, Message } from "discord.js";
import { Jukebox } from "../structures/Jukebox";
import { ServerQueue } from "../structures/ServerQueue";
import { DefaultLang } from "../utils/Localization";

export interface ICommandComponent {
    meta: {
        aliases?: string[];
        cooldown?: number;
        disable?: boolean;
        path?: string;
        name: string;
        description?: (lang: DefaultLang) => string;
        usage?: (lang: DefaultLang) => string;
    };
    execute: (message: Message, args: string[]) => any;
}
export interface IEvent {
    name: keyof ClientEvents;
    execute: (...args: any) => any;
}
declare module "discord.js" {
    // @ts-expect-error Override
    export interface Client extends OClient {
        readonly config: Jukebox["config"];
        readonly logger: Jukebox["logger"];
        readonly commands: Jukebox["commands"];
        readonly events: Jukebox["events"];
        readonly util: Jukebox["util"];
        readonly ytdl: Jukebox["ytdl"];
        readonly queue: Jukebox["queue"];
        readonly localization: Jukebox["localization"];
        readonly lang: Jukebox["lang"];

        // eslint-disable-next-line @typescript-eslint/method-signature-style
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
    duration: number;// In seconds
}

export interface IAboutCommandData {
    stats: {
        channelCount: number;
        guildsCount: number;
        playersCount: number;
        uptimes: {
            bot: string;
            process: string;
            os: string;
        };
        memory: NodeJS.MemoryUsage;
    };
    shard: {
        count: number | string;
        id: number | string;
    };
    bot: {
        platform: string;
        arch: string;
        versions: {
            bot: string;
            discordjs: string;
            nodejs: string;
            ffmpeg: string;
            ytdlp: string;
        };
        opusEncoder: string;
    };
}
