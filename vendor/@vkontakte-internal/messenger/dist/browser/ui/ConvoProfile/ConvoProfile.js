import '../../ui/ConvoProfile/ConvoProfile.css';
import React, { useCallback, useEffect, useId, useMemo, useRef, useState, } from 'react';
import cx from 'classnames';
import * as Convo from '../../../core/model/Convo';
import * as Peer from '../../../core/model/Peer';
import * as Channel from '../../../core/model/Channel';
import * as Attach from '../../../core/model/Attach';
import * as Viewer from '../../../core/model/Viewer';
import { ScrollbarProvider } from '@vkontakte-internal/scrollbar';
import { ConvoProfileSettings } from '../../ui/ConvoProfileSettings/ConvoProfileSettings';
import { useModal, useModalGroup } from '../../hooks/useModal';
import { useBrowserEnv, useCommunityMessagingWithToggle, useDispatch, useOwner, useViewer, useFeatureFlags, useDidUpdate, usePrevious, useCommunityMessaging, } from '../../hooks/misc';
import { Separator } from '@vkontakte/vkui';
import { ChatInviteUsersModal } from '../../ui/ChatInviteUsersModal/ChatInviteUsersModal';
import { ConvoProfileMenu } from '../../ui/ConvoProfileMenu/ConvoProfileMenu';
import { ConvoProfileName } from '../../ui/ConvoProfileName/ConvoProfileName';
import { ConvoProfileTabs, } from '../../ui/ConvoProfileTabs/ConvoProfileTabs';
import { ConvoProfileInformation } from '../../ui/ConvoProfileInformation/ConvoProfileInformation';
import { RightPanel } from '../../ui/RightPanel/RightPanel';
import { RightPanelIconButton } from '../../ui/RightPanel/RightPanelIconButton';
import { ConvoProfileInvitationLink } from '../../ui/ConvoProfileInvitationLink/ConvoProfileInvitationLink';
import { ConvoProfileUserLink } from '../../ui/ConvoProfileUserLink/ConvoProfileUserLink';
import { StickyHeader, } from '../../ui/StickyHeader/StickyHeader';
import { Icon24Back, Icon24CancelOutline, Icon24GearOutline, } from '@vkontakte/icons';
import { RightPanelTitle } from '../../ui/RightPanel/RightPanelTitle';
import { useRouter } from '../../ui/Router/Router';
import { ConvoProfileEmployeeCardLink } from '../../ui/ConvoProfileEmployeeCardLink/ConvoProfileEmployeeCardLink';
import { ConvoProfileSendGiftLink } from '../../ui/ConvoProfileSendGiftLink/ConvoProfileSendGiftLink';
import { IncognitoProfile } from '../../ui/IncognitoProfile/IncognitoProfile';
import { ConvoProfileAchievements } from '../../ui/ConvoProfileAchievements/ConvoProfileAchievements';
import { ProfileLoader } from '../../ui/ProfileLoader/ProfileLoader';
import { ConvoProfileUGCStickersButton } from '../../ui/ConvoProfileUGCStickersButton/ConvoProfileUGCStickersButton';
import { ConvoProfileUGCStickersToggle } from '../../ui/ConvoProfileUGCStickersToggle/ConvoProfileUGCStickersToggle';
import { useStatsOnMount } from '../../hooks/useStatsOnMount';
import { ConvoProfileOrganizations } from '../../ui/ConvoProfileOrganizations/ConvoProfileOrganizations';
import { ConvoProfileOrganizationsModal } from '../../ui/ConvoProfileOrganizationsModal/ConvoProfileOrganizationsModal';
import { EDU_LK_SFERUM_MINI_APP_ID } from '../../../core/config/config';
export const ConvoProfile = ({ peerId, convo, peer, channel, goToMessage, goToConvo, onClose, convoMembersLoading, }) => {
    const { storage } = useBrowserEnv();
    const { viewer, profileType } = useViewer();
    const { navigate } = useRouter();
    const dispatch = useDispatch();
    const profileGroup = useModalGroup();
    const profileModal = useModal(profileGroup.id, 'rightPanel');
    const isEdu = Viewer.isEdu(profileType);
    /**
     * Открываем модалку, ориентируясь на маунт компонента
     */
    useEffect(() => {
        //Не даем открыть по прямому урлу профиль заглушку
        if (peerId === 0) {
            onClose();
            return;
        }
        profileModal.open();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    useEffect(() => {
        if (!isEdu) {
            return;
        }
        if (!Channel.isChannelId(peerId)) {
            return;
        }
        if (!channel || channel.kind !== 'ChannelRestricted') {
            return;
        }
        navigate({
            kind: 'ChannelRoute',
            channelId: Channel.resolveId(peerId),
        });
    }, [isEdu, navigate, peerId, channel]);
    const isLinkWithHistory = !storage
        .get('chats-links-without-history')
        ?.includes(peerId);
    /**
     * Загрузка данных профиля в случае если они отсутствуют в кеше
     */
    useEffect(() => {
        if (viewer.id === 0) {
            return;
        }
        dispatch({
            type: 'UserOpenedConvoProfile',
            peerId: peerId,
            isLinkWithHistory,
        });
    }, [dispatch, viewer, peerId, isLinkWithHistory]);
    /**
     * Храним предыдущее значение для того, чтобы понимать на 100%
     * стоит ли вызывать коллбэк закрытия.
     *
     * `typeof previousIndexInStack === 'number'` свидетельствует о том, что
     * профиль был открыт.
     */
    const previousIndexInStack = usePrevious(profileModal.indexInStack);
    /**
     * Обработка закрытия профиля
     */
    useDidUpdate(() => {
        if (typeof previousIndexInStack === 'number' &&
            profileModal.indexInStack === null) {
            onClose();
        }
    }, [onClose, previousIndexInStack, profileModal.indexInStack]);
    if (!convo || !peer || channel?.kind === 'ChannelRestricted') {
        return (React.createElement(RightPanel, { indexInStack: profileModal.indexInStack, isActive: profileModal.isActive, className: "RightPanel__profile" },
            React.createElement(ProfileLoader, { type: "Convo" })));
    }
    const onPanelEscape = () => {
        profileGroup.closeGroup();
    };
    return (React.createElement(RightPanel, { indexInStack: profileModal.indexInStack, isActive: profileModal.isActive, onEscape: onPanelEscape, className: cx('RightPanel__profile', {
            RE_userSelectNone: !Convo.canCopyMessagesText(convo),
        }) },
        React.createElement(ConvoProfileContent, { profileGroupId: profileGroup.id, convo: convo, peer: peer, onPanelEscape: onPanelEscape, goToMessage: goToMessage, onClose: onClose, goToConvo: goToConvo, convoMembersLoading: convoMembersLoading })));
};
const ConvoProfileContent = ({ profileGroupId, convo, peer, goToConvo, onPanelEscape, goToMessage, onClose, convoMembersLoading, }) => {
    const { lang, calls, envFeatureFlags } = useBrowserEnv();
    const { screenRoute, navigate } = useRouter();
    const owner = useOwner();
    const { profileType, viewer } = useViewer();
    const isEdu = Viewer.isEdu(profileType);
    const featureFlags = useFeatureFlags();
    const isCommunityMessagingWithToggle = useCommunityMessagingWithToggle();
    const isCommunityMessaging = useCommunityMessaging();
    const isFavorites = Peer.isFavorites(convo.peerId, owner.id);
    const peerEduRoles = Peer.getEduRoles(peer);
    const [showChatInviteModal, setShowChatInviteModal] = useState(false);
    const chatSettingsModal = useModal(profileGroupId, 'rightPanel');
    const incognitoModal = useModal(profileGroupId, 'rightPanel');
    const eduOrganizationsModal = useModal(profileGroupId, 'rightPanel');
    const containerRef = useRef(null);
    const informationRef = useRef(null);
    const attachmentsRef = useRef(null);
    const [tab, setTab] = useState(null);
    const [selectedIncognitoId, setSelectedIncognitoId] = useState(null);
    const rightPanelCount = screenRoute.rp?.length || 0;
    const sections = useMemo(() => [
        {
            id: 'info',
            content: React.createElement("h3", null, lang.use('me_convo_profile_section_info')),
            anchorRef: informationRef,
        },
        {
            id: 'attachments',
            content: tab === 'invitations' || tab === 'members' ? (React.createElement("h3", null, lang.use('me_convo_profile_section_members'))) : tab === 'sharedConvos' ? (React.createElement("h3", null, lang.use('me_convo_profile_shared_convos_tab'))) : (React.createElement("h3", null, lang.use('me_convo_profile_section_attachments'))),
            anchorRef: attachmentsRef,
        },
    ], [informationRef, attachmentsRef, lang, tab]);
    const canOpenChatSettings = convo.kind === 'ChatConvo' &&
        convo.acl.canChangeInfo &&
        (convo.canWrite.allowed ||
            convo.canWrite.reason === 'forbid_writing_for_all') &&
        (owner.kind !== 'Group' ||
            (!isEdu && envFeatureFlags.isCommunityMessagingEnabled));
    const canInviteUsers = Convo.canInviteTo(convo, owner);
    useEffect(() => {
        /**
         * Если у пользователя исчезнет право на редактирование беседы
         * (сделают не администратором либо поменяют настройки прав в беседе),
         * а он в это время будет находиться в настройках беседы,
         * то нужно закрыть эту модалку, иначе будет показываться чернота
         */
        if (!canOpenChatSettings && chatSettingsModal.isActive) {
            chatSettingsModal.close();
        }
    }, [canOpenChatSettings, chatSettingsModal]);
    useStatsOnMount({
        type: 'type_navgo',
        type_navgo: {
            screen: 'im_profile',
            subtype: 'go',
            destination_item: {
                type: 'profile',
                id: convo.peerId,
            },
        },
    });
    const handleIncognitoClick = useCallback((id) => {
        setSelectedIncognitoId(id);
        incognitoModal.open();
    }, 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [incognitoModal.open]);
    const handleIncognitoModalClose = useCallback(() => {
        setSelectedIncognitoId(null);
        incognitoModal.close();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [incognitoModal.close]);
    const onAddToOrg = useCallback(() => {
        if (peer.kind === 'User') {
            navigate({
                kind: 'MiniAppModal',
                miniAppId: Attach.resolveMiniAppId(EDU_LK_SFERUM_MINI_APP_ID),
                hash: `/invite/${peer.id}`,
            });
        }
    }, [navigate, peer.id, peer.kind]);
    const canInviteToOrg = useMemo(() => Peer.hasEduOrganizationalRoles(viewer), [viewer]);
    const settingsId = useId();
    const peerEduOrganizationsId = useId();
    const isEduViewer = Viewer.isEdu(profileType);
    const hideProfileMenu = (peer.kind === 'User' && isFavorites) ||
        (peer.kind === 'Group' && isEduViewer);
    return (React.createElement(React.Fragment, null,
        React.createElement(StickyHeader, { left: React.createElement(RightPanelIconButton, { side: "left", onClick: onPanelEscape, "aria-label": lang.use('me_convo_profile_close') }, rightPanelCount > 1 ? React.createElement(Icon24Back, null) : React.createElement(Icon24CancelOutline, null)), right: canOpenChatSettings ? (React.createElement(RightPanelIconButton, { side: "right", onClick: chatSettingsModal.open, "aria-label": lang.use('me_convo_profile_chat_settings') },
                React.createElement(Icon24GearOutline, null))) : null, containerRef: containerRef, sections: sections }),
        React.createElement(ScrollbarProvider, { className: "ConvoProfile__scroll", overflowX: "hidden" }, ({ scrollableRef, scrollableProps, contentProps }) => {
            containerRef.current = scrollableRef.current;
            return (React.createElement("div", { ...scrollableProps, className: "ConvoProfile" },
                React.createElement("div", { ...contentProps, className: "ConvoProfile__content" },
                    React.createElement("div", { ref: informationRef, className: "ConvoProfile__anchor ConvoProfile__anchor--information" }),
                    React.createElement(ConvoProfileName, { convo: convo, peer: peer, className: "ConvoProfile__section ConvoProfile__name" }),
                    hideProfileMenu ? null : (React.createElement(ConvoProfileMenu, { convo: convo, onOpenConvo: goToConvo, modalGroupId: profileGroupId, onClose: onClose, onCall: calls?.callPeer, className: "ConvoProfile__section" })),
                    isEdu && convo.kind === 'UserConvo' && !isFavorites && (React.createElement(ConvoProfileOrganizations, { className: "ConvoProfile__section", organizations: peerEduRoles?.organizations ?? [], onShowMore: eduOrganizationsModal.open, onAddToOrg: onAddToOrg, canAddOrg: featureFlags.vkm_edu_org_navigation && canInviteToOrg })),
                    isEdu &&
                        !!peerEduRoles?.organizations.length &&
                        convo.kind === 'UserConvo' &&
                        !isFavorites && (React.createElement(ConvoProfileAchievements, { convo: convo, className: "ConvoProfile__section" })),
                    React.createElement(ConvoProfileInformation, { convo: convo, className: "ConvoProfile__section", openConvo: goToConvo }),
                    React.createElement("div", { ref: attachmentsRef, className: "ConvoProfile__anchor" }),
                    convo.kind === 'ChatConvo' && (React.createElement(ConvoProfileInvitationLink, { convo: convo, openConvo: goToConvo, className: "ConvoProfile__section" })),
                    convo.kind === 'ChatConvo' &&
                        convo.stickersParams?.canEdit &&
                        !isCommunityMessaging && (React.createElement(React.Fragment, null,
                        React.createElement(Separator, null),
                        React.createElement(ConvoProfileUGCStickersButton, { peerId: convo.peerId }))),
                    convo.kind === 'ChatConvo' &&
                        convo.stickersParams?.canHideKeyboard &&
                        convo.stickersParams?.hasStickers && (React.createElement(React.Fragment, null,
                        React.createElement(Separator, null),
                        React.createElement(ConvoProfileUGCStickersToggle, { className: "ConvoProfile__section", peerId: convo.peerId, stickersParams: convo.stickersParams }))),
                    !isEdu &&
                        !isFavorites &&
                        (convo.kind === 'UserConvo' ||
                            convo.kind === 'GroupConvo') && (React.createElement(React.Fragment, null,
                        (peer.kind !== 'User' ||
                            (peer.kind === 'User' && !peer.isService)) && (React.createElement(React.Fragment, null,
                            React.createElement(Separator, null),
                            React.createElement(ConvoProfileUserLink, { peerId: convo.peerId, className: "ConvoProfile__section" }))),
                        peer.kind === 'User' && Peer.isEmployee(peer) && (React.createElement(ConvoProfileEmployeeCardLink, { peerId: convo.peerId, className: "ConvoProfile__section" })),
                        !isCommunityMessagingWithToggle &&
                            peer.kind === 'User' &&
                            featureFlags.vas_profile_send_gift && (React.createElement(ConvoProfileSendGiftLink, { peerId: convo.peerId, className: "ConvoProfile__section" })))),
                    React.createElement(Separator, null),
                    React.createElement(ConvoProfileTabs, { convo: convo, goToConvo: goToConvo, goToMessage: goToMessage, peerId: convo.peerId, onAddUsers: canInviteUsers
                            ? () => setShowChatInviteModal(true)
                            : undefined, onTabChange: setTab, onIncognitoClick: handleIncognitoClick, convoMembersLoading: convoMembersLoading, className: "ConvoProfile__section ConvoProfile__tabs" }))));
        }),
        chatSettingsModal.isActive && canOpenChatSettings && (React.createElement(RightPanel, { id: settingsId, indexInStack: chatSettingsModal.indexInStack, isActive: chatSettingsModal.isActive, onEscape: chatSettingsModal.close, className: "RightPanel__profile" },
            React.createElement(RightPanelTitle, { className: "ConvoProfile__settingsTitle", id: settingsId, left: React.createElement(RightPanelIconButton, { side: "left", onClick: chatSettingsModal.close, "aria-label": lang.use('me_back') },
                    React.createElement(Icon24Back, null)) }, lang.use('me_convo_profile_settings_title')),
            React.createElement(ConvoProfileSettings, { convo: convo }))),
        incognitoModal.isActive && selectedIncognitoId && (React.createElement(RightPanel, { id: settingsId, indexInStack: incognitoModal.indexInStack, isActive: incognitoModal.isActive, onEscape: handleIncognitoModalClose, className: "RightPanel__profile" },
            React.createElement(RightPanelIconButton, { side: "left", onClick: incognitoModal.close, "aria-label": lang.use('me_close'), className: "ConvoProfile__closeBtn" },
                React.createElement(Icon24Back, null)),
            React.createElement(IncognitoProfile, { convo: convo, incognitoId: selectedIncognitoId }))),
        showChatInviteModal && canInviteUsers && (React.createElement(ChatInviteUsersModal, { convo: convo, onClose: () => setShowChatInviteModal(false) })),
        eduOrganizationsModal.isActive &&
            peer.kind === 'User' &&
            peerEduRoles && (React.createElement(RightPanel, { id: peerEduOrganizationsId, indexInStack: eduOrganizationsModal.indexInStack, isActive: eduOrganizationsModal.isActive, onEscape: eduOrganizationsModal.close, className: "RightPanel__profile" },
            React.createElement(RightPanelTitle, { id: peerEduOrganizationsId, left: React.createElement(RightPanelIconButton, { side: "left", onClick: eduOrganizationsModal.close, "aria-label": lang.use('me_close') },
                    React.createElement(Icon24Back, null)) }, lang.use('me_convo_profile_edu_organizations')),
            React.createElement(ConvoProfileOrganizationsModal, { organizations: peerEduRoles.organizations, onAddToOrg: onAddToOrg, canAdd: featureFlags.vkm_edu_org_navigation && canInviteToOrg })))));
};
//# sourceMappingURL=ConvoProfile.js.map