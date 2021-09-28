import { ActivityType } from "discord.js";

// Base config
export const prefix = process.env.CONFIG_PREFIX?.replace(/"/g, "") ?? "jukebox "; // Temporary workaround for https://github.com/docker/compose/issues/6951
export const owners: string[] = process.env.CONFIG_OWNERS?.replace(/  +/g, " ").split(/,[ ]?/) ?? [];
export const totalShards: string | number = process.env.CONFIG_TOTALSHARDS?.toLowerCase() ?? "auto";
export const debug = process.env.CONFIG_DEBUG?.toLowerCase() === "yes";
export const cacheUsers = process.env.CONFIG_CACHE_USERS?.toLowerCase() === "yes";

if (totalShards !== "auto" && isNaN(totalShards as unknown as number)) throw new Error("CONFIG_TOTALSHARDS must be a number or \"auto\"");

// Queue config
export const allowDuplicate: boolean = process.env.CONFIG_ALLOW_DUPLICATE?.toLowerCase() === "yes";
export const deleteQueueTimeout = Number(process.env.CONFIG_DELETE_QUEUE_TIMEOUT) * 1000 || 180 * 1000;

// Play command config
export const selectTimeout = Number(process.env.CONFIG_SELECT_TIMEOUT) * 1000 || 20 * 1000;
export const disableTrackSelection = process.env.CONFIG_DISABLE_TRACK_SELECTION?.toLowerCase() === "yes";
export const searchMaxResults = Number(process.env.CONFIG_SEARCH_MAX_RESULTS) || 10;

if (searchMaxResults < 1) throw new Error("CONFIG_SEARCH_MAX_RESULTS cannot be smaller than 1");
if (searchMaxResults > 15) throw new Error("CONFIG_SEARCH_MAX_RESULTS cannot be higher than 12");

// Volume config
export const enableInlineVolume = process.env.CONFIG_ENABLE_INLINE_VOLUME?.toLowerCase() === "yes";
export const defaultVolume = Number(process.env.CONFIG_DEFAULT_VOLUME) || 100;
export const maxVolume = Number(process.env.CONFIG_MAX_VOLUME) || 100;

// Music cache config
// TODO: Recreate cache system
export const cacheYoutubeDownloads: boolean = process.env.CONFIG_CACHE_YOUTUBE_DOWNLOADS?.toLowerCase() === "yes";
export const cacheMaxLengthAllowed = Number(process.env.CONFIG_CACHE_MAX_LENGTH) || 5400;

// Miscellaneous config
export const disableInviteCmd = process.env.CONFIG_DISABLE_INVITE_CMD?.toLowerCase() === "yes";
export const status = {
    type: process.env.CONFIG_STATUS_TYPE?.toUpperCase() as ActivityType | null ?? "LISTENING",
    activity: process.env.CONFIG_STATUS_ACTIVITY ?? "music on {guildsCount} guilds"
};
