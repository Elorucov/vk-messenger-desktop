import { HorizontalScroll } from '@vkontakte/vkui';
import { Tabs, TabsItem } from '@vkontakte-internal/vkcom-kit';
import cx from 'classnames';
import '../../ui/ConvoProfileTabs/ConvoProfileTabs.css';
import React, { memo, useEffect, useMemo, useState } from 'react';
import { useBrowserEnv, useOwner, useViewer } from '../../hooks/misc';
import * as Peer from '../../../core/model/Peer';
import * as Viewer from '../../../core/model/Viewer';
import { ConvoProfileAttachments } from '../../ui/ConvoProfileAttachments/ConvoProfileAttachments';
import { ConvoProfileMembers, } from '../../ui/ConvoProfileMembers/ConvoProfileMembers';
import { ConvoProfileSharedConvos, } from '../../ui/ConvoProfileSharedConvos/ConvoProfileSharedConvos';
import { useRouter } from '../../ui/Router/Router';
import { Icon20PictureOutline, Icon20MusicOutline, Icon20DocumentOutline, Icon20Chain, Icon20ServicesOutline, Icon20VideoSquareOutline, Icon20UsersOutline, Icon20MessagesOutline, } from '@vkontakte/icons';
export const ConvoProfileTabs = memo(({ convo, onAddUsers, goToConvo, goToMessage, onTabChange, onIncognitoClick, className, peerId, convoMembersLoading, }) => {
    const { lang } = useBrowserEnv();
    const { rightPanel } = useRouter();
    const owner = useOwner();
    const { profileType } = useViewer();
    const isEdu = Viewer.isEdu(profileType);
    // Don't show for yourself, only for chat's or channel's or other user's peer id
    const needToShowMiniAppWidgets = peerId &&
        (Peer.isChatPeerId(peerId) || Peer.isUserPeerId(peerId)) &&
        peerId !== owner.id &&
        !isEdu;
    const membersTabs = useMemo(() => {
        const resultTabs = [];
        if (convo.kind !== 'ChatConvo' || convo.state !== 'in') {
            return resultTabs;
        }
        const membersCount = convo.members.count;
        resultTabs.push({
            value: 'members',
            label: lang.use(convo.isGroupChannel
                ? 'me_channel_profile_section_members'
                : 'me_chat_members_tab'),
            count: membersCount,
            icon: React.createElement(Icon20UsersOutline, null),
        });
        if (convo.members.invitedIds.size > 0) {
            resultTabs.push({
                value: 'invitations',
                label: lang.use('me_chat_invitations_tab'),
            });
        }
        return resultTabs;
    }, [convo, lang]);
    const tabs = useMemo(() => {
        const resultTabs = [
            {
                value: 'photos',
                label: lang.use('me_convo_attaches_type_photo'),
                icon: React.createElement(Icon20PictureOutline, null),
            },
            {
                value: 'videos',
                label: lang.use('me_convo_attaches_type_video'),
                icon: React.createElement(Icon20VideoSquareOutline, null),
            },
            {
                value: 'audios',
                label: lang.use('me_convo_attaches_type_music'),
                icon: React.createElement(Icon20MusicOutline, null),
            },
            {
                value: 'docs',
                label: lang.use('me_convo_attaches_type_doc'),
                icon: React.createElement(Icon20DocumentOutline, null),
            },
            {
                value: 'links',
                label: lang.use('me_convo_attaches_type_links'),
                icon: React.createElement(Icon20Chain, null),
            },
        ];
        if (needToShowMiniAppWidgets) {
            const audioTabIndex = resultTabs.findIndex((tab) => tab.value === 'audios');
            const miniAppsWidgetsTab = {
                value: 'miniAppWidgets',
                label: lang.use('me_convo_attaches_type_miniapp_widget'),
                icon: React.createElement(Icon20ServicesOutline, null),
            };
            resultTabs.splice(audioTabIndex ? audioTabIndex + 1 : resultTabs.length, 0, miniAppsWidgetsTab);
        }
        if (peerId &&
            !Peer.isFavorites(peerId, owner.id) &&
            convo.kind === 'UserConvo' &&
            owner.kind !== 'Group') {
            void resultTabs.push({
                value: 'sharedConvos',
                label: lang.use('me_convo_profile_shared_convos_tab'),
                icon: React.createElement(Icon20MessagesOutline, null),
            });
        }
        resultTabs.unshift(...membersTabs);
        return resultTabs;
    }, [
        peerId,
        convo.kind,
        owner.kind,
        owner.id,
        membersTabs,
        lang,
        needToShowMiniAppWidgets,
    ]);
    const [activeTab, setActiveTab] = useState(rightPanel?.kind === 'PeerPanel' && rightPanel.section
        ? rightPanel.section
        : tabs[0].value);
    useEffect(() => {
        onTabChange(activeTab);
    }, [onTabChange, activeTab]);
    return (React.createElement("div", { className: cx('ConvoProfileTabs', className) },
        React.createElement(Tabs, { mode: "accent", className: "ConvoProfileTabs__tabs" },
            React.createElement(HorizontalScroll, { arrowSize: "m" }, tabs.map(({ label, value, count, icon }) => (React.createElement(TabsItem, { key: value, id: `tab-${value}`, "aria-controls": `tab-content-${value}`, before: icon, after: !!count && (React.createElement("span", { className: "ConvoProfileTabs__tabCount", "aria-hidden": true }, count)), onClick: () => setActiveTab(value), selected: value === activeTab, className: "ConvoProfileTabs__tab" }, label))))),
        React.createElement("div", { className: "ConvoProfileTabs__tabContent" },
            isMembersTab(activeTab) && (React.createElement(ConvoProfileMembers, { activeTab: activeTab, convo: convo, onAddUsers: onAddUsers, onIncognitoClick: onIncognitoClick, isLoading: !!convoMembersLoading })),
            isAttachmentsTab(activeTab) && (React.createElement(ConvoProfileAttachments, { convo: convo, activeTab: activeTab, goToMessage: goToMessage })),
            peerId && isSharedConvosTab(activeTab) && (React.createElement(ConvoProfileSharedConvos, { activeTab: activeTab, peerId: peerId, goToConvo: goToConvo })))));
});
function isMembersTab(tab) {
    return tab === 'members' || tab === 'invitations';
}
function isSharedConvosTab(tab) {
    return tab === 'sharedConvos';
}
function isAttachmentsTab(tab) {
    return !isMembersTab(tab) && !isSharedConvosTab(tab);
}
//# sourceMappingURL=ConvoProfileTabs.js.map