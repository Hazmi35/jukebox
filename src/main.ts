import { config } from "dotenv"; config();
import { resolve } from "path";
import { ShardingManager } from "discord.js";
import { LogWrapper } from "./utils/LogWrapper";
import { totalShards, name } from "./config";
const log = new LogWrapper(name + "-sharding").logger;

const shardCount: number | "auto" = totalShards === "auto" ? totalShards : Number(totalShards);
let shardsSpawned = 0;

process.on("unhandledRejection", (e) => {
    log.error("UNHANDLED_REJECTION: ", e);
});
process.on("uncaughtException", (e) => {
    log.error("UNCAUGHT_EXCEPTION: ", e);
    log.warn("NODE_WARN: ", { stack: "Uncaught Exception detected. Restarting..." });
});

const shards = new ShardingManager(resolve(__dirname, "bot.js"), { totalShards: shardCount, mode: "worker", respawn: true, token: process.env.DISCORD_TOKEN });

shards.on("shardCreate", (shard) => {
    shardsSpawned++;
    log.info(`[ShardManager] Shard #${shard.id} Spawned.`);
    shard.on("disconnect", () => {
        log.warn("SHARD_DISCONNECTED: ", { stack: `[ShardManager] Shard #${shard.id} Disconnected` }); // TODO: Fix this.
    }).on("reconnecting", () => {
        log.info(`[ShardManager] Shard #${shard.id} Reconnected.`);
    });
    if (shardsSpawned === shards.totalShards) log.info("[ShardManager] All shards spawned successfully.");
}).spawn(shardCount);