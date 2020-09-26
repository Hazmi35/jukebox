import { formatDistanceToNowStrict } from "date-fns";

export function formatMs(ms: number): string {
    if (isNaN(ms)) throw new Error("value is not a number.");
    return formatDistanceToNowStrict(Date.now() - ms, {
        addSuffix: false,
        roundingMethod: "round"
    });
}
