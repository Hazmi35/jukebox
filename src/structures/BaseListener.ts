import { IListener } from "../../typings";
import { Jukebox } from "./Jukebox";

export class BaseListener implements IListener {
    public constructor(public readonly client: Jukebox, public name: IListener["name"]) {}

    // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
    public execute(...args: any): void {}
}
