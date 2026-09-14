import React, { useEffect } from 'react';
import cx from 'classnames';
import { Icon20Story, Icon20HistoryBackwardOutline, Icon28LockOutline, Icon28ClockOutline, Icon20StoryOutline, } from '@vkontakte/icons';
import * as Attach from '../../../core/model/Attach';
import * as Peer from '../../../core/model/Peer';
import { useBrowserEnv, useViewer, usePeers } from '../../hooks/misc';
import { Link } from '../../ui/Link/Link';
import { PeerTitle } from '../../ui/PeerTitle/PeerTitle';
import { Avatar } from '../../ui/Avatar/Avatar';
import { PhotoItem } from '../../ui/PhotoItem/PhotoItem';
import { useWithoutBubblesTheme } from '../../hooks/useWithoutBubblesTheme';
import './AttachStory.css';
import './AttachStoryWithoutBubblesTheme.css';
import { useNow } from '../../hooks/useNow';
const STORY_MIN_SIZE = 320;
const STORY_WIDTH_FULL = 200;
const STORY_HEIGHT_FULL = 356;
const STORY_WIDTH_COMPACT = 132;
const STORY_HEIGHT_COMPACT = 236;
export const AttachStory = ({ story, isOut, isForwarded, isCompact, isThemed, onWidthChange, }) => {
    const peers = usePeers();
    const { id } = useViewer();
    const { lang } = useBrowserEnv();
    const isWithoutBubblesTheme = useWithoutBubblesTheme();
    const now = useNow();
    const { available, expired, expiresAt, narrativesCount } = story;
    const peer = Peer.safeGet(peers, Peer.resolveId(story.ownerId));
    const name = Peer.name(peer);
    const preview = Attach.preview(story, STORY_MIN_SIZE, STORY_MIN_SIZE);
    const isNotVisibleStory = !preview || expired || !available;
    const isOurStory = id === story.ownerId;
    useEffect(() => {
        preview?.width && onWidthChange?.(preview.width);
    }, [onWidthChange, preview?.width]);
    if (isForwarded) {
        return React.createElement(ForwardedStory, { story: story, name: name });
    }
    const renderLockedStoryContent = () => {
        if (!available && !expired) {
            return (React.createElement("div", { className: "AttachStory__info AttachStory__info--vertical AttachStory__info--center" },
                React.createElement(Icon28LockOutline, { className: "AttachStory__icon" }),
                React.createElement("p", { className: "AttachStory__text" }, lang.use('me_attach_story_private'))));
        }
        if (expired) {
            return (React.createElement("div", { className: "AttachStory__info AttachStory__info--vertical AttachStory__info--center" },
                React.createElement(Icon28ClockOutline, { className: "AttachStory__icon" }),
                React.createElement("p", { className: "AttachStory__text" }, lang.use('me_attach_story_expired'))));
        }
        return null;
    };
    const isAvailableOnlyForCurrentUser = isOurStory &&
        available &&
        expiresAt &&
        expiresAt < now &&
        narrativesCount === 0;
    const attachMediaWidth = (isCompact ? STORY_WIDTH_COMPACT : STORY_WIDTH_FULL) + 'px';
    const attachMediaHeight = (isCompact ? STORY_HEIGHT_COMPACT : STORY_HEIGHT_FULL) + 'px';
    return (React.createElement("div", { className: cx('AttachStory', {
            'AttachStory--withoutBubbles': isWithoutBubblesTheme,
            'AttachStory--out': isOut && !isWithoutBubblesTheme,
            'AttachStory--in': !isOut || isWithoutBubblesTheme,
            'AttachStory--lock': isNotVisibleStory,
        }), style: {
            '--attach-story-media-width': attachMediaWidth,
        } },
        React.createElement("div", { className: "AttachStory__content" },
            isAvailableOnlyForCurrentUser && (React.createElement("div", { className: cx('AttachStory__info AttachStory__info--float AttachStory__info--vertical AttachStory__info--aside', { 'AttachStory__info--themed': isThemed }) },
                React.createElement(Icon20HistoryBackwardOutline, null),
                React.createElement("p", { className: "AttachStory__text" }, lang.use('me_attach_story_restricted')))),
            React.createElement("div", { className: "AttachStory__media", style: {
                    width: attachMediaWidth,
                    height: attachMediaHeight,
                } }, isNotVisibleStory ? (renderLockedStoryContent()) : (React.createElement(Link, { to: {
                    kind: 'AttachProxyRoute',
                    attach: story,
                }, className: "AttachStory__link" },
                React.createElement("div", { className: "AttachStory__head" },
                    React.createElement(Avatar, { peer: peer, size: 20, className: "AttachStory__avatar" }),
                    React.createElement(PeerTitle, { peer: peer, className: "AttachVideosClip__title", iconColor: "var(--vkui--color_text_contrast)" })),
                React.createElement(PhotoItem, { width: !isCompact ? STORY_WIDTH_FULL : STORY_WIDTH_COMPACT, height: !isCompact ? STORY_HEIGHT_FULL : STORY_HEIGHT_COMPACT, src: preview?.url, alt: "" }),
                React.createElement("div", { className: "AttachStory__logo" },
                    React.createElement(Icon20StoryOutline, null))))))));
};
const ForwardedStory = ({ story, name, }) => {
    const { lang } = useBrowserEnv();
    const STORY_SIZE = 32 * window.devicePixelRatio;
    const preview = Attach.preview(story, STORY_SIZE, STORY_SIZE);
    return (React.createElement(Link, { className: "AttachStory--forwarded__link", to: {
            kind: 'AttachProxyRoute',
            attach: story,
        } },
        preview ? (React.createElement("img", { className: "AttachStory--forwarded__img", alt: "", src: preview.url })) : (React.createElement("i", { className: "AttachStory--forwarded__icon" },
            React.createElement(Icon20Story, null))),
        React.createElement("div", { className: "AttachStory--forwarded__info" },
            React.createElement("span", { className: "AttachStory--forwarded__from" }, name),
            React.createElement("span", { className: "AttachStory--forwarded__text" }, lang.use('me_attaches_story')))));
};
//# sourceMappingURL=AttachStory.js.map