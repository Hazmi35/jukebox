import "dotenv/config";
import { Jukebox } from "./structures/Jukebox";
import { CacheWithLimitsOptions, ClientOptions, Intents, Options, Sweepers } from "discord.js";
import { cacheUsers } from "./config";
import { CustomError } from "./utils/CustomError";

const cacheOptions: CacheWithLimitsOptions = {
    ...Options.defaultMakeCacheSettings,
    MessageManager: { // Sweep messages every 5 minutes, removing messages that have not been edited or created in the last 3 hours
        maxSize: Infinity,
        sweepInterval: 300, // 5 Minutes
        sweepFilter: Sweepers.filterByLifetime({
            lifetime: 10800 // 3 Hours
        })
    },
    ThreadManager: { // Sweep threads every 5 minutes, removing threads that have been archived in the last 3 hours
        maxSize: Infinity,
        sweepInterval: 300, // 5 Minutes
        sweepFilter: Sweepers.filterByLifetime({
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
    if (e instanceof Error) {
        client.logger.error(e);
    } else {
        client.logger.error(CustomError("PromiseError", e as string));
    }
});
process.on("uncaughtException", e => {
    client.logger.fatal(e);
    process.exit(1);
});

client.build(process.env.SECRET_DISCORD_TOKEN!)
    .catch(e => client.logger.error(e));
