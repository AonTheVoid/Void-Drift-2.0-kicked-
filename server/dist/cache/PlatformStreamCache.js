"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PlatformStreamCache {
    streams = {
        twitch: [],
        kick: [],
        youtube: []
    };
    topGameStreams = {
        twitch: [],
        kick: [],
        youtube: []
    };
    historyLimit = 50;
    history = {
        twitch: [],
        kick: [],
        youtube: []
    };
    categoryHistory = {
        twitch: [],
        kick: [],
        youtube: []
    };
    setStreams(platform, streams) {
        this.streams[platform] = streams;
        console.log(`Loaded ${streams.length} ${platform} streams into cache.`);
    }
    setTopGameStreams(platform, streams) {
        this.topGameStreams[platform] = streams;
        console.log(`Loaded ${streams.length} ${platform} top-game streams into cache.`);
    }
    getStreams(platform) {
        return this.streams[platform];
    }
    getCount(platform) {
        return this.streams[platform].length;
    }
    getRandom(platform, language = "any", mode = "random", categoryId) {
        /*
         * If the user explicitly selected a category,
         * always search the complete platform cache.
         *
         * A category selection must not be restricted
         * by discovery mode pools such as Top Games.
         *
         * Example:
         *
         * Kick
         * Mode: Top Games
         * Game: Elden Ring
         *
         * should search all cached Kick streams for
         * Elden Ring, not only Kick's current top-game pool.
         */
        let source = categoryId
            ? this.streams[platform]
            : this.streams[platform];
        /*
         * Top Games only controls the source pool when
         * there is no explicit category selection.
         */
        if (!categoryId &&
            mode === "top-game") {
            source =
                this.topGameStreams[platform];
        }
        if (source.length === 0)
            return null;
        let pool = [];
        /*
         * An explicit category selection overrides
         * discovery mode.
         */
        if (categoryId) {
            pool =
                source.filter(stream => stream.categoryId === categoryId);
        }
        else {
            switch (mode) {
                case "top-game":
                    pool = source;
                    break;
                case "just-starting":
                    pool = source.filter(stream => {
                        const started = new Date(stream.startedAt).getTime();
                        const minutes = (Date.now() - started) /
                            60000;
                        return (minutes <= 30 &&
                            stream.viewers >= 5 &&
                            stream.viewers <= 200);
                    });
                    break;
                case "partner-push":
                    const positivePhrases = [
                        "partner push",
                        "road to partner",
                        "road2partner",
                        "partner grind",
                        "grinding for partner",
                        "grinding partner",
                        "push to partner",
                        "push for partner",
                        "partner journey",
                        "help me reach partner"
                    ];
                    const negativePhrases = [
                        "partnered",
                        "official partner"
                    ];
                    pool = source.filter(stream => {
                        if (stream.viewers < 40 ||
                            stream.viewers > 199)
                            return false;
                        const title = stream.title.toLowerCase();
                        if (negativePhrases.some(phrase => title.includes(phrase)))
                            return false;
                        return positivePhrases.some(phrase => title.includes(phrase));
                    });
                    break;
                case "less-than-10":
                    pool = source.filter(stream => stream.viewers >= 5 &&
                        stream.viewers <= 9);
                    break;
                case "on-the-rise":
                    pool = source.filter(stream => stream.viewers >= 200 &&
                        stream.viewers <= 999);
                    break;
                default:
                    pool = source.filter(stream => stream.viewers >= 5 &&
                        stream.viewers <= 200);
                    break;
            }
        }
        /*
         * Language filtering still applies to both
         * normal discovery and explicit categories.
         */
        if (language !== "any") {
            pool = pool.filter(stream => stream.language.toLowerCase() === language);
        }
        /*
         * Category filtering is already handled above
         * when categoryId is present.
         */
        if (pool.length === 0)
            return null;
        /*
         * Explicit category selections should not be
         * constrained by Top Games or category diversity.
         *
         * The user already chose exactly what category
         * they want.
         */
        if (categoryId) {
            const platformHistory = this.history[platform];
            const available = pool.filter(stream => !platformHistory.includes(stream.channelLogin));
            const selection = available.length > 0
                ? available
                : pool;
            const stream = selection[Math.floor(Math.random() *
                selection.length)];
            this.addToHistory(platform, stream);
            return stream;
        }
        if (mode === "top-game") {
            return pool[Math.floor(Math.random() *
                pool.length)];
        }
        const platformHistory = this.history[platform];
        if (mode === "on-the-rise") {
            const available = pool.filter(stream => !platformHistory.includes(stream.channelLogin));
            const selection = available.length > 0
                ? available
                : pool;
            const stream = selection[Math.floor(Math.random() *
                selection.length)];
            this.addToHistory(platform, stream);
            return stream;
        }
        let available = pool.filter(stream => !platformHistory.includes(stream.channelLogin));
        if (available.length === 0) {
            this.history[platform] = [];
            available = pool;
        }
        const hidden = available.filter(stream => stream.viewers >= 5 &&
            stream.viewers <= 50);
        const small = available.filter(stream => stream.viewers > 50 &&
            stream.viewers <= 100);
        const rising = available.filter(stream => stream.viewers > 100 &&
            stream.viewers <= 200);
        const roll = Math.random();
        let bucket;
        if (roll < 0.60)
            bucket = hidden;
        else if (roll < 0.85)
            bucket = small;
        else
            bucket = rising;
        if (bucket.length === 0) {
            bucket =
                available.filter(stream => stream.viewers >= 5 &&
                    stream.viewers <= 200);
        }
        if (bucket.length === 0)
            return null;
        let stream = bucket[Math.floor(Math.random() *
            bucket.length)];
        const usedCategories = this.categoryHistory[platform];
        const categoryUsed = usedCategories.includes(stream.category);
        if (categoryUsed) {
            const differentCategory = bucket.filter(item => !usedCategories.includes(item.category));
            if (differentCategory.length > 0) {
                stream =
                    differentCategory[Math.floor(Math.random() *
                        differentCategory.length)];
            }
        }
        this.addToHistory(platform, stream);
        usedCategories.push(stream.category);
        if (usedCategories.length >
            10) {
            usedCategories.shift();
        }
        return stream;
    }
    addToHistory(platform, stream) {
        const history = this.history[platform];
        history.push(stream.channelLogin);
        if (history.length >
            this.historyLimit) {
            history.shift();
        }
    }
}
exports.default = new PlatformStreamCache();
