import cors from "cors";
import dotenv from "dotenv";
import express from "express";

import StreamCache from "./cache/StreamCache";
import RandomRoute from "./routes/RandomRoute";
import TwitchConfig from "./config/Twitch";

dotenv.config();

const app = express();

const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {

    res.json({
        status: "Running"
    });

});

app.use("/api/random", RandomRoute);

async function start(): Promise<void> {

    await StreamCache.refresh();

    setInterval(async () => {

        await StreamCache.refresh();

    }, TwitchConfig.CacheRefreshSeconds * 1000);

    app.listen(PORT, () => {

        console.log("");
        console.log("=====================================");
        console.log("        Void Drift Server");
        console.log("=====================================");
        console.log(`Listening : http://localhost:${PORT}`);
        console.log("");

    });

}

start();
