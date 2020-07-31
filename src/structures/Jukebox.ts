/* eslint-disable no-underscore-dangle, @typescript-eslint/unbound-method, @typescript-eslint/restrict-plus-operands */
import { Client, ClientOptions } from "discord.js";
import { resolve } from "path";
import config from "../config";
import { LogWrapper } from "../utils/LogWrapper";
import CommandsHandler from "../utils/Commands";
import ClientEventsLoader from "../utils/ClientEventsLoader";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error // FIX: Find or create typings for simple-youtube-api or wait for v6 released
import YouTube from "simple-youtube-api";

// Extends DiscordJS Structures
import "./Guild";

export default class Jukebox extends Client {
    readonly config = config;
    readonly log = new LogWrapper(config.name).logger;
    readonly youtube = new YouTube(process.env.YT_API_KEY!, { cache: false, fetchAll: true });
    readonly commandsHandler = new CommandsHandler(this, resolve(__dirname, "..", "commands"));
    readonly eventsLaoder = new ClientEventsLoader(this, resolve(__dirname, "..", "events"));
    constructor(opt: ClientOptions) { super(opt); }

    public async build(token: string): Promise<Jukebox> {
        // NOTE: Will be removed when caching is not a experimental feature anymore
        if (this.config.cacheYoutubeDownloads) this.log.warn(this.constructor.name, { stack: "cacheYoutubeDownloads is still a experimental feature"});
        this.on("ready", () => this.commandsHandler.load());
        this.eventsLaoder.load();
        await this.login(token);
        return this;
    }

    public async getGuildsCount(): Promise<number> {
        if (!this.shard) return this.guilds.cache.size;
        const size = await this.shard.broadcastEval("this.guilds.cache.size");
        return size.reduce((p, v) => p + v, 0);
    }
    public async getChannelsCount(filter = true): Promise<number> {
        if (filter) {
            if (!this.shard) return this.channels.cache.filter(c => c.type !== "category" && c.type !== "dm").size;
            const size = await this.shard.broadcastEval("this.channels.cache.filter(c => c.type !== 'category' && c.type !== 'dm').size");
            return size.reduce((p, v) => p + v, 0);
        } else {
            if (!this.shard) return this.channels.cache.size;
            const size = await this.shard.broadcastEval("this.channels.cache.size");
            return size.reduce((p, v) => p + v, 0);
        }
    }
    public async getUsersCount(filter = true): Promise<number> {
        if (filter) {
            if (!this.shard) return this.users.cache.filter(u => !u.equals(this.user!)).size;
            const size = await this.shard.broadcastEval("this.users.cache.filter(u => !u.equals(this.user)).size");
            return size.reduce((p, v) => p + v, 0);
        } else {
            if (!this.shard) return this.users.cache.size;
            const size = await this.shard.broadcastEval("this.users.cache.size");
            return size.reduce((p, v) => p + v, 0);
        }
    }
    public async getTotalPlaying(): Promise<number> {
        if (!this.shard) return this.guilds.cache.filter((g: any) => g.queue !== null && g.queue.playing === true).size;
        return await this.shard.broadcastEval("this.guilds.cache.filter(g => g.queue !== null && g.queue.playing === true).size").then(data => data.reduce((a, b) => a + b));
    }
}