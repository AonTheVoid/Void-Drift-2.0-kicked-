import axios from "axios";

import KickConfig from "../config/Kick";

import {
    KickStream,
    KickStreamsResponse,
    KickTokenResponse,
    KickCategorySearchResponse
} from "../types/Kick";

class KickService {

    private accessToken = "";

    private expiresAt = 0;

    private async authenticate(): Promise<void> {

        if (
            this.accessToken.length > 0 &&
            Date.now() < this.expiresAt
        ) {
            return;
        }

        const response =
            await axios.post<KickTokenResponse>(
                KickConfig.OAuthUrl,
                new URLSearchParams({
                    grant_type: "client_credentials",
                    client_id: KickConfig.ClientId,
                    client_secret: KickConfig.ClientSecret
                }),
                {
                    headers: {
                        "Content-Type":
                            "application/x-www-form-urlencoded"
                    }
                }
            );

        this.accessToken =
            response.data.access_token;

        this.expiresAt =
            Date.now() +
            ((response.data.expires_in - 60) * 1000);

        console.log(
            "Kick OAuth token acquired."
        );
    }

    private async get<T>(
        url: string,
        params: Record<string, unknown> = {}
    ): Promise<T> {

        await this.authenticate();

        const response =
            await axios.get<T>(
                `${KickConfig.ApiBaseUrl}${url}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${this.accessToken}`
                    },
                    params
                }
            );

        return response.data;
    }

    public async getLiveStreams(
        targetCount = 100
    ): Promise<KickStream[]> {

        const streams: KickStream[] = [];

        let cursor: string | undefined;

        const maxPages = 100;

        for (
            let page = 0;
            page < maxPages &&
            streams.length < targetCount;
            page++
        ) {

            const params: Record<string, unknown> = {};

            if (cursor) {
                params.cursor = cursor;
            }

            const response =
                await this.get<KickStreamsResponse>(
                    "/public/v2/livestreams",
                    params
                );

            streams.push(
                ...response.data
            );

            console.log(
                `Kick stream page ${page + 1} - ${streams.length} streams`
            );

            const nextCursor =
                response.pagination?.next_cursor;

            if (
                !nextCursor ||
                response.data.length === 0
            ) {
                break;
            }

            cursor = nextCursor;
        }

        return streams.slice(0, targetCount);
    }

    public async searchCategories(
        query: string
    ): Promise<KickCategorySearchResponse> {

        return await this.get<KickCategorySearchResponse>(
            "/public/v2/categories",
            {
                name: query,
                limit: 20
            }
        );
    }

}

export default new KickService();
