export class VideoInfo {
    public readonly url: string;
    public readonly thumbnailURL: string;
    public constructor(public readonly id: string, public readonly title: string, public readonly author: string, public readonly duration: number|null) {
        this.url = `https://www.youtube.com/watch?v=${this.id}`;
        this.thumbnailURL = `https://i.ytimg.com/vi/${this.id}/hqdefault.jpg`;
        // i.ytimg.com may not available for some videos (the quality)
        // You can do manual eliminate by using http request and check the response status
    }
}
