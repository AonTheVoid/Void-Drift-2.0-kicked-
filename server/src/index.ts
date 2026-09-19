import cors from "cors";
import dotenv from "dotenv";
import express from "express";

import StreamCache from "./cache/StreamCache";
import RandomRoute from "./routes/RandomRoute";
import SearchGamesRoute from "./routes/SearchGamesRoute";
import TwitchConfig from "./config/Twitch";

dotenv.config();

const app = express();

const PORT =
    Number(process.env.PORT) || 3000;

app.use(cors());

app.use(express.json());

app.get("/api/health", (_req, res) => {

    res.json({
        status: "Running"
    });

});

app.use(
    "/api/random",
    RandomRoute
);

app.use(
    "/api/search-games",
    SearchGamesRoute
);

async function refreshCaches(): Promise<void> {

    console.log("");
    console.log(
        "Refreshing Twitch stream cache..."
    );

    const startedAt = Date.now();

    await StreamCache.refresh();

    await StreamCache.refreshTopGame();

    const elapsed =
        ((Date.now() - startedAt) / 1000)
            .toFixed(1);

    console.log(
        `Cache refresh completed in ${elapsed}s.`
    );

}

async function start(): Promise<void> {

    await refreshCaches();

    app.listen(PORT, () => {

        console.log("");
        console.log(
            "====================================="
        );
        console.log(
            "        Void Drift Server"
        );
        console.log(
            "====================================="
        );
        console.log(
            `Listening : http://localhost:${PORT}`
        );
        console.log("");

    });

    const refreshLoop =
        async (): Promise<void> => {

            await new Promise(resolve =>
                setTimeout(
                    resolve,
                    TwitchConfig.CacheRefreshSeconds * 1000
                )
            );

            try {

                await refreshCaches();

            } catch (error) {

                console.error(
                    "Cache refresh failed."
                );

                console.error(error);

            }

            void refreshLoop();

        };

    void refreshLoop();

}

void start();