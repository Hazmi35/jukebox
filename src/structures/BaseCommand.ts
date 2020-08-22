import Jukebox from "./Jukebox";
import { CommandComponent } from "../../typings";
import { Message } from "discord.js";

export default class BaseCommand implements CommandComponent {
    public conf: CommandComponent["conf"];
    public help: CommandComponent["help"];
    public constructor(public client: Jukebox, public readonly path: string, conf: CommandComponent["conf"], help: CommandComponent["help"]) {
        this.conf = {
            aliases: [],
            cooldown: 3,
            disable: false,
            path: this.path
        };
        this.help = {
            name: "",
            description: "",
            usage: ""
        };
        Object.assign(this.conf, conf);
        Object.assign(this.help, help);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    public execute(message: Message, args: string[]): any {}
}
