import axios from "axios";
import TwitchConfig from "../config/Twitch";
import {
    OAuthResponse,
    TwitchStream,
    TwitchStreamsResponse
} from "../types/Twitch";

class TwitchService {

    private accessToken = "";

    private expiresAt = 0;

    private readonly requestsPerMinute = 750;

    private requestTimestamps: number[] = [];

    private async authenticate(): Promise<void> {

        if (
            this.accessToken.length > 0 &&
            Date.now() < this.expiresAt
        ) {
            return;
        }

        const response = await axios.post<OAuthResponse>(
            TwitchConfig.OAuthUrl,
            null,
            {
                params: {
                    client_id: TwitchConfig.ClientId,
                    client_secret: TwitchConfig.ClientSecret,
                    grant_type: "client_credentials"
                }
            }
        );

        this.accessToken =
            response.data.access_token;

        this.expiresAt =
            Date.now() +
            ((response.data.expires_in - 60) * 1000);

        console.log(
            "Twitch OAuth token acquired."
        );
    }

    private async waitForRateLimit(): Promise<void> {

        while (true) {

            const now = Date.now();

            this.requestTimestamps =
                this.requestTimestamps.filter(
                    timestamp =>
                        now - timestamp < 60_000
                );

            if (
                this.requestTimestamps.length <
                this.requestsPerMinute
            ) {

                this.requestTimestamps.push(now);

                return;

            }

            const oldest =
                this.requestTimestamps[0];

            const waitTime =
                60_000 -
                (now - oldest) +
                10;

            await new Promise(resolve =>
                setTimeout(
                    resolve,
                    waitTime
                )
            );

        }

    }

    private async get<T>(
        url: string,
        params: Record<string, unknown>
    ): Promise<T> {

        await this.authenticate();

        await this.waitForRateLimit();

        const headers = {
            Authorization:
                `Bearer ${this.accessToken}`,

            "Client-Id":
                TwitchConfig.ClientId
        };

        const response =
            await axios.get<T>(
                url,
                {
                    headers,
                    params
                }
            );

        return response.data;

    }

    public async searchCategories(
        query: string
    ): Promise<
        {
            id: string;
            name: string;
            box_art_url: string;
        }[]
    > {

        const response =
            await this.get<{
                data: {
                    id: string;
                    name: string;
                    box_art_url: string;
                }[];
            }>(
                TwitchConfig.SearchCategoriesUrl,
                {
                    query,
                    first: 10
                }
            );

        return response.data;

    }

    public async getLiveStreams(): Promise<TwitchStream[]> {

        const streams: TwitchStream[] = [];

        let cursor:
            string | undefined;

        const maxPages = 700;

        for (
            let page = 0;
            page < maxPages;
            page++
        ) {

            const params:
                Record<string, unknown> = {
                    first: 100
                };

            if (cursor) {
                params.after = cursor;
            }

            const response =
                await this.get<TwitchStreamsResponse>(
                    TwitchConfig.StreamsUrl,
                    params
                );

            streams.push(
                ...response.data
            );

            cursor =
                response.pagination?.cursor;

            console.log(
                `Stream cache page ${page + 1}/${maxPages} - ${streams.length} streams`
            );

            if (
                !cursor ||
                response.data.length === 0
            ) {
                break;
            }

        }

        return streams;

    }

    public async getTopGameStreams(): Promise<TwitchStream[]> {

        const gamesResponse =
            await this.get<{
                data: {
                    id: string;
                }[];
            }>(
                TwitchConfig.GamesUrl,
                {
                    first: 5
                }
            );

        const games =
            gamesResponse.data;

        const streams: TwitchStream[] = [];

        for (const game of games) {

            let cursor:
                string | undefined;

            for (
                let page = 0;
                page < 2;
                page++
            ) {

                const params:
                    Record<string, unknown> = {
                        game_id: game.id,
                        first: 100
                    };

                if (cursor) {
                    params.after = cursor;
                }

                const response =
                    await this.get<TwitchStreamsResponse>(
                        TwitchConfig.StreamsUrl,
                        params
                    );

                streams.push(
                    ...response.data.filter(
                        stream =>
                            stream.viewer_count >= 5 &&
                            stream.viewer_count <= 200
                    )
                );

                cursor =
                    response.pagination?.cursor;

                if (
                    !cursor ||
                    response.data.length === 0
                ) {
                    break;
                }

            }

        }

        streams.sort(
            () => Math.random() - 0.5
        );

        return streams;

    }

}

export default new TwitchService();