import "dotenv/config";
import { fetchAllUsers } from "./config";
import Client from "./structures/Jukebox";

const client = new Client({
    disableMentions: "everyone",
    fetchAllMembers: fetchAllUsers,
    messageCacheLifetime: 60,
    messageCacheMaxSize: Infinity,
    messageEditHistoryMaxSize: Infinity,
    messageSweepInterval: 180,
    ws: {
        intents: ["GUILDS", "GUILD_VOICE_STATES", "GUILD_MESSAGES", "GUILD_MESSAGE_REACTIONS"]
    }
});

process.on("unhandledRejection", e => {
    client.logger.error("UNHANDLED_REJECTION: ", e);
});

process.on("uncaughtException", e => {
    client.logger.error("UNCAUGHT_EXCEPTION: ", e);
    client.logger.warn("Uncaught Exception detected. Restarting...");
    process.exit(1);
});

client.build(process.env.DISCORD_TOKEN!)
    .catch(e => client.logger.error("CLIENT_BUILD_ERR: ", e));
