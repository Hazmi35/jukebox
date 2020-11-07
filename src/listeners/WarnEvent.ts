import { ClientEventListener } from "../../typings";
import Jukebox from "../structures/Jukebox";
import { DefineListener } from "../utils/decorators/DefineListener";

@DefineListener("warn")
export default class WarnEvent implements ClientEventListener {
    public constructor(private readonly client: Jukebox, public name: ClientEventListener["name"]) {}

    public execute(warn: string): void {
        this.client.logger.warn("CLIENT_WARN:", warn);
    }
}
