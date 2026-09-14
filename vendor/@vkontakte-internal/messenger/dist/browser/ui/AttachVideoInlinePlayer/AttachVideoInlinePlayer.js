import React, { useEffect, useRef } from 'react';
import { isMouseEventWithModifier } from '../../utils/misc';
import { useBrowserEnv } from '../../hooks/misc';
import { useInView } from 'react-intersection-observer';
export const AttachVideoInlinePlayer = (props) => {
    const { autoplay, videoId, listId, children, isVkVideo, shortVideo, forceAutoPlay, hasRestriction, attachmentsCount, vkComLegacyAnalyticsPostId, peerId, cmid, } = props;
    const { inView, ref, entry } = useInView({ threshold: 1 });
    const { vkcom_me } = useBrowserEnv();
    const $div = useRef(null);
    // иногда проскакивают пересечения и 0x0 px (их отсекаем)
    const isInView = inView &&
        entry?.boundingClientRect.height &&
        entry?.boundingClientRect.width &&
        $div.current?.clientHeight &&
        $div.current?.clientWidth;
    const isVideoAttachmentTheOnlyOne = attachmentsCount === 1;
    const playInlineVideo = isVideoAttachmentTheOnlyOne &&
        autoplay &&
        isVkVideo &&
        isInView &&
        !hasRestriction;
    const SPECIAL_VKCOM_CLASS_FOR_ENABLING_AUTOPLAY = 'page_video_autoplayable';
    useEffect(() => {
        if (playInlineVideo && $div.current) {
            vkcom_me?.showInlineVideo?.(videoId, listId, shortVideo, $div.current, true, forceAutoPlay, vkComLegacyAnalyticsPostId, peerId, cmid);
        }
    }, [
        videoId,
        listId,
        shortVideo,
        vkcom_me,
        playInlineVideo,
        vkComLegacyAnalyticsPostId,
        forceAutoPlay,
        peerId,
        cmid,
    ]);
    const handleContextMenuClick = (e) => {
        if ($div.current &&
            e.target instanceof Node &&
            !$div.current.contains(e.target)) {
            // значит сейчас играет инлайн плеер вккома
            // и нам не следует показывать наше контекстное меню, а дать показать только контекстное меню инлайн плеера
            e.stopPropagation();
            e.preventDefault();
        }
    };
    return (React.createElement("div", { onContextMenu: handleContextMenuClick, ref: ref },
        React.createElement("div", { onClickCapture: (e) => {
                if (hasRestriction) {
                    return;
                }
                if (!isVideoAttachmentTheOnlyOne) {
                    return;
                }
                if (isMouseEventWithModifier(e)) {
                    return;
                }
                /**
                 * Если это клик по кнопке "подписаться на автора клипа" или другим
                 * интерактивным элементам шапки клипа, не запускаем проигрывание клипа
                 * https://jira.mvk.com/browse/ME-75685
                 *
                 * @TODO убрать, когда отключим проигрывание клипов
                 * в истории сообщений в https://jira.mvk.com/browse/ME-74541
                 */
                const isClickOnClipHead = $div.current &&
                    !!findParentElementByClassName(e.target instanceof HTMLElement || e.target instanceof Element
                        ? e.target
                        : null, [
                        'AttachVideosClip__manageSubscriptionButton',
                        'AttachVideosClip__title',
                        'AttachVideosClip__avatar',
                    ], $div.current);
                if (isClickOnClipHead) {
                    return;
                }
                if (vkcom_me?.showInlineVideo) {
                    e.preventDefault();
                    e.stopPropagation();
                    vkcom_me.showInlineVideo(videoId, listId, shortVideo, e.currentTarget, false, undefined, vkComLegacyAnalyticsPostId, peerId, cmid);
                }
            }, className: SPECIAL_VKCOM_CLASS_FOR_ENABLING_AUTOPLAY, ref: $div }, children)));
};
export function findParentElementByClassName(element, searchedParentClassNames, boundaryElement) {
    if (!element) {
        return null;
    }
    if (element === boundaryElement) {
        return null;
    }
    if (searchedParentClassNames.some((cl) => element.classList.contains(cl))) {
        return element;
    }
    return findParentElementByClassName(element.parentElement, searchedParentClassNames, boundaryElement);
}
//# sourceMappingURL=AttachVideoInlinePlayer.js.map