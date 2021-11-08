export enum loopMode {
    off = 0,
    one = 1,
    all = 2,

    // ALIASES
    queue = all,
    "*" = all,

    current = one,
    trackonly = one,

    none = off,
    disable = off
}

export const loopModeTypes = ["disabled", "current track", "all tracks in the queue"];
export const loopModeEmojis = ["▶", "🔂", "🔁"];
export const baseLoopModes = ["off", "one", "all"];
