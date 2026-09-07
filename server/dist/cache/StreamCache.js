"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const TwitchService_1 = __importDefault(require("../services/TwitchService"));
class StreamCache {
    streams = [];
    topGameStreams = [];
    historyLimit = 50;
    history = [];
    categoryHistory = [];
    async refresh() {
        try {
            this.streams =
                await TwitchService_1.default.getLiveStreams();
            console.log(`Loaded ${this.streams.length} live streams.`);
        }
        catch (error) {
            console.error("Failed to refresh Twitch cache.");
            console.error(error);
        }
    }
    async refreshTopGame() {
        try {
            this.topGameStreams =
                await TwitchService_1.default.getTopGameStreams();
            console.log(`Loaded ${this.topGameStreams.length} top game streams.`);
        }
        catch (error) {
            console.error("Failed to refresh Top Game cache.");
            console.error(error);
        }
    }
    getRandom(language = "any", mode = "random") {
        let source = mode === "top-game"
            ? this.topGameStreams
            : this.streams;
        if (source.length === 0)
            return null;
        let pool = [];
        switch (mode) {
            case "top-game":
                pool = source;
                break;
            case "just-starting":
                pool = source.filter(stream => {
                    const started = new Date(stream.started_at).getTime();
                    const minutes = (Date.now() - started) / 60000;
                    return (minutes <= 30 &&
                        stream.viewer_count >= 5 &&
                        stream.viewer_count <= 200);
                });
                break;
            case "partner-push":
                const positivePhrases = [
                    "partner push",
                    "road to partner",
                    "road2partner",
                    "partner grind",
                    "grinding for partner",
                    "grinding partner",
                    "push to partner",
                    "push for partner",
                    "partner journey",
                    "help me reach partner",
                ];
                const negativePhrases = [
                    "partnered",
                    "official partner"
                ];
                pool = source.filter(stream => {
                    if (stream.viewer_count < 40 || stream.viewer_count > 199)
                        return false;
                    const title = stream.title.toLowerCase();
                    if (negativePhrases.some(p => title.includes(p)))
                        return false;
                    return positivePhrases.some(p => title.includes(p));
                });
                break;
            case "less-than-10":
                pool = source.filter(stream => stream.viewer_count >= 5 &&
                    stream.viewer_count <= 9);
                break;
            case "on-the-rise":
                pool = source.filter(stream => stream.viewer_count >= 200 &&
                    stream.viewer_count <= 999);
                break;
            default:
                pool = source.filter(stream => stream.viewer_count >= 5 &&
                    stream.viewer_count <= 200);
                break;
        }
        if (language !== "any") {
            pool = pool.filter(stream => stream.language.toLowerCase() === language);
        }
        if (pool.length === 0)
            return null;
        if (mode === "top-game") {
            return pool[Math.floor(Math.random() * pool.length)];
        }
        if (mode === "on-the-rise") {
            const available = pool.filter(stream => !this.history.includes(stream.user_login));
            const selection = available.length > 0
                ? available
                : pool;
            const stream = selection[Math.floor(Math.random() * selection.length)];
            this.history.push(stream.user_login);
            if (this.history.length > this.historyLimit)
                this.history.shift();
            return stream;
        }
        let available = pool.filter(stream => !this.history.includes(stream.user_login));
        if (available.length === 0) {
            this.history = [];
            available = pool;
        }
        const hidden = available.filter(stream => stream.viewer_count >= 5 &&
            stream.viewer_count <= 50);
        const small = available.filter(stream => stream.viewer_count > 50 &&
            stream.viewer_count <= 100);
        const rising = available.filter(stream => stream.viewer_count > 100 &&
            stream.viewer_count <= 200);
        const roll = Math.random();
        let bucket = [];
        if (roll < 0.60)
            bucket = hidden;
        else if (roll < 0.85)
            bucket = small;
        else
            bucket = rising;
        if (bucket.length === 0)
            bucket = available.filter(stream => stream.viewer_count >= 5 &&
                stream.viewer_count <= 200);
        let stream = bucket[Math.floor(Math.random() * bucket.length)];
        const categoryUsed = this.categoryHistory.includes(stream.game_name);
        if (categoryUsed) {
            const differentCategory = bucket.filter(item => !this.categoryHistory.includes(item.game_name));
            if (differentCategory.length > 0) {
                stream =
                    differentCategory[Math.floor(Math.random() * differentCategory.length)];
            }
        }
        this.history.push(stream.user_login);
        if (this.history.length > this.historyLimit)
            this.history.shift();
        this.categoryHistory.push(stream.game_name);
        if (this.categoryHistory.length > 10)
            this.categoryHistory.shift();
        return stream;
    }
}
exports.default = new StreamCache();
