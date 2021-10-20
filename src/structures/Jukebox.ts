import { Client as BotClient, ClientOptions, Collection, Snowflake } from "discord.js";
import { resolve } from "path";
import * as config from "../config";
import { createLogger } from "../utils/Logger";
import { CommandManager } from "../utils/CommandManager";
import { EventsLoader } from "../utils/EventsLoader";
import { Util } from "../utils/Util";
import { ServerQueue } from "./ServerQueue";
import { create } from "youtube-dl-exec";
import { Localization } from "../utils/Localization";


// Extends DiscordJS Structures
import "./Guild";

export class Jukebox extends BotClient {
    public readonly config = config;
    public readonly logger = createLogger("main", config.lang, config.debug);
    public readonly commands = new CommandManager(this, resolve(__dirname, "..", "commands"));
    public readonly events = new EventsLoader(this, resolve(__dirname, "..", "events"));
    public readonly util: Util = new Util(this);
    public readonly ytdl = create(resolve(this.util.getPackagePath("youtube-dl-exec"), "bin", "yt-dlp"));
    public readonly queue: Collection<Snowflake, ServerQueue> = new Collection();
    public readonly localization = new Localization(config.lang);
    public lang = this.localization.lang;
    public constructor(opt: ClientOptions) { super(opt); }

    public async build(token: string): Promise<this> {
        await this.localization.load();
        this.lang = this.localization.lang;
        if (!this.localization.has(config.lang)) {
            this.logger.warn(`${this.shard ? `[Shard #${this.shard.ids[0]}]` : ""} Lang "${config.lang}" does not exists, using "${this.lang.META_ID()} as a fallback."`);
        }
        this.on("ready", () => this.commands.load());
        this.events.load().catch(e => this.logger.error("EVENTS_LOADER_ERR:", e));
        this.util.getOpusEncoderName()
            .then(name => this.logger.info(`${this.shard ? `[Shard #${this.shard.ids[0]}]` : ""} Using "${name}" as the preferred opus encoder.`))
            .catch(e => { this.logger.error("JUKEBOX_INIT_ERR:", new Error(`Could not load any opus encoder\n${e.message}`)); process.exit(1); });
        await this.login(token);
        return this;
    }
}
