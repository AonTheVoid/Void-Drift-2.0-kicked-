export type DriftPlatform =
    | "twitch"
    | "kick"
    | "youtube";

export interface DriftStream {

    platform: DriftPlatform;

    id: string;

    channelId: string;

    channelLogin: string;

    channelName: string;

    title: string;

    categoryId?: string;

    category: string;

    language: string;

    viewers: number;

    thumbnail: string;

    startedAt: string;

    mature: boolean;

    tags?: string[];

    url: string;
}
