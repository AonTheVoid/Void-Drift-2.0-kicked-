"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const TwitchService_1 = __importDefault(require("../services/TwitchService"));
const router = (0, express_1.Router)();
router.get("/", async (req, res) => {
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
        const categories = await TwitchService_1.default.searchCategories(query);
        res.json(categories.map(category => ({
            id: category.id,
            name: category.name,
            boxArtUrl: category.box_art_url
        })));
    }
    catch (error) {
        console.error("Failed to search Twitch categories.");
        console.error(error);
        res.status(500).json({
            error: "Unable to search games."
        });
    }
});
exports.default = router;
