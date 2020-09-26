import type { ClientEvent } from "../../typings";
import type Jukebox from "../structures/Jukebox";

export default class WarnEvent implements ClientEvent {
    public readonly name = "warn";
    public constructor(private readonly client: Jukebox) {}

    public execute(warn: string): void {
        this.client.log.warn("CLIENT_WARN: ", warn);
    }
}
