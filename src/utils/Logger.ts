/* eslint-disable sort-keys */
import pino from "pino";
import { resolve } from "path";

export function createLogger(name: string, lang: string, type: "manager" | "shard", shardID?: number, debug = false): pino.Logger {
    const dateFormat = Intl.DateTimeFormat(lang, {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour12: false
    });
    const date = formatDate(dateFormat);
    const logger = pino({
        name,
        timestamp: true,
        level: debug ? "debug" : "info",
        formatters: {
            bindings: () => ({
                pid: type === "shard" ? shardID ? `Shard #${shardID}` : null : `ShardManager`
            })
        },
        transport: {
            targets: [
                { target: "pino/file", level: "info", options: { destination: resolve(process.cwd(), "logs", `${name}-${date}.log`) } },
                { target: "pino-pretty", level: debug ? "debug" : "info", options: { translateTime: "SYS:yyyy-mm-dd HH:MM:ss.l o" } }
            ]
        }
    });
    return logger;
}

function formatDate(dateFormat: Intl.DateTimeFormat, date: number | Date = new Date()): string {
    const data = dateFormat.formatToParts(date);
    return `<year>-<month>-<day>`
        .replace(/<year>/g, data.find(d => d.type === "year")!.value)
        .replace(/<month>/g, data.find(d => d.type === "month")!.value)
        .replace(/<day>/g, data.find(d => d.type === "day")!.value);
}
