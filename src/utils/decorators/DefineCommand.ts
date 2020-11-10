import { ICommandComponent } from "../../../typings";
import { Jukebox } from "../../structures/Jukebox";

export function DefineCommand(meta: ICommandComponent["meta"]): any {
    return function decorate<T extends ICommandComponent>(target: new (...args: any[]) => T): new (client: Jukebox) => T {
        return new Proxy(target, {
            construct: (ctx, [client]): T => new ctx(client, meta)
        });
    };
}
