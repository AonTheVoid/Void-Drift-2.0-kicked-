import TwitchService from "../services/TwitchService";
import { TwitchStream } from "../types/Twitch";

class StreamCache {

    private streams: TwitchStream[] = [];

    private readonly historyLimit = 50;

    private history: string[] = [];

    public async refresh(): Promise<void> {

        try {

            this.streams = await TwitchService.getLiveStreams();

console.log(`Loaded ${this.streams.length} live streams.`);

console.log(
    "Viewer range:",
    Math.min(...this.streams.map(s => s.viewer_count)),
    "-",
    Math.max(...this.streams.map(s => s.viewer_count))
);

        } catch (error) {

            console.error("Failed to refresh Twitch cache.");

            console.error(error);

        }

    }

    public getRandom(language: string = "any"): TwitchStream | null {

        if (this.streams.length === 0)
            return null;

        let pool = this.streams.filter(stream =>
    stream.viewer_count >= 5 &&
    stream.viewer_count <= 200
);

        if (language !== "any") {

            pool = pool.filter(stream =>
                stream.language.toLowerCase() === language
            );

            if (pool.length === 0)
                return null;

        }

        let available = pool.filter(stream =>
            !this.history.includes(stream.user_login)
        );

        if (available.length === 0) {

            this.history = [];

            available = pool;

        }

        const hidden = available.filter(stream =>
    stream.viewer_count >= 5 &&
    stream.viewer_count <= 50
);

const small = available.filter(stream =>
    stream.viewer_count > 50 &&
    stream.viewer_count <= 100
);

const rising = available.filter(stream =>
    stream.viewer_count > 100 &&
    stream.viewer_count <= 200
);

const roll = Math.random();

let bucket: TwitchStream[] = [];

if (roll < 0.60)
    bucket = hidden;
else if (roll < 0.85)
    bucket = small;
else
    bucket = rising;

if (bucket.length === 0)
    bucket = available.filter(stream =>
        stream.viewer_count >= 5 &&
        stream.viewer_count <= 200
    );

const stream =
    bucket[Math.floor(Math.random() * bucket.length)];
        this.history.push(stream.user_login);

        if (this.history.length > this.historyLimit) {

            this.history.shift();

        }

        return stream;

    }

}

export default new StreamCache();
