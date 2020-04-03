import { readdir } from "fs";
import { resolve } from "path";
import BotClient from "../structures/Client";
import { CommandComponent } from "../typings";

export default class CommandsHandler {
    constructor(public client: BotClient, readonly path: string) {}
    public load(): void {
        readdir(resolve(this.path), (err, files) => {
            if (err) this.client.log.error("CMD_LOADER_ERR: ", err);
            files.forEach(file => {
                const command: CommandComponent = require(resolve(this.path, file));
                if (command.conf.aliases!.length > 0) command.conf.aliases!.forEach(alias => {
                    this.client.aliases.set(alias, command.help.name);
                });
                this.client.commands.set(command.help.name, command);
            });
        });
        return undefined;
    }
    public handle(): void {
        return undefined;
    }
}