import "dotenv/config";
import Client from "./structures/Jukebox";

const client = new Client({
    disableMentions: "everyone",
    messageCacheLifetime: 60,
    messageCacheMaxSize: Infinity,
    messageEditHistoryMaxSize: Infinity,
    messageSweepInterval: 180,
    ws: {
        intents: ["GUILDS", "GUILD_PRESENCES", "GUILD_MEMBERS", "GUILD_VOICE_STATES", "GUILD_MESSAGES"]
    }
});

process.on("unhandledRejection", e => {
    client.log.error("UNHANDLED_REJECTION: ", e);
});

process.on("uncaughtException", e => {
    client.log.error("UNCAUGHT_EXCEPTION: ", e);
    client.log.warn("Uncaught Exception detected. Restarting...");
    process.exit(1);
});

client.build(process.env.DISCORD_TOKEN!)
    .catch(e => client.log.error("CLIENT_BUILD_ERR: ", e));
