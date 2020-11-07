import { ClientEventListener } from "../../typings";
import Jukebox from "../structures/Jukebox";
import { DefineListener } from "../utils/decorators/DefineListener";

@DefineListener("debug")
export default class DebugEvent implements ClientEventListener {
    public constructor(private readonly client: Jukebox, public name: ClientEventListener["name"]) {}

    public execute(message: string): void {
        this.client.logger.debug(message);
    }
}
