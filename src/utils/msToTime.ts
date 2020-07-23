export function msToTime(ms: number): string {
    let seconds = ms / 1000;
    const days = parseInt((seconds / 86400).toString());
    seconds = seconds % 86400;
    const hours = parseInt((seconds / 3600).toString());
    seconds = seconds % 3600;
    const minutes = parseInt((seconds / 60).toString());
    seconds = parseInt((seconds % 60).toString());

    const result = [seconds, minutes, hours, days].filter(val => val > 0);
    const times = ["seconds", "minutes", "hours", "days"];

    return result.map((v, i) => `${v} ${times[i]}`).reverse().join(", ");
}