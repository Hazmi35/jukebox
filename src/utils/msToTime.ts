export function msToTime(ms: number): string {
    let seconds = ms / 1000;
    const days = parseInt((seconds / 86400).toString(), 10);
    seconds %= 86400;
    const hours = parseInt((seconds / 3600).toString(), 10);
    seconds %= 3600;
    const minutes = parseInt((seconds / 60).toString(), 10);
    seconds = parseInt((seconds % 60).toString(), 10);

    const result = [`${days} days`, `${hours} hours`, `${minutes} minutes`, `${seconds} seconds`]
        .filter((val: any) => val.split(" ")[0] > 0);

    return result.join(", ");
}
