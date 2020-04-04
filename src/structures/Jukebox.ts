/* eslint-disable no-underscore-dangle */
import { Client, ClientOptions, Collection, GuildResolvable } from "discord.js";
import { resolve } from "path";
import config from "../config.json";
import { LogWrapper } from "../utils/LogWrapper";
import CommandsHandler from "../utils/Commands";
import { IServerQueue } from "../typings";

// Extending DiscordJS Structures
import "./Guild";

export default class Jukebox extends Client {
    private _token = "n/a";
    readonly config = config;
    readonly log = new LogWrapper(config.name).logger;
    readonly commandsHandler = new CommandsHandler(this, resolve(__dirname, "..", "commands"));
    readonly queue: Collection<GuildResolvable, IServerQueue> = new Collection(); // TODO:
    constructor(opt: ClientOptions) { super(opt); }

    public async build(): Promise<Jukebox> {
        this.commandsHandler.load();
        await this.login(this.getToken());
        return this;
    }
    // Getter setter
    public setToken(token: string): Jukebox {
        this._token = token;
        return this;
    }
    public getToken(): string {
        return this._token;
    }
}