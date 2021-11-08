import Collection from "@discordjs/collection";
import { readdir } from "fs/promises";
import { resolve } from "path";
import { lang as enUs } from "../langs/en-US";

export type DefaultLang = typeof enUs;
export type LangID = ReturnType<DefaultLang["META_ID"]>;
export class Localization extends Collection<LangID, DefaultLang> {
    public readonly default = enUs;
    public constructor(public langID: LangID) { super(); }

    public async load(): Promise<any> {
        const langsFolderPath = resolve(__dirname, "..", "langs");
        const langsFile = await readdir(langsFolderPath);
        for (const langFile of langsFile) {
            const lang: DefaultLang = (await import(resolve(langsFolderPath, langFile))).lang;
            this.set(lang.META_ID(), lang);
        }
    }

    public get lang(): DefaultLang {
        return this.get(this.langID) ?? this.default;
    }
}
