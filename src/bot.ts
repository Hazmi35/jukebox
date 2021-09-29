import "./utils/initializeDotEnv";
import { Jukebox } from "./structures/Jukebox";
import { CacheWithLimitsOptions, ClientOptions, Intents, LimitedCollection, Options } from "discord.js";
import { cacheUsers } from "./config";

const cacheOptions: CacheWithLimitsOptions = {
    ...Options.defaultMakeCacheSettings,
    MessageManager: { // Sweep messages every 5 minutes, removing messages that have not been edited or created in the last 3 hours
        maxSize: Infinity,
        sweepInterval: 300, // 5 Minutes
        sweepFilter: LimitedCollection.filterByLifetime({
            lifetime: 10800 // 3 Hours
        })
    },
    ThreadManager: { // Sweep threads every 5 minutes, removing threads that have been archived in the last 3 hours
        maxSize: Infinity,
        sweepInterval: 300, // 5 Minutes
        sweepFilter: LimitedCollection.filterByLifetime({
            lifetime: 10800, // 3 Hours
            getComparisonTimestamp: e => e.archiveTimestamp!,
            excludeFromSweep: e => !e.archived
        })
    }
};

const clientOptions: ClientOptions = {
    allowedMentions: { parse: ["users"] },
    makeCache: Options.cacheWithLimits(cacheUsers ? cacheOptions : Object.assign(cacheOptions, { UserManager: { maxSize: 0 } })),
    partials: [],
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS]
};

if (!cacheUsers) clientOptions.partials?.push("USER");

const client = new Jukebox(clientOptions);

process.on("unhandledRejection", e => {
    client.logger.error("UNHANDLED_REJECTION: ", e);
});

process.on("uncaughtException", e => {
    client.logger.error("UNCAUGHT_EXCEPTION: ", e);
    client.logger.warn("Uncaught Exception detected. Restarting...");
    process.exit(1);
});

client.build(process.env.SECRET_DISCORD_TOKEN!)
    .catch(e => client.logger.error("CLIENT_BUILD_ERR: ", e));
