import cors from "cors";
import dotenv from "dotenv";
import express from "express";

import PlatformCacheService from "./services/PlatformCacheService";

import RandomRoute from "./routes/RandomRoute";
import SearchGamesRoute from "./routes/SearchGamesRoute";
import FeaturedRoute from "./routes/FeaturedRoute";
import PicksRoute from "./routes/PicksRoute";
import CreatorRoute from "./routes/CreatorRoute";

import TwitchConfig from "./config/Twitch";

dotenv.config();

const app = express();

const PORT =
    Number(process.env.PORT) || 3000;

app.use(cors());

app.use(express.json());

app.get(
    "/api/health",
    (_req, res) => {

        res.json({
            status: "Running"
        });

    }
);

app.use(
    "/api/random",
    RandomRoute
);

app.use(
    "/api/search-games",
    SearchGamesRoute
);

app.use(
    "/api/featured",
    FeaturedRoute
);

app.use(
    "/api/picks",
    PicksRoute
);

app.use(
    "/api/creator",
    CreatorRoute
);

async function refreshCaches(): Promise<void> {

    console.log("");

    console.log(
        "Refreshing platform stream caches..."
    );

    const startedAt =
        Date.now();

    await PlatformCacheService.refreshAll();

    const elapsed =
        (
            (
                Date.now() -
                startedAt
            ) / 1000
        ).toFixed(1);

    console.log(
        `Platform cache refresh completed in ${elapsed}s.`
    );

}

async function start(): Promise<void> {

    await refreshCaches();

    app.listen(
        PORT,
        () => {

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

        }
    );

    const refreshLoop =
        async (): Promise<void> => {

            const refreshInterval =
                TwitchConfig.CacheRefreshSeconds *
                1000;

            const elapsed =
                Date.now();

            await refreshCaches();

            const refreshTime =
                Date.now() -
                elapsed;

            const remainingDelay =
                Math.max(
                    0,
                    refreshInterval -
                    refreshTime
                );

            if (
                remainingDelay > 0
            ) {

                console.log(
                    `Next platform cache refresh in ${(remainingDelay / 1000).toFixed(1)}s.`
                );

                await new Promise(
                    resolve =>
                        setTimeout(
                            resolve,
                            remainingDelay
                        )
                );

            } else {

                console.log(
                    "Refresh exceeded configured interval; starting next refresh immediately."
                );

            }

            void refreshLoop();

        };

    void refreshLoop();

}

void start();