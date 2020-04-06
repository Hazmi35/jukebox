export const name: string = process.env.CONFIG_NAME!;
export const prefix: string = process.env.CONFIG_PREFIX!;
export const owners: string[] = JSON.parse(process.env.CONFIG_OWNERS!);
export const totalShards: string | number = process.env.CONFIG_TOTALSHARDS!;

export default {
    name,
    prefix,
    owners,
    totalShards
};