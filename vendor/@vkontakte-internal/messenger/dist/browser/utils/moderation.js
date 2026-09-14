/**
 * @param contentOptions  подробнее о параметре смотри в src/core/model/ChannelsConfig.ts
 */
export function canGeoBlock(contentOptions) {
    if (!contentOptions) {
        return false;
    }
    return (contentOptions & (1 << 2)) !== 0;
}
/**
 * @param contentOptions  подробнее о параметре смотри в src/core/model/ChannelsConfig.ts
 */
export function canDeleteChannelPostWithReason(contentOptions) {
    if (!contentOptions) {
        return false;
    }
    return (contentOptions & (1 << 0)) !== 0;
}
/**
 * @param contentOptions  подробнее о параметре смотри в src/core/model/ChannelsConfig.ts
 */
export function canDeleteChannelCommentWithReason(contentOptions) {
    if (!contentOptions) {
        return false;
    }
    return (contentOptions & (1 << 1)) !== 0;
}
/**
 * @param contentOptions  подробнее о параметре смотри в src/core/model/ChannelsConfig.ts
 */
export function canMarkPostAsFakeNews(contentOptions) {
    if (!contentOptions) {
        return false;
    }
    return (contentOptions & (1 << 3)) !== 0;
}
//# sourceMappingURL=moderation.js.map