/* eslint-disable @typescript-eslint/restrict-plus-operands */
import { Channel, Client, Collection, Guild, Presence, Snowflake, User } from "discord.js";
import { request } from "https";
import { promises as fs } from "fs";
import path from "path";
import prettyMilliseconds from "pretty-ms";

export class Util {
    public constructor(public client: Client) {}

    public bytesToSize(bytes: number): string {
        if (isNaN(bytes) && bytes !== 0) throw new Error(`[bytesToSize] (bytes) Error: bytes is not a Number/Integer, received: ${typeof bytes}`);
        const sizes: string[] = ["B", "KiB", "MiB", "GiB", "TiB", "PiB"];
        if (bytes < 2 && bytes > 0) return `${bytes} Byte`;
        const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
        if (i === 0) return `${bytes} ${sizes[i]}`;
        if (!sizes[i]) return `${bytes} ${sizes[sizes.length - 1]}`;
        return `${Number(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
    }

    public formatMS(ms: number): string {
        if (isNaN(ms)) throw new Error("value is not a number.");
        return prettyMilliseconds(ms, {
            verbose: true,
            compact: false,
            secondsDecimalDigits: 0
        });
    }

    public async getPackageJSON(pkgName = process.cwd()): Promise<any> {
        if (process.platform === "win32") pkgName = pkgName.replace("/", "\\");
        const resolvedPath = path.resolve(require.resolve(pkgName));
        return JSON.parse((await fs.readFile(path.resolve(resolvedPath.split(pkgName)[0], pkgName, "package.json"))).toString());
    }

    public async getOpusEncoder(): Promise<any> {
        const list = ["@discordjs/opus", "opusscript"];
        const errorLog = [];
        for (const name of list) {
            try {
                const data = (await import(name)).default;
                const pkgMetadata = await this.getPackageJSON(name);
                return { encoder: name === "@discordjs/opus" ? data.OpusEncoder : data, pkgMetadata };
            } catch (e) {
                errorLog.push(e);
            }
        }
        throw new Error(errorLog.join("\n"));
    }

    public async getResource(type: "guilds" | "channels" | "users"): Promise<getResourceReturnType> {
        const evalResult = await this.client.shard?.broadcastEval((client, ctx) => client[ctx.type].cache, { context: { type } }) ?? this.client[type].cache;
        let result: getResourceReturnType;
        if (this.client.shard) result = new Collection(await this._getMergedBroadcastEval<getResourceResourceType>(evalResult as getResourceResourceType[][]));
        else result = evalResult as getResourceReturnType;
        return result;
    }

    public async getGuildsCount(): Promise<number> {
        return (await this.getResource("guilds")).size;
    }

    public async getChannelsCount(filter = true): Promise<number> {
        const channels = await this.getResource("channels") as Collection<Snowflake, Channel>;

        if (filter) return channels.filter(c => c.type !== "GUILD_CATEGORY" && c.type !== "DM").size;
        return channels.size;
    }

    public async getUsersCount(filter = true): Promise<number> {
        const users = await this.getResource("users") as Collection<Snowflake, User>;

        if (filter) return users.filter(u => u.id === this.client.user!.id).size;
        return users.size;
    }

    public async getTotalPlaying(): Promise<number> {
        return (await this.getResource("users") as Collection<Snowflake, Guild>).filter(g => g.queue?.playing === true).size;
    }

    public hastebin(text: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const req = request({ hostname: "bin.hzmi.xyz", path: "/documents", method: "POST", minVersion: "TLSv1.3" }, res => {
                let raw = "";
                res.on("data", chunk => raw += chunk);
                res.on("end", () => {
                    if (res.statusCode! >= 200 && res.statusCode! < 300) return resolve(`https://bin.hzmi.xyz/${JSON.parse(raw).key as string}`);
                    return reject(new Error(`[hastebin] Error while trying to send data to https://bin.hzmi.xyz/documents, ${res.statusCode as number} ${res.statusMessage as string}`));
                });
            }).on("error", reject);
            req.write(typeof text === "object" ? JSON.stringify(text, null, 2) : text);
            req.end();
        });
    }

    public paginate(text: string, limit = 2000): any[] {
        const lines = text.trim().split("\n");
        const pages = [];
        let chunk = "";

        for (const line of lines) {
            if (chunk.length + line.length > limit && chunk.length > 0) {
                pages.push(chunk);
                chunk = "";
            }

            if (line.length > limit) {
                const lineChunks = line.length / limit;

                for (let i = 0; i < lineChunks; i++) {
                    const start = i * limit;
                    const end = start + limit;
                    pages.push(line.slice(start, end));
                }
            } else {
                chunk += `${line}\n`;
            }
        }

        if (chunk.length > 0) {
            pages.push(chunk);
        }

        return pages;
    }

    public chunk(array: Array<any> | string, chunkSize: number): Array<any> {
        const temp = [];
        for (let i = 0; i < array.length; i += chunkSize) {
            temp.push(array.slice(i, i + chunkSize));
        }
        return temp;
    }

    public getUserFromMention(mention: string): Promise<User | undefined> {
        const matches = /^<@!?(\d+)>$/.exec(mention);
        if (!matches) return Promise.resolve(undefined);

        const id = matches[1];
        return this.client.users.fetch(id);
    }

    public async updatePresence(): Promise<Presence | undefined> {
        const activityName = this.client.config.status.activity
            .replace(/{guildsCount}/g, (await this.getGuildsCount()).toString())
            .replace(/{playingCount}/g, (await this.getTotalPlaying()).toString())
            .replace(/{usersCount}/g, (await this.getUsersCount()).toString())
            .replace(/{botPrefix}/g, this.client.config.prefix);
        return this.client.user!.setPresence({
            activities: [{ name: activityName, type: this.client.config.status.type }]
        });
    }

    private _getMergedBroadcastEval<T>(broadcastEval: T[][]): Iterable<[Snowflake, any]> {
        return broadcastEval.reduce((p, c) => [...p, ...c]) as any;
    }
}

type getResourceResourceType = Channel | Guild | User;
type getResourceReturnType = Collection<Snowflake, getResourceResourceType>;
