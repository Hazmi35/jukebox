import { IListener } from "../../../typings";
import { Jukebox } from "../../structures/Jukebox";

export function DefineListener(name: IListener["name"]): any {
    return function decorate<T extends IListener>(target: new (...args: any[]) => T): new (client: Jukebox) => T {
        return new Proxy(target, {
            construct: (ctx, [client]): T => new ctx(client, name)
        });
    };
}
