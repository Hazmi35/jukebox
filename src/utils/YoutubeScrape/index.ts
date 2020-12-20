/* eslint-disable no-mixed-operators */
import { Jukebox } from "../../structures/Jukebox";
import { Playlist } from "./structures/Playlist";
import { VideoInfo } from "./structures/Video";
import fetch from "node-fetch";

export class YoutubeScrape {
    private readonly initialDataRegex = /(window\["ytInitialData"]|var ytInitialData)\s*=\s*(.*);/;
    private readonly playlistURLRegex = /^https?:\/\/(?:www.|)youtube.com\/playlist\?list=(.*)$/;
    public constructor(public readonly client: Jukebox) {}

    public async load(query: string): Promise<Playlist|VideoInfo[]> {
        if (this.playlistURLRegex.test(query)) return this.loadPlaylist(query);
        return this.search(query);
    }

    public async search(query: string): Promise<VideoInfo[]> {
        const response = await (await fetch(`https://www.youtube.com/results?search_query=${decodeURIComponent(query)}`)).text();
        return this.extractSearchResults(response);
    }

    public async loadPlaylist(url: string): Promise<Playlist> {
        const response = await (await fetch(url)).text();
        return this.extractPlaylist(response);
    }

    private extractSearchResults(html: string): VideoInfo[] {
        const matched = this.initialDataRegex.exec(html)![2];
        const result = JSON.parse(matched.split(";</script>")[0]);
        const videos = result
            .contents
            .twoColumnSearchResultsRenderer
            .primaryContents
            .sectionListRenderer
            .contents[0]
            .itemSectionRenderer
            .contents;
        return videos
            .filter((x: any) => Boolean(x.videoRenderer))
            .map((x: any) => this.extractData(x.videoRenderer)) as VideoInfo[];
    }

    private extractPlaylist(html: string): Playlist {
        const matched = this.initialDataRegex.exec(html)![2];
        const result = JSON.parse(matched.split(";</script>")[0]);
        const playlistInfo = result.sidebar.playlistSidebarRenderer.items[0].playlistSidebarPrimaryInfoRenderer;
        const playlistOwner = result.sidebar.playlistSidebarRenderer.items[1].playlistSidebarSecondaryInfoRenderer.videoOwner.videoOwnerRenderer;
        const videos = result
            .contents
            .twoColumnBrowseResultsRenderer
            .tabs[0]
            .tabRenderer
            .content
            .sectionListRenderer
            .contents[0]
            .itemSectionRenderer
            .contents[0]
            .playlistVideoListRenderer
            .contents;
        const extractedVideos: VideoInfo[] = videos
            .filter((x: any) => x.playlistVideoRenderer?.isPlayable as boolean)
            .map((x: any) => this.extractData(x.playlistVideoRenderer));
        return new Playlist(
            playlistInfo.navigationEndpoint.watchEndpoint.playlistId,
            playlistInfo.title.runs[0].text,
            playlistOwner.title.runs[0].text,
            extractedVideos
        );
    }

    private extractData(video: any): VideoInfo {
        const title = video.title.runs[0].text;
        const author = video.shortBylineText?.runs[0].text;
        const duration = video.lengthText ? this.durationToMs(video.lengthText.simpleText) : null;
        return new VideoInfo(video.videoId, title, author, duration);
    }

    private durationToMs(duration: string): number {
        return duration.split(/[:.]/).map(Number).reduce((acc, curr) => curr + acc * 60) * 1000;
    }
}
