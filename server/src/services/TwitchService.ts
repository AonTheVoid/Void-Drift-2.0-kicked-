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

        this.accessToken = response.data.access_token;

        this.expiresAt =
            Date.now() +
            ((response.data.expires_in - 60) * 1000);

        console.log("Twitch OAuth token acquired.");

    }

    public async getLiveStreams(): Promise<TwitchStream[]> {

        await this.authenticate();

        const headers = {
            Authorization: `Bearer ${this.accessToken}`,
            "Client-Id": TwitchConfig.ClientId
        };

        const gamesResponse =
            await axios.get(
                TwitchConfig.GamesUrl,
                {
                    headers,
                    params: {
                        first: 50
                    }
                }
            );

        const games = gamesResponse.data.data;

        const randomGames =
            games
                .sort(() => Math.random() - 0.5)
                .slice(0, 20);

        const streams: TwitchStream[] = [];

        for (const game of randomGames) {

            // First 100 streams
            const page1 =
                await axios.get<TwitchStreamsResponse>(
                    TwitchConfig.StreamsUrl,
                    {
                        headers,
                        params: {
                            game_id: game.id,
                            first: 100
                        }
                    }
                );

            streams.push(...page1.data.data);

            // Next 100 streams
            if (page1.data.pagination?.cursor) {

                const page2 =
                    await axios.get<TwitchStreamsResponse>(
                        TwitchConfig.StreamsUrl,
                        {
                            headers,
                            params: {
                                game_id: game.id,
                                first: 100,
                                after: page1.data.pagination.cursor
                            }
                        }
                    );

                streams.push(...page2.data.data);

            }

        }

        return streams;

    }

    public async getTopGameStreams(): Promise<TwitchStream[]> {

        await this.authenticate();

        const headers = {
            Authorization: `Bearer ${this.accessToken}`,
            "Client-Id": TwitchConfig.ClientId
        };

        const gamesResponse =
            await axios.get(
                TwitchConfig.GamesUrl,
                {
                    headers,
                    params: {
                        first: 5
                    }
                }
            );

        const games = gamesResponse.data.data;

        const streams: TwitchStream[] = [];

        for (const game of games) {

            const page1 =
                await axios.get<TwitchStreamsResponse>(
                    TwitchConfig.StreamsUrl,
                    {
                        headers,
                        params: {
                            game_id: game.id,
                            first: 100
                        }
                    }
                );

            streams.push(
                ...page1.data.data.filter(stream =>
                    stream.viewer_count >= 5 &&
                    stream.viewer_count <= 200
                )
            );

            if (page1.data.pagination?.cursor) {

                const page2 =
                    await axios.get<TwitchStreamsResponse>(
                        TwitchConfig.StreamsUrl,
                        {
                            headers,
                            params: {
                                game_id: game.id,
                                first: 100,
                                after: page1.data.pagination.cursor
                            }
                        }
                    );

                streams.push(
                    ...page2.data.data.filter(stream =>
                        stream.viewer_count >= 5 &&
                        stream.viewer_count <= 200
                    )
                );

            }

        }

        streams.sort(() => Math.random() - 0.5);

        return streams;

    }

}

export default new TwitchService();
