import axios from "axios";
import TwitchConfig from "../config/Twitch";
import { OAuthResponse, TwitchStream, TwitchStreamsResponse } from "../types/Twitch";

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

        const response =
            await axios.get<TwitchStreamsResponse>(
                TwitchConfig.StreamsUrl,
                {
                    headers: {
                        Authorization: `Bearer ${this.accessToken}`,
                        "Client-Id": TwitchConfig.ClientId
                    },
                    params: {
                        first: TwitchConfig.MaxStreams
                    }
                }
            );

        return response.data.data;
    }
}

export default new TwitchService();
