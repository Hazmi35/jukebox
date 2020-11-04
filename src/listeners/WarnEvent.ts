import { ClientEventListener } from "../../typings";
import Jukebox from "../structures/Jukebox";

export default class WarnEvent implements ClientEventListener {
    public readonly name = "warn";
    public constructor(private readonly client: Jukebox) {}

    public execute(warn: string): void {
        this.client.logger.warn("CLIENT_WARN:", warn);
    }
}
