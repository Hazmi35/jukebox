import { BaseEvent } from "../structures/BaseEvent";
import { DefineEvent } from "../utils/decorators/DefineEvent";

@DefineEvent("error")
export class ErrorEvent extends BaseEvent {
    public execute(error: string): void {
        this.client.logger.error("CLIENT_ERROR:", error);
    }
}
