"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KickConfig = void 0;
exports.KickConfig = {
    get ClientId() {
        return process.env.KICK_CLIENT_ID ?? "";
    },
    get ClientSecret() {
        return process.env.KICK_CLIENT_SECRET ?? "";
    },
    OAuthUrl: "https://id.kick.com/oauth/token",
    ApiBaseUrl: "https://api.kick.com",
    CacheRefreshSeconds: 60,
    MaxStreams: 100
};
exports.default = exports.KickConfig;
