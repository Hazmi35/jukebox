import { config } from "dotenv"; config();
import Client from "./structures/Jukebox";

const client = new Client({ disableMentions: "everyone" })
    .setToken(process.env.DISCORD_TOKEN!);

// TODO: Implement embeds in every command + fix grammars + cleanup code

client.on("ready", () => {
    client.log.info(`${client.shard ? `[Shard #${client.shard.ids}]` : ""} I'm ready to serve `
    + `${client.users.cache.filter(u => !u.equals(client.user!)).size} users on ${client.guilds.cache.size} guilds!`);
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const updatePresence = async () => client.user!.setPresence({ activity: { name: `music with ${await client.getUsersCount()} users!`, type: "LISTENING" } });
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    setInterval(updatePresence, 30 * 1000); updatePresence();
});

client.on("warn", (warn) => {
    client.log.warn("CLIENT_WARN: ", warn);
});
client.on("error", (error) => {
    client.log.error("CLIENT_ERROR: ", error);
});

client.on("message", (message): any => {
    if (message.author.bot) return message;
    if (message.channel.type === "dm") return message;
    if (!message.content.startsWith(client.config.prefix)) return message;
    client.commandsHandler.handle(message);
    return message;
});

process.on("unhandledRejection", (e) => {
    client.log.error("UNHANDLED_REJECTION: ", e);
});

process.on("uncaughtException", (e) => {
    client.log.error("UNCAUGHT_EXCEPTION: ", e);
    client.log.warn("NODE_WARN: ", { stack: "Uncaught Exception detected. Restarting..." });
    process.exit(1);
});

client.build();
