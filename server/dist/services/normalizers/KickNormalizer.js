"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeKickStream = normalizeKickStream;
function normalizeKickStream(stream) {
    return {
        platform: "kick",
        id: stream.id,
        channelId: String(stream.broadcaster_user.id),
        channelLogin: stream.channel.slug,
        channelName: stream.broadcaster_user.username,
        title: stream.title,
        categoryId: String(stream.category.id),
        category: stream.category.name,
        language: stream.language_code,
        viewers: stream.viewer_count,
        thumbnail: stream.thumbnail,
        startedAt: stream.started_at,
        mature: stream.has_mature_content,
        tags: stream.tags,
        url: `https://kick.com/${stream.channel.slug}`
    };
}
