import "dotenv/config";
import { resolve } from "path";
import { ShardingManager } from "discord.js";
import { createLogger } from "./utils/Logger";
import { totalShards as configTotalShards, debug, lang } from "./config";
const log = createLogger("shardingmanager", lang, "manager", undefined, debug);

const totalShards: number | "auto" = configTotalShards === "auto" ? configTotalShards : Number(configTotalShards);

process.on("uncaughtException", e => {
    log.fatal(e);
    process.exit(1);
});

// @ts-expect-error Ignore next line
if (process[Symbol.for("ts-node.register.instance")]) {
    log.warn("ts-node detected, sharding is disabled. Please only use ts-node for development purposes.");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("./bot");
} else {
    const manager = new ShardingManager(resolve(__dirname, "bot.js"), {
        totalShards,
        mode: "worker",
        respawn: true,
        token: process.env.SECRET_DISCORD_TOKEN
    });

    manager.on("shardCreate", shard => {
        log.info(`Shard #${shard.id} Spawned.`);
        shard.on("disconnect", () => {
            log.warn("SHARD_DISCONNECTED: ", { stack: `Shard #${shard.id} Disconnected` });
        }).on("reconnection", () => {
            log.info(`Shard #${shard.id} Reconnected.`);
        });
        if (manager.shards.size === manager.totalShards) log.info("All shards spawned successfully.");
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access
    }).spawn().catch(e => log.error(e.status ? `Error while fetching recommended shards: ${e.status}, ${e.statusText}` : e));
}
