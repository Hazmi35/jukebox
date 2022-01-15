import { Message } from "discord.js";
import { ICommandComponent } from "../../typings";

export function Inhibit(func: ICommandComponent["execute"]) {
    return function decorate(target: unknown, key: string | symbol, descriptor: PropertyDescriptor): any {
        const original = descriptor.value as ICommandComponent["execute"];
        // eslint-disable-next-line func-names
        descriptor.value = async function (message: Message, args: string[]): Promise<any> {
            const result = await func(message, args);
            if (result === undefined) return original.apply(this, [message, args]);
            return null;
        };

        return descriptor;
    };
}
