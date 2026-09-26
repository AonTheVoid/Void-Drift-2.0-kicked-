import axios from "axios";
import fs from "fs";
import path from "path";

export type PicksPlatform =
    | "twitch"
    | "kick";

export interface PickCreator {
    slot: number;
    platform: PicksPlatform;
    channelLogin: string;
    channelName: string;
    profileImageUrl: string;
    url: string;
    updatedAt: string;
}

export interface PickStream {
    platform: PicksPlatform;
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

interface TwitchStreamResponse {
    data: Array<{
        user_id: string;
        user_login: string;
        user_name: string;
        game_id: string;
        game_name: string;
        type: string;
        title: string;
        viewer_count: number;
        language: string;
        thumbnail_url: string;
        started_at: string;
        is_mature: boolean;
    }>;
}

interface KickChannelResponse {
    data: Array<{
        broadcaster_user_id: number;
        channel_id: number;
        slug: string;
        stream_title?: string;
        language?: string;
        has_mature_content?: boolean;
        viewer_count?: number;
        thumbnail?: string;
        started_at?: string;
        category?: {
            id: number;
            name: string;
            thumbnail?: string;
        };
        profile_picture?: string;
    }>;
}

interface KickUserResponse {
    data: Array<{
        user_id: number;
        name: string;
        profile_picture: string;
    }>;
}

class PicksService {

    private readonly dataDirectory =
        path.resolve(
            __dirname,
            "../../data"
        );

    private readonly dataFile =
        path.join(
            this.dataDirectory,
            "picks.json"
        );

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
            (
                (response.data.expires_in - 60) *
                1000
            );

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
            (
                (Number(response.data.expires_in) - 60) *
                1000
            );

        return this.kickAccessToken;
    }


    private parseChannelUrl(
        input: string
    ): {
        platform: PicksPlatform;
        login: string;
    } {

        let parsed: URL;

        try {

            parsed =
                new URL(
                    input.trim()
                );

        } catch {

            throw new Error(
                "Invalid URL. Paste a Twitch or Kick channel link."
            );

        }

        const hostname =
            parsed.hostname
                .toLowerCase()
                .replace(
                    /^www\./,
                    ""
                );

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
            decodeURIComponent(
                segments[0]
            );

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


    private async resolveCreator(
        input: string
    ): Promise<Omit<PickCreator, "slot">> {

        const parsed =
            this.parseChannelUrl(
                input
            );

        if (
            parsed.platform ===
            "twitch"
        ) {

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
                            login:
                                parsed.login
                        }
                    }
                );

            const user =
                response.data.data[0];

            if (!user) {

                throw new Error(
                    `Twitch channel "${parsed.login}" was not found.`
                );

            }

            return {
                platform: "twitch",

                channelLogin:
                    user.login,

                channelName:
                    user.display_name,

                profileImageUrl:
                    user.profile_image_url,

                url:
                    `https://twitch.tv/${user.login}`,

                updatedAt:
                    new Date().toISOString()
            };
        }


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
                        slug:
                            parsed.login
                    }
                }
            );

        const channel =
            channelResponse.data.data[0];

        if (!channel) {

            throw new Error(
                `Kick channel "${parsed.login}" was not found.`
            );

        }

        let profileImageUrl =
            channel.profile_picture ?? "";

        if (
            !profileImageUrl &&
            channel.broadcaster_user_id
        ) {

            const userResponse =
                await axios.get<KickUserResponse>(
                    "https://api.kick.com/public/v1/users",
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        },

                        params: {
                            id:
                                channel.broadcaster_user_id
                        }
                    }
                );

            profileImageUrl =
                userResponse.data.data[0]
                    ?.profile_picture ?? "";
        }

        return {
            platform: "kick",

            channelLogin:
                channel.slug,

            channelName:
                channel.slug,

            profileImageUrl,

            url:
                `https://kick.com/${channel.slug}`,

            updatedAt:
                new Date().toISOString()
        };
    }


    private readPicks(): PickCreator[] {

        if (
            !fs.existsSync(
                this.dataFile
            )
        ) {
            return [];
        }

        try {

            const raw =
                fs.readFileSync(
                    this.dataFile,
                    "utf8"
                );

            const parsed =
                JSON.parse(raw);

            if (
                !Array.isArray(parsed)
            ) {
                return [];
            }

            return parsed
                .filter(Boolean)
                .sort(
                    (
                        a: PickCreator,
                        b: PickCreator
                    ) =>
                        a.slot - b.slot
                );

        } catch {

            return [];
        }
    }


    private writePicks(
        picks: PickCreator[]
    ): void {

        fs.mkdirSync(
            this.dataDirectory,
            {
                recursive: true
            }
        );

        fs.writeFileSync(
            this.dataFile,
            JSON.stringify(
                picks.sort(
                    (a, b) =>
                        a.slot - b.slot
                ),
                null,
                4
            ),
            "utf8"
        );
    }


    public async setPick(
        slot: number,
        input: string
    ): Promise<PickCreator> {

        if (
            !Number.isInteger(slot) ||
            slot < 1 ||
            slot > 10
        ) {

            throw new Error(
                "Pick slot must be between 1 and 10."
            );

        }

        const creator =
            await this.resolveCreator(
                input
            );

        const pick: PickCreator = {
            slot,
            ...creator
        };

        const picks =
            this.readPicks()
                .filter(
                    item =>
                        item.slot !== slot
                );

        picks.push(pick);

        this.writePicks(
            picks
        );

        return pick;
    }


    public getPicks(): PickCreator[] {

        return this.readPicks()
            .filter(
                pick =>
                    pick.slot >= 1 &&
                    pick.slot <= 10
            );
    }


    public clear(): void {

        if (
            fs.existsSync(
                this.dataFile
            )
        ) {

            fs.unlinkSync(
                this.dataFile
            );

        }
    }


    public async getLiveStream(
        slot: number
    ): Promise<PickStream | null> {

        const pick =
            this.readPicks()
                .find(
                    item =>
                        item.slot === slot
                );

        if (!pick) {
            return null;
        }


        if (
            pick.platform ===
            "twitch"
        ) {

            const token =
                await this.getTwitchToken();

            const response =
                await axios.get<TwitchStreamResponse>(
                    "https://api.twitch.tv/helix/streams",
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`,

                            "Client-Id":
                                process.env.TWITCH_CLIENT_ID ?? ""
                        },

                        params: {
                            user_login:
                                pick.channelLogin
                        }
                    }
                );

            const stream =
                response.data.data[0];

            if (!stream) {
                return null;
            }

            return {
                platform: "twitch",

                channelName:
                    stream.user_name,

                channelLogin:
                    stream.user_login,

                title:
                    stream.title,

                category:
                    stream.game_name,

                categoryId:
                    stream.game_id ||
                    undefined,

                language:
                    stream.language,

                viewers:
                    stream.viewer_count,

                thumbnail:
                    stream.thumbnail_url
                        .replace(
                            "{width}",
                            "1280"
                        )
                        .replace(
                            "{height}",
                            "720"
                        ),

                url:
                    `https://twitch.tv/${stream.user_login}`,

                startedAt:
                    stream.started_at,

                mature:
                    stream.is_mature,

                live: true
            };
        }


        const token =
            await this.getKickToken();

        const response =
            await axios.get<KickChannelResponse>(
                "https://api.kick.com/public/v1/channels",
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    },

                    params: {
                        slug:
                            pick.channelLogin
                    }
                }
            );

        const channel =
            response.data.data[0];

        if (
            !channel ||
            !channel.started_at
        ) {
            return null;
        }

        return {
            platform: "kick",

            channelName:
                pick.channelName,

            channelLogin:
                channel.slug,

            title:
                channel.stream_title ?? "",

            category:
                channel.category?.name ?? "",

            categoryId:
                channel.category?.id
                    ? String(
                        channel.category.id
                    )
                    : undefined,

            language:
                channel.language ?? "any",

            viewers:
                channel.viewer_count ?? 0,

            thumbnail:
                channel.thumbnail ?? "",

            url:
                `https://kick.com/${channel.slug}`,

            startedAt:
                channel.started_at,

            mature:
                channel.has_mature_content ?? false,

            live: true
        };
    }


    public async getPicksWithLiveData() {

        const picks =
            this.getPicks();

        return Promise.all(
            picks.map(
                async pick => {

                    let live =
                        null;

                    try {

                        live =
                            await this.getLiveStream(
                                pick.slot
                            );

                    } catch (error) {

                        console.error(
                            `Unable to load live data for pick ${pick.slot}.`,
                            error
                        );

                    }

                    return {
                        ...pick,
                        live
                    };
                }
            )
        );
    }
}

export default new PicksService();