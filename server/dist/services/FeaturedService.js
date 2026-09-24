"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class FeaturedService {
    dataDirectory = path_1.default.resolve(__dirname, "../../data");
    dataFile = path_1.default.join(this.dataDirectory, "featured.json");
    twitchAccessToken = "";
    twitchExpiresAt = 0;
    kickAccessToken = "";
    kickExpiresAt = 0;
    async getTwitchToken() {
        if (this.twitchAccessToken &&
            Date.now() < this.twitchExpiresAt) {
            return this.twitchAccessToken;
        }
        const response = await axios_1.default.post("https://id.twitch.tv/oauth2/token", null, {
            params: {
                client_id: process.env.TWITCH_CLIENT_ID,
                client_secret: process.env.TWITCH_CLIENT_SECRET,
                grant_type: "client_credentials"
            }
        });
        this.twitchAccessToken =
            response.data.access_token;
        this.twitchExpiresAt =
            Date.now() +
                ((response.data.expires_in - 60) * 1000);
        return this.twitchAccessToken;
    }
    async getKickToken() {
        if (this.kickAccessToken &&
            Date.now() < this.kickExpiresAt) {
            return this.kickAccessToken;
        }
        const response = await axios_1.default.post("https://id.kick.com/oauth/token", new URLSearchParams({
            grant_type: "client_credentials",
            client_id: process.env.KICK_CLIENT_ID ?? "",
            client_secret: process.env.KICK_CLIENT_SECRET ?? ""
        }), {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });
        this.kickAccessToken =
            response.data.access_token;
        this.kickExpiresAt =
            Date.now() +
                ((Number(response.data.expires_in) - 60) * 1000);
        return this.kickAccessToken;
    }
    parseChannelUrl(input) {
        let parsed;
        try {
            parsed = new URL(input.trim());
        }
        catch {
            throw new Error("Invalid URL. Paste a Twitch or Kick channel link.");
        }
        const hostname = parsed.hostname
            .toLowerCase()
            .replace(/^www\./, "");
        const segments = parsed.pathname
            .split("/")
            .filter(Boolean);
        if (segments.length !== 1) {
            throw new Error("Use a direct Twitch or Kick channel link.");
        }
        const login = decodeURIComponent(segments[0]);
        if (!login) {
            throw new Error("Unable to determine the channel name.");
        }
        if (hostname === "twitch.tv") {
            return {
                platform: "twitch",
                login
            };
        }
        if (hostname === "kick.com") {
            return {
                platform: "kick",
                login
            };
        }
        throw new Error("Only Twitch and Kick channel links are supported.");
    }
    async fetchTwitchCreator(login) {
        const token = await this.getTwitchToken();
        const response = await axios_1.default.get("https://api.twitch.tv/helix/users", {
            headers: {
                Authorization: `Bearer ${token}`,
                "Client-Id": process.env.TWITCH_CLIENT_ID ?? ""
            },
            params: {
                login
            }
        });
        const user = response.data.data[0];
        if (!user) {
            throw new Error(`Twitch channel "${login}" was not found.`);
        }
        return {
            platform: "twitch",
            channelLogin: user.login,
            channelName: user.display_name,
            profileImageUrl: user.profile_image_url,
            url: `https://twitch.tv/${user.login}`,
            updatedAt: new Date().toISOString()
        };
    }
    async fetchKickCreator(login) {
        const token = await this.getKickToken();
        const channelResponse = await axios_1.default.get("https://api.kick.com/public/v1/channels", {
            headers: {
                Authorization: `Bearer ${token}`
            },
            params: {
                slug: login
            }
        });
        const channel = channelResponse.data.data[0];
        if (!channel) {
            throw new Error(`Kick channel "${login}" was not found.`);
        }
        const userResponse = await axios_1.default.get("https://api.kick.com/public/v1/users", {
            headers: {
                Authorization: `Bearer ${token}`
            },
            params: {
                id: channel.broadcaster_user_id
            }
        });
        const user = userResponse.data.data[0];
        if (!user) {
            throw new Error(`Kick creator information for "${login}" could not be loaded.`);
        }
        return {
            platform: "kick",
            channelLogin: channel.slug,
            channelName: user.name,
            profileImageUrl: user.profile_picture,
            url: `https://kick.com/${channel.slug}`,
            updatedAt: new Date().toISOString()
        };
    }
    async setFeatured(input) {
        const parsed = this.parseChannelUrl(input);
        let featured;
        if (parsed.platform === "twitch") {
            featured =
                await this.fetchTwitchCreator(parsed.login);
        }
        else {
            featured =
                await this.fetchKickCreator(parsed.login);
        }
        fs_1.default.mkdirSync(this.dataDirectory, {
            recursive: true
        });
        fs_1.default.writeFileSync(this.dataFile, JSON.stringify(featured, null, 4), "utf8");
        return featured;
    }
    getFeatured() {
        if (!fs_1.default.existsSync(this.dataFile)) {
            return null;
        }
        try {
            const raw = fs_1.default.readFileSync(this.dataFile, "utf8");
            return JSON.parse(raw);
        }
        catch {
            return null;
        }
    }
    clearFeatured() {
        if (fs_1.default.existsSync(this.dataFile)) {
            fs_1.default.unlinkSync(this.dataFile);
        }
    }
}
exports.default = new FeaturedService();
