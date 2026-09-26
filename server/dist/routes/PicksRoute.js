"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const PicksService_1 = __importDefault(require("../services/PicksService"));
const router = (0, express_1.Router)();
router.get("/", async (_req, res) => {
    try {
        const picks = await PicksService_1.default.getPicksWithLiveData();
        res.json(picks);
    }
    catch (error) {
        console.error("Unable to load Drift Picks.", error);
        res.status(500).json({
            error: "Unable to load Drift Picks."
        });
    }
});
router.get("/:slot/stream", async (req, res) => {
    const slot = Number(req.params.slot);
    if (!Number.isInteger(slot) ||
        slot < 1 ||
        slot > 5) {
        return res.status(400).json({
            error: "Invalid Pick slot."
        });
    }
    try {
        const stream = await PicksService_1.default.getLiveStream(slot);
        if (!stream) {
            return res.status(404).json({
                error: "Pick is currently offline."
            });
        }
        res.json(stream);
    }
    catch (error) {
        console.error(`Unable to load Pick ${slot}.`, error);
        res.status(500).json({
            error: "Unable to load Pick stream."
        });
    }
});
exports.default = router;
