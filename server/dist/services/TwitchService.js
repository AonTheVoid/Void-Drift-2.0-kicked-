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
        const response = await axios_1.default.get(Twitch_1.default.StreamsUrl, {
            headers: {
                Authorization: `Bearer ${this.accessToken}`,
                "Client-Id": Twitch_1.default.ClientId
            },
            params: {
                first: Twitch_1.default.MaxStreams
            }
        });
        return response.data.data;
    }
}
exports.default = new TwitchService();
