import { Router } from "express";
import { randomUUID } from "crypto";
import StreamCache from "../cache/StreamCache";

const router = Router();

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

    let language =
        typeof req.query.language === "string"
            ? req.query.language.toLowerCase()
            : "any";

    if (!SupportedLanguages.has(language))
        language = "any";

    const stream = StreamCache.getRandom(language);

    if (!stream) {

        return res.status(503).json({
            error: "No live streams available."
        });

    }

    res.json({

        requestId: randomUUID(),

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

export default router;
