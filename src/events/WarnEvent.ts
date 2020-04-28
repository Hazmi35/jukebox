import { ClientEvent } from "../../typings";
import Jukebox from "../structures/Jukebox";

export default class WarnEvent implements ClientEvent {
    readonly name = "warn";
    constructor(private client: Jukebox) {}

    public execute(warn: string): void {
        this.client.log.warn("CLIENT_WARN: ", warn);
    }
}
