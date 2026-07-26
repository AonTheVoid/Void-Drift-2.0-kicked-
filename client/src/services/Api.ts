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

const API = "/api";

export async function GetRandomStream(
    language: string = "any",
    mode: DiscoveryMode = "random"
): Promise<Stream> {

    const response = await fetch(
        `${API}/random?language=${encodeURIComponent(language)}&mode=${encodeURIComponent(mode)}`
    );

    if (!response.ok) {

        throw new Error("Unable to load stream.");

    }

    return await response.json();

}