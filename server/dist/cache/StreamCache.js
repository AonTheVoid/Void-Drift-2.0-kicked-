"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const TwitchService_1 = __importDefault(require("../services/TwitchService"));
class StreamCache {
    streams = [];
    historyLimit = 50;
    history = [];
    async refresh() {
        try {
            this.streams = await TwitchService_1.default.getLiveStreams();
            console.log(`Loaded ${this.streams.length} live streams.`);
        }
        catch (error) {
            console.error("Failed to refresh Twitch cache.");
            console.error(error);
        }
    }
    getRandom(language = "any") {
        if (this.streams.length === 0)
            return null;
        let pool = this.streams;
        if (language !== "any") {
            pool = pool.filter(stream => stream.language.toLowerCase() === language);
            if (pool.length === 0)
                return null;
        }
        let available = pool.filter(stream => !this.history.includes(stream.user_login));
        if (available.length === 0) {
            this.history = [];
            available = pool;
        }
        const stream = available[Math.floor(Math.random() * available.length)];
        this.history.push(stream.user_login);
        if (this.history.length > this.historyLimit) {
            this.history.shift();
        }
        return stream;
    }
}
exports.default = new StreamCache();
