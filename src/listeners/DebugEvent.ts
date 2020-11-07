import type { ClientEventListener } from "../../typings";
import type Jukebox from "../structures/Jukebox";

export default class DebugEvent implements ClientEventListener {
    public readonly name = "debug";
    public constructor(private readonly client: Jukebox) {}

    public execute(message: string): void {
        this.client.logger.debug(message);
    }
}
