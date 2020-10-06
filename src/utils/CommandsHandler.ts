import { readdir } from "fs";
import { resolve } from "path";
import type { Message, Snowflake } from "discord.js";
import { Collection } from "discord.js";
import type Jukebox from "../structures/Jukebox";
import type { CommandComponent } from "../../typings";

export default class CommandsHandler {
    public readonly commands: Collection<string, CommandComponent> = new Collection();
    public readonly aliases: Collection<string, string> = new Collection();
    public readonly cooldowns: Collection<string, Collection<Snowflake, number>> = new Collection();
    public constructor(public client: Jukebox, public readonly path: string) {}
    public load(): void {
        readdir(resolve(this.path), (err, filesRaw) => {
            if (err) this.client.log.error("CMD_LOADER_ERR", err);
            let disabledCount = 0;
            const files = filesRaw.filter(f => !f.endsWith(".map"));
            files.forEach(file => {
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const command: CommandComponent = new (require(`${this.path}/${file}`).default)(this.client, `${this.path}/${file}`);
                if (command.conf.aliases!.length > 0) {
                    command.conf.aliases!.forEach(alias => {
                        this.aliases.set(alias, command.help.name);
                    });
                }
                this.commands.set(command.help.name, command);
                if (command.conf.disable === true) disabledCount++;
            });
            this.client.log.info(`${this.client.shard ? `[Shard #${this.client.shard.ids[0]}]` : ""} Found & Loaded ${files.length} of commands!`);
            if (disabledCount === 0) return;
            this.client.log.info(`${this.client.shard ? `[Shard #${this.client.shard.ids[0]}]` : ""} ${disabledCount} out of ${files.length} commands is disabled.`);
        });
        return undefined;
    }

    public handle(message: Message): any {
        const args = message.content.substring(this.client.config.prefix.length).trim().split(/ +/g);
        const cmd = args.shift()!.toLowerCase();
        const command = this.commands.get(cmd) ?? this.commands.get(this.aliases.get(cmd)!);
        if (!command || command.conf.disable) return undefined;
        if (!this.cooldowns.has(command.help.name)) this.cooldowns.set(command.help.name, new Collection());
        const now = Date.now();
        const timestamps: Collection<Snowflake, number> = this.cooldowns.get(command.help.name)!;
        const cooldownAmount = (command.conf.cooldown ?? 3) * 1000;
        if (timestamps.has(message.author.id)) {
            const expirationTime = timestamps.get(message.author.id)! + cooldownAmount;
            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                message.channel.send(`**${message.author.username}**, please wait **${timeLeft.toFixed(1)}** cooldown time.`).then((msg: Message) => {
                    msg.delete({ timeout: 3500 });
                });
                return undefined;
            }

            timestamps.set(message.author.id, now);
            setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
        } else {
            timestamps.set(message.author.id, now);
            if (this.client.config.owners.includes(message.author.id)) timestamps.delete(message.author.id);
        }
        try {
            return command.execute(message, args);
        } catch (e) {
            this.client.log.error("COMMAND_HANDLER_ERR", e);
        } finally {
            this.client.log.info(`${this.client.shard ? `[Shard #${this.client.shard.ids[0]}]` : ""} ${message.author.tag} is using ${command.help.name} command on ${message.guild ? message.guild.name : "DM Channel"}`);
        }
    }
}
