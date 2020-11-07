import { ClientEventListener } from "../../../typings";
import Jukebox from "../../structures/Jukebox";

export function DefineListener(name: ClientEventListener["name"]): any {
    return function decorate<T extends ClientEventListener>(target: new (...args: any[]) => T): new (client: Jukebox) => T {
        return new Proxy(target, {
            construct: (ctx, [client]): T => new ctx(client, name)
        });
    };
}
