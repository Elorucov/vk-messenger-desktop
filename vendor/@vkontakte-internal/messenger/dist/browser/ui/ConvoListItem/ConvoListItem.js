import '../../ui/ConvoListItem/ConvoListItem.css';
import React, { useMemo, useRef } from 'react';
import cx from 'classnames';
import { useBrowserEnv, useOwner, useFeatureFlags, useTypings, usePeer, useStoreState, useDidUpdate, useDispatch, useCommunityMessagingWithToggle, useOrganisers, } from '../../hooks/misc';
import * as Convo from '../../../core/model/Convo';
import * as Message from '../../../core/model/Message';
import * as Peer from '../../../core/model/Peer';
import * as ComposerDraft from '../../../core/model/ComposerDraft';
import * as TextChunk from '../../../core/model/TextChunk';
import * as History from '../../../core/model/History';
import * as RemindAnswerToMessage from '../../../core/model/RemindAnswerToMessage';
import { Icon12Bomb, Icon12Clock, Icon12ErrorCircleFill, Icon12Mention, Icon12Stars, Icon16Cancel, Icon16CheckDoubleOutline, Icon16MoreHorizontal, Icon16MoreVertical, Icon16Pin, Icon16StarAlt, } from '@vkontakte/icons';
import { Avatar } from '../../ui/Avatar/Avatar';
import { ConvoTitle } from '../../ui/ConvoTitle/ConvoTitle';
import { getAttachmentPreview, MessagePreview, } from '../../ui/MessagePreview/MessagePreview';
import { UnreadCounter } from '../../ui/UnreadCounter/UnreadCounter';
import { TypingIndicator } from '../../ui/TypingIndicator/TypingIndicator';
import { AvatarFavorites } from '../../ui/AvatarFavorites/AvatarFavorites';
import { Dropdown } from '../../ui/Dropdown/Dropdown';
import { MessagePreviewPlaceholder } from '../../ui/MessagePreview/MessagePreviewPlaceholder';
import { Tooltip } from '../../ui/Tooltip/Tooltip';
import { getMessageOutStatusIconType, MessageOutStatusIcon, } from '../../ui/MessageOutStatusIcon/MessageOutStatusIcon';
import { ContextMenu } from '../../ui/ContextMenu/ContextMenu';
import { ConvoListItemActionsMenu, } from '../../ui/ConvoListItemActionsMenu/ConvoListItemActionsMenu';
import { ConvoListItemTags } from '../../ui/ConvoListItemTags';
import { Time as TimeComponent } from '../../ui/Time/Time';
import { isMouseEventWithModifier, isTouchScreen } from '../../utils/misc';
import { useHover } from '../../hooks/useHover';
import { useFastActionsState } from '../../hooks/useFastActionsState';
import { useComposerDraft } from '../../hooks/useComposerDraft';
import { useFormattedDate } from '../../hooks/useFormattedDate';
import { getOwnerGroupId } from '../../../data/store/State';
import { useFastActionsTrigger } from '../../hooks/useFastActionsTrigger';
import { useLayoutData } from '../../ui/LayoutDataProvider/LayoutDataProvider';
import { VisuallyHidden } from '@vkontakte-internal/vkcom-kit';
import { DeferredRendering } from '../../ui/DeferredRendering/DeferredRendering';
export const ConvoListItem = React.memo(function ConvoListItem({ convo, isSelected, selectedOrganiser, isCollapsed, withPinIcon = true, onClick, onActionRejectMR, onContextMenuAction, setConvoScrollFocusItem, isNavigationActive, onActionsOpenChange, ...ariaAttributes }) {
    const { lang, stats } = useBrowserEnv();
    const owner = useOwner();
    const peer = usePeer(convo.peerId);
    const remindAnswerToMessage = useStoreState('remindAnswerToMessage');
    const isImportant = Convo.isImportant(convo);
    const organisers = useOrganisers();
    const isCommunityMessaging = useCommunityMessagingWithToggle();
    const { isMobileLayout } = useLayoutData();
    const tags = useMemo(() => {
        const tagsIds = convo.tags;
        const adsTag = convo.adsTag;
        if (!isCommunityMessaging || !(tagsIds?.size || adsTag)) {
            return [];
        }
        return [
            ...(adsTag?.ad_id
                ? [
                    {
                        adId: adsTag.ad_id,
                        hasAdAccess: adsTag.has_ad_access,
                        isEasyPromotedMarket: adsTag.is_easy_promoted_market,
                        isMailRuAd: adsTag.is_mail_ru_ad,
                    },
                ]
                : []),
            ...(tagsIds?.size
                ? organisers.tags.items.filter((tag) => tagsIds.has(tag.id))
                : []),
        ];
    }, [convo.adsTag, convo.tags, isCommunityMessaging, organisers.tags.items]);
    const lastMessage = History.lastNode({
        history: convo.history,
        withDeleted: false,
        withPending: true,
        withFailed: true,
    })?.item;
    const withReplyButton = Convo.canSendReactions(convo) && lastMessage?.cmid
        ? RemindAnswerToMessage.checkMessageHasMark(remindAnswerToMessage, convo.peerId, lastMessage.cmid)
        : false;
    useDidUpdate(() => {
        if (!lastMessage) {
            return;
        }
        stats.logEvent({
            type: 'type_action',
            type_action: {
                type: 'type_messaging_action_item',
                type_messaging_action_item: {
                    action_type: withReplyButton
                        ? 'show_do_you_wanna_reply_chat'
                        : 'click_do_you_wanna_reply_chat',
                    label: Message.isClipOnly(lastMessage) ? 'clip' : 'post',
                    peer_id: convo.peerId,
                    group_id: getOwnerGroupId(owner.id),
                },
            },
        });
    }, [withReplyButton]);
    const fastActionsTrigger = useFastActionsTrigger();
    const { isDropdownFastActionsOpened, isContextMenuFastActionsOpened, openDropdownFastActions, openContextMenuFastActions, closeDropdownFastActions, closeContextMenuFastActions, } = useFastActionsState();
    const openActions = () => {
        openDropdownFastActions();
        onActionsOpenChange(true);
    };
    const closeActions = () => {
        closeDropdownFastActions();
        onActionsOpenChange(false);
    };
    const $ref = useRef(null);
    const [wrapperRefCallback, isWrapperHovered] = useHover();
    const isFavorites = Peer.isFavorites(peer.id, owner.id);
    const activeCall = convo.kind === 'ChatConvo' && convo.activeCall
        ? convo.activeCall.participants.count > 0
            ? 'filled'
            : 'empty'
        : undefined;
    const handleContextMenuAction = (action) => onContextMenuAction?.(action, convo);
    const handleClick = (event) => {
        const openInNewTab = isMouseEventWithModifier(event);
        if (!isSelected || openInNewTab) {
            onClick(convo.peerId, openInNewTab);
            return;
        }
        setConvoScrollFocusItem(convo.peerId, {
            kind: 'bottom',
            shouldMoveFocus: true,
        });
    };
    // TODO: выпилить после рефакторинга Dropdown; не забыть убрать eventListener в <ConvoList/>
    // отдельный компонент для навигации, т.к DD некорректно триггерит
    // фокусы/блюры/хоткеи, если ему в зависимости от переменной
    // isNavigationActive передавать разный openType
    const actionNavigationButton = fastActionsTrigger.button !== 'tap' && (React.createElement(DeferredRendering, null,
        React.createElement(Dropdown, { disableInert: true, enableFocusTrap: true, open: isDropdownFastActionsOpened, onOpen: openActions, onClose: closeActions, content: React.createElement(ConvoListItemActionsMenu, { isSelected: isSelected, convo: convo, selectedOrganiser: selectedOrganiser, onAction: handleContextMenuAction, className: "ConvoListItem__actionsMenu--right", dropdownActionOpenType: "click" }), adaptation: "vertical", align: "center", position: "right", openType: "click" },
            React.createElement("button", { type: "button", "aria-label": lang.use('me_convo_list_item_actions_a11y'), className: cx('ConvoListItem__action', 'ConvoListItem__action--navigating') },
                React.createElement(Icon16MoreHorizontal, null)))));
    const actionHoverButton = fastActionsTrigger.button === 'hover' && (React.createElement(DeferredRendering, null, convo.kind === 'MessageRequestChatConvo' ? (React.createElement(Tooltip, { content: lang.use('me_message_request_delete'), position: "top" },
        React.createElement("button", { type: "button", className: "ConvoListItem__action", onClick: (e) => {
                e.stopPropagation();
                onActionRejectMR?.(convo);
            } },
            React.createElement(Icon16Cancel, null)))) : (React.createElement(Dropdown, { enableFocusTrap: true, disableInert: true, delay: 300, open: isDropdownFastActionsOpened, onOpen: openActions, onClose: closeActions, content: React.createElement(ConvoListItemActionsMenu, { isSelected: isSelected, convo: convo, selectedOrganiser: selectedOrganiser, onAction: handleContextMenuAction, className: "ConvoListItem__actionsMenu--right", dropdownActionOpenType: "hover" }), adaptation: "vertical", align: "center", position: "right", openType: "hover-click", hideOnClick: true, classNames: {
            wrapper: `${isCollapsed ? 'ConvoListItem__dropdownWrapper' : ''} ${isCollapsed && !isWrapperHovered
                ? 'ConvoListItem__dropdownWrapper--hide'
                : ''}`,
        } },
        React.createElement("button", { type: "button", "aria-label": lang.use('me_convo_list_item_actions_a11y'), className: "ConvoListItem__action" },
            React.createElement(Icon16MoreHorizontal, null))))));
    const actionTapButton = fastActionsTrigger.button === 'tap' && (React.createElement(DeferredRendering, null,
        React.createElement("span", { onClick: (e) => {
                e.stopPropagation();
            } }, convo.kind === 'MessageRequestChatConvo' ? (React.createElement("button", { type: "button", className: "ConvoListItem__action", onClick: () => {
                onActionRejectMR?.(convo);
            } },
            React.createElement(Icon16Cancel, null))) : (React.createElement(Dropdown, { open: isDropdownFastActionsOpened, onOpen: openActions, onClose: closeActions, content: React.createElement(ConvoListItemActionsMenu, { isSelected: isSelected, convo: convo, selectedOrganiser: selectedOrganiser, onAction: handleContextMenuAction, className: isMobileLayout
                    ? undefined
                    : 'ConvoListItem__actionsMenu--bottom', dropdownActionOpenType: "click" }), adaptation: "horizontal", align: "right", position: "bottom", openType: "click", adaptive: true, hideOnClick: true },
            React.createElement("button", { type: "button", "aria-label": lang.use('me_actions_more'), className: cx('ConvoListItem__action', 'ConvoListItem__actionTap') },
                React.createElement(Icon16MoreVertical, null),
                React.createElement("div", { className: "ConvoListItem__actionTapArea" })))))));
    const convoTitle = Peer.isFavorites(peer.id, owner.id)
        ? lang.use('me_favorites')
        : Peer.name(peer);
    const convoAvatar = (React.createElement(DeferredRendering, { fallback: React.createElement("div", { className: "ConvoListItem__avatar" }) },
        React.createElement("div", { className: "ConvoListItem__avatar" }, isFavorites ? (React.createElement(AvatarFavorites, { size: !isCollapsed ? 48 : 40 })) : (React.createElement(Avatar, { peer: peer, size: !isCollapsed ? 48 : 40, withOnline: true, activeCall: activeCall, withBirthday: !isCollapsed || !isWrapperHovered, isCollapsed: isCollapsed })))));
    return (React.createElement("div", { ref: wrapperRefCallback, role: "none", className: cx('ConvoListItemWrapper', {
            'ConvoListItemWrapper--collapsed': isCollapsed,
        }) },
        React.createElement("button", { ref: $ref, className: cx('ConvoListItem', fastActionsTrigger.button === 'tap'
                ? 'ConvoListItem--tap'
                : 'ConvoListItem--click', {
                'ConvoListItem--selected': isSelected,
                'ConvoListItem--muted': Convo.isMuted(convo),
            }), role: "listitem", onClick: handleClick, onAuxClick: (e) => e.button === 1 && handleClick(e), ...ariaAttributes },
            isCollapsed ? (React.createElement(Tooltip, { align: "right", delay: 500, content: convoTitle, position: "right" }, convoAvatar)) : (convoAvatar),
            React.createElement("div", { className: "ConvoListItem__header" },
                React.createElement(ConvoTitle, { peer: peer, isMuted: Convo.isMuted(convo), isCasper: Convo.isCasper(convo), isForbidedWritingForAll: Convo.isForbidedWritingForAll(convo) && !Convo.isDisabled(convo), ImportantMarker: isCommunityMessaging &&
                        (isImportant ||
                            (isWrapperHovered && !isMobileLayout && !isTouchScreen())) ? (React.createElement(ImportantMarker, { isImportant: isImportant, peerId: convo.peerId })) : null, deferMarkersRendering: true }),
                !!tags?.length && (React.createElement(ConvoListItemTags, { className: "ConvoListItem__tags", tags: tags })),
                isNavigationActive ? actionNavigationButton : actionHoverButton),
            React.createElement(ConvoListItemText, { convo: convo, lastMessage: lastMessage, isCurrentConvo: isSelected }),
            React.createElement("div", { className: cx('ConvoListItem__icons', {
                    'ConvoListItem__icons--hide': isCollapsed && isWrapperHovered,
                }) },
                React.createElement(Icons, { convo: convo, lastMessage: lastMessage, isCollapsed: isCollapsed, withPinIcon: withPinIcon, withReplyButton: withReplyButton, isWrapperHovered: isWrapperHovered }),
                actionTapButton)),
        fastActionsTrigger.rightClick && (React.createElement(DeferredRendering, null,
            React.createElement(ContextMenu, { ref: $ref, allowNativeContextMenu: true, open: isContextMenuFastActionsOpened, onOpen: () => {
                    openContextMenuFastActions();
                    onActionsOpenChange(true);
                }, onClose: () => {
                    closeContextMenuFastActions();
                    onActionsOpenChange(false);
                }, content: React.createElement(ConvoListItemActionsMenu, { isSelected: isSelected, convo: convo, selectedOrganiser: selectedOrganiser, onAction: handleContextMenuAction, dropdownActionOpenType: fastActionsTrigger.button === 'tap' ? 'click' : 'hover' }) })))));
});
const ConvoListItemText = ({ convo, lastMessage, isCurrentConvo }) => {
    const { lang } = useBrowserEnv();
    const featureFlags = useFeatureFlags();
    const lastMessageAuthor = usePeer(lastMessage?.authorId);
    const authorFullName = useAuthorName(convo, lang, false, lastMessage, lastMessageAuthor);
    const authorShortName = useAuthorName(convo, lang, true, lastMessage, lastMessageAuthor);
    const hoverPreview = featureFlags.vkm_message_preview_on_hover && lastMessage
        ? getHoverMessagePreview(lastMessage, authorFullName, lang)
        : '';
    const draftedConvoMessageForPreview = useDraftedConvoMessageForPreview(convo);
    return (React.createElement("div", { className: "ConvoListItem__message", title: hoverPreview },
        React.createElement(Typing, { convo: convo },
            React.createElement(React.Fragment, null,
                React.createElement("span", { className: "ConvoListItem__text" }, draftedConvoMessageForPreview &&
                    (!isCurrentConvo || Convo.isEmpty(convo)) ? (React.createElement(React.Fragment, null,
                    React.createElement("span", { className: "ConvoListItem__draftLabel" },
                        lang.use('me_convo_list_item_draft_label'),
                        ' '),
                    React.createElement(MessagePreview, { message: draftedConvoMessageForPreview }))) : (React.createElement(React.Fragment, null,
                    authorShortName && (React.createElement(React.Fragment, null,
                        React.createElement("span", { className: "ConvoListItem__author", "aria-hidden": true }, authorShortName),
                        React.createElement(VisuallyHidden, null, authorFullName))),
                    lastMessage ? (React.createElement(MessagePreview, { message: lastMessage })) : (React.createElement(MessagePreviewPlaceholder, { convo: convo }))))),
                React.createElement(ConvoListItemDate, { lastMessage: lastMessage })))));
};
const ConvoListItemDate = ({ lastMessage }) => {
    const [formattedDate, ariaVersionFormattedDate] = useFormattedDate(lastMessage?.sentAt);
    return (formattedDate &&
        ariaVersionFormattedDate &&
        lastMessage?.sentAt && (React.createElement(TimeComponent, { ariaVersionFormattedDate: ariaVersionFormattedDate, formattedDate: formattedDate, className: "ConvoListItem__date", withDot: true })));
};
const useAuthorName = (convo, lang, shortName = true, lastMessage, author) => {
    const owner = useOwner();
    const isGroupChannel = convo.kind === 'ChatConvo' && convo.isGroupChannel;
    if (!lastMessage || !author || lastMessage.kind === 'Service') {
        return '';
    }
    if (isGroupChannel) {
        return '';
    }
    if (convo.kind !== 'ChatConvo' && !lastMessage.isOut) {
        return '';
    }
    if (author.id === owner.id) {
        return lang.use('me_convo_list_author_you') + ' ';
    }
    return (lang.use('me_convo_list_author_name', {
        values: {
            name: shortName
                ? Peer.shortName(author, 'nom', false)
                : Peer.name(author),
        },
    }) + ' ');
};
const useDraftedConvoMessageForPreview = (convo) => {
    const draft = useComposerDraft(convo.peerId);
    if (ComposerDraft.isEmpty(draft, draft.text) || !convo.isDrafted) {
        return null;
    }
    const common = {
        attaches: draft.attaches,
        chunks: TextChunk.fromClientText(draft.text),
        sentAt: 0,
        isUnavailable: false,
        authorId: convo.peerId,
        peerId: convo.peerId,
        cmid: Message.resolveCmid(0),
    };
    if (draft.forward?.items.length) {
        return {
            ...common,
            kind: 'Foreign',
            rootPeerId: Peer.resolveId(1),
            rootCmid: Message.resolveCmid(0),
            rootRandomId: Message.resolveRandomId(0),
            forwardedMessages: draft.forward.items,
        };
    }
    if (draft.reply) {
        return {
            ...common,
            kind: 'Normal',
            isOut: true,
            isImportant: false,
            isPinned: false,
            reactions: new Map(),
            replyMessage: {
                authorId: draft.reply.authorId,
                cmid: draft.reply.cmid,
                sentAt: draft.reply.sentAt,
                kind: 'Foreign',
                isUnavailable: draft.reply.isUnavailable,
                chunks: [],
                attaches: {},
                rootPeerId: Peer.resolveId(1),
                rootCmid: Message.resolveCmid(0),
                rootRandomId: Message.resolveRandomId(0),
            },
        };
    }
    return {
        ...common,
        kind: 'Normal',
        isOut: true,
        isImportant: false,
        isPinned: false,
        reactions: new Map(),
    };
};
const Icons = ({ convo, lastMessage, isCollapsed, withPinIcon, withReplyButton, isWrapperHovered, }) => {
    const { lang, envFeatureFlags } = useBrowserEnv();
    const featureFlags = useFeatureFlags();
    const { isMobileLayout } = useLayoutData();
    const isUnread = Convo.isUnread(convo);
    const isMuted = Convo.isMuted(convo);
    const isUnanswered = Convo.isUnanswered(convo);
    const isCommunityMessaging = useCommunityMessagingWithToggle();
    const hasSendPostponedError = envFeatureFlags.isPostponedMessagesAvailable &&
        Convo.hasPostponedMessagesError(convo);
    const hasUnreadMentions = Convo.hasUnreadMentions(convo);
    const hasUnreadExpireables = Convo.hasUnreadExpireables(convo);
    const hasUnreadReactions = featureFlags.vkm_reactions && Convo.hasUnreadReactions(convo);
    const dispatch = useDispatch();
    const sendPostponedMessageErrorIcon = hasSendPostponedError ? (React.createElement("div", { className: "ConvoListItem__icon", role: "img" },
        React.createElement(Icon12ErrorCircleFill, { width: 18, height: 18 }))) : null;
    let unreadIcon;
    switch (true) {
        case hasUnreadMentions: {
            unreadIcon = (React.createElement("div", { className: "ConvoListItem__icon ConvoListItem__icon--unmute", role: "img", "aria-label": lang.use('me_convo_has_mentions') },
                React.createElement(Icon12Mention, null)));
            break;
        }
        case hasUnreadExpireables && isUnread: {
            unreadIcon = (React.createElement("div", { className: "ConvoListItem__icon", role: "img", "aria-label": lang.use('me_convo_has_expired') },
                React.createElement(Icon12Bomb, null)));
            break;
        }
        case hasUnreadReactions: {
            unreadIcon = (React.createElement("div", { className: cx('ConvoListItem__icon', {
                    'ConvoListItem__icon--unmute': !isMuted,
                }), role: "img" },
                React.createElement(Icon12Stars, null)));
            break;
        }
        default:
            unreadIcon = null;
    }
    const unansweredIcon = isCommunityMessaging &&
        !isMobileLayout &&
        !isTouchScreen() &&
        isUnanswered &&
        isWrapperHovered && (React.createElement(Tooltip, { align: "center", delay: 500, position: "top", content: lang.use('me_convo_action_mark_answered') },
        React.createElement("span", null,
            React.createElement(Icon16CheckDoubleOutline, { onClick: (event) => {
                    dispatch({
                        type: 'UserChangedConvo',
                        peerId: convo.peerId,
                        userAction: 'mark_answered',
                    });
                    event.stopPropagation();
                }, color: "var(--vkui--color_icon_tertiary)", "aria-label": lang.use('me_convo_action_mark_answered') }))));
    if (isUnread) {
        return (React.createElement(React.Fragment, null,
            unansweredIcon,
            sendPostponedMessageErrorIcon,
            unreadIcon,
            React.createElement(UnreadCounter, { count: convo.unreadCount, isMuted: isMuted, size: 18, className: isCollapsed
                    ? cx('ConvoListItem__icon ConvoListItem__icon--unreadCounter', {
                        'ConvoListItem__icon--muted': isMuted,
                    })
                    : '' })));
    }
    if (unreadIcon || sendPostponedMessageErrorIcon) {
        return (React.createElement(React.Fragment, null,
            sendPostponedMessageErrorIcon,
            unreadIcon));
    }
    if (unansweredIcon) {
        return unansweredIcon;
    }
    if (withReplyButton) {
        return (React.createElement("span", { className: "ConvoListItem__replyButton" }, lang.use('me_convo_list_item_reply')));
    }
    if (lastMessage?.isOut) {
        const messageOutStatusIconType = getMessageOutStatusIconType(lastMessage, Convo.isUnreadOut(convo));
        if (messageOutStatusIconType) {
            return (React.createElement(MessageOutStatusIcon, { type: messageOutStatusIconType, sendingIcon: React.createElement(Icon12Clock, null), className: "ConvoListItem__outStatusIcon", sendingIconColor: "var(--vkui--color_icon_secondary)", readIconColor: "var(--vkui--color_icon_accent)" }));
        }
    }
    const shouldShowPinIcon = withPinIcon && Convo.isPinned(convo);
    if (shouldShowPinIcon) {
        return (React.createElement("div", { className: "ConvoListItem__pinIcon" },
            React.createElement(Icon16Pin, { "aria-hidden": false, "aria-label": lang.use('me_convo_item_pinned') })));
    }
    return null;
};
/**
 * Вынесение в отдельный компонент оправдано частым
 * изменением тайпингов. Это позволило избавиться от
 * мемоизаций внутри ConvoListItemText.
 */
const Typing = ({ convo, children }) => {
    const typing = useTypings(convo.peerId, 'compact', convo.kind === 'ChatConvo' ? 2 : 0);
    if (!typing) {
        return children;
    }
    return (React.createElement("span", { className: "ConvoListItem__typing" },
        React.createElement(TypingIndicator, { className: "ConvoListItem__typingIndicator", type: typing.type, animationDuration: 1100 }),
        React.createElement("span", { className: "ConvoListItem__typingText" }, typing.text)));
};
/**
 * Генерируем текстовое превью, только для сотрудников
 */
function getHoverMessagePreview(message, authorPrefix, lang) {
    if (message.kind !== 'Normal' && message.kind !== 'Queued') {
        return '';
    }
    const LIMIT = 1000;
    let text = Message.toPlainText(message, { multiline: true });
    let attachmentPreview = getAttachmentPreview(message, lang) || '';
    if (text && attachmentPreview) {
        attachmentPreview = ` [${attachmentPreview}]`;
    }
    if (text.length + attachmentPreview.length > LIMIT) {
        text = text.slice(0, LIMIT - attachmentPreview.length) + '...';
    }
    return authorPrefix + text + attachmentPreview;
}
const ImportantMarker = ({ isImportant, peerId, }) => {
    const { lang } = useBrowserEnv();
    const dispatch = useDispatch();
    const { isMobileLayout } = useLayoutData();
    const handleClick = (event) => {
        dispatch({
            type: 'UserChangedConvo',
            peerId: peerId,
            userAction: isImportant ? 'mark_unimportant' : 'mark_important',
        });
        event.stopPropagation();
    };
    return (React.createElement(Tooltip, { align: "center", delay: 500, content: isImportant
            ? lang.use('me_convo_action_mark_unimportant')
            : lang.use('me_convo_mark_important_tooltip'), position: "top" },
        React.createElement("span", null,
            React.createElement(Icon16StarAlt, { className: cx('ConvoTitle__icon', !isImportant && 'ConvoTitle__icon--inactive'), color: "var(--vkui--color_icon_tertiary)", onClick: !isMobileLayout && !isTouchScreen() ? handleClick : undefined, "aria-label": isImportant
                    ? lang.use('me_convo_action_mark_unimportant')
                    : lang.use('me_convo_mark_important_aria_label') }))));
};
//# sourceMappingURL=ConvoListItem.js.map