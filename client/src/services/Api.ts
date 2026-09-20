export type Platform =
    | "twitch"
    | "kick";

export type DiscoveryMode =
    | "random"
    | "just-starting"
    | "less-than-10"
    | "partner-push"
    | "top-game"
    | "on-the-rise";

export interface Stream {
    platform: Platform;
    channelName: string;
    channelLogin: string;
    title: string;
    category: string;
    categoryId?: string;
    language: string;
    viewers: number;
    thumbnail: string;
    url: string;
    startedAt: string;
    mature: boolean;
}

export interface GameResult {
    id: string;
    name: string;
    boxArtUrl: string;
}

const API = "/api";

export async function GetRandomStream(
    platform: Platform = "twitch",
    language: string = "any",
    mode: DiscoveryMode = "random",
    categoryId?: string
): Promise<Stream> {

    const params = new URLSearchParams();

    params.set("platform", platform);
    params.set("language", language);
    params.set("mode", mode);

    if (categoryId) {
        params.set("categoryId", categoryId);
    }

    const response =
        await fetch(
            `${API}/random?${params.toString()}`
        );

    if (!response.ok) {
        throw new Error(
            "Unable to load stream."
        );
    }

    return await response.json();
}

export async function SearchGames(
    platform: Platform,
    query: string
): Promise<GameResult[]> {

    const params =
        new URLSearchParams();

    params.set(
        "platform",
        platform
    );

    params.set(
        "query",
        query
    );

    const response =
        await fetch(
            `${API}/search-games?${params.toString()}`
        );

    if (!response.ok) {
        throw new Error(
            "Unable to search games."
        );
    }

    return await response.json();
}
