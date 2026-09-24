import axios from "axios";
import fs from "fs";
import path from "path";

type FeaturedPlatform = "twitch" | "kick";

export interface FeaturedCreator {
    platform: FeaturedPlatform;
    channelLogin: string;
    channelName: string;
    profileImageUrl: string;
    url: string;
    updatedAt: string;
}

interface TwitchTokenResponse {
    access_token: string;
    expires_in: number;
    token_type: string;
}

interface TwitchUserResponse {
    data: Array<{
        id: string;
        login: string;
        display_name: string;
        profile_image_url: string;
    }>;
}

interface KickChannelResponse {
    data: Array<{
        broadcaster_user_id: number;
        slug: string;
        stream_title?: string;
    }>;
}

interface KickUserResponse {
    data: Array<{
        user_id: number;
        name: string;
        profile_picture: string;
    }>;
}

class FeaturedService {

    private readonly dataDirectory =
        path.resolve(__dirname, "../../data");

    private readonly dataFile =
        path.join(this.dataDirectory, "featured.json");

    private twitchAccessToken = "";
    private twitchExpiresAt = 0;

    private kickAccessToken = "";
    private kickExpiresAt = 0;

    private async getTwitchToken(): Promise<string> {

        if (
            this.twitchAccessToken &&
            Date.now() < this.twitchExpiresAt
        ) {
            return this.twitchAccessToken;
        }

        const response =
            await axios.post<TwitchTokenResponse>(
                "https://id.twitch.tv/oauth2/token",
                null,
                {
                    params: {
                        client_id:
                            process.env.TWITCH_CLIENT_ID,
                        client_secret:
                            process.env.TWITCH_CLIENT_SECRET,
                        grant_type:
                            "client_credentials"
                    }
                }
            );

        this.twitchAccessToken =
            response.data.access_token;

        this.twitchExpiresAt =
            Date.now() +
            ((response.data.expires_in - 60) * 1000);

        return this.twitchAccessToken;
    }

    private async getKickToken(): Promise<string> {

        if (
            this.kickAccessToken &&
            Date.now() < this.kickExpiresAt
        ) {
            return this.kickAccessToken;
        }

        const response =
            await axios.post<{
                access_token: string;
                expires_in: number;
                token_type: string;
            }>(
                "https://id.kick.com/oauth/token",
                new URLSearchParams({
                    grant_type:
                        "client_credentials",
                    client_id:
                        process.env.KICK_CLIENT_ID ?? "",
                    client_secret:
                        process.env.KICK_CLIENT_SECRET ?? ""
                }),
                {
                    headers: {
                        "Content-Type":
                            "application/x-www-form-urlencoded"
                    }
                }
            );

        this.kickAccessToken =
            response.data.access_token;

        this.kickExpiresAt =
            Date.now() +
            ((Number(response.data.expires_in) - 60) * 1000);

        return this.kickAccessToken;
    }

    private parseChannelUrl(
        input: string
    ): {
        platform: FeaturedPlatform;
        login: string;
    } {

        let parsed: URL;

        try {
            parsed = new URL(input.trim());
        } catch {
            throw new Error(
                "Invalid URL. Paste a Twitch or Kick channel link."
            );
        }

        const hostname =
            parsed.hostname
                .toLowerCase()
                .replace(/^www\./, "");

        const segments =
            parsed.pathname
                .split("/")
                .filter(Boolean);

        if (segments.length !== 1) {
            throw new Error(
                "Use a direct Twitch or Kick channel link."
            );
        }

        const login =
            decodeURIComponent(segments[0]);

        if (!login) {
            throw new Error(
                "Unable to determine the channel name."
            );
        }

        if (hostname === "twitch.tv") {
            return {
                platform: "twitch",
                login
            };
        }

        if (hostname === "kick.com") {
            return {
                platform: "kick",
                login
            };
        }

        throw new Error(
            "Only Twitch and Kick channel links are supported."
        );
    }

    private async fetchTwitchCreator(
        login: string
    ): Promise<FeaturedCreator> {

        const token =
            await this.getTwitchToken();

        const response =
            await axios.get<TwitchUserResponse>(
                "https://api.twitch.tv/helix/users",
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                        "Client-Id":
                            process.env.TWITCH_CLIENT_ID ?? ""
                    },
                    params: {
                        login
                    }
                }
            );

        const user =
            response.data.data[0];

        if (!user) {
            throw new Error(
                `Twitch channel "${login}" was not found.`
            );
        }

        return {
            platform: "twitch",
            channelLogin: user.login,
            channelName: user.display_name,
            profileImageUrl:
                user.profile_image_url,
            url:
                `https://twitch.tv/${user.login}`,
            updatedAt:
                new Date().toISOString()
        };
    }

    private async fetchKickCreator(
        login: string
    ): Promise<FeaturedCreator> {

        const token =
            await this.getKickToken();

        const channelResponse =
            await axios.get<KickChannelResponse>(
                "https://api.kick.com/public/v1/channels",
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    },
                    params: {
                        slug: login
                    }
                }
            );

        const channel =
            channelResponse.data.data[0];

        if (!channel) {
            throw new Error(
                `Kick channel "${login}" was not found.`
            );
        }

        const userResponse =
            await axios.get<KickUserResponse>(
                "https://api.kick.com/public/v1/users",
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    },
                    params: {
                        id: channel.broadcaster_user_id
                    }
                }
            );

        const user =
            userResponse.data.data[0];

        if (!user) {
            throw new Error(
                `Kick creator information for "${login}" could not be loaded.`
            );
        }

        return {
            platform: "kick",
            channelLogin: channel.slug,
            channelName: user.name,
            profileImageUrl:
                user.profile_picture,
            url:
                `https://kick.com/${channel.slug}`,
            updatedAt:
                new Date().toISOString()
        };
    }

    public async setFeatured(
        input: string
    ): Promise<FeaturedCreator> {

        const parsed =
            this.parseChannelUrl(input);

        let featured: FeaturedCreator;

        if (parsed.platform === "twitch") {
            featured =
                await this.fetchTwitchCreator(
                    parsed.login
                );
        } else {
            featured =
                await this.fetchKickCreator(
                    parsed.login
                );
        }

        fs.mkdirSync(
            this.dataDirectory,
            {
                recursive: true
            }
        );

        fs.writeFileSync(
            this.dataFile,
            JSON.stringify(
                featured,
                null,
                4
            ),
            "utf8"
        );

        return featured;
    }

    public getFeatured():
        FeaturedCreator | null {

        if (!fs.existsSync(this.dataFile)) {
            return null;
        }

        try {
            const raw =
                fs.readFileSync(
                    this.dataFile,
                    "utf8"
                );

            return JSON.parse(
                raw
            ) as FeaturedCreator;

        } catch {
            return null;
        }
    }

    public clearFeatured(): void {

        if (fs.existsSync(this.dataFile)) {
            fs.unlinkSync(
                this.dataFile
            );
        }
    }
}

export default new FeaturedService();