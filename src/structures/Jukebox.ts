/* eslint-disable no-underscore-dangle */
import { Client, ClientOptions } from "discord.js";
import { resolve } from "path";
import config from "../config.json";
import { LogWrapper } from "../utils/LogWrapper";
import CommandsHandler from "../utils/Commands";

export default class BotClient extends Client {
    private _token = "n/a";
    readonly config = config;
    readonly log = new LogWrapper(config.name).logger;
    readonly commandsHandler = new CommandsHandler(this, resolve(__dirname, "..", "commands"));
    constructor(opt: ClientOptions) { super(opt); }

    public async build(): Promise<BotClient> {
        this.commandsHandler.load();
        await this.login(this.getToken());
        return this;
    }
    // Getter setter
    public setToken(token: string): BotClient {
        this._token = token;
        return this;
    }
    public getToken(): string {
        return this._token;
    }
}