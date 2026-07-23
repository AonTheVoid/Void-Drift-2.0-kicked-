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

        } catch (error) {

            console.error("Failed to refresh Twitch cache.");

            console.error(error);

        }

    }

    public getRandom(language: string = "any"): TwitchStream | null {

        if (this.streams.length === 0)
            return null;

        let pool = this.streams;

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

        const stream =
            available[Math.floor(Math.random() * available.length)];

        this.history.push(stream.user_login);

        if (this.history.length > this.historyLimit) {

            this.history.shift();

        }

        return stream;

    }

}

export default new StreamCache();
