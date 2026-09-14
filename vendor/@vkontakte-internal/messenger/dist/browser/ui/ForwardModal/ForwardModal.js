import { useCallback, useEffect, useMemo, useState } from 'react';
import { ModalInterface } from '../../ui/ModalInterface/ModalInterface';
import React from 'react';
import { useBrowserEnv, useChannels, useCommunityMessagingWithToggle, useDispatch, useFeatureFlags, useOwner, usePeers, usePrevious, useViewer, } from '../../hooks/misc';
import { PeerPickerList } from '../../ui/PeerPickerList/PeerPickerList';
import * as Convo from '../../../core/model/Convo';
import * as Channel from '../../../core/model/Channel';
import * as Post from '../../../core/model/Post';
import * as Comment from '../../../core/model/Comment';
import * as Viewer from '../../../core/model/Viewer';
import * as Attach from '../../../core/model/Attach';
import * as Message from '../../../core/model/Message';
import { ConvoPicker, } from '../../ui/ConvoPicker/ConvoPicker';
import './ForwardModal.css';
import { Tabs, TabsItem } from '@vkontakte-internal/vkcom-kit';
import { ChannelPicker, } from '../../ui/ChannelPicker/ChannelPicker';
import { useSnackbar } from '../../hooks/useSnackbar';
import { Icon24ChainOutline, Icon28CopyOutline, Icon28ErrorOutline, } from '@vkontakte/icons';
import { CopyText } from '../../ui/CopyText/CopyText';
import { exhaustivenessCheck } from '../../../core/utils/misc';
import { MAX_INT32 } from '../../../core/config/config';
import { ForwardModalComposer } from '../../ui/ForwardModalComposer/ForwardModalComposer';
import { API_ERROR_FLOOD, API_ERROR_MESSAGES_SPAM_RESTRICTION, API_ERROR_MESSAGES_TOO_LONG_MESSAGE, } from '@vkontakte-internal/api-schema-typescript';
import { PeerChipsSearchInputSecondary } from '../../ui/PeerChipsSearchInput/PeerChipsSearchInput';
import cx from 'classnames';
/** Макс. кол-во пиров к выбору для отправления им форварда */
export const MAX_FORWARD_TARGET_COUNT = 15;
export const ForwardModal = ({ entrypoint, forward, currentPeerId, initialStrategy, canChooseStrategy, openChannel, openConvo, close, withChannelsTab = true, handleCancelSelecting, ...props }) => {
    const { analyticsAppName, api, lang, router, vkcom_me: { viewerConvoPickerAppRenderer } = {}, } = useBrowserEnv();
    const peers = usePeers();
    const viewer = useViewer();
    const channels = useChannels();
    const owner = useOwner();
    const dispatch = useDispatch();
    const { vkm_channel_name_to_community, vkm_channels_forward_as_text, vkm_channels_new_forwards, vkm_forward_clean_attachment, vkm_split_messages_music_video, } = useFeatureFlags();
    const isCommunityMessaging = useCommunityMessagingWithToggle();
    const [tab, setTab] = useState('convos');
    const [strategy, setStrategy] = useState(initialStrategy);
    const previousStrategy = usePrevious(strategy);
    const [targetPeersIds, setTargetPeersIds] = useState([]);
    const [composerInput, setComposerInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { profileType } = useViewer();
    const isEdu = Viewer.isEdu(profileType);
    const isMultipleStrtegyToggleAvailable = tab === 'convos' && canChooseStrategy && !isCommunityMessaging;
    const canSubmit = !!targetPeersIds.length;
    const toggleStrategy = () => {
        setStrategy((old) => {
            return old === 'singular' ? 'multiple' : 'singular';
        });
    };
    useEffect(() => {
        setStrategy(tab === 'viewer'
            ? 'multiple'
            : canChooseStrategy
                ? 'singular'
                : initialStrategy);
    }, [tab, canChooseStrategy, initialStrategy]);
    const snackbar = useSnackbar();
    const [searchQuery, setSearchQuery] = useState('');
    const groups = useMemo(() => {
        return Array.from(peers.values()).reduce((acc, peer) => {
            if (peer.kind === 'Group' &&
                peer.adminLevel >= 2 /* Peer.GroupAdminLevel.Editor */ &&
                peer.id !== currentPeerId) {
                acc.push(peer);
            }
            return acc;
        }, []);
    }, [peers, currentPeerId]);
    const sendToMultiplePeers = async () => {
        if (isLoading) {
            return;
        }
        const params = {
            peer_ids: targetPeersIds.join(','),
            random_id: Math.floor(Math.random() * MAX_INT32),
            message: composerInput,
        };
        const onRequestFailed = (err) => {
            let message = lang.use('me_forward_modal_error_toast_text');
            switch (err?.code) {
                case API_ERROR_MESSAGES_TOO_LONG_MESSAGE:
                    message = lang.use('me_forward_modal_length_error_toast_text');
                    break;
                case API_ERROR_FLOOD:
                case API_ERROR_MESSAGES_SPAM_RESTRICTION:
                    message = lang.use('me_message_send_floodcontrol_and_spamblock_error');
                    break;
                default:
                    break;
            }
            snackbar({
                message,
                before: React.createElement(Icon28ErrorOutline, { color: "var(--vkui--color_icon_negative)" }),
            });
        };
        const onRequestCompleted = (response) => {
            if (!Array.isArray(response)) {
                return;
            }
            handleCancelSelecting?.();
            if (Array.isArray(response) && response.some((i) => i.error)) {
                snackbar({
                    message: lang.use('me_forward_modal_error_toast_text'),
                    before: (React.createElement(Icon28ErrorOutline, { color: "var(--vkui--color_icon_negative)" })),
                });
            }
            else {
                close();
            }
        };
        switch (entrypoint) {
            case 'convo':
                if (forward?.kind !== "message" /* ComposerDraft.ForwardKind.Message */) {
                    break;
                }
                const messages = forward.items;
                const message = messages[0];
                const basePayload = { ...params, group_id: 0, from: analyticsAppName };
                setIsLoading(true);
                const videoOrAudioSeparatelyFromTheText = message.kind === 'Normal' &&
                    (!Message.isVideoOrAudioOnly(message) ||
                        vkm_split_messages_music_video);
                const shouldSendAttachesSeparatelyFromTheText = vkm_forward_clean_attachment &&
                    message.kind === 'Normal' &&
                    !Message.hasText(message) &&
                    Message.shouldSendAttachesSeparatelyFromTheText(message);
                const payload = shouldSendAttachesSeparatelyFromTheText
                    ? {
                        ...basePayload,
                        message: videoOrAudioSeparatelyFromTheText
                            ? ''
                            : basePayload.message,
                        attachment: Attach.ids(message.attaches, vkm_forward_clean_attachment).join(',') || undefined,
                    }
                    : {
                        ...basePayload,
                        forward: JSON.stringify({
                            owner_id: tab === 'viewer' ? owner.id : undefined,
                            peer_id: message.peerId,
                            conversation_message_ids: messages.map((m) => m.cmid),
                        }),
                    };
                api
                    .fetch('messages.send', payload)
                    .then((response) => {
                    if (shouldSendAttachesSeparatelyFromTheText &&
                        videoOrAudioSeparatelyFromTheText &&
                        composerInput) {
                        const linked_cmids = Message.createLinkedCmids(response);
                        return api
                            .fetch('messages.send', {
                            peer_ids: params.peer_ids,
                            random_id: Math.floor(Math.random() * MAX_INT32),
                            message: composerInput,
                            group_id: 0,
                            from: analyticsAppName,
                            linked_cmids,
                        })
                            .then(() => {
                            onRequestCompleted(response);
                        });
                    }
                    return onRequestCompleted(response);
                })
                    .catch(onRequestFailed)
                    .finally(() => setIsLoading(false));
                break;
            case 'channel':
                if (forward?.kind === "post" /* ComposerDraft.ForwardKind.Post */) {
                    const post = forward.items[0];
                    const isFromCommunityChannel = Post.isFromCommunityChannel(post);
                    setIsLoading(true);
                    api
                        .fetch('messages.send', {
                        ...params,
                        attachment: isFromCommunityChannel
                            ? `channel_message${post.channelId}_${post.cmid}`
                            : `wall${post.channelId}_${post.cmid}`,
                        group_id: 0,
                        from: analyticsAppName,
                    })
                        .then(onRequestCompleted)
                        .catch(onRequestFailed)
                        .finally(() => {
                        setIsLoading(false);
                    });
                    break;
                }
                else if (forward?.kind === "comment" /* ComposerDraft.ForwardKind.Comment */) {
                    const comment = forward.items[0];
                    setIsLoading(true);
                    api
                        .fetch('messages.send', {
                        ...params,
                        attachment: `wall_reply${comment.channelId}_${comment.cmid}`,
                        group_id: 0,
                        from: analyticsAppName,
                    })
                        .then(onRequestCompleted)
                        .catch(onRequestFailed)
                        .finally(() => {
                        setIsLoading(false);
                    });
                }
                break;
            default:
                exhaustivenessCheck(entrypoint);
        }
    };
    const onConvoSelected = (peerIds) => {
        switch (entrypoint) {
            case 'convo':
                if (strategy === 'singular') {
                    props.onConvoSelected?.(peerIds);
                }
                else {
                    setTargetPeersIds(peerIds);
                }
                break;
            case 'channel':
                if (strategy === 'singular') {
                    const peerId = peerIds[0];
                    if (peerId === undefined) {
                        break;
                    }
                    if (forward?.kind === "post" /* ComposerDraft.ForwardKind.Post */) {
                        const post = forward.items[0];
                        dispatch({
                            type: 'UserChangedComposerDraft',
                            kind: 'forward',
                            forward: {
                                kind: "post" /* ComposerDraft.ForwardKind.Post */,
                                items: [post],
                            },
                            peerId,
                            isPostponed: false,
                        });
                    }
                    else if (forward?.kind === "comment" /* ComposerDraft.ForwardKind.Comment */) {
                        const comment = forward.items[0];
                        dispatch({
                            type: 'UserChangedComposerDraft',
                            kind: 'forward',
                            forward: {
                                kind: "comment" /* ComposerDraft.ForwardKind.Comment */,
                                items: [comment],
                            },
                            peerId,
                            isPostponed: false,
                        });
                    }
                    openConvo({ peerId, entrypoint: 'forward_messages_target' });
                    break;
                }
                else {
                    setTargetPeersIds(peerIds);
                    break;
                }
            default:
                exhaustivenessCheck(entrypoint);
        }
    };
    const onChannelSelected = (peerIds) => {
        const peerId = peerIds[0];
        if (peerId === undefined) {
            return;
        }
        const channelId = Channel.resolveId(peerId);
        if (forward?.kind !== "post" /* ComposerDraft.ForwardKind.Post */) {
            return;
        }
        const post = forward.items[0];
        dispatch({
            type: 'UserChangedChannelComposerDraft',
            kind: 'forward',
            forward: {
                kind: "post" /* ComposerDraft.ForwardKind.Post */,
                items: [post],
            },
            channelId,
        });
        openChannel(channelId);
    };
    const forwardingPostURL = useMemo(() => {
        if (forward?.kind !== "post" /* ComposerDraft.ForwardKind.Post */) {
            return '';
        }
        const post = forward.items[0];
        if (Viewer.isEdu(viewer.profileType)) {
            return (router.toUrl({
                kind: 'SferumChannelProxyRoute',
                channelId: post.channelId,
                postCmid: post.cmid,
            }) || '');
        }
        const channel = post ? Channel.safeGet(channels, post.channelId) : null;
        if (post &&
            channel &&
            channel.kind !== 'ChannelRestricted' &&
            Channel.isCommunityChannel(channel) &&
            (vkm_channels_forward_as_text || vkm_channels_new_forwards)) {
            return Post.toPostChannelUrl(post);
        }
        return `https://vk.com/wall${forward.items[0].channelId}_${forward.items[0].cmid}`;
    }, [
        forward,
        viewer.profileType,
        router,
        vkm_channels_forward_as_text,
        channels,
        vkm_channels_new_forwards,
    ]);
    const forwardingPostOrCommentChannelURL = useMemo(() => {
        if (forward?.kind === "post" /* ComposerDraft.ForwardKind.Post */) {
            const post = forward.items[0];
            const channel = post ? Channel.safeGet(channels, post.channelId) : null;
            if (post &&
                channel &&
                channel.kind !== 'ChannelRestricted' &&
                Channel.isCommunityChannel(channel) &&
                vkm_channels_forward_as_text &&
                !vkm_channels_new_forwards) {
                return Post.toPostChannelUrl(post);
            }
            return undefined;
        }
        if (forward?.kind === "comment" /* ComposerDraft.ForwardKind.Comment */) {
            const comment = forward.items[0];
            const channel = comment
                ? Channel.safeGet(channels, comment.channelId)
                : null;
            if (comment &&
                channel &&
                channel.kind !== 'ChannelRestricted' &&
                Channel.isCommunityChannel(channel) &&
                vkm_channels_forward_as_text &&
                !vkm_channels_new_forwards) {
                return Comment.toCommentChannelUrl(comment);
            }
            return undefined;
        }
        return '';
    }, [
        forward,
        vkm_channels_forward_as_text,
        channels,
        vkm_channels_new_forwards,
    ]);
    const withCopyPostUrlButton = forward?.kind === "post" /* ComposerDraft.ForwardKind.Post */ && !searchQuery;
    const onPostUrlCopied = useCallback(() => {
        snackbar({
            message: lang.use('me_channel_post_link_copied_snackbar'),
            before: React.createElement(Icon28CopyOutline, { className: "CopyPostUrlSnackbarIcon" }),
        });
    }, [snackbar, lang]);
    const ConvoListRenderer = useCallback((props) => {
        const updatedItems = [
            ...props.items,
        ];
        if (withCopyPostUrlButton) {
            updatedItems.unshift(CopyLinkButtonElement(forwardingPostURL, lang.use('me_copy_post_url_action'), onPostUrlCopied));
        }
        const canSelect = updatedItems.filter((i) => i.selected).length < MAX_FORWARD_TARGET_COUNT;
        return (React.createElement(PeerPickerList, { ...props, items: updatedItems, withRestrictedDisabling: true, controlType: strategy === 'singular' ? 'arrow' : 'check', controlSide: "right", canSelect: canSelect }));
    }, [withCopyPostUrlButton, strategy, lang, forwardingPostURL, onPostUrlCopied]);
    const ChannelListRenderer = useCallback((props) => {
        const updatedItems = [
            ...props.items,
        ];
        if (withCopyPostUrlButton) {
            updatedItems.unshift(CopyLinkButtonElement(forwardingPostURL, lang.use('me_copy_post_url_action'), onPostUrlCopied));
        }
        return (React.createElement(PeerPickerList, { ...props, items: updatedItems, withRestrictedDisabling: true, controlType: "arrow", controlSide: "right" }));
    }, [withCopyPostUrlButton, onPostUrlCopied, lang, forwardingPostURL]);
    const ModalTitle = (React.createElement("div", { className: "ForwardModal__title" },
        React.createElement(Tabs, { mode: "accent", noMinWidth: true },
            React.createElement(TabsItem, { "aria-controls": "convos-tab", id: "meForwardModalConvosTab", selected: tab === 'convos', onClick: () => setTab('convos') }, isCommunityMessaging
                ? lang.use('me_forward_modal_community_convos_tab_title')
                : lang.use('me_forward_modal_convos_tab_title')),
            isCommunityMessaging && viewerConvoPickerAppRenderer && (React.createElement(TabsItem, { "aria-controls": "viewer-tab", id: "meForwardModalViewerTab", selected: tab === 'viewer', onClick: () => setTab('viewer') }, lang.use('me_forward_modal_community_viewer_tab_title'))),
            entrypoint === 'channel' &&
                withChannelsTab &&
                forward?.kind !== "comment" /* ComposerDraft.ForwardKind.Comment */ &&
                groups.length > 0 && (React.createElement(TabsItem, { "aria-controls": "channels-tab", id: "meForwardModalChannelsTab", selected: tab === 'channels', onClick: () => setTab('channels') }, !isEdu && vkm_channel_name_to_community
                ? lang.use('me_forward_modal_channels_community_tab_title')
                : lang.use('me_forward_modal_channels_tab_title')))),
        isMultipleStrtegyToggleAvailable && (React.createElement("button", { className: "ForwardModalTitle__multipickToggler", onClick: toggleStrategy }, strategy === 'singular'
            ? lang.use('me_forward_modal_multipick_open')
            : lang.use('me_forward_modal_multipick_close')))));
    const forwardListFilter = (convo) => {
        return (Convo.canForwardTo(convo) || Convo.isRestrictedToWrite(convo, viewer.id));
    };
    return (React.createElement(ModalInterface, { onClose: close, contextClass: "MEAppConfig", headerClass: "ForwardModal__header", closeLabel: lang.use('me_close'), title: ModalTitle, withCustomLayout: true },
        React.createElement("div", { className: "ForwardModal__wrapper" },
            React.createElement("div", { className: "ForwardModal__body" },
                tab === 'convos' && (React.createElement(ConvoPicker, { className: cx('ForwardModal__picker', {
                        'ForwardModal__picker--singular': strategy === 'singular',
                    }), strategy: strategy, previousStrategy: previousStrategy, listRenderer: ConvoListRenderer, templateItemsCount: withCopyPostUrlButton ? 1 : 0, listFilter: forwardListFilter, searchRenderer: PeerChipsSearchInputSecondary, withFavorites: owner.kind !== 'Group', onSelectionChange: onConvoSelected, onQueryChange: setSearchQuery })),
                tab === 'viewer' &&
                    viewerConvoPickerAppRenderer &&
                    viewerConvoPickerAppRenderer({
                        className: cx('ForwardModal__picker', {
                            'ForwardModal__picker--singular': strategy === 'singular',
                        }),
                        listFilter: forwardListFilter,
                        listRenderer: ConvoListRenderer,
                        onQueryChange: setSearchQuery,
                        onSelectionChange: onConvoSelected,
                        searchRenderer: PeerChipsSearchInputSecondary,
                        templateItemsCount: withCopyPostUrlButton ? 1 : 0,
                        withFavorites: true,
                    }),
                tab === 'channels' && (React.createElement(ChannelPicker, { className: "ForwardModal__picker", groups: groups, listRenderer: ChannelListRenderer, templateItemsCount: withCopyPostUrlButton ? 1 : 0, onSelectionChange: onChannelSelected, onQueryChange: setSearchQuery }))),
            strategy === 'multiple' && (React.createElement("div", { className: "ForwardModal__footer" },
                React.createElement(ForwardModalComposer, { isDisabled: !canSubmit, onChange: setComposerInput, value: forwardingPostOrCommentChannelURL, send: sendToMultiplePeers }))))));
};
function CopyLinkButtonElement(textToCopy, buttonText, onCopy) {
    return {
        id: 'copy-post-link',
        item: {
            kind: 'template',
            id: 'copy-post-link',
            node: (React.createElement(CopyText, { text: textToCopy, onCopyDone: onCopy },
                React.createElement("span", { className: "CopyPostUrlButton" },
                    React.createElement("span", { className: "CopyPostUrlButton__icon", "aria-hidden": true },
                        React.createElement(Icon24ChainOutline, { color: "var(--vkui--color_text_accent)" })),
                    React.createElement("span", { className: "CopyPostUrlButton__label" }, buttonText)))),
        },
        selected: false,
        disabled: false,
        focusedWithNavigation: false,
    };
}
//# sourceMappingURL=ForwardModal.js.map