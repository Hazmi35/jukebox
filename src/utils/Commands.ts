import { readdir } from "fs";
import { resolve } from "path";
import BotClient from "../structures/Client";

export default class CommandsHandler {
    constructor(public client: BotClient, readonly path: string) {}
    public load(): void {
        readdir(resolve(this.path), (err, files) => {
            if (err) this.client.log.error("CMD_LOADER_ERR: ", err);
            files.forEach(file => {
                const command = require(resolve(this.path, file));
                console.log(command);
            });
        });
        return undefined;
    }
    public handle(): void {
        return undefined;
    }
}