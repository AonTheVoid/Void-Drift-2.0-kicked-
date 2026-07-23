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

export async function GetRandomStream(language: string = "any"): Promise<Stream> {

    const response = await fetch(
        `${API}/random?language=${encodeURIComponent(language)}`
    );

    if (!response.ok) {

        throw new Error("Unable to load stream.");

    }

    return await response.json();

}
