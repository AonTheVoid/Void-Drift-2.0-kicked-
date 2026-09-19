"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const StreamCache_1 = __importDefault(require("./cache/StreamCache"));
const RandomRoute_1 = __importDefault(require("./routes/RandomRoute"));
const SearchGamesRoute_1 = __importDefault(require("./routes/SearchGamesRoute"));
const Twitch_1 = __importDefault(require("./config/Twitch"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get("/api/health", (_req, res) => {
    res.json({
        status: "Running"
    });
});
app.use("/api/random", RandomRoute_1.default);
app.use("/api/search-games", SearchGamesRoute_1.default);
async function start() {
    await StreamCache_1.default.refresh();
    await StreamCache_1.default.refreshTopGame();
    setInterval(async () => {
        await StreamCache_1.default.refresh();
        await StreamCache_1.default.refreshTopGame();
    }, Twitch_1.default.CacheRefreshSeconds * 1000);
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
