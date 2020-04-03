/* eslint-disable no-underscore-dangle */
import { Client, Collection, ClientOptions } from "discord.js";
import config from "../config.json";
import { LogWrapper } from "../utils/LogWrapper";
import { CommandComponent } from "../typings";

export default class BotClient extends Client {
    private _token = "n/a";
    readonly config = config;
    readonly log = new LogWrapper(config.name).logger;
    readonly commands: Collection<string, CommandComponent> = new Collection();
    readonly aliases: Collection<string, string> = new Collection();
    constructor(opt: ClientOptions) { super(opt); }

    // Getter setter
    public setToken(token: string): BotClient {
        this._token = token;
        return this;
    }
    public getToken(): string {
        return this._token;
    }

    public async build(): Promise<BotClient> {
        await this.login(this.getToken());
        return this;
    }
}