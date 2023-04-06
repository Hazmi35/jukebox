// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class TimeUtil {
    public static millisecondsToFormat(milliseconds: number): string {
        const seconds: number = milliseconds / 1000;

        return this.secondsToFormat(seconds);
    }

    public static secondsToFormat(seconds: number): string {
        const hours: string = String(Math.trunc(seconds / 3600)).padStart(2, "0");
        seconds %= 3600;

        const minutes: string = String(Math.trunc(seconds / 60)).padStart(2, "0");
        seconds %= 60;

        const formattedSeconds: string = String(Math.trunc(seconds)).padStart(2, "0");

        return `${hours}:${minutes}:${formattedSeconds}`;
    }
}
