import { config } from "dotenv"; config();
import { resolve } from "path";
import { ShardingManager } from "discord.js";
import { LogWrapper } from "./utils/LogWrapper";
import { totalShards, name } from "./config";
const log = new LogWrapper(name + "-sharding").logger;

process.on("unhandledRejection", (e) => {
    log.error("UNHANDLED_REJECTION: ", e);
});
process.on("uncaughtException", (e) => {
    log.error("UNCAUGHT_EXCEPTION: ", e);
    log.warn("NODE_WARN: ", { stack: "Uncaught Exception detected. Restarting..." });
});


const shards = new ShardingManager(resolve(__dirname, "bot.js"), { totalShards: totalShards as number | "auto", mode: "worker", respawn: true, token: process.env.DISCORD_TOKEN });

shards.on("shardCreate", (shard) => {
    log.info(`[Shard #${shard.id}] Spawned.`);
    shard.on("disconnect", () => {
        log.warn("SHARD_DISCONNECTED: ", { stack: `[Shard #${shard.id}] Disconnected` }); // TODO: Fix this.
    }).on("reconnecting", () => {
        log.info(`[Shard #${shard.id}] Reconnected.`);
    });
}).spawn(totalShards as number | "auto");