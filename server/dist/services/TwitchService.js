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
    requestsPerMinute = 750;
    requestTimestamps = [];
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
        this.accessToken =
            response.data.access_token;
        this.expiresAt =
            Date.now() +
                ((response.data.expires_in - 60) * 1000);
        console.log("Twitch OAuth token acquired.");
    }
    async waitForRateLimit() {
        while (true) {
            const now = Date.now();
            this.requestTimestamps =
                this.requestTimestamps.filter(timestamp => now - timestamp < 60_000);
            if (this.requestTimestamps.length <
                this.requestsPerMinute) {
                this.requestTimestamps.push(now);
                return;
            }
            const oldest = this.requestTimestamps[0];
            const waitTime = 60_000 -
                (now - oldest) +
                10;
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }
    async get(url, params) {
        await this.authenticate();
        await this.waitForRateLimit();
        const headers = {
            Authorization: `Bearer ${this.accessToken}`,
            "Client-Id": Twitch_1.default.ClientId
        };
        const response = await axios_1.default.get(url, {
            headers,
            params
        });
        return response.data;
    }
    async searchCategories(query) {
        const response = await this.get(Twitch_1.default.SearchCategoriesUrl, {
            query,
            first: 10
        });
        return response.data;
    }
    async getLiveStreams() {
        const streams = [];
        let cursor;
        const maxPages = 700;
        for (let page = 0; page < maxPages; page++) {
            const params = {
                first: 100
            };
            if (cursor) {
                params.after = cursor;
            }
            const response = await this.get(Twitch_1.default.StreamsUrl, params);
            streams.push(...response.data);
            cursor =
                response.pagination?.cursor;
            console.log(`Stream cache page ${page + 1}/${maxPages} - ${streams.length} streams`);
            if (!cursor ||
                response.data.length === 0) {
                break;
            }
        }
        return streams;
    }
    async getTopGameStreams() {
        const gamesResponse = await this.get(Twitch_1.default.GamesUrl, {
            first: 5
        });
        const games = gamesResponse.data;
        const streams = [];
        for (const game of games) {
            let cursor;
            for (let page = 0; page < 2; page++) {
                const params = {
                    game_id: game.id,
                    first: 100
                };
                if (cursor) {
                    params.after = cursor;
                }
                const response = await this.get(Twitch_1.default.StreamsUrl, params);
                streams.push(...response.data.filter(stream => stream.viewer_count >= 5 &&
                    stream.viewer_count <= 200));
                cursor =
                    response.pagination?.cursor;
                if (!cursor ||
                    response.data.length === 0) {
                    break;
                }
            }
        }
        streams.sort(() => Math.random() - 0.5);
        return streams;
    }
}
exports.default = new TwitchService();
