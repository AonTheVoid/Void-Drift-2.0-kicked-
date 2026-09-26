import { Router } from "express";
import axios from "axios";

const router = Router();

type Platform =
    | "twitch"
    | "kick";

interface TwitchTokenResponse {
    access_token: string;
    expires_in: number;
}

interface TwitchUserResponse {
    data: Array<{
        login: string;
        display_name: string;
        profile_image_url: string;
    }>;
}

interface KickChannelResponse {
    data: Array<{
        broadcaster_user_id: number;
        slug: string;
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

let twitchToken = "";
let twitchTokenExpires = 0;

let kickToken = "";
let kickTokenExpires = 0;

async function GetTwitchToken(): Promise<string> {

    if (
        twitchToken &&
        Date.now() < twitchTokenExpires
    ) {
        return twitchToken;
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

    twitchToken =
        response.data.access_token;

    twitchTokenExpires =
        Date.now() +
        (
            (
                response.data.expires_in -
                60
            ) * 1000
        );

    return twitchToken;
}

async function GetKickToken(): Promise<string> {

    if (
        kickToken &&
        Date.now() < kickTokenExpires
    ) {
        return kickToken;
    }

    const response =
        await axios.post<{
            access_token: string;
            expires_in: number;
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

    kickToken =
        response.data.access_token;

    kickTokenExpires =
        Date.now() +
        (
            (
                Number(
                    response.data.expires_in
                ) - 60
            ) * 1000
        );

    return kickToken;
}

router.get(
    "/",
    async (req, res) => {

        const platform =
            typeof req.query.platform === "string"
                ? req.query.platform.toLowerCase()
                : "";

        const login =
            typeof req.query.login === "string"
                ? req.query.login.trim()
                : "";

        if (
            (
                platform !== "twitch" &&
                platform !== "kick"
            ) ||
            !login
        ) {

            return res.status(400).json({
                error:
                    "Platform and login are required."
            });

        }

        try {

            if (
                platform ===
                "twitch"
            ) {

                const token =
                    await GetTwitchToken();

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

                    return res.status(404).json({
                        error:
                            "Creator not found."
                    });

                }

                return res.json({
                    platform: "twitch",
                    channelLogin:
                        user.login,
                    channelName:
                        user.display_name,
                    profileImageUrl:
                        user.profile_image_url
                });
            }

            const token =
                await GetKickToken();

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

                return res.status(404).json({
                    error:
                        "Creator not found."
                });

            }

            let profileImageUrl =
                channel.profile_picture ??
                "";

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
                    userResponse
                        .data
                        .data[0]
                        ?.profile_picture ??
                    "";
            }

            return res.json({
                platform: "kick",
                channelLogin:
                    channel.slug,
                channelName:
                    channel.slug,
                profileImageUrl
            });

        } catch (error) {

            console.error(
                "Unable to resolve creator profile.",
                error
            );

            return res.status(500).json({
                error:
                    "Unable to resolve creator profile."
            });

        }

    }
);

export default router;