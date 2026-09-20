import { TwitchStream } from "../../types/Twitch";
import { DriftStream } from "../../types/Drift";

export function normalizeTwitchStream(
    stream: TwitchStream
): DriftStream {

    return {
        platform: "twitch",

        id: stream.id,

        channelId: stream.user_id,

        channelLogin: stream.user_login,

        channelName: stream.user_name,

        title: stream.title,

        categoryId: stream.game_id,

        category: stream.game_name,

        language: stream.language,

        viewers: stream.viewer_count,

        thumbnail: stream.thumbnail_url
            .replace("{width}", "1280")
            .replace("{height}", "720"),

        startedAt: stream.started_at,

        mature: stream.is_mature,

        url: `https://twitch.tv/${stream.user_login}`
    };

}
