import { Client, Collection, ClientOptions, GuildResolvable } from "discord.js";
import config from "../config.json";
import { LogWrapper } from "../utils/LogWrapper";

export default class BotClient extends Client {
    private _token = "n/a";
    readonly config = config;
    readonly log = new LogWrapper(config.name).logger;
    constructor(opt: ClientOptions) { super(opt) };
    //Getter setter
    public setToken(token: string): BotClient {
        this._token = token;
        return this;
    }
    public getToken(): string {
        return this._token;
    }
    public async build(): Promise<BotClient> {
        this.login(this.getToken());
        return this;
    }
}