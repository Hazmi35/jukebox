import { Message, Guild, TextChannel, VoiceChannel, DMChannel, VoiceConnection, Collection, NewsChannel } from "discord.js";
import Jukebox from "../structures/Jukebox";

export interface CommandComponent {
    execute(message: Message, args: string[]): any;
    conf: {
        aliases?: string[];
        cooldown?: number;
        disable?: boolean;
        path?: string;
    };
    help: {
        name: string;
        description?: string;
        usage?: string;
    };
}

export interface IGuild extends Guild {
    client: Jukebox;
    getQueue(): IQueueManager | null;
    constructQueue(textChannel: IQueueConstruct["textChannel"], voiceChannel: IQueueConstruct["voiceChannel"]): IQueueManager;
    destroyQueue(): null;
}

export interface IMessage extends Message {
    client: Jukebox;
    guild: IGuild | null;
    channel: ITextChannel | INewsChannel | IDMChannel;
}

export interface ITextChannel extends TextChannel {
    client: Jukebox;
    guild: IGuild;
}

export interface INewsChannel extends NewsChannel {
    client: Jukebox;
    guild: IGuild;
}

export interface IDMChannel extends DMChannel {
    client: Jukebox;
    guild: null;
}

export interface IMusicManager {
    connect(): Promise<IMusicManager>;
    addSong(song: ISong): Collection<ISong["id"], ISong>;
}

export interface IQueueConstruct {
    textChannel: ITextChannel | IDMChannel | INewsChannel | null;
    voiceChannel: VoiceChannel | null;
    connection: VoiceConnection | null;
}

export interface ISong {
    title: string;
    id: string;
    url: string;
}
