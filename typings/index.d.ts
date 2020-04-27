import { Message, Guild, TextChannel, VoiceChannel, DMChannel, NewsChannel, VoiceConnection, Collection } from "discord.js";
import Jukebox from "../src/structures/Jukebox";

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
    queue: IServerQueue | null;
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

export interface IServerQueue {
    textChannel: ITextChannel | IDMChannel | INewsChannel | null;
    voiceChannel: VoiceChannel | null;
    connection: VoiceConnection | null;
    songs: ISongs;
    volume: number;
    playing: boolean;
    loopMode: 0 | 1 | 2;
}
export interface ISongs extends Collection<string, ISong> {
    addSong(song: ISong): this;
    deleteFirst(): boolean;
}

export interface ISong {
    id: string;
    title: string;
    url: string;
}