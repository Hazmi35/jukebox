import { ClientEvent } from "../../typings";
import Jukebox from "../structures/Jukebox";

export default class ErrorEvent implements ClientEvent {
    public readonly name = "error";
    public constructor(private readonly client: Jukebox) {}

    public execute(error: string): void {
        this.client.log.error("CLIENT_ERROR: ", error);
    }
}
