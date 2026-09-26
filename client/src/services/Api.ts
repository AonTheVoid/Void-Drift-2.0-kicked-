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
    profileImageUrl?: string;
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

export interface PickCreator {
    slot: number;
    platform: Platform;
    channelLogin: string;
    channelName: string;
    profileImageUrl: string;
    url: string;
    updatedAt: string;
}

export interface PickStream {
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
    live: boolean;
}

export interface PickWithLiveData
    extends PickCreator {
    live: PickStream | null;
}

export interface CreatorProfile {
    platform: Platform;
    channelLogin: string;
    channelName: string;
    profileImageUrl: string;
}

const API = "/api";

export async function GetRandomStream(
    platform: Platform = "twitch",
    language: string = "any",
    mode: DiscoveryMode = "random",
    categoryId?: string
): Promise<Stream> {

    const params =
        new URLSearchParams();

    params.set(
        "platform",
        platform
    );

    params.set(
        "language",
        language
    );

    params.set(
        "mode",
        mode
    );

    if (categoryId) {
        params.set(
            "categoryId",
            categoryId
        );
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

    const stream: Stream =
    await response.json();

try {

    const profile =
        await GetCreatorProfile(
            platform,
            stream.channelLogin
        );

    return {
        ...stream,
        profileImageUrl:
            profile.profileImageUrl
    };

} catch (error) {

    console.error(
        "Unable to load creator profile.",
        error
    );

    return stream;
}
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

export async function GetPicks():
    Promise<PickWithLiveData[]> {

    const response =
        await fetch(
            `${API}/picks`
        );

    if (!response.ok) {
        throw new Error(
            "Unable to load Drift Picks."
        );
    }

    return await response.json();
}

export async function GetPickStream(
    slot: number
): Promise<PickStream | null> {

    const response =
        await fetch(
            `${API}/picks/${slot}/stream`
        );

    if (response.status === 404) {
        return null;
    }

    if (!response.ok) {
        throw new Error(
            "Unable to load Pick stream."
        );
    }

    return await response.json();
}

export async function GetCreatorProfile(
    platform: Platform,
    channelLogin: string
): Promise<CreatorProfile> {

    const params =
        new URLSearchParams();

    params.set(
        "platform",
        platform
    );

    params.set(
        "login",
        channelLogin
    );

    const response =
        await fetch(
            `${API}/creator?${params.toString()}`
        );

    if (!response.ok) {
        throw new Error(
            "Unable to load creator profile."
        );
    }

    return await response.json();
}