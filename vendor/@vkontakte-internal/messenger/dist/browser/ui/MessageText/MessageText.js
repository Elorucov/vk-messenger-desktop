import '../../ui/MessageText/MessageText.css';
import React, { forwardRef, useEffect, useMemo, useRef, } from 'react';
import cx from 'classnames';
import * as Peer from '../../../core/model/Peer';
import { exhaustivenessCheck } from '../../../core/utils/misc';
import { Link, ExternalLink } from '../../ui/Link/Link';
import { useBrowserEnv, useCombinedRefs, useFeatureFlags, usePeers, useViewer, } from '../../hooks/misc';
import { resolveMiniAppId } from '../../../core/model/Attach';
import { useRouter } from '../../ui/Router/Router';
import { applyParentRouteParam } from '../../../data/env/Router';
import { useApiFetch } from '../../hooks/useApiFetch';
import * as Channel from '../../../core/model/Channel';
import { IRouter } from '../../../data/env/IRouter';
import { Emoji } from '../../ui/Emoji/Emoji';
import { PlainText } from '../../ui/PlainText/PlainText';
import { isMouseEventWithModifier } from '../../utils/misc';
import { CodeBlock } from '../../ui/CodeBlock/CodeBlock';
import { useTextFormatting } from '../../hooks/useTextFormatting';
import { getCallJoinHash, getCallJoinId, getChatJoinHash, } from '../../../core/utils/links';
import { decodeHTMLEntities } from '@vkontakte/vkjs';
export const MessageText = ({ chunks, peerId, kind, multiline = true, isPlainText = false, className, highlightFuzzySearch, highlightColor, highlightColorOpacity, allowMentionHighlighting, underlineLink, formatData, }) => {
    const { calls, isEduAvailable } = useBrowserEnv();
    const { navigate, screenRoute, rightPanel } = useRouter();
    const { viewer, settings } = useViewer();
    const peers = usePeers();
    const featureFlags = useFeatureFlags();
    const shouldHighlightMention = allowMentionHighlighting &&
        settings.messageSelfMentionHighlighting !== 'none';
    const handleJoinLinkClick = (e, joinType, hash, password) => {
        e.preventDefault();
        e.stopPropagation();
        if (featureFlags.vkm_router_modal_unification) {
            switch (joinType) {
                case 'chat': {
                    navigate({ kind: 'ChatInviteModal', hash, p: password });
                    return;
                }
                case 'call': {
                    navigate({ kind: 'CallJoinByIdModal', callId: hash, p: password });
                    return;
                }
                case 'call_id': {
                    navigate({
                        kind: 'CallJoinByShortIdModal',
                        shortId: hash,
                        p: password,
                    });
                    return;
                }
                default:
                    return exhaustivenessCheck(joinType);
            }
        }
        //  старое поведение
        const peerId = (screenRoute.kind === 'ConvoRoute' && screenRoute.peerId) ||
            (rightPanel?.kind === 'PeerPanel' && rightPanel.peerId);
        if (!peerId || !hash)
            return;
        const HASH_PARAM_MAP = {
            chat: 'chatJoinHash',
            call: 'callJoinHash',
            call_id: 'callJoinId',
        };
        navigate({
            kind: 'ConvoRoute',
            entrypoint: 'convo_invite',
            peerId,
            [HASH_PARAM_MAP[joinType]]: hash,
            p: password,
        });
    };
    const linkClassName = cx('MessageText__link', {
        'MessageText__link--underline': underlineLink,
    });
    const formattingLink = (url, content) => {
        const decodeUrl = decodeHTMLEntities(url);
        return (React.createElement(ExternalLink, { href: decodeUrl, className: linkClassName, withWarningModal: true }, content));
    };
    const formatting = useTextFormatting({
        formatData,
        linkRenderer: formattingLink,
        highlightFuzzySearch,
        highlightColor,
        highlightColorOpacity,
        multiline,
    });
    if (chunks.length === 0) {
        return null;
    }
    if (isPlainText) {
        return (React.createElement("span", { className: cx('MessageText', className) },
            React.createElement(PlainText, { chunks: chunks, multiline: multiline })));
    }
    return (React.createElement("span", { className: cx('MessageText', className) }, chunks.map((chunk, i) => {
        switch (chunk.kind) {
            case 'Text': {
                const formattedText = formatting.byChunk(chunk);
                return React.createElement(React.Fragment, { key: i }, formattedText);
            }
            case 'Emoji': {
                formatting.byChunk(chunk);
                return React.createElement(Emoji, { emoji: chunk.text, key: i });
            }
            case 'Code': {
                formatting.byChunk(chunk);
                return React.createElement(CodeBlock, { code: chunk, key: i });
            }
            case 'Mention': {
                // Обрабатываем @id0, показывая вьювера
                const mentionedPeerId = chunk.peerId === 0 ? viewer.id : chunk.peerId;
                const mentionedPeer = peers.get(mentionedPeerId);
                const formattedText = formatting.byChunk(chunk);
                return (React.createElement(MentionRenderer, { key: i, peerId: mentionedPeerId, screenName: mentionedPeer && Peer.screenName(mentionedPeer), displayName: formattedText, highlight: shouldHighlightMention && viewer.id === mentionedPeerId
                        ? settings.messageSelfMentionHighlighting
                        : undefined, underline: underlineLink }));
            }
            case 'ScreenNameMention': {
                const formattedText = formatting.byChunk(chunk);
                return (React.createElement(MentionRenderer, { key: i, url: `/${chunk.screenName}`, displayName: formattedText, highlight: shouldHighlightMention &&
                        chunk.displayName === viewer.screenName
                        ? settings.messageSelfMentionHighlighting
                        : undefined, underline: underlineLink }));
            }
            case 'MassMention': {
                const formattedText = formatting.byChunk(chunk);
                if ((kind && kind === 'Foreign') ||
                    (peerId && !Peer.isChatPeerId(peerId))) {
                    return React.createElement(React.Fragment, { key: i }, formattedText);
                }
                return (React.createElement("span", { key: i, className: "MessageText__pseudoLink", onClick: (e) => e.stopPropagation() }, formattedText));
            }
            case 'Email': {
                const formattedText = formatting.byChunk(chunk);
                return (React.createElement(ExternalLink, { key: i, href: `mailto:${chunk.email}`, className: linkClassName }, formattedText));
            }
            case 'Url': {
                let handleInviteClick = undefined;
                const callJoinHash = calls && getCallJoinHash(chunk.href, isEduAvailable);
                const chatJoinHash = getChatJoinHash(chunk.href, isEduAvailable);
                if (chatJoinHash) {
                    handleInviteClick = (e) => handleJoinLinkClick(e, 'chat', chatJoinHash);
                }
                else if (callJoinHash) {
                    handleInviteClick = (e) => handleJoinLinkClick(e, 'call', callJoinHash);
                }
                else {
                    const callJoinShortCredentials = getCallJoinId(chunk.href, isEduAvailable);
                    if (callJoinShortCredentials) {
                        handleInviteClick = (e) => handleJoinLinkClick(e, 'call_id', callJoinShortCredentials.callJoinId, callJoinShortCredentials.password);
                    }
                }
                const formattedText = formatting.byChunk(chunk);
                return (React.createElement(LinkRenderer, { key: i, className: linkClassName, href: chunk.href, displayName: formattedText, onClick: handleInviteClick }));
            }
            case 'Hashtag':
            case 'HashtagMention': {
                const hashtag = chunk.tag +
                    (chunk.kind === 'HashtagMention' ? `@${chunk.screenName}` : '');
                const formattedText = formatting.byText(hashtag);
                return (React.createElement(React.Fragment, { key: i }, peerId ? (React.createElement(Link, { className: linkClassName, to: {
                        kind: 'ConvoRoute',
                        entrypoint: 'unknown',
                        peerId,
                        search: hashtag,
                    } }, formattedText)) : (formattedText)));
            }
            case 'LineBreak': {
                formatting.byChunk(chunk);
                return multiline ? React.createElement("br", { key: i }) : ' ';
            }
            default:
                return exhaustivenessCheck(chunk);
        }
    })));
};
export const MentionRenderer = ({ peerId, url, screenName, displayName, highlight, underline }) => {
    if (peerId !== undefined) {
        return (React.createElement(Link, { to: { kind: 'PeerPanel', peerId, screenName }, className: cx('MessageText__link', {
                'MessageText__link--underline': underline,
                'MessageText__linkHighlighted--primary': highlight === 'primary',
                'MessageText__linkHighlighted--secondary': highlight === 'secondary',
            }) }, displayName));
    }
    return (React.createElement(ExternalLink, { href: url, className: "MessageText__link" }, displayName));
};
export const LinkRenderer = forwardRef(({ href, disabled, onClick, displayName, ...props }, ref) => {
    const { router } = useBrowserEnv();
    const { navigate } = useRouter();
    const fetch = useApiFetch();
    const route = useMemo(() => router.fromExternalUrl(href), [href, router]);
    const $ref = useRef(null);
    const combinedRefsCallback = useCombinedRefs(ref, $ref);
    const handleClick = useMemo(() => {
        let wasClicked = false;
        let requestState = { kind: 'None' };
        const handleScreenNameRouteClick = (result) => {
            switch (result.kind) {
                case 'App':
                    navigate({
                        kind: 'MiniAppModal',
                        miniAppId: resolveMiniAppId(result.appId),
                        groupPeerId: result.groupId
                            ? Peer.resolveRealId('Group', result.groupId)
                            : undefined,
                        hash: result.hash,
                    });
                    return;
                case 'Group':
                    navigate(applyParentRouteParam(router.screenRoute, {
                        kind: 'ChannelRoute',
                        channelId: Channel.resolveId(-result.groupId),
                    }));
                    return;
                default:
                    exhaustivenessCheck(result);
            }
        };
        if (route.kind === 'ScreenNameProxyRoute') {
            return async (event) => {
                if (!$ref.current) {
                    return;
                }
                if (event) {
                    wasClicked = true;
                    event.stopPropagation();
                    if (isMouseEventWithModifier(event)) {
                        return;
                    }
                }
                // Уже ходили в api и есть данные. По клику можем сделать navigate
                if (requestState.kind === 'Finished') {
                    if (event) {
                        event.preventDefault();
                        handleScreenNameRouteClick(requestState.result);
                    }
                    return;
                }
                if (requestState.kind === 'ApiError' ||
                    requestState.kind === 'Unsupported') {
                    return;
                }
                event?.preventDefault();
                if (requestState.kind === 'Fetching') {
                    return;
                }
                try {
                    requestState = { kind: 'Fetching' };
                    const res = await fetch('utils.resolveScreenName', {
                        screen_name: route.screenName,
                    });
                    if (!res.object_id || !res.type) {
                        if (wasClicked) {
                            $ref.current.click();
                        }
                        requestState = { kind: 'ApiError' };
                        return;
                    }
                    switch (res.type) {
                        case 'group': // club1
                        case 'page': // public1
                            requestState = {
                                kind: 'Finished',
                                result: { kind: 'Group', groupId: res.object_id },
                            };
                            break;
                        case 'vk_app': {
                            requestState = {
                                kind: 'Finished',
                                result: {
                                    kind: 'App',
                                    appId: res.object_id,
                                    groupId: res.group_id,
                                    // hash всегда берется из конструктора с #, она нам не нужна в роуте, убираем ее
                                    hash: new URL(href).hash.slice(1),
                                },
                            };
                            break;
                        }
                        case 'application':
                        case 'community_application':
                        case 'internal_vkui':
                        case 'user':
                        case 'event':
                            requestState = { kind: 'Unsupported' };
                            break;
                        default:
                            const _typeguard = res.type;
                            requestState = { kind: 'Unsupported' };
                    }
                    if (wasClicked) {
                        switch (requestState.kind) {
                            case 'Finished':
                                handleScreenNameRouteClick(requestState.result);
                                return;
                            case 'Unsupported': {
                                $ref.current.click();
                                return;
                            }
                            default:
                                exhaustivenessCheck(requestState);
                        }
                    }
                }
                catch (err) {
                    requestState = { kind: 'ApiError' };
                }
            };
        }
        return async (event) => {
            const to = IRouter.isProxyRoute(route)
                ? router.fromProxyRoute(route)
                : route;
            if (event) {
                event.stopPropagation();
                if (isMouseEventWithModifier(event)) {
                    return;
                }
            }
            // Просто откроем ссылку
            if (!to || to.kind === 'NotFoundRoute') {
                return;
            }
            // Откроем внутренний роут
            event?.preventDefault();
            if (to.kind === 'ChannelRoute') {
                navigate(applyParentRouteParam(router.screenRoute, to));
                return;
            }
            navigate(to);
        };
    }, [$ref, fetch, href, navigate, route, router]);
    useEffect(() => {
        const el = $ref.current;
        if (!el || route.kind !== 'ScreenNameProxyRoute' || disabled || onClick) {
            return;
        }
        const handleHover = () => handleClick();
        el.addEventListener('mouseenter', handleHover, { once: true });
        return () => {
            el.removeEventListener('mouseenter', handleHover);
        };
    }, [$ref, disabled, handleClick, onClick, route.kind]);
    const handleContextMenu = (e) => {
        // открываем нативное контекстное меню
        e.stopPropagation();
    };
    return (React.createElement(React.Fragment, null,
        React.createElement(ExternalLink, { ...props, href: href, ref: combinedRefsCallback, disabled: disabled, onContextMenu: handleContextMenu, onClick: onClick || handleClick }, displayName)));
});
//# sourceMappingURL=MessageText.js.map