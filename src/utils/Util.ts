/* eslint-disable class-methods-use-this */
import { Channel, Client, Collection, Guild, Snowflake, User } from "discord.js";
import { request } from "https";
import { promises as fs } from "fs";
import path from "path";
import prettyMilliseconds from "pretty-ms";
import { ServerQueue } from "../structures/ServerQueue";
import prism from "prism-media";
import { createRequire } from "module";

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

    public getPackagePath(pkgName?: string): string {
        if (process.platform === "win32") pkgName = pkgName?.replace("/", "\\");
        const require = createRequire(import.meta.url);
        const mainPath = path.resolve(pkgName ? require.resolve(pkgName) : process.cwd());
        pkgName = pkgName ?? path.parse(process.cwd()).base;
        return path.resolve(mainPath.split(pkgName)[0], pkgName);
    }

    public async getPackageJSON(pkgName?: string): Promise<any> {
        return JSON.parse((await fs.readFile(path.resolve(this.getPackagePath(pkgName), "package.json"))).toString());
    }

    public getFFmpegInfo(): prism.FFmpegInfo {
        return prism.FFmpeg.getInfo();
    }

    public getFFmpegVersion(): string {
        const info = this.getFFmpegInfo();

        // if the ffmpeg-static is used
        if (info.command.includes("ffmpeg-static")) return info.version.replace("https://johnvansickle.com/ffmpeg/", "");

        return info.version.startsWith("n") ? info.version.slice(1) : info.version;
    }

    public doesFFmpegHasLibOpus(): boolean {
        return this.getFFmpegInfo().output.includes("--enable-libopus");
    }

    public async getResource<T extends keyof getResourceResourceType>(type: T | keyof getResourceResourceType): Promise<getResourceReturnType<T>> {
        // Functions how to get the resources
        const resourcesFunctions: Record<keyof getResourceResourceType, (client: Client) => Collection<any, any>> = {
            users: (client: Client) => client.users.cache,
            channels: (client: Client) => client.channels.cache,
            guilds: (client: Client) => client.guilds.cache,
            queues: (client: Client) => client.queue.mapValues(v => v.flatten())
        };

        /*
         *  Why do we convert these functions to string? because we can't pass a function to a broadcastEval context, so we convert them to string.
         *   Then in the broadcastEval context, we convert them again to function using eval, then execute that function
         */
        const doBroadcastEval = (): any => this.client.shard?.broadcastEval(
            // eslint-disable-next-line no-eval, @typescript-eslint/no-unsafe-call
            (client, ctx) => eval(ctx.resourcesFunctions[ctx.type])(client),
            { context: { type, resourcesFunctions: Object.fromEntries(Object.entries(resourcesFunctions).map(o => [o[0], o[1].toString()])) } }
        );

        const evalResult = await doBroadcastEval() ?? resourcesFunctions[type](this.client);

        let result: getResourceReturnType<T>;
        if (this.client.shard) {
            result = new Collection<Snowflake, getResourceResourceType[T]>(
                this.mergeBroadcastEval<getResourceResourceType[T]>(evalResult as (getResourceResourceType[T])[][])
            );
        } else { result = evalResult as getResourceReturnType<T>; }
        return result;
    }

    public async getGuildsCount(): Promise<number> {
        return (await this.getResource("guilds")).size;
    }

    public async getChannelsCount(filter = true): Promise<number> {
        const channels = await this.getResource("channels");

        if (filter) return channels.filter(c => c.type !== "GUILD_CATEGORY" && c.type !== "DM").size;
        return channels.size;
    }

    public async getUsersCount(filter = true): Promise<number> {
        const users = await this.getResource("users");

        if (filter) return users.filter(u => u.id !== this.client.user!.id).size;
        return users.size;
    }

    public async getTotalPlaying(): Promise<number> {
        return (await this.getResource("queues")).filter(q => q.playing).size;
    }

    public hastebin(text: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const req = request({ hostname: "bin.hzmi.xyz", path: "/documents", method: "POST", minVersion: "TLSv1.3" }, res => {
                let raw = "";
                res.on("data", chunk => raw += chunk);
                res.on("end", () => {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    if (res.statusCode! >= 200 && res.statusCode! < 300) return resolve(`https://bin.hzmi.xyz/${JSON.parse(raw).key as string}`);
                    return reject(new Error(`[hastebin] Error while trying to send data to https://bin.hzmi.xyz/documents, ${res.statusCode!} ${res.statusMessage!}`));
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

    public chunk<T>(array: T[] | string, chunkSize: number): T[][] {
        const temp = [];
        for (let i = 0; i < array.length; i += chunkSize) {
            temp.push(array.slice(i, i + chunkSize));
        }
        return temp as T[][];
    }

    // Uses https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#The_modern_algorithm
    public shuffleArray<T>(array: T[]): T[] {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    public getUserIDFromMention(mention: string): Snowflake | undefined {
        const matches = (/^<@!?(?<Snowflake>\d+)>$/).exec(mention);
        if (!matches) return undefined;

        return matches[1];
    }

    public fetchUserFromMention(mention: string): Promise<User | null> {
        const id = this.getUserIDFromMention(mention);
        if (!id) return Promise.resolve(null);

        return this.client.users.fetch(id);
    }

    public mergeBroadcastEval<T>(broadcastEval: T[][]): Iterable<[Snowflake, T]> {
        return broadcastEval.reduce((p, c) => [...p, ...c]) as Iterable<[Snowflake, T]>;
    }

    public async getOpusEncoderName(): Promise<string> {
        if (this.client.util.doesFFmpegHasLibOpus() && !this.client.config.enableInlineVolume) {
            return "ffmpeg libopus";
        }

        const list = ["@discordjs/opus", "opusscript"];
        const errorLog = [];
        for (const name of list) {
            try {
                await import(name); // Tries to import the module, if fails then the next line of code won't run
                const pkgMetadata = await this.client.util.getPackageJSON(name);
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                return `${pkgMetadata.name as string} v${pkgMetadata.version as string}`;
            } catch (e) {
                errorLog.push(e);
            }
        }
        throw new Error(errorLog.join("\n"));
    }
}

interface getResourceResourceType {
    users: User;
    channels: Channel;
    guilds: Guild;
    queues: ServerQueue;
}
type getResourceReturnType<T extends keyof getResourceResourceType> = Collection<Snowflake, getResourceResourceType[T]>;
