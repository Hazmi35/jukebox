export const name: string = process.env.CONFIG_NAME!;
export const prefix = process.env.CONFIG_PREFIX!.replace(/"/g, ""); // Temporary workaround for https://github.com/docker/compose/issues/6951
export const owners: string[] = JSON.parse(process.env.CONFIG_OWNERS!);
export const totalShards: string | number = process.env.CONFIG_TOTALSHARDS!;
export const defaultVolume = Number(process.env.CONFIG_DEFAULT_VOLUME);
export const maxVolume = Number(process.env.CONFIG_MAX_VOLUME);

export default { name, prefix, owners, totalShards, defaultVolume, maxVolume };