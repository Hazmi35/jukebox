import { Client } from "discord.js";
import { IEvent } from "../typings";

export class BaseEvent implements IEvent {
    public constructor(public readonly client: Client, public name: IEvent["name"]) {}

    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function, class-methods-use-this
    public execute(...args: any): void {}
}
