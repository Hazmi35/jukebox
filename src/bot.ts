import { config } from "dotenv"; config();
import Client from "./structures/Jukebox";
import { Message } from "discord.js";

const client = new Client({ disableMentions: "everyone" })
    .setToken(process.env.DISCORD_TOKEN!);

client.on("ready", () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore-next-line (I don't know why when using pnpm ts-node error on this line but tsc does not)
    client.log.info(`[Shard #${client.shard!.ids}] I'm ready to serve ${client.users.cache.size} users on ${client.guilds.cache.size} guilds!`);
    client.user!.setPresence({ activity: { name: "Hello There!", type: "PLAYING" }, afk: false });
});

client.on("warn", (warn) => {
    client.log.warn("CLIENT_WARN: ", warn);
});
client.on("error", (error) => {
    client.log.error("CLIENT_ERROR: ", error);
});

client.on("message", (message: Message): any => {
    if (message.author.bot) return message;
    if (message.channel.type === "dm") return message;
    if (!message.content.startsWith(client.config.prefix)) return message;
    client.commandsHandler.handle(message);
    return message;
});

client.build();
