import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { BannerButton, BannerButtonTypeCallback, BannerButtons, BannerIcon, BannerPanel, BannerText, } from '../../ui/BannerPanel/BannerPanel';
import * as Peer from '../../../core/model/Peer';
import { MessageText } from '../../ui/MessageText/MessageText';
import { useModal } from '../../hooks/useModal';
import { MRRejectConfirmationModal } from '../../ui/MRRejectConfirmationModal/MRRejectConfirmationModal';
import { ModalView } from '../../ui/ModalView/ModalView';
import { ModalBackdrop } from '../../ui/ModalBackdrop/ModalBackdrop';
import { ModalPanel } from '../../ui/ModalPanel/ModalPanel';
import { ModalBody } from '../../ui/ModalBody/ModalBody';
import { ModalFooter } from '../../ui/ModalFooter/ModalFooter';
import { Button } from '@vkontakte/vkui';
import { Icon56DataStackLockOutline } from '@vkontakte/icons';
import { useBrowserEnv, useDispatch } from '../../hooks/misc';
import { SpamReportConfirmModal } from '../../ui/SpamReportConfirmModal/SpamReportConfirmModal';
import './ConvoBanner.css';
import { prepareLink } from '../../../core/utils/links';
import { exhaustivenessCheck } from '../../../core/utils/misc';
import { UNKNOWN_SENDER_ANALYTICS_BANNER_NAMES, useUnknownSenderAnalytics, } from '../../hooks/useUnknownSenderAnalytics';
const BANNERS_SHOULD_NOT_HIDE_ON_SERVER_MAP = {
    business_notify_banner: true,
};
export const ConvoBanner = ({ isCompact, peerId, banner, closeConvo, onBirthdayBannerClickButton, }) => {
    const [isVisible, setIsVisible] = useState(true);
    const { vkDomain, api } = useBrowserEnv();
    const dispatch = useDispatch();
    const { name, icon, title, buttons, canHide } = banner;
    const { sendHideEvent, sendShowEvent } = useUnknownSenderAnalytics(peerId, {
        bannerName: name,
        isUser2IdRequired: true,
    });
    const rejectMRModal = useModal();
    const businessNotifyInfo = useModal();
    const spamReportConfirmModal = useModal();
    const [spamCallbackData, setSpamCallbackData] = useState('');
    const [isTextOverflowing, setTextOverflowing] = useState();
    let forcedPanelMode = undefined;
    if (isTextOverflowing && banner.buttons.length > 0) {
        forcedPanelMode = 'twoLines';
    }
    const onBannerClose = useCallback(async ({ source, } = {}) => {
        setIsVisible(false);
        if (!BANNERS_SHOULD_NOT_HIDE_ON_SERVER_MAP[name]) {
            try {
                await api.fetch('messages.conversationBarHide', {
                    name,
                    peer_id: peerId,
                    source,
                });
            }
            catch {
                // pass
            }
        }
    }, [api, name, peerId]);
    useEffect(() => {
        if (UNKNOWN_SENDER_ANALYTICS_BANNER_NAMES.includes(name)) {
            sendShowEvent({ firstSendingOnly: true });
        }
    }, [name, sendShowEvent]);
    // @TODO: избавиться от вайтлиста после поддержки всех баннеров
    if (name !== 'employees_banner' &&
        name !== 'spam_dialog' &&
        name !== 'spam_chat_global' &&
        name !== 'message_request_banner' &&
        name !== 'business_notify_banner' &&
        name !== 'mail_verified_community' &&
        name !== 'verified_community' &&
        name !== 'friend_send_request' &&
        name !== 'friend_accept_request' &&
        name !== 'spam_chat_invite_banner' &&
        name !== 'hacked_dialog' &&
        name !== 'birthday' &&
        name !== 'cta_online_booking' &&
        name !== 'not_friend') {
        return null;
    }
    const handleButtonClick = (button) => {
        switch (button.type) {
            case 'spam':
            case 'antispam':
                if (button.type === 'antispam') {
                    setSpamCallbackData(button.callbackData);
                }
                spamReportConfirmModal.open();
                break;
            case 'hide_banner':
                if (UNKNOWN_SENDER_ANALYTICS_BANNER_NAMES.includes(name)) {
                    sendHideEvent();
                }
                dispatch({
                    type: 'UserHideConvoBanner',
                    name: banner.name,
                    peerId,
                });
                break;
            case 'reject_mr':
                rejectMRModal.open();
                break;
            case 'business_notify':
                businessNotifyInfo.open();
                break;
            case 'link':
                window.open(prepareLink(vkDomain, button.link), '_blank');
                break;
            case 'gifts_link':
                onBirthdayBannerClickButton?.();
                break;
            default:
                break;
        }
        if (button.hideOnAction) {
            void onBannerClose({ source: 'action' });
        }
    };
    const getActions = (panelMode) => buttons.map((button, id) => {
        const props = {
            handleClick: () => {
                handleButtonClick(button);
            },
            mode: panelMode === 'twoLines' && button.mode === 'tertiary'
                ? 'secondary'
                : button.mode,
            appearance: button.appearance,
            text: button.text,
            key: id,
        };
        if (button.type === 'callback') {
            return (React.createElement(BannerButtonTypeCallback, { peerId: peerId, callbackData: button.callbackData, ...props, closeBanner: button.hideOnAction ? onBannerClose : undefined }));
        }
        return React.createElement(BannerButton, { ...props });
    });
    const SpamReportModal = spamReportConfirmModal.isActive &&
        (Peer.isUserPeerId(peerId) || Peer.isChatPeerId(peerId)) && (React.createElement(SpamReportConfirmModal, { banner: banner, peerId: peerId, onClose: spamReportConfirmModal.close, reportRequestExtraData: `from_${name}`, callbackData: spamCallbackData }));
    switch (name) {
        case 'verified_community':
        case 'mail_verified_community':
        case 'employees_banner': {
            const mode = forcedPanelMode ?? 'oneLine';
            return (React.createElement(BannerPanel, { isVisible: isVisible, onBannerClose: canHide ? onBannerClose : undefined, isCompact: isCompact, mode: mode },
                React.createElement(BannerIcon, { icon: icon, title: title }),
                banner.chunks.length > 0 && (React.createElement(BannerText, { title: banner.title, onTextOverflowing: setTextOverflowing, isWrapping: isTextOverflowing },
                    React.createElement(MessageText, { chunks: banner.chunks }))),
                React.createElement(BannerButtons, { buttons: getActions(mode) }),
                SpamReportModal));
        }
        case 'spam_chat_global':
        case 'spam_dialog':
        case 'hacked_dialog': {
            return (React.createElement(BannerPanel, { isVisible: isVisible, onBannerClose: canHide ? onBannerClose : undefined, isCompact: isCompact, mode: "twoLines", noTransition: true },
                React.createElement(BannerIcon, { icon: icon, title: title }),
                banner.chunks.length > 0 && (React.createElement(BannerText, { title: banner.title, onTextOverflowing: setTextOverflowing, isWrapping: isTextOverflowing, isSecondary: true },
                    React.createElement(MessageText, { chunks: banner.chunks }))),
                React.createElement(BannerButtons, { buttons: getActions('twoLines') }),
                SpamReportModal));
        }
        case 'birthday': {
            const mode = forcedPanelMode ?? 'oneLine';
            return (React.createElement(BannerPanel, { isVisible: isVisible, onBannerClose: canHide ? onBannerClose : undefined, isCompact: isCompact, mode: mode },
                React.createElement(BannerIcon, { icon: icon, title: title }),
                React.createElement(BannerText, { title: banner.title, onTextOverflowing: setTextOverflowing, isWrapping: isTextOverflowing },
                    React.createElement(MessageText, { chunks: banner.chunks })),
                React.createElement(BannerButtons, { buttons: getActions('oneLine') }),
                rejectMRModal.isActive && Peer.isUserPeerId(peerId) && (React.createElement(MRRejectConfirmationModal, { peerId: peerId, onClose: rejectMRModal.close, onReject: closeConvo }))));
        }
        case 'spam_chat_invite_banner':
        case 'message_request_banner': {
            const mode = forcedPanelMode ?? 'oneLine';
            return (React.createElement(BannerPanel, { isVisible: isVisible, onBannerClose: canHide ? onBannerClose : undefined, isCompact: isCompact, mode: mode, noTransition: true },
                React.createElement(BannerIcon, { icon: icon, title: title }),
                React.createElement(BannerText, { title: banner.title, onTextOverflowing: setTextOverflowing, isWrapping: isTextOverflowing, isSecondary: true },
                    React.createElement(MessageText, { chunks: banner.chunks })),
                React.createElement(BannerButtons, { buttons: getActions(mode) }),
                rejectMRModal.isActive && Peer.isUserPeerId(peerId) && (React.createElement(MRRejectConfirmationModal, { peerId: peerId, onClose: rejectMRModal.close, onReject: closeConvo })),
                SpamReportModal));
        }
        case 'business_notify_banner': {
            const mode = forcedPanelMode ?? 'oneLine';
            return (React.createElement(BannerPanel, { isVisible: isVisible, onBannerClose: canHide ? onBannerClose : undefined, isCompact: isCompact, mode: mode },
                React.createElement(BannerIcon, { icon: icon, title: title }),
                React.createElement(BannerText, { title: banner.title, onTextOverflowing: setTextOverflowing, isWrapping: isTextOverflowing },
                    React.createElement(MessageText, { chunks: banner.chunks })),
                React.createElement(BannerButtons, { buttons: getActions(mode) }),
                businessNotifyInfo.isActive && (React.createElement(BusinessNotifyInfo, { onClose: businessNotifyInfo.close })),
                SpamReportModal));
        }
        case 'friend_accept_request':
        case 'friend_send_request': {
            if (isCompact)
                return null;
            return (React.createElement(BannerPanel, { isVisible: isVisible, onBannerClose: canHide ? onBannerClose : undefined, mode: "custom", contentStyles: {
                    gridTemplateAreas: `'icon buttons close'`,
                    // Резервируем 16px для icon area даже если ее нет, чтобы buttons area была ровно по центру
                    gridTemplateColumns: '16px 1fr auto',
                }, noTransition: true },
                React.createElement(BannerIcon, { icon: icon, title: title }),
                React.createElement(BannerButtons, { buttons: getActions('custom'), styles: { width: '100%', justifyContent: 'space-evenly' } }),
                SpamReportModal));
        }
        case 'cta_online_booking': {
            return (React.createElement(BannerPanel, { isVisible: isVisible, onBannerClose: canHide ? onBannerClose : undefined, isCompact: isCompact, mode: "oneLine" },
                React.createElement(BannerText, { title: banner.title, onTextOverflowing: setTextOverflowing, isWrapping: isTextOverflowing },
                    React.createElement(MessageText, { chunks: banner.chunks }))));
        }
        case 'not_friend': {
            if (isCompact)
                return null;
            return (React.createElement(BannerPanel, { isVisible: isVisible, onBannerClose: canHide ? onBannerClose : undefined, mode: "custom", contentStyles: {
                    gridTemplateAreas: `'icon text' '. buttons'`,
                    gridTemplateColumns: '24px 1fr',
                    padding: '10px',
                }, noTransition: true },
                React.createElement(BannerIcon, { icon: icon, title: title }),
                React.createElement("div", { className: "NotAFriend__text" }, banner.text),
                React.createElement(BannerButtons, { buttons: getActions('custom'), styles: { width: '100%', justifyContent: 'flex-start' } }),
                SpamReportModal));
        }
        default:
            return exhaustivenessCheck(name);
    }
};
export const BusinessNotifyInfo = ({ onClose }) => {
    const { lang } = useBrowserEnv();
    return (React.createElement(ModalView, { onEscape: onClose },
        React.createElement(ModalBackdrop, { onClick: onClose },
            React.createElement(ModalPanel, null,
                React.createElement(ModalBody, { withCustomLayout: true },
                    React.createElement("div", { className: "BusinessNotifyInfo" },
                        React.createElement(Icon56DataStackLockOutline, { className: "BusinessNotifyInfo__icon" }),
                        React.createElement("h3", { className: "BusinessNotifyInfo__title" }, lang.use('me_business_notify_info_box_title')),
                        React.createElement("div", { className: "BusinessNotifyInfo__text" }, lang
                            .use('me_business_notify_info_box_text')
                            .split('\n')
                            .map((item, index) => (React.createElement(Fragment, { key: index },
                            item,
                            " ",
                            React.createElement("br", null))))))),
                React.createElement(ModalFooter, { buttons: React.createElement(Button, { onClick: onClose }, lang.use('me_business_notify_info_box_button')) })))));
};
//# sourceMappingURL=ConvoBanner.js.map