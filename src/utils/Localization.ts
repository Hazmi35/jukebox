import Collection from "@discordjs/collection";
import { readdir } from "fs/promises";
import { resolve } from "path";
import { dirname } from "path/posix";
import { fileURLToPath } from "url";
import { lang as enUs } from "../langs/en-US";

export type DefaultLang = typeof enUs;
export type LangID = ReturnType<DefaultLang["META_ID"]>;
export class Localization extends Collection<LangID, DefaultLang> {
    public readonly default = enUs;
    public constructor(public langID: LangID) { super(); }

    public async load(): Promise<any> {
        const langsFolderPath = resolve(dirname(fileURLToPath(import.meta.url)), "..", "langs");
        const langsFile = await readdir(langsFolderPath);
        for (const langFile of langsFile) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            const lang: DefaultLang = (await import(resolve(langsFolderPath, langFile))).lang;
            this.set(lang.META_ID(), lang);
        }
    }

    public get lang(): DefaultLang {
        return this.get(this.langID) ?? this.default;
    }
}
