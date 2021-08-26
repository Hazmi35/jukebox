import { BaseEvent } from "../structures/BaseEvent";
import { DefineEvent } from "../utils/decorators/DefineEvent";

@DefineEvent("warn")
export class WarnEvent extends BaseEvent {
    public execute(warn: string): void {
        this.client.logger.warn("CLIENT_WARN:", warn);
    }
}
