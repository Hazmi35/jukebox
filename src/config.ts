export const name: string = process.env.CONFIG_NAME!;
export const prefix: string = process.env.CONFIG_PREFIX!;
export const devs: string[] = JSON.parse(process.env.CONFIG_DEVS!);
export const totalShards: string | number = process.env.CONFIG_TOTALSHARDS!;

export default {
    name,
    prefix,
    devs,
    totalShards
};