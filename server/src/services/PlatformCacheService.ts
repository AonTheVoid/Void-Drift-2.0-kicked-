import TwitchService from "./TwitchService";
import KickService from "./KickService";

import PlatformStreamCache from "../cache/PlatformStreamCache";

import { normalizeTwitchStream } from "./normalizers/TwitchNormalizer";
import { normalizeKickStream } from "./normalizers/KickNormalizer";

import { DriftStream } from "../types/Drift";

class PlatformCacheService {

    public async refreshTwitch(): Promise<void> {

        try {

            console.log(
                "Refreshing Twitch stream cache..."
            );

            const streams =
                await TwitchService.getLiveStreams();

            const normalized =
                streams.map(
                    normalizeTwitchStream
                );

            PlatformStreamCache.setStreams(
                "twitch",
                normalized
            );

            console.log(
                "Refreshing Twitch top-game cache..."
            );

            const topGameStreams =
                await TwitchService.getTopGameStreams();

            const normalizedTopGameStreams =
                topGameStreams.map(
                    normalizeTwitchStream
                );

            PlatformStreamCache.setTopGameStreams(
                "twitch",
                normalizedTopGameStreams
            );

        } catch (error) {

            console.error(
                "Failed to refresh Twitch cache."
            );

            console.error(error);

        }

    }

    public async refreshKick(): Promise<void> {

        try {

            console.log(
                "Refreshing Kick stream cache..."
            );

            const streams =
                await KickService.getLiveStreams(10000);

            const normalized =
                streams.map(
                    normalizeKickStream
                );

            PlatformStreamCache.setStreams(
                "kick",
                normalized
            );

            console.log(
                "Refreshing Kick top-game cache..."
            );

            const categoryStats =
                new Map<
                    string,
                    {
                        categoryId: string;
                        category: string;
                        streams: number;
                        viewers: number;
                    }
                >();

            for (const stream of normalized) {

                if (!stream.categoryId)
                    continue;

                const existing =
                    categoryStats.get(
                        stream.categoryId
                    );

                if (existing) {

                    existing.streams += 1;
                    existing.viewers += stream.viewers;

                } else {

                    categoryStats.set(
                        stream.categoryId,
                        {
                            categoryId:
                                stream.categoryId,

                            category:
                                stream.category,

                            streams: 1,

                            viewers:
                                stream.viewers
                        }
                    );

                }

            }

            const topCategories =
                Array.from(
                    categoryStats.values()
                )
                .filter(category =>
                    category.streams >= 5
                )
                .sort(
                    (a, b) =>
                        b.viewers - a.viewers
                )
                .slice(0, 10);

            const topCategoryIds =
                new Set(
                    topCategories.map(
                        category =>
                            category.categoryId
                    )
                );

            const topGameStreams =
                normalized.filter(stream =>
                    stream.categoryId &&
                    topCategoryIds.has(
                        stream.categoryId
                    )
                );

            PlatformStreamCache.setTopGameStreams(
                "kick",
                topGameStreams
            );

            console.log(
                "Kick top-game categories:"
            );

            for (
                const category of topCategories
            ) {

                console.log(
                    `  ${category.category} - ` +
                    `${category.streams} streams - ` +
                    `${category.viewers} viewers`
                );

            }

            console.log(
                `Kick top-game pool: ${topGameStreams.length} streams`
            );

        } catch (error) {

            console.error(
                "Failed to refresh Kick cache."
            );

            console.error(error);

        }

    }

    public async refreshAll(): Promise<void> {

        await Promise.all([
            this.refreshTwitch(),
            this.refreshKick()
        ]);

    }

}

export default new PlatformCacheService();