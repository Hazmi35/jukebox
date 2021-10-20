import winston from "winston";

export function createLogger(serviceName: string, lang: string, debug = false): winston.Logger {
    const dateFormat = Intl.DateTimeFormat(lang, { dateStyle: "short", timeStyle: "medium", hour12: false });

    function formatDateForLogFile(date?: number | Date): string {
        const data = dateFormat.formatToParts(date);
        return `<year>-<month>-<day>-<hour>-<minute>-<second>`
            .replace(/<year>/g, data.find(({ type }) => type === "year")!.value)
            .replace(/<month>/g, data.find(({ type }) => type === "month")!.value)
            .replace(/<day>/g, data.find(({ type }) => type === "day")!.value)
            .replace(/<hour>/g, data.find(({ type }) => type === "hour")!.value)
            .replace(/<minute>/g, data.find(({ type }) => type === "minute")!.value)
            .replace(/<second>/g, data.find(({ type }) => type === "second")!.value);
    }
    const logger = winston.createLogger({
        defaultMeta: {
            serviceName
        },
        format: winston.format.combine(
            winston.format.printf(info => {
                const { level, message, stack } = info;
                const prefix = `[${dateFormat.format(Date.now())}] [${level}]`;
                if (["error", "crit"].includes(level)) return `${prefix}: ${stack}`;
                return `${prefix}: ${message}`;
            })
        ),
        level: debug ? "debug" : "info",
        levels: {
            alert: 1,
            debug: 5,
            error: 0,
            info: 4,
            notice: 3,
            warn: 2
        },
        transports: [
            new winston.transports.File({ filename: `logs/${serviceName}/error-${formatDateForLogFile(Date.now())}.log`, level: "error" }),
            new winston.transports.File({ filename: `logs/${serviceName}/logs-${formatDateForLogFile(Date.now())}.log` })
        ]
    });
    logger.add(new winston.transports.Console({
        level: debug ? "debug" : "info",
        format: winston.format.combine(
            winston.format.printf(info => {
                const { level, message, stack } = info;
                const prefix = `[${dateFormat.format(Date.now())}] [${level}]`;
                // TODO: You should store shard ID here instead of typing "${this.shard ? `[Shard #${this.shard.ids[0]}]` : ""}" on everything.
                if (["error", "alert"].includes(level)) return `${prefix}: ${stack}`;
                return `${prefix}: ${message}`;
            }),
            winston.format.align(),
            winston.format.colorize({ all: true })
        )
    }));
    return logger;
}
