export type DiscoveryMode =
    | "random"
    | "just-starting"
    | "less-than-10"
    | "partner-push"
    | "top-game"
    | "on-the-rise";

export interface Stream {
    channelName: string;
    channelLogin: string;
    title: string;
    category: string;
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
    language: string = "any",
    mode: DiscoveryMode = "random",
    gameId?: string
): Promise<Stream> {
    const params = new URLSearchParams();

    params.set("language", language);
    params.set("mode", mode);

    if (gameId) {
        params.set("gameId", gameId);
    }

    const response = await fetch(`${API}/random?${params.toString()}`);

    if (!response.ok) {
        throw new Error("Unable to load stream.");
    }

    return await response.json();
}

export async function SearchGames(
    query: string
): Promise<GameResult[]> {
    const response = await fetch(
        `${API}/search-games?query=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
        throw new Error("Unable to search games.");
    }

    return await response.json();
}