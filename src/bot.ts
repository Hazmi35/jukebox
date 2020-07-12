import "dotenv/config";
import Client from "./structures/Jukebox";

const client = new Client({ disableMentions: "everyone", messageCacheMaxSize: Infinity, messageCacheLifetime: 540, messageSweepInterval: 180 });

process.on("unhandledRejection", (e) => {
    client.log.error("UNHANDLED_REJECTION: ", e);
});

process.on("uncaughtException", (e) => {
    client.log.error("UNCAUGHT_EXCEPTION: ", e);
    client.log.warn("NODE_WARN: ", { stack: "Uncaught Exception detected. Restarting..." });
    process.exit(1);
});

client.build(process.env.DISCORD_TOKEN!);
