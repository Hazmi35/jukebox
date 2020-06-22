export function parseDur(ms: number): string {
    let seconds = ms / 1000;
    const days = parseInt((seconds / 86400).toString());
    seconds = seconds % 86400;
    const hours = parseInt((seconds / 3600).toString());
    seconds = seconds % 3600;
    const minutes = parseInt((seconds / 60).toString());
    seconds = parseInt((seconds % 60).toString());


    if (days) {
        return `${days} days, ${hours} hours, ${minutes} minutes, and ${seconds} seconds`;
    } else if (hours) {
        return `${hours} hours, ${minutes} minutes, and ${seconds} seconds`;
    } else if (minutes) {
        return `${minutes} minutes and ${seconds} seconds`;
    }
    return `${seconds} seconds`;
}