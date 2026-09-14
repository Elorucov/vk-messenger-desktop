import { useBrowserEnv, useFeatureFlags, usePixelDensity, useViewport, } from '../hooks/misc';
import { applySizeLimitations, getAttachForwardIndent, getExpectedAttachWidth, } from '../utils/misc';
import { useImagesLayout } from '../ui/ConvoHistory/ImagesLayoutContext';
import * as Attach from '../../core/model/Attach';
import { useEffect, useState } from 'react';
import * as IPlayer from '../../data/env/IPlayer';
import { getRichMiniAppAttachMinWidth, MINI_APP_BREAKPOINT, } from '../ui/AttachMiniAppCell/AttachMiniAppCell';
import { MAX_FORWARDED_IN_LIST } from '../ui/ForwardedMessagesList/ForwardedMessagesList';
export const MIN_SINGLE_VIDEO_WIDTH = 220;
export const MIN_SINGLE_VIDEO_HEIGHT = 100;
export const MIN_SINGLE_IMAGE_WIDTH = 250;
export const MIN_SINGLE_IMAGE_HEIGHT = 100;
export const STORY_WIDTH_FULL = 200;
export const STORY_WIDTH_COMPACT = 132;
export const ARTIST_WIDTH_FULL = 400;
export const ARTIST_WIDTH_COMPACT = 240;
export const AUDIO_PRIMARY_WIDTH = 220;
export const MAP_WIDTH = 300;
export const GIFT_WIDTH = 208;
export const VIDEO_MESSAGE_DEFAULT_WIDTH = 216;
export const VIDEO_MESSAGE_PLAYING_WIDTH = 351;
// const MIN_SINGLE_DOC_PREVIEW_WIDTH = 120
// const MIN_SINGLE_DOC_PREVIEW_HEIGHT = 120
export const CLIP_WIDTH_FULL = 200;
export const CLIP_HEIGHT_FULL = 356;
export const NEW_CLIP_HEIGHT_FULL = 320;
export const CLIP_WIDTH_COMPACT = 132;
export const NEW_CLIP_WIDTH_COMPACT = 140;
export const CLIP_HEIGHT_COMPACT = 236;
export const NEW_CLIP_HEIGHT_COMPACT = 224;
export const MAX_COMPACT_WIDTH = 260;
export const MAX_COMPACT_WITH_FORWARDS_WIDTH = 225;
export function useMessageExpectedAttachesWidth(params) {
    const { vkm_new_bubbles_width_calc } = useFeatureFlags();
    return vkm_new_bubbles_width_calc
        ? 0
        : _useMessageExpectedAttachesWidth(params);
}
/**
 * Определяет ширину содержимого сообщения на основе прикрепленных аттачей
 */
function _useMessageExpectedAttachesWidth({ message, rootMessageId, forwardLevel = 0, isCompact = false, isInBubble = false, }) {
    const featureFlags = useFeatureFlags();
    const isDense = usePixelDensity();
    const { videoMessagePlayer } = useBrowserEnv();
    const [vw] = useViewport({ debounced: true });
    const forwardIndent = getAttachForwardIndent(forwardLevel, featureFlags.vkm_new_forward);
    const { width, maxSingleHeight } = useImagesLayout();
    const commonLayoutWidth = width - forwardIndent;
    const [playingVideoMessageId, setPlayingVideoMessageId] = useState(null);
    useEffect(() => {
        function handleVideoMessagePlayerStateUpdated(state) {
            if (!state.currentVideoMessageTrack) {
                setPlayingVideoMessageId(null);
                return;
            }
            switch (state.status) {
                case 'playing':
                case 'paused':
                    setPlayingVideoMessageId(state.currentVideoMessageTrack.id);
                    break;
                default:
                    setPlayingVideoMessageId(null);
            }
        }
        videoMessagePlayer.subscribe(IPlayer.VideoMessagePlayerEventTypes.STATE_UPDATED, handleVideoMessagePlayerStateUpdated);
        return () => {
            videoMessagePlayer.unsubscribe(IPlayer.VideoMessagePlayerEventTypes.STATE_UPDATED, handleVideoMessagePlayerStateUpdated);
        };
    }, [videoMessagePlayer]);
    const [messageWidth, setMessageWidth] = useState(calcMessageAttaches({
        message,
        rootMessageId,
        playingVideoMessageId,
        commonLayoutWidth,
        maxSingleHeight,
        isCompact,
        forwardLevel,
        isDense,
        isInBubble,
        vw,
        vkm_clip_uniform_size: featureFlags.vkm_clip_uniform_size,
    }));
    useEffect(() => {
        setMessageWidth(calcMessageAttaches({
            message,
            rootMessageId,
            playingVideoMessageId,
            commonLayoutWidth,
            maxSingleHeight,
            isCompact,
            forwardLevel,
            isDense,
            isInBubble,
            vw,
            vkm_clip_uniform_size: featureFlags.vkm_clip_uniform_size,
        }));
    }, [
        commonLayoutWidth,
        forwardLevel,
        isCompact,
        isDense,
        isInBubble,
        maxSingleHeight,
        message,
        playingVideoMessageId,
        rootMessageId,
        vw,
        featureFlags.vkm_clip_uniform_size,
    ]);
    return isCompact ? Math.min(messageWidth, MAX_COMPACT_WIDTH) : messageWidth;
}
/**
 * Считает ширину аттачей
 * Учитываются только аттачи, ширина которых зависит от их содержимого
 * (картинки, первью)
 */
function calcAttachesWidth({ attaches, rootMessageId, playingVideoMessageId, maxSingleHeight, commonLayoutWidth, isCompact = false, forwardLevel = 0, isDense = false, isInBubble = false, vw, vkm_clip_uniform_size, }) {
    const attachesWidth = [];
    const forwardIndent = getAttachForwardIndent(forwardLevel, true);
    const attachmentsCount = Attach.count(attaches);
    if (Attach.hasMediaAttaches(attaches)) {
        const mediaAttachesCount = Attach.mediaAttachesCount(attaches);
        if (mediaAttachesCount > 1) {
            attachesWidth.push(commonLayoutWidth);
        }
        else {
            const mediaAttach = Attach.getSingleMediaAttach(attaches);
            if (mediaAttach === null) {
                return 0;
            }
            const mediaPreview = mediaAttach.kind === 'Video' // Из-за перегрузки просто так не кушает
                ? Attach.preview(mediaAttach, commonLayoutWidth)
                : Attach.preview(mediaAttach, commonLayoutWidth);
            if (!mediaPreview) {
                return 0;
            }
            switch (mediaAttach.kind) {
                case 'Photo':
                case 'Doc': {
                    attachesWidth.push(applySizeLimitations(mediaPreview.width, mediaPreview.height, commonLayoutWidth, maxSingleHeight, MIN_SINGLE_IMAGE_WIDTH, MIN_SINGLE_IMAGE_HEIGHT).width);
                    break;
                }
                case 'Video': {
                    if (mediaAttach.type === 'short_video') {
                        attachesWidth.push(isCompact
                            ? vkm_clip_uniform_size
                                ? NEW_CLIP_WIDTH_COMPACT
                                : CLIP_WIDTH_COMPACT
                            : CLIP_WIDTH_FULL);
                        break;
                    }
                    attachesWidth.push(applySizeLimitations(mediaPreview.width, mediaPreview.height, commonLayoutWidth, maxSingleHeight, MIN_SINGLE_VIDEO_WIDTH, MIN_SINGLE_VIDEO_HEIGHT).width);
                    break;
                }
                default:
                    break;
            }
            attachesWidth.push(applySizeLimitations(mediaPreview.width, mediaPreview.height, commonLayoutWidth, maxSingleHeight, MIN_SINGLE_IMAGE_WIDTH, MIN_SINGLE_IMAGE_HEIGHT).width);
        }
    }
    if (attaches.artist) {
        attachesWidth.push(isCompact ? ARTIST_WIDTH_COMPACT : ARTIST_WIDTH_FULL);
    }
    if (attaches.story) {
        attachesWidth.push(isCompact ? STORY_WIDTH_COMPACT : STORY_WIDTH_FULL);
    }
    if (attaches.audios && !Attach.hasMediaAttaches(attaches)) {
        attachesWidth.push(AUDIO_PRIMARY_WIDTH);
    }
    if (attaches.geo) {
        attachesWidth.push(MAP_WIDTH);
    }
    if (attaches.videoMessage) {
        const id = `${rootMessageId}_${attaches.videoMessage.id}`;
        attachesWidth.push(playingVideoMessageId === id
            ? VIDEO_MESSAGE_PLAYING_WIDTH
            : VIDEO_MESSAGE_DEFAULT_WIDTH);
    }
    if (attaches.gift) {
        attachesWidth.push(GIFT_WIDTH);
    }
    if (attaches.graffiti) {
        const [previewWidth] = getExpectedAttachWidth(isDense, isInBubble, forwardLevel, commonLayoutWidth);
        const width = Math.min(previewWidth, attaches.graffiti.width);
        attachesWidth.push(width);
    }
    if (attaches.miniApps) {
        const isRich = !isCompact && attachmentsCount === 1;
        if (isRich) {
            const shouldRenderCompact = isCompact || vw <= MINI_APP_BREAKPOINT;
            const width = getRichMiniAppAttachMinWidth(!isInBubble, shouldRenderCompact, vw);
            attachesWidth.push(width);
        }
    }
    if (attaches.wall) {
        const wallWidth = calcAttachesWidth({
            attaches: attaches.wall.attaches,
            rootMessageId,
            playingVideoMessageId,
            commonLayoutWidth,
            maxSingleHeight,
            forwardLevel,
            isCompact,
            isDense,
            isInBubble,
            vw,
            vkm_clip_uniform_size,
        });
        if (wallWidth !== 0) {
            attachesWidth.push(wallWidth);
        }
    }
    if (attaches.wallReply) {
        const wallWidth = calcAttachesWidth({
            attaches: attaches.wallReply.attaches,
            rootMessageId,
            playingVideoMessageId,
            commonLayoutWidth,
            maxSingleHeight,
            forwardLevel,
            isCompact,
            isDense,
            isInBubble,
            vw,
            vkm_clip_uniform_size,
        });
        if (wallWidth !== 0) {
            attachesWidth.push(wallWidth);
        }
    }
    return attachesWidth.length ? Math.min(...attachesWidth) + forwardIndent : 0;
}
function calcMessageAttaches({ message, rootMessageId, commonLayoutWidth, maxSingleHeight, isCompact, forwardLevel = 0, isDense, isInBubble, playingVideoMessageId, vw, vkm_clip_uniform_size, }) {
    const calculatedWidth = calcAttachesWidth({
        attaches: message.attaches,
        rootMessageId,
        playingVideoMessageId,
        commonLayoutWidth,
        maxSingleHeight,
        isCompact,
        forwardLevel,
        isDense,
        isInBubble,
        vw,
        vkm_clip_uniform_size,
    });
    const forwardedWidth = message.forwardedMessages
        ?.map((forwardedMessage) => calcAttachesWidth({
        attaches: forwardedMessage.attaches,
        rootMessageId,
        playingVideoMessageId,
        commonLayoutWidth,
        maxSingleHeight,
        isCompact,
        forwardLevel: forwardLevel + 1,
        isDense,
        isInBubble,
        vw,
        vkm_clip_uniform_size,
    }))
        .flat() ?? [];
    if (isCompact &&
        message.forwardedMessages &&
        message.forwardedMessages.length > MAX_FORWARDED_IN_LIST) {
        forwardedWidth.push(MAX_COMPACT_WITH_FORWARDS_WIDTH);
    }
    return Math.max(calculatedWidth, ...forwardedWidth, 0);
}
//# sourceMappingURL=useExpectedAttachesWidth.js.map