export const TwitchConfig = {

    get ClientId(): string {
        return process.env.TWITCH_CLIENT_ID ?? "";
    },

    get ClientSecret(): string {
        return process.env.TWITCH_CLIENT_SECRET ?? "";
    },

    OAuthUrl: "https://id.twitch.tv/oauth2/token",

    StreamsUrl: "https://api.twitch.tv/helix/streams",

    GamesUrl: "https://api.twitch.tv/helix/games/top",

    SearchCategoriesUrl: "https://api.twitch.tv/helix/search/categories",

    CacheRefreshSeconds: 145,

    MaxStreams: 100
};

export default TwitchConfig;