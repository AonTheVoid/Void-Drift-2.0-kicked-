"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const crypto_1 = require("crypto");
const StreamCache_1 = __importDefault(require("../cache/StreamCache"));
const router = (0, express_1.Router)();
const SupportedLanguages = new Set([
    "any",
    "en",
    "es",
    "fr",
    "de",
    "pt",
    "ja",
    "ko",
    "ru"
]);
router.get("/", (req, res) => {
    let language = typeof req.query.language === "string"
        ? req.query.language.toLowerCase()
        : "any";
    if (!SupportedLanguages.has(language))
        language = "any";
    const stream = StreamCache_1.default.getRandom(language);
    if (!stream) {
        return res.status(503).json({
            error: "No live streams available."
        });
    }
    res.json({
        requestId: (0, crypto_1.randomUUID)(),
        channelName: stream.user_name,
        channelLogin: stream.user_login,
        title: stream.title,
        category: stream.game_name,
        language: stream.language,
        viewers: stream.viewer_count,
        thumbnail: stream.thumbnail_url
            .replace("{width}", "1280")
            .replace("{height}", "720"),
        url: `https://twitch.tv/${stream.user_login}`,
        startedAt: stream.started_at,
        mature: stream.is_mature
    });
});
exports.default = router;
