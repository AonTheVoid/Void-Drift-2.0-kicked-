"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const Twitch_1 = __importDefault(require("../config/Twitch"));
class TwitchService {
    accessToken = "";
    expiresAt = 0;
    async authenticate() {
        if (this.accessToken.length > 0 &&
            Date.now() < this.expiresAt) {
            return;
        }
        const response = await axios_1.default.post(Twitch_1.default.OAuthUrl, null, {
            params: {
                client_id: Twitch_1.default.ClientId,
                client_secret: Twitch_1.default.ClientSecret,
                grant_type: "client_credentials"
            }
        });
        this.accessToken = response.data.access_token;
        this.expiresAt =
            Date.now() +
                ((response.data.expires_in - 60) * 1000);
        console.log("Twitch OAuth token acquired.");
    }
    async getLiveStreams() {
        await this.authenticate();
        const headers = {
            Authorization: `Bearer ${this.accessToken}`,
            "Client-Id": Twitch_1.default.ClientId
        };
        const gamesResponse = await axios_1.default.get(Twitch_1.default.GamesUrl, {
            headers,
            params: {
                first: 25
            }
        });
        const games = gamesResponse.data.data;
        const randomGames = games
            .sort(() => Math.random() - 0.5)
            .slice(0, 10);
        const streams = [];
        for (const game of randomGames) {
            const response = await axios_1.default.get(Twitch_1.default.StreamsUrl, {
                headers,
                params: {
                    game_id: game.id,
                    first: 100
                }
            });
            streams.push(...response.data.data);
        }
        return streams;
    }
}
exports.default = new TwitchService();
