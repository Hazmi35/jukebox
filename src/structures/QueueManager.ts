import { IMusicManager, IQueueConstruct, ISong } from "../typings";
import { Collection } from "discord.js";
import Jukebox from "./Jukebox";
import ytdl from "ytdl-core";

export default class MusicManager implements IMusicManager {
    private client: Jukebox | null = null;
    protected connection: IQueueConstruct["connection"] = null;
    protected songs: Collection<ISong["id"], ISong> = new Collection();
    protected volume = 50;
    protected playing = false;
    constructor(
        protected textChannel: IQueueConstruct["textChannel"] = null,
        protected voiceChannel: IQueueConstruct["voiceChannel"] = null) {}

    // public async connect(): Promise<IQueueManager> {
    //     this.connection = await this.voiceChannel!.join();
    //     return this;
    // }
    // public addSong(song: ISong): Collection<ISong["id"], ISong> {
    //     this.songs.set(song.id, song);
    //     return this.songs;
    // }
    // public getSong(id: ISong["id"]): ISong | undefined {
    //     return this.songs.get(id);
    // }
    // public getCurrentSong(): ISong | undefined {
    //     return this.songs.first();
    // }
    public play(): any {
        const serverQueue = guild.getQueue()!;
        const song = serverQueue.getCurrentSong[0];
        if (!song) {
            serverQueue.connection!.disconnect();
            return guild.setQueue(null);
        }

        serverQueue.connection!.voice.setSelfDeaf(true);
        const dispatcher = serverQueue.connection!.play(ytdl(song.url, ))
            .on("start", () => {
                this.textChannel!.client.log.info(`${this.textChannel!.client.shard ? `[Shard #${this.textChannel!.client.shard.ids}]` : ""} Song: ${song.title} started`);
                serverQueue.textChannel.send(`Start playing: **${song.title}**`);
            })
            .on("stop", () => {
                serverQueue.songs = [];
                this.textChannel!.guild!.setQueue(serverQueue);
                dispatcher.end();
            })
            .on("skip", () => {
                dispatcher.end();
            })
            .on("setVolume", (volume: number) => {
                serverQueue.volume = volume;
                serverQueue.connection!.dispatcher.setVolumeLogarithmic(volume / 100);
                guild.setQueue(serverQueue);
            })
            .on("finish", () => {
                this.client.log.info(`${this.client.shard ? `[Shard #${this.client.shard.ids}]` : ""} Song: ${song.title} ended`);
                serverQueue.textChannel.send(`Stop playing: **${song.title}**`);
                serverQueue.songs.shift();
                this.play(guild);
            }).on("error", (err: Error) => {
                this.client.log.error("PLAY_ERROR: ", err);
            });

        dispatcher.setVolumeLogarithmic(serverQueue.volume / 100);
    }
}