import '../../ui/ChatInvitationLink/ChatInvitationLink.css';
import React, { useEffect, useRef, useState } from 'react';
import { SegmentedControl } from '@vkontakte/vkui';
import cx from 'classnames';
import { useBrowserEnv, useDispatch } from '../../hooks/misc';
import { ChatInvitationLinkHistorySwitch } from '../../ui/ChatInvitationLinkHistorySwitch/ChatInvitationLinkHistorySwitch';
import { TEXT_TAB_PANEL_ID, TEXT_TAB_PANEL_CONTROL_ID, ChatInvitationLinkTextTabContent, } from '../../ui/ChatInvitationLinkTextTabContent/ChatInvitationLinkTextTabContent';
import { QR_TAB_PANEL_ID, QR_TAB_PANEL_CONTROL_ID, ChatInvitationLinkQrTabContent, } from '../../ui/ChatInvitationLinkQrTabContent/ChatInvitationLinkQrTabContent';
import { ChatInvitationLinkResetModal, } from '../../ui/ChatInvitationLinkResetModal/ChatInvitationLinkResetModal';
import { ChatInvitationLinkForwardModal, } from '../../ui/ChatInvitationLinkForwardModal/ChatInvitationLinkForwardModal';
export var ChatInvitationLinkTab;
(function (ChatInvitationLinkTab) {
    ChatInvitationLinkTab["Text"] = "Text";
    ChatInvitationLinkTab["QR"] = "QR";
})(ChatInvitationLinkTab || (ChatInvitationLinkTab = {}));
const DEFAULT_CHAT_INVITATION_LINK_TAB = ChatInvitationLinkTab.Text;
/**
 * Компонент с ссылкой-приглашением в чат в различных форматах.
 */
export const ChatInvitationLink = ({ links, peerId, canEdit, isLinkWithHistory = false, listFilter, listRenderer, openConvo, className, }) => {
    const { lang } = useBrowserEnv();
    const dispatch = useDispatch();
    const resetModal = useRef(null);
    const forwardModal = useRef(null);
    const [activeTab, setActiveTab] = useState(DEFAULT_CHAT_INVITATION_LINK_TAB);
    const [withHistory, setWithHistory] = useState(isLinkWithHistory);
    const tabsPropsMap = [
        {
            value: ChatInvitationLinkTab.Text,
            id: TEXT_TAB_PANEL_CONTROL_ID,
            'aria-controls': TEXT_TAB_PANEL_ID,
            label: lang.use('me_invite_link_text'),
        },
        {
            value: ChatInvitationLinkTab.QR,
            id: QR_TAB_PANEL_CONTROL_ID,
            'aria-controls': QR_TAB_PANEL_ID,
            label: lang.use('me_invite_link_qr'),
        },
    ];
    useEffect(() => {
        if (links.noHistory && links.withHistory) {
            return;
        }
        dispatch({
            type: 'UserRequestChatInvitationLink',
            isLinkWithHistory: !isLinkWithHistory,
            peerId,
        });
        /**
         * Загружаем вторую ссылку только один раз при открытии модалки
         * */
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const currentLink = withHistory ? links.withHistory : links.noHistory;
    return (React.createElement("div", { className: cx('ChatInvitationLink', className) },
        React.createElement(SegmentedControl, { value: activeTab, options: tabsPropsMap, size: "l", className: "ChatInvitationLink__tabsControl", onChange: (value) => {
                // Корректируем типы, т.к. в кач-ве `value` возвращается `string | number | undefined`.
                const nextTab = value ??
                    DEFAULT_CHAT_INVITATION_LINK_TAB;
                setActiveTab(nextTab);
            } }),
        canEdit && (React.createElement(ChatInvitationLinkHistorySwitch, { peerId: peerId, withHistory: withHistory, setWithHistory: setWithHistory })),
        activeTab === ChatInvitationLinkTab.Text && (React.createElement(ChatInvitationLinkTextTabContent, { canEdit: canEdit, currentLink: currentLink, forwardModal: forwardModal, resetModal: resetModal })),
        activeTab === ChatInvitationLinkTab.QR && (React.createElement(ChatInvitationLinkQrTabContent, { canEdit: canEdit, currentLink: currentLink, forwardModal: forwardModal, resetModal: resetModal })),
        React.createElement(ChatInvitationLinkResetModal, { ref: resetModal, peerId: peerId }),
        React.createElement(ChatInvitationLinkForwardModal, { ref: forwardModal, openConvo: openConvo, listFilter: listFilter, listRenderer: listRenderer })));
};
//# sourceMappingURL=ChatInvitationLink.js.map