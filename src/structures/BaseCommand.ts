import BotClient from "./Client";
import { CommandComponent } from "../typings";
import { Message } from "discord.js";

export default class BaseCommand implements CommandComponent {
    public conf: CommandComponent["conf"];
    public help: CommandComponent["help"];
    constructor(public client: BotClient, readonly path: string, conf: CommandComponent["conf"], help: CommandComponent["help"]) {
        this.conf = {
            aliases: [],
            cooldown: 3,
            disable: false,
            path: this.path,
        }
        this.help = {
            name: "",
            description: "",
            usage: ""
        }
    }
    public run(message: Message): any {};
}

interface conf {
    name: string;
    description: string;
    
}