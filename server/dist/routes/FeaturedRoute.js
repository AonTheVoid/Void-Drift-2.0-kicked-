"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const FeaturedService_1 = __importDefault(require("../services/FeaturedService"));
const router = (0, express_1.Router)();
router.get("/", (_req, res) => {
    const featured = FeaturedService_1.default.getFeatured();
    if (!featured) {
        return res.status(404).json({
            error: "No featured creator is currently set."
        });
    }
    res.json(featured);
});
exports.default = router;
