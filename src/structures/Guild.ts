/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
import { Guild } from "discord.js";

Reflect.defineProperty(Guild.prototype, "queue", {
    get() {
        // @ts-expect-error-next-line
        return (this as Guild).client.queue.get(this.id as string) ?? null;
    },

    set(v: any) {
        // @ts-expect-error-next-line
        if (v === null || v === undefined) return this.client.queue.delete(this.id);

        // @ts-expect-error-next-line
        return this.client.queue.set(this.id, v);
    }
});
