import './ChatInviteModal.css';
import { Button } from '@vkontakte/vkui';
import cx from 'classnames';
import { useBrowserEnv, useViewer } from '../../hooks/misc';
import React, { useMemo } from 'react';
import { OptimizedSpinner } from '../../ui/OptimizedSpinner/OptimizedSpinner';
import * as Peer from '../../../core/model/Peer';
import * as Viewer from '../../../core/model/Viewer';
import { Link } from '../../ui/Link/Link';
import { Icon24Ghost, Icon20DonutCircleFillYellow as DonutChatIcon, Icon56MessageOutline, } from '@vkontakte/icons';
import { CHAT_PREVIEW_ERRORS_LANG_MAP as errors, } from './useChatPreview';
import { ModalInterface } from '../../ui/ModalInterface/ModalInterface';
import { ModalBackdrop } from '../../ui/ModalBackdrop/ModalBackdrop';
import { ModalView } from '../../ui/ModalView/ModalView';
import { getPeersInlineNames } from '../../utils/misc';
import { exhaustivenessCheck, getFirstLetter } from '../../../core/utils/misc';
import { UsersStack } from '../../ui/UsersStack/UsersStack';
import { BasicAvatar } from '../../ui/BasicAvatar/BasicAvatar';
import { ModalWindow } from '../../ui/ModalWindow/ModalWindow';
import { API_ERROR_FLOOD, API_ERROR_MESSAGES_SHOULD_BE_EDU, API_ERROR_MESSAGES_SHOULD_NOT_BE_EDU, } from '@vkontakte-internal/api-schema-typescript';
import { UnifiedServiceModal } from '../../ui/UnifiedServiceModal/UnifiedServiceModal';
import { useRouter } from '../../ui/Router/Router';
import { IRouter } from '../../../data/env/IRouter';
let isForceLoading = false;
export const ChatInviteModal = (props) => {
    const { handleClose, isLoading, error, onSetAccount, registerAccount } = props;
    const { lang, router, isEduAvailable } = useBrowserEnv();
    const viewer = useViewer();
    const { screenRoute, replace } = useRouter();
    const isEdu = Viewer.isEdu(viewer.profileType);
    const accountToSwitch = isEdu
        ? Viewer.mainAccount(viewer)
        : Viewer.eduAccount(viewer);
    const switchAccount = () => {
        if (!accountToSwitch) {
            if (isEdu) {
                switch (screenRoute.kind) {
                    case 'ConvoRoute':
                    case 'ChatJoinRoute':
                    case 'MainRoute':
                        if (!screenRoute.chatJoinHash) {
                            return;
                        }
                        const { url } = router.fromEntity({
                            kind: 'ChatJoinProxyRoute',
                            joinHash: screenRoute.chatJoinHash,
                        }, IRouter.Action.Push);
                        if (!url) {
                            return;
                        }
                        window.open(url, '_blank');
                        break;
                    case 'ChannelRoute':
                    case 'ChannelsFolderRoute':
                    case 'CallJoinRoute':
                    case 'CallJoinShortenedRoute':
                    case 'NotFoundRoute':
                    case 'SettingsRoute':
                    case 'SpaceRoute':
                    case 'SpaceRoomRoute':
                        return;
                    default:
                        exhaustivenessCheck(screenRoute);
                }
            }
            else {
                registerAccount('edu');
            }
            return;
        }
        if (screenRoute.kind === 'ConvoRoute' && screenRoute.chatJoinHash) {
            isForceLoading = true;
            replace({
                kind: 'MainRoute',
                chatJoinHash: screenRoute.chatJoinHash,
            });
        }
        onSetAccount(accountToSwitch.id, false);
    };
    // Состояние загрузки
    if (isLoading || isForceLoading) {
        return (React.createElement(ModalView, { contextClass: "MEConfig" },
            React.createElement(ModalBackdrop, null,
                React.createElement(OptimizedSpinner, { size: "xl", className: "ChatInvitePanel__spinner" }))));
    }
    if (!isEduAvailable && error === API_ERROR_MESSAGES_SHOULD_BE_EDU) {
        // Не показываем модальное окно переключения на учебный профиль в интеграции
        return null;
    }
    if (error) {
        const actionButton = (React.createElement(Button, { onClick: switchAccount, stretched: true, size: "l", className: cx('ChatInvitePanel__button', {
                'ChatInvitePanel__button--edu': isEdu,
            }) }, lang.use('me_proceed')));
        const icon = (React.createElement("div", { className: cx('ChatInvitePanel__icon', {
                'ChatInvitePanel__icon--edu': isEdu,
            }) },
            React.createElement(Icon56MessageOutline, null)));
        switch (error) {
            case API_ERROR_MESSAGES_SHOULD_BE_EDU:
                return (React.createElement(UnifiedServiceModal, { handleModalClose: handleClose, title: lang.use('me_chat_join_edu_account_error_caption'), subtitle: lang.use('me_chat_join_edu_account_error_description'), image: icon, footer: actionButton }));
            case API_ERROR_MESSAGES_SHOULD_NOT_BE_EDU:
                return (React.createElement(UnifiedServiceModal, { handleModalClose: handleClose, title: lang.use('me_chat_join_vkm_account_error_caption'), subtitle: lang.use('me_chat_join_vkm_account_error_description'), image: icon, footer: actionButton }));
            default:
        }
    }
    if (error !== undefined) {
        return (React.createElement(ModalInterface, { title: error === API_ERROR_FLOOD
                ? lang.use('me_try_later')
                : lang.use('me_error_title'), closeLabel: lang.use('me_close'), onClose: handleClose, onBack: handleClose, contextClass: "MEConfig", panelClass: "ChatInvitePanel__panel", buttons: React.createElement(Button, { mode: "primary", onClick: handleClose }, error === API_ERROR_FLOOD
                ? lang.use('me_got_it')
                : lang.use('me_close')) },
            React.createElement("div", { className: "ChatInviteModal--error" },
                React.createElement("p", null, lang.use(errors[error] || 'me_unknown_error')))));
    }
    return (React.createElement(ModalWindow, { onClose: handleClose },
        React.createElement(ChatInvitePanel, { ...props })));
};
export const ChatInvitePanel = (props) => {
    const { lang } = useBrowserEnv();
    const { plain = false, actionsButtons, senderPeer, preview, peersCache, } = props;
    const { isDisappearing: isCasper, isDonut, title, photo, membersCount, members: membersProp, } = preview;
    const members = (membersProp ?? [])
        .slice(0, 3)
        .map((id) => Peer.safeGet(peersCache, id));
    const photos = useMemo(() => members
        .map((member) => member.photo)
        .filter((photo) => photo !== undefined), [members]);
    const memberRenderer = (member) => {
        const name = Peer.firstName(member);
        return (React.createElement("span", { key: member.id, className: cx('ChatInvitePanel__memberLinkWrapper') },
            React.createElement(Link, { className: "ChatInvitePanel__memberLink", to: {
                    kind: 'PeerPanel',
                    peerId: member.id,
                    screenName: Peer.screenName(member),
                } }, name)));
    };
    const names = getPeersInlineNames(members, membersCount, memberRenderer, lang);
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: cx('ChatInvitePanel', { 'ChatInvitePanel--plain': plain }) },
            React.createElement("div", { className: "ChatInvitePanel__avatarAndTitleContainer" },
                React.createElement("div", { className: "ChatInvitePanel__avatarContainer" },
                    React.createElement(BasicAvatar, { size: 72, content: getFirstLetter(preview.title ?? ''), picture: photo.photo, alt: title }),
                    isCasper && React.createElement(CasperChatIcon, null),
                    isDonut && (React.createElement(DonutChatIcon, { className: "ChatInvitePanel__donutIcon" }))),
                React.createElement("h3", { className: "ChatInvitePanel__title" }, title),
                senderPeer !== undefined && (React.createElement("div", { className: "ChatInvitePanel__senderName" }, lang.use('me_chat_invite_from', {
                    values: {
                        senderName: Peer.name(senderPeer, 'gen'),
                    },
                }))),
                isDonut && (React.createElement("p", { className: "ChatInvitePanel__description" }, lang.use('me_donut_chat_preview_text'))),
                isCasper && (React.createElement("p", { className: "ChatInvitePanel__description" }, lang.use('me_casper_chat_preview_text')))),
            names !== null && (React.createElement("div", { className: "ChatInvitePanel__membersContainer" },
                members.length !== 0 && (React.createElement(UsersStack, { size: 32, count: membersCount, photos: photos, className: "ChatInvitePanel__usersStack" })),
                React.createElement("span", { className: "ChatInvitePanel__members" }, names))),
            React.createElement("div", { className: "ChatInvitePanel__actionsButtons" }, actionsButtons))));
};
const CasperChatIcon = () => (React.createElement("span", { className: "ChatInvitePanel__casperIcon" },
    React.createElement(Icon24Ghost, { width: 16, height: 16 })));
//# sourceMappingURL=ChatInviteModal.js.map