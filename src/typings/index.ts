import { Message, Guild, TextChannel, VoiceChannel, DMChannel, NewsChannel, VoiceConnection, Collection } from "discord.js";
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
    getQueue(): IServerQueue | null;
    setQueue(newQueue: IServerQueue | null): IServerQueue | null;
}

export interface IMessage extends Message {
    client: Jukebox;
    guild: IGuild | null;
}

export interface IServerQueue {
    textChannel: TextChannel | DMChannel | NewsChannel;
    voiceChannel: VoiceChannel;
    connection: VoiceConnection | null;
    songs: Collection<ISong["id"], ISong>;
    volume: number;
    playing: boolean;
}
export interface ISong {
    title: string;
    id: string;
    url: string;
}
