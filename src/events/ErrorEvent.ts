import { ClientEvent } from "../../typings";
import Jukebox from "../structures/Jukebox";

export default class ErrorEvent implements ClientEvent {
    readonly name = "error";
    constructor(private client: Jukebox) {}

    public execute(error: string): void {
        this.client.log.error("CLIENT_ERROR: ", error);
    }
}
