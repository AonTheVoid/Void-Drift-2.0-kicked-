"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class PicksService {
    dataDirectory = path_1.default.resolve(__dirname, "../../data");
    dataFile = path_1.default.join(this.dataDirectory, "picks.json");
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
                ((response.data.expires_in - 60) *
                    1000);
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
                ((Number(response.data.expires_in) - 60) *
                    1000);
        return this.kickAccessToken;
    }
    parseChannelUrl(input) {
        let parsed;
        try {
            parsed =
                new URL(input.trim());
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
    async resolveCreator(input) {
        const parsed = this.parseChannelUrl(input);
        if (parsed.platform ===
            "twitch") {
            const token = await this.getTwitchToken();
            const response = await axios_1.default.get("https://api.twitch.tv/helix/users", {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Client-Id": process.env.TWITCH_CLIENT_ID ?? ""
                },
                params: {
                    login: parsed.login
                }
            });
            const user = response.data.data[0];
            if (!user) {
                throw new Error(`Twitch channel "${parsed.login}" was not found.`);
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
        const token = await this.getKickToken();
        const channelResponse = await axios_1.default.get("https://api.kick.com/public/v1/channels", {
            headers: {
                Authorization: `Bearer ${token}`
            },
            params: {
                slug: parsed.login
            }
        });
        const channel = channelResponse.data.data[0];
        if (!channel) {
            throw new Error(`Kick channel "${parsed.login}" was not found.`);
        }
        let profileImageUrl = channel.profile_picture ?? "";
        if (!profileImageUrl &&
            channel.broadcaster_user_id) {
            const userResponse = await axios_1.default.get("https://api.kick.com/public/v1/users", {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: {
                    id: channel.broadcaster_user_id
                }
            });
            profileImageUrl =
                userResponse.data.data[0]
                    ?.profile_picture ?? "";
        }
        return {
            platform: "kick",
            channelLogin: channel.slug,
            channelName: channel.slug,
            profileImageUrl,
            url: `https://kick.com/${channel.slug}`,
            updatedAt: new Date().toISOString()
        };
    }
    readPicks() {
        if (!fs_1.default.existsSync(this.dataFile)) {
            return [];
        }
        try {
            const raw = fs_1.default.readFileSync(this.dataFile, "utf8");
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) {
                return [];
            }
            return parsed
                .filter(Boolean)
                .sort((a, b) => a.slot - b.slot);
        }
        catch {
            return [];
        }
    }
    writePicks(picks) {
        fs_1.default.mkdirSync(this.dataDirectory, {
            recursive: true
        });
        fs_1.default.writeFileSync(this.dataFile, JSON.stringify(picks.sort((a, b) => a.slot - b.slot), null, 4), "utf8");
    }
    async setPick(slot, input) {
        if (!Number.isInteger(slot) ||
            slot < 1 ||
            slot > 10) {
            throw new Error("Pick slot must be between 1 and 10.");
        }
        const creator = await this.resolveCreator(input);
        const pick = {
            slot,
            ...creator
        };
        const picks = this.readPicks()
            .filter(item => item.slot !== slot);
        picks.push(pick);
        this.writePicks(picks);
        return pick;
    }
    getPicks() {
        return this.readPicks()
            .filter(pick => pick.slot >= 1 &&
            pick.slot <= 10);
    }
    clear() {
        if (fs_1.default.existsSync(this.dataFile)) {
            fs_1.default.unlinkSync(this.dataFile);
        }
    }
    async getLiveStream(slot) {
        const pick = this.readPicks()
            .find(item => item.slot === slot);
        if (!pick) {
            return null;
        }
        if (pick.platform ===
            "twitch") {
            const token = await this.getTwitchToken();
            const response = await axios_1.default.get("https://api.twitch.tv/helix/streams", {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Client-Id": process.env.TWITCH_CLIENT_ID ?? ""
                },
                params: {
                    user_login: pick.channelLogin
                }
            });
            const stream = response.data.data[0];
            if (!stream) {
                return null;
            }
            return {
                platform: "twitch",
                channelName: stream.user_name,
                channelLogin: stream.user_login,
                title: stream.title,
                category: stream.game_name,
                categoryId: stream.game_id ||
                    undefined,
                language: stream.language,
                viewers: stream.viewer_count,
                thumbnail: stream.thumbnail_url
                    .replace("{width}", "1280")
                    .replace("{height}", "720"),
                url: `https://twitch.tv/${stream.user_login}`,
                startedAt: stream.started_at,
                mature: stream.is_mature,
                live: true
            };
        }
        const token = await this.getKickToken();
        const response = await axios_1.default.get("https://api.kick.com/public/v1/channels", {
            headers: {
                Authorization: `Bearer ${token}`
            },
            params: {
                slug: pick.channelLogin
            }
        });
        const channel = response.data.data[0];
        if (!channel ||
            !channel.started_at) {
            return null;
        }
        return {
            platform: "kick",
            channelName: pick.channelName,
            channelLogin: channel.slug,
            title: channel.stream_title ?? "",
            category: channel.category?.name ?? "",
            categoryId: channel.category?.id
                ? String(channel.category.id)
                : undefined,
            language: channel.language ?? "any",
            viewers: channel.viewer_count ?? 0,
            thumbnail: channel.thumbnail ?? "",
            url: `https://kick.com/${channel.slug}`,
            startedAt: channel.started_at,
            mature: channel.has_mature_content ?? false,
            live: true
        };
    }
    async getPicksWithLiveData() {
        const picks = this.getPicks();
        return Promise.all(picks.map(async (pick) => {
            let live = null;
            try {
                live =
                    await this.getLiveStream(pick.slot);
            }
            catch (error) {
                console.error(`Unable to load live data for pick ${pick.slot}.`, error);
            }
            return {
                ...pick,
                live
            };
        }));
    }
}
exports.default = new PicksService();
