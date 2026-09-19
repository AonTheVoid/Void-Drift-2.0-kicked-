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
    async searchCategories(query) {
        await this.authenticate();
        const headers = {
            Authorization: `Bearer ${this.accessToken}`,
            "Client-Id": Twitch_1.default.ClientId
        };
        const response = await axios_1.default.get(Twitch_1.default.SearchCategoriesUrl, {
            headers,
            params: {
                query,
                first: 10
            }
        });
        return response.data.data;
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
                first: 50
            }
        });
        const games = gamesResponse.data.data;
        const randomGames = games
            .sort(() => Math.random() - 0.5)
            .slice(0, 20);
        const streams = [];
        for (const game of randomGames) {
            // First 100 streams
            const page1 = await axios_1.default.get(Twitch_1.default.StreamsUrl, {
                headers,
                params: {
                    game_id: game.id,
                    first: 100
                }
            });
            streams.push(...page1.data.data);
            // Next 100 streams
            if (page1.data.pagination?.cursor) {
                const page2 = await axios_1.default.get(Twitch_1.default.StreamsUrl, {
                    headers,
                    params: {
                        game_id: game.id,
                        first: 100,
                        after: page1.data.pagination.cursor
                    }
                });
                streams.push(...page2.data.data);
            }
        }
        return streams;
    }
    async getTopGameStreams() {
        await this.authenticate();
        const headers = {
            Authorization: `Bearer ${this.accessToken}`,
            "Client-Id": Twitch_1.default.ClientId
        };
        const gamesResponse = await axios_1.default.get(Twitch_1.default.GamesUrl, {
            headers,
            params: {
                first: 5
            }
        });
        const games = gamesResponse.data.data;
        const streams = [];
        for (const game of games) {
            const page1 = await axios_1.default.get(Twitch_1.default.StreamsUrl, {
                headers,
                params: {
                    game_id: game.id,
                    first: 100
                }
            });
            streams.push(...page1.data.data.filter(stream => stream.viewer_count >= 5 &&
                stream.viewer_count <= 200));
            if (page1.data.pagination?.cursor) {
                const page2 = await axios_1.default.get(Twitch_1.default.StreamsUrl, {
                    headers,
                    params: {
                        game_id: game.id,
                        first: 100,
                        after: page1.data.pagination.cursor
                    }
                });
                streams.push(...page2.data.data.filter(stream => stream.viewer_count >= 5 &&
                    stream.viewer_count <= 200));
            }
        }
        streams.sort(() => Math.random() - 0.5);
        return streams;
    }
}
exports.default = new TwitchService();
