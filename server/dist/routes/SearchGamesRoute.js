"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const TwitchService_1 = __importDefault(require("../services/TwitchService"));
const KickService_1 = __importDefault(require("../services/KickService"));
const router = (0, express_1.Router)();
const SupportedPlatforms = new Set([
    "twitch",
    "kick"
]);
router.get("/", async (req, res) => {
    const platform = typeof req.query.platform === "string"
        ? req.query.platform.toLowerCase()
        : "twitch";
    if (!SupportedPlatforms.has(platform)) {
        return res.status(400).json({
            error: "Unsupported platform."
        });
    }
    const query = typeof req.query.query === "string"
        ? req.query.query.trim()
        : "";
    if (!query) {
        return res.status(400).json({
            error: "Search query is required."
        });
    }
    if (query.length > 100) {
        return res.status(400).json({
            error: "Search query is too long."
        });
    }
    try {
        if (platform === "twitch") {
            const categories = await TwitchService_1.default.searchCategories(query);
            return res.json(categories.map(category => ({
                id: category.id,
                name: category.name,
                boxArtUrl: category.box_art_url
            })));
        }
        const response = await KickService_1.default.searchCategories(query);
        return res.json(response.data.map(category => ({
            id: category.id,
            name: category.name,
            boxArtUrl: category.thumbnail
        })));
    }
    catch (error) {
        console.error(`Failed to search ${platform} categories.`);
        console.error(error);
        return res.status(500).json({
            error: "Unable to search games."
        });
    }
});
exports.default = router;
