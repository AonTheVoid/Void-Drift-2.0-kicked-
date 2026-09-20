import { Router } from "express";
import { randomUUID } from "crypto";

import PlatformStreamCache from "../cache/PlatformStreamCache";
import { DriftPlatform } from "../types/Drift";

const router = Router();

const SupportedPlatforms = new Set([
    "twitch",
    "kick"
]);

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

const SupportedModes = new Set([
    "random",
    "just-starting",
    "less-than-10",
    "partner-push",
    "top-game",
    "on-the-rise"
]);

router.get("/", (req, res) => {

    let platform =
        typeof req.query.platform === "string"
            ? req.query.platform.toLowerCase()
            : "twitch";

    if (!SupportedPlatforms.has(platform))
        platform = "twitch";

    let language =
        typeof req.query.language === "string"
            ? req.query.language.toLowerCase()
            : "any";

    if (!SupportedLanguages.has(language))
        language = "any";

    let mode =
        typeof req.query.mode === "string"
            ? req.query.mode.toLowerCase()
            : "random";

    if (!SupportedModes.has(mode))
        mode = "random";

    const categoryId =
        typeof req.query.categoryId === "string"
            ? req.query.categoryId
            : undefined;

    const stream =
        PlatformStreamCache.getRandom(
            platform as DriftPlatform,
            language,
            mode,
            categoryId
        );

    if (!stream) {

        return res.status(503).json({
            error: "No live streams available."
        });

    }

    res.json({

        requestId: randomUUID(),

        platform: stream.platform,

        channelName: stream.channelName,

        channelLogin: stream.channelLogin,

        title: stream.title,

        category: stream.category,

        categoryId: stream.categoryId,

        language: stream.language,

        viewers: stream.viewers,

        thumbnail: stream.thumbnail,

        url: stream.url,

        startedAt: stream.startedAt,

        mature: stream.mature

    });

});

export default router;
