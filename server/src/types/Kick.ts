export interface KickCategory {
    id: number;
    name: string;
    thumbnail: string;
}

export interface KickChannel {
    slug: string;
}

export interface KickBroadcasterUser {
    id: number;
    username: string;
    profile_picture: string;
}

export interface KickStream {
    id: string;
    title: string;
    language_code: string;
    tags: string[];
    has_mature_content: boolean;
    viewer_count: number;
    thumbnail: string;
    started_at: string;
    category: KickCategory;
    channel: KickChannel;
    broadcaster_user: KickBroadcasterUser;
}

export interface KickPagination {
    next_cursor?: string;
}

export interface KickStreamsResponse {
    data: KickStream[];
    message: string;
    pagination?: KickPagination;
}

export interface KickTokenResponse {
    access_token: string;
    expires_in: number;
    token_type: string;
}

export interface KickCategorySearchResult {
    id: number;
    name: string;
    thumbnail: string;
    tags: string[] | null;
}

export interface KickCategorySearchResponse {
    data: KickCategorySearchResult[];
    message: string;
    pagination?: KickPagination;
}
