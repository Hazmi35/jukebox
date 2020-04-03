import { ShardingManager } from "discord.js";
import { LogWrapper } from "./utils/LogWrapper";
import { totalShards, name } from "./config.json";

const log = new LogWrapper(name + "-sharding").logger;

new ShardingManager("./bot", { totalShards: totalShards as number | "auto", mode: "worker", respawn: true })
    .on("shardCreate", (shard) => {
        log.info(`[shardCreate] Spawned shard: ${shard.id}`);
    }).spawn(totalShards as number | "auto");