import { Client as BotClient, ClientOptions, Collection, Snowflake } from "discord.js";
import { resolve } from "path";
import * as config from "../config";
import { createLogger } from "../utils/Logger";
import { CommandManager } from "../utils/CommandManager";
import { EventsLoader } from "../utils/EventsLoader";
import { Util } from "../utils/Util";
import { ServerQueue } from "./ServerQueue";


// Extends DiscordJS Structures
import "./Guild";

export class Jukebox extends BotClient {
    public readonly config = config;
    public readonly logger = createLogger("main", config.debug);
    public readonly commands = new CommandManager(this, resolve(__dirname, "..", "commands"));
    public readonly events = new EventsLoader(this, resolve(__dirname, "..", "events"));
    public readonly util: Util = new Util(this);
    public readonly queue: Collection<Snowflake, ServerQueue> = new Collection();
    public constructor(opt: ClientOptions) { super(opt); }

    public async build(token: string): Promise<this> {
        this.on("ready", () => this.commands.load());
        this.events.load().catch(e => this.logger.error("LISTENER_LOADER_ERR:", e));
        await this.login(token);
        return this;
    }
}
