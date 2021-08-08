import { Client } from "discord.js";
import { IListener } from "../../typings";

export function DefineListener(name: IListener["name"]): any {
    return function decorate<T extends IListener>(target: new (...args: any[]) => T): new (client: Client) => T {
        return new Proxy(target, {
            construct: (ctx, [client]): T => new ctx(client, name)
        });
    };
}
