"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const Kick_1 = __importDefault(require("../config/Kick"));
class KickService {
    accessToken = "";
    expiresAt = 0;
    async authenticate() {
        if (this.accessToken.length > 0 &&
            Date.now() < this.expiresAt) {
            return;
        }
        const response = await axios_1.default.post(Kick_1.default.OAuthUrl, new URLSearchParams({
            grant_type: "client_credentials",
            client_id: Kick_1.default.ClientId,
            client_secret: Kick_1.default.ClientSecret
        }), {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });
        this.accessToken =
            response.data.access_token;
        this.expiresAt =
            Date.now() +
                ((response.data.expires_in - 60) * 1000);
        console.log("Kick OAuth token acquired.");
    }
    async get(url, params = {}) {
        await this.authenticate();
        const response = await axios_1.default.get(`${Kick_1.default.ApiBaseUrl}${url}`, {
            headers: {
                Authorization: `Bearer ${this.accessToken}`
            },
            params
        });
        return response.data;
    }
    async getLiveStreams(targetCount = 100) {
        const streams = [];
        let cursor;
        const maxPages = 100;
        for (let page = 0; page < maxPages &&
            streams.length < targetCount; page++) {
            const params = {};
            if (cursor) {
                params.cursor = cursor;
            }
            const response = await this.get("/public/v2/livestreams", params);
            streams.push(...response.data);
            console.log(`Kick stream page ${page + 1} - ${streams.length} streams`);
            const nextCursor = response.pagination?.next_cursor;
            if (!nextCursor ||
                response.data.length === 0) {
                break;
            }
            cursor = nextCursor;
        }
        return streams.slice(0, targetCount);
    }
    async searchCategories(query) {
        return await this.get("/public/v2/categories", {
            name: query,
            limit: 20
        });
    }
}
exports.default = new KickService();
