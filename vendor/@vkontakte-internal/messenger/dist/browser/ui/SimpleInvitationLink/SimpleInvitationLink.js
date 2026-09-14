import '../../ui/ChatInvitationLink/ChatInvitationLink.css';
import React, { useCallback, useRef, useState } from 'react';
import { SegmentedControl } from '@vkontakte/vkui';
import './SimpleInvitationLink.css';
import { useBrowserEnv } from '../../hooks/misc';
import { TEXT_TAB_PANEL_ID, TEXT_TAB_PANEL_CONTROL_ID, ChatInvitationLinkTextTabContent, } from '../../ui/ChatInvitationLinkTextTabContent/ChatInvitationLinkTextTabContent';
import { QR_TAB_PANEL_ID, QR_TAB_PANEL_CONTROL_ID, ChatInvitationLinkQrTabContent, } from '../../ui/ChatInvitationLinkQrTabContent/ChatInvitationLinkQrTabContent';
import { ChatInvitationLinkForwardModal, } from '../../ui/ChatInvitationLinkForwardModal/ChatInvitationLinkForwardModal';
import { ChatInvitationLinkTab } from '../../ui/ChatInvitationLink/ChatInvitationLink';
import { PeerPickerList } from '../../ui/PeerPickerList/PeerPickerList';
const DEFAULT_TAB = ChatInvitationLinkTab.Text;
export const SimpleInvitationLink = ({ link, listFilter, listRenderer, openConvo, }) => {
    const { lang } = useBrowserEnv();
    const forwardModal = useRef(null);
    const [activeTab, setActiveTab] = useState(DEFAULT_TAB);
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
    const listRendererWithRestricted = useCallback((props) => {
        return React.createElement(PeerPickerList, { ...props, withRestrictedDisabling: true });
    }, []);
    return (React.createElement("div", { className: "SimpleInvitationLink" },
        React.createElement(SegmentedControl, { value: activeTab, options: tabsPropsMap, size: "l", className: "SimpleInvitationLink__tabsControl", onChange: (value) => {
                // Корректируем типы, т.к. в кач-ве `value` возвращается `string | number | undefined`.
                const nextTab = value ?? DEFAULT_TAB;
                setActiveTab(nextTab);
            } }),
        activeTab === ChatInvitationLinkTab.Text && (React.createElement(ChatInvitationLinkTextTabContent, { canEdit: false, currentLink: link, forwardModal: forwardModal })),
        activeTab === ChatInvitationLinkTab.QR && (React.createElement(ChatInvitationLinkQrTabContent, { canEdit: false, currentLink: link, forwardModal: forwardModal })),
        React.createElement(ChatInvitationLinkForwardModal, { ref: forwardModal, openConvo: openConvo, listFilter: listFilter, listRenderer: listRenderer ?? listRendererWithRestricted })));
};
//# sourceMappingURL=SimpleInvitationLink.js.map