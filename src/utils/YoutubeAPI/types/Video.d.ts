import type { IThumbnails } from "./Thumbnails";

export interface IVideo {
    raw: {
        kind: string;
        etag: string;
        id: string;
        snippet: {
            publishedAt: Date;
            channelID: string;
            title: string;
            description: string;
            thumbnails: IThumbnails;
            channelTitle: string;
        };
        contentDetails: {
            duration: Date;
        };
        status: {
            uploadStatus: "deleted" | "failed" | "processed" | "rejected" | "uploaded";
            failureReason: "codec" | "conversion" | "emptyFile" | "invalidFile" | "tooSmall" | "uploadAborted";
            rejectionReason: "claim" | "copyright" | "duplicate" | "inappropriate" | "legal" | "length" | "termsOfUse" | "tradedmark" | "uploaderAccountClosed" | "uploaderAccountSuspended";
            privacyStatus: "private" | "public" | "unlisted";
        };

    };
    id: string;
    url: string;
    title: string;
    description: string;
    channel: {
        id: string;
        name: string;
        url: string;
    };
    thumbnails: IThumbnails;
    duration: string; // TODO: Try to parse ISO 8601 Duration (https://en.wikipedia.org/wiki/ISO_8601#Durations) with date-fns
    status: {
        uploadStatus: "deleted" | "failed" | "processed" | "rejected" | "uploaded";
        failureReason: "codec" | "conversion" | "emptyFile" | "invalidFile" | "tooSmall" | "uploadAborted";
        rejectionReason: "claim" | "copyright" | "duplicate" | "inappropriate" | "legal" | "length" | "termsOfUse" | "tradedmark" | "uploaderAccountClosed" | "uploaderAccountSuspended";
        privacyStatus: "private" | "public" | "unlisted";
    };
    publishedAt: Date;
}
