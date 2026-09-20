export const KickConfig = {

    get ClientId(): string {
        return process.env.KICK_CLIENT_ID ?? "";
    },

    get ClientSecret(): string {
        return process.env.KICK_CLIENT_SECRET ?? "";
    },

    OAuthUrl: "https://id.kick.com/oauth/token",

    ApiBaseUrl: "https://api.kick.com",

    CacheRefreshSeconds: 60,

    MaxStreams: 100
};

export default KickConfig;
