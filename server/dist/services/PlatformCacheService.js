"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const TwitchService_1 = __importDefault(require("./TwitchService"));
const KickService_1 = __importDefault(require("./KickService"));
const PlatformStreamCache_1 = __importDefault(require("../cache/PlatformStreamCache"));
const TwitchNormalizer_1 = require("./normalizers/TwitchNormalizer");
const KickNormalizer_1 = require("./normalizers/KickNormalizer");
class PlatformCacheService {
    async refreshTwitch() {
        try {
            console.log("Refreshing Twitch stream cache...");
            const streams = await TwitchService_1.default.getLiveStreams();
            const normalized = streams.map(TwitchNormalizer_1.normalizeTwitchStream);
            PlatformStreamCache_1.default.setStreams("twitch", normalized);
            console.log("Refreshing Twitch top-game cache...");
            const topGameStreams = await TwitchService_1.default.getTopGameStreams();
            const normalizedTopGameStreams = topGameStreams.map(TwitchNormalizer_1.normalizeTwitchStream);
            PlatformStreamCache_1.default.setTopGameStreams("twitch", normalizedTopGameStreams);
        }
        catch (error) {
            console.error("Failed to refresh Twitch cache.");
            console.error(error);
        }
    }
    async refreshKick() {
        try {
            console.log("Refreshing Kick stream cache...");
            const streams = await KickService_1.default.getLiveStreams(10000);
            const normalized = streams.map(KickNormalizer_1.normalizeKickStream);
            PlatformStreamCache_1.default.setStreams("kick", normalized);
            console.log("Refreshing Kick top-game cache...");
            const categoryStats = new Map();
            for (const stream of normalized) {
                if (!stream.categoryId)
                    continue;
                const existing = categoryStats.get(stream.categoryId);
                if (existing) {
                    existing.streams += 1;
                    existing.viewers += stream.viewers;
                }
                else {
                    categoryStats.set(stream.categoryId, {
                        categoryId: stream.categoryId,
                        category: stream.category,
                        streams: 1,
                        viewers: stream.viewers
                    });
                }
            }
            const topCategories = Array.from(categoryStats.values())
                .filter(category => category.streams >= 5)
                .sort((a, b) => b.viewers - a.viewers)
                .slice(0, 10);
            const topCategoryIds = new Set(topCategories.map(category => category.categoryId));
            const topGameStreams = normalized.filter(stream => stream.categoryId &&
                topCategoryIds.has(stream.categoryId));
            PlatformStreamCache_1.default.setTopGameStreams("kick", topGameStreams);
            console.log("Kick top-game categories:");
            for (const category of topCategories) {
                console.log(`  ${category.category} - ` +
                    `${category.streams} streams - ` +
                    `${category.viewers} viewers`);
            }
            console.log(`Kick top-game pool: ${topGameStreams.length} streams`);
        }
        catch (error) {
            console.error("Failed to refresh Kick cache.");
            console.error(error);
        }
    }
    async refreshAll() {
        await Promise.all([
            this.refreshTwitch(),
            this.refreshKick()
        ]);
    }
}
exports.default = new PlatformCacheService();
