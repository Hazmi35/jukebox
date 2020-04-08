export const name: string = process.env.CONFIG_NAME!;
export const prefix = process.env.CONFIG_PREFIX!.replace(/"/g, ""); // FIX: Temporary workaround for https://github.com/docker/compose/issues/6951
export const owners: string[] = JSON.parse(process.env.CONFIG_OWNERS!);
export const searchLimit = Number(process.env.CONFIG_YT_SEARCH_LIMIT!);
export const totalShards: string | number = process.env.CONFIG_TOTALSHARDS!;

export default {
    name,
    prefix,
    owners,
    totalShards
};