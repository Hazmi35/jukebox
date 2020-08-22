export const name: string = process.env.CONFIG_NAME! || "Jukebox";
export const prefix = process.env.CONFIG_PREFIX!.replace(/"/g, "") || "jukebox "; // Temporary workaround for https://github.com/docker/compose/issues/6951
// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
export const owners: string[] = process.env.CONFIG_OWNERS!.replace(/  +/g, " ").split(/,[ ]?/) || [];
export const totalShards: string | number = process.env.CONFIG_TOTALSHARDS! || "auto";
export const defaultVolume = Number(process.env.CONFIG_DEFAULT_VOLUME) || 50;
export const maxVolume = Number(process.env.CONFIG_MAX_VOLUME) || 100;
export const allowDuplicate: boolean = process.env.CONFIG_ALLOW_DUPLICATE! === "yes" || false;
export const deleteQueueTimeout: number = Number(process.env.CONFIG_DELETE_QUEUE_TIMEOUT) * 1000 || 180 * 1000;
export const cacheYoutubeDownloads: boolean = process.env.CONFIG_CACHE_YOUTUBE_DOWNLOADS! === "yes" || false;
export const cacheMaxLengthAllowed = Number(process.env.CONFIG_CACHE_MAX_LENGTH) || 5400;

export default { allowDuplicate, cacheMaxLengthAllowed, cacheYoutubeDownloads, defaultVolume, deleteQueueTimeout, maxVolume, name, owners, prefix, totalShards };
