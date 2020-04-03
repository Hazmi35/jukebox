import { config } from "dotenv"; config();
import Client from "./structures/Client";

new Client({ disableMentions: "everyone" })
    .setToken(process.env.DISCORD_TOKEN!)
    .build();