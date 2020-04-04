import { Message } from "discord.js";

export interface CommandComponent {
    execute(message: Message, args: string[]): any;
    conf: {
        aliases?: string[];
        cooldown?: number;
        disable?: boolean;
        path?: string;
    };
    help: {
        name: string;
        description?: string;
        usage?: string;
    };
}