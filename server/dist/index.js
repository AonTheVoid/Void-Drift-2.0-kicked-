"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const PlatformCacheService_1 = __importDefault(require("./services/PlatformCacheService"));
const RandomRoute_1 = __importDefault(require("./routes/RandomRoute"));
const SearchGamesRoute_1 = __importDefault(require("./routes/SearchGamesRoute"));
const FeaturedRoute_1 = __importDefault(require("./routes/FeaturedRoute"));
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
app.use("/api/featured", FeaturedRoute_1.default);
async function refreshCaches() {
    console.log("");
    console.log("Refreshing platform stream caches...");
    const startedAt = Date.now();
    await PlatformCacheService_1.default.refreshAll();
    const elapsed = ((Date.now() - startedAt) /
        1000).toFixed(1);
    console.log(`Platform cache refresh completed in ${elapsed}s.`);
}
async function start() {
    await refreshCaches();
    app.listen(PORT, () => {
        console.log("");
        console.log("=====================================");
        console.log("        Void Drift Server");
        console.log("=====================================");
        console.log(`Listening : http://localhost:${PORT}`);
        console.log("");
    });
    const refreshLoop = async () => {
        const refreshInterval = Twitch_1.default.CacheRefreshSeconds *
            1000;
        const elapsed = Date.now();
        await refreshCaches();
        const refreshTime = Date.now() -
            elapsed;
        const remainingDelay = Math.max(0, refreshInterval -
            refreshTime);
        if (remainingDelay > 0) {
            console.log(`Next platform cache refresh in ${(remainingDelay / 1000).toFixed(1)}s.`);
            await new Promise(resolve => setTimeout(resolve, remainingDelay));
        }
        else {
            console.log("Refresh exceeded configured interval; starting next refresh immediately.");
        }
        void refreshLoop();
    };
    void refreshLoop();
}
void start();
