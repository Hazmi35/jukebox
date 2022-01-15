import { ActivitiesOptions } from "discord.js";

function getValue(config: string, defaultValue: any): string {
    const valueRaw = process.env[config];
    if (valueRaw === undefined || valueRaw === "" || valueRaw === " ") return defaultValue;

    return valueRaw.toString();
}

function getBoolean(config: string): boolean {
    return process.env[config]?.toLowerCase() === "yes";
}

// Base config
export const prefix = getValue("CONFIG_PREFIX", "jukebox ").replace(/"/g, ""); // Temporary workaround for https://github.com/docker/compose/issues/6951
export const owners: string[] = getValue("CONFIG_OWNERS", "").replace(/  +/g, " ").split(/,[ ]?/);
export const totalShards: number | string = getValue("CONFIG_TOTALSHARDS", "auto").toLowerCase();
export const debug = getBoolean("CONFIG_DEBUG");
export const cacheUsers = getBoolean("CONFIG_CACHE_USERS");

if (totalShards !== "auto" && isNaN(totalShards as unknown as number)) throw new Error("CONFIG_TOTALSHARDS must be a number or \"auto\"");

// Queue config
export const allowDuplicate = getBoolean("CONFIG_ALLOW_DUPLICATE");
export const deleteQueueTimeout = Number(getValue("CONFIG_DELETE_QUEUE_TIMEOUT", 180)) * 1000;

// Play command config
export const selectTimeout = Number(getValue("CONFIG_SELECT_TIMEOUT", 20)) * 1000;
export const disableTrackSelection = getBoolean("CONFIG_DISABLE_TRACK_SELECTION");
export const searchMaxResults = Number(getValue("CONFIG_SEARCH_MAX_RESULTS", 10));

if (searchMaxResults < 1) throw new Error("CONFIG_SEARCH_MAX_RESULTS cannot be smaller than 1");
if (searchMaxResults > 15) throw new Error("CONFIG_SEARCH_MAX_RESULTS cannot be higher than 12");

// Volume config
export const enableInlineVolume = getBoolean("CONFIG_ENABLE_INLINE_VOLUME");
export const defaultVolume = Number(getValue("CONFIG_DEFAULT_VOLUME", 100));
export const maxVolume = Number(getValue("CONFIG_MAX_VOLUME", 100));

// Music cache config
export const cacheYoutubeDownloads = getBoolean("CONFIG_CACHE_YOUTUBE_DOWNLOADS"); // TODO: Recreate cache system
export const cacheMaxLengthAllowed = Number(getValue("CONFIG_CACHE_MAX_LENGTH", 5400));

// Miscellaneous config
export const disableInviteCmd = getBoolean("CONFIG_DISABLE_INVITE_CMD");
export const status = {
    type: getValue("CONFIG_STATUS_TYPE", "LISTENING").toUpperCase() as ActivitiesOptions["type"],
    activity: getValue("CONFIG_STATUS_ACTIVITY", "music on {guildsCount} guilds")
};

// i18n Config
export const lang = getValue("CONFIG_LANGUAGE", "en-US");
