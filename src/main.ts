import { config } from "dotenv"; config();
import Client from "./structures/Client";

const client = new Client({ disableMentions: "everyone" })
    .setToken(process.env.DISCORD_TOKEN!);

client.on("ready", () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore-next-line (I don't know why ts-node when using pnpm error on this line but tsc does not)
    client.log.info(`I'm ready to serve ${client.users.cache.size} on ${client.guilds.cache.size}`);
    client.user!.setPresence({ activity: { name: "Hello There!", type: "PLAYING" }, afk: false });
});

client.build();
