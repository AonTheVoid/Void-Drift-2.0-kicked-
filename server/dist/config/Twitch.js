"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwitchConfig = void 0;
exports.TwitchConfig = {
    get ClientId() {
        return process.env.TWITCH_CLIENT_ID ?? "";
    },
    get ClientSecret() {
        return process.env.TWITCH_CLIENT_SECRET ?? "";
    },
    OAuthUrl: "https://id.twitch.tv/oauth2/token",
    StreamsUrl: "https://api.twitch.tv/helix/streams",
    CacheRefreshSeconds: 60,
    MaxStreams: 100
};
exports.default = exports.TwitchConfig;
