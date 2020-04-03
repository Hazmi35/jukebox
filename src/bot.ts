import { config } from "dotenv"; config();
import Client from "./structures/Client";
import { Message } from "discord.js";

const client = new Client({ disableMentions: "everyone" })
    .setToken(process.env.DISCORD_TOKEN!);

client.on("ready", () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore-next-line (I don't know why ts-node when using pnpm error on this line but tsc does not)
    client.log.info(`[Shard #${client.shard!.ids}] I'm ready to serve ${client.users.cache.size} users on ${client.guilds.cache.size} guilds!`);
    client.user!.setPresence({ activity: { name: "Hello There!", type: "PLAYING" }, afk: false });
    // client.destroy();
});

client.on("warn", client.log.warn);
client.on("error", client.log.error);

client.on("message", (message: Message): any => {
    if (message.content === "Hello") return message.channel.send("Hi");
});

client.build();
