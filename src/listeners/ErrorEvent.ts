import { ClientEventListener } from "../../typings";
import Jukebox from "../structures/Jukebox";
import { DefineListener } from "../utils/decorators/DefineListener";

@DefineListener("error")
export default class ErrorEvent implements ClientEventListener {
    public constructor(private readonly client: Jukebox, public name: ClientEventListener["name"]) {}

    public execute(error: string): void {
        this.client.logger.error("CLIENT_ERROR:", error);
    }
}
