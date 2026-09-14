import { useBrowserEnv, useDidUpdate, useDispatch, usePeers, useViewer, usePrevious, useChannel, } from '../../hooks/misc';
import { useModal, useModalGroup } from '../../hooks/useModal';
import '../../ui/ChannelProfile/ChannelProfile.css';
import * as Channel from '../../../core/model/Channel';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { RightPanel } from '../../ui/RightPanel/RightPanel';
import { StickyHeader, } from '../../ui/StickyHeader/StickyHeader';
import { RightPanelIconButton } from '../../ui/RightPanel/RightPanelIconButton';
import { Icon36LockOutline, Icon20ArticleOutline, Icon24Back, Icon24CancelOutline, Icon24GearOutline, } from '@vkontakte/icons';
import { ScrollbarProvider } from '@vkontakte-internal/scrollbar';
import { exhaustivenessCheck } from '../../../core/utils/misc';
import { useRouter } from '../../ui/Router/Router';
import { RightPanelTitle } from '../../ui/RightPanel/RightPanelTitle';
import { AvatarCard } from '../../ui/AvatarCard/AvatarCard';
import { Icon20VerifiedBadgeAltLight } from '@vkontakte-internal/icons-private';
import { ChannelAvatar } from '../../ui/ChannelAvatar/ChannelAvatar';
import { InfoCell } from '../../ui/InfoCell/InfoCell';
import { ProfileUserLink } from '../../ui/ConvoProfileUserLink/ConvoProfileUserLink';
import * as Viewer from '../../../core/model/Viewer';
import * as Peer from '../../../core/model/Peer';
import { ChannelProfileMenu } from '../../ui/ChannelProfileMenu/ChannelProfileMenu';
import { ChannelSettings } from '../../ui/ChannelSettings/ChannelSettings';
import { ProfileLoader } from '../../ui/ProfileLoader/ProfileLoader';
import { ExternalLink, Link } from '../../ui/Link/Link';
import { ClampText, ClampTextTrigger } from '../../ui/ClampText/ClampText';
import { SFERUM_DOMAIN } from '../../../core/config/config';
import { ChannelProfileInvitationLink } from '../../ui/ChannelProfileInvitationLink/ChannelProfileInvitationLink';
import { Button, Separator } from '@vkontakte/vkui';
import { ChannelMembers } from '../../ui/ChannelMembers/ChannelMembers';
import { CodeBlock } from '../../ui/CodeBlock/CodeBlock';
import { ModalDialog } from '../../ui/ModalDialog/ModalDialog';
import { useSnackbar } from '../../hooks/useSnackbar';
import { classNames as cx } from '@vkontakte/vkjs';
import { Paragraph } from '@vkontakte-internal/vkcom-kit';
import { useChannelSubscribersCountLang } from '../../hooks/useChannelSubscribersCountLang';
export const ChannelProfile = ({ channelId, section, onClose, openConvo, canPinMoreChannels, }) => {
    const channel = useChannel(channelId, false);
    const { viewer } = useViewer();
    const dispatch = useDispatch();
    const { lang } = useBrowserEnv();
    const profileGroup = useModalGroup();
    const profileModal = useModal(profileGroup.id, 'rightPanel');
    const pinChannelErrorModal = useModal();
    const handlePinChannel = useCallback((channelId) => {
        if (canPinMoreChannels) {
            dispatch({
                type: 'UserChangedChannel',
                channelId,
                userAction: 'pin',
            });
        }
        else {
            pinChannelErrorModal.open();
        }
    }, [canPinMoreChannels, dispatch, pinChannelErrorModal]);
    /**
     * Открываем модалку, ориентируясь на маунт компонента
     */
    useEffect(() => {
        //Не даем открыть по прямому урлу профиль заглушку
        if (channelId === 0) {
            onClose();
            return;
        }
        profileModal.open();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    /**
     * Загрузка данных профиля в случае если они отсутствуют в кеше
     */
    useEffect(() => {
        if (viewer.id === 0) {
            return;
        }
        dispatch({
            type: 'UserOpenedChannel',
            channelId: channelId,
        });
    }, [dispatch, viewer, channelId]);
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
    if (!channel || channel.kind === 'ChannelRestricted') {
        return (React.createElement(RightPanel, { indexInStack: profileModal.indexInStack, isActive: profileModal.isActive, className: "RightPanel__profile" },
            React.createElement(ProfileLoader, { type: "Channel" })));
    }
    const onPanelEscape = () => {
        profileGroup.closeGroup();
    };
    return (React.createElement(RightPanel, { indexInStack: profileModal.indexInStack, isActive: profileModal.isActive, className: "RightPanel__profile", onEscape: onPanelEscape },
        React.createElement(ChannelProfileContent, { onPinChannel: handlePinChannel, profileGroupId: profileGroup.id, channel: channel, onClose: onClose, isSettingsOpened: !!(section && section === 'settings'), onPanelEscape: onPanelEscape, openConvo: openConvo }),
        pinChannelErrorModal.isActive && (React.createElement(ModalDialog, { title: lang.use('me_error_title'), content: lang.use('me_too_many_channels_pinned_error'), closeLabel: lang.use('me_close'), onClose: pinChannelErrorModal.close, buttons: React.createElement(Button, { onClick: pinChannelErrorModal.close }, lang.use('me_close')) }))));
};
const ChannelProfileContent = ({ profileGroupId, onPanelEscape, channel, isSettingsOpened, openConvo, onPinChannel, }) => {
    const { lang, vkDomain } = useBrowserEnv();
    const containerRef = useRef(null);
    const informationRef = useRef(null);
    const attachmentsRef = useRef(null);
    const { replace, screenRoute } = useRouter();
    const peers = usePeers();
    const snackbar = useSnackbar();
    const channelSettingsModal = useModal(profileGroupId, 'rightPanel');
    const viewer = useViewer();
    const isEdu = Viewer.isEdu(viewer.profileType);
    const isAdmin = Channel.canAdmin(channel);
    const canSeeMembers = isEdu && isAdmin;
    const sections = useMemo(() => [
        {
            id: 'info',
            content: React.createElement("h3", null, lang.use('me_convo_profile_section_info')),
            anchorRef: informationRef,
        },
        {
            id: 'attachments',
            content: React.createElement("h3", null, lang.use('me_channel_profile_section_members')),
            anchorRef: attachmentsRef,
        },
    ], [informationRef, attachmentsRef, lang]);
    const channelLink = getChannelLink(channel, vkDomain, isEdu);
    useEffect(() => {
        if (isSettingsOpened && !channelSettingsModal.isActive) {
            channelSettingsModal.open();
        }
        if (!isSettingsOpened && channelSettingsModal.isActive) {
            channelSettingsModal.close();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSettingsOpened]);
    const scrollableProps = useMemo(() => ({
        className: 'ChannelProfile',
    }), []);
    const contentProps = useMemo(() => ({
        className: 'ChannelProfile__content',
    }), []);
    const panelCount = screenRoute.rp?.length || 0;
    const isCommunityChannel = Channel.isCommunityChannel(channel);
    const isCommunityChannelAdmin = isCommunityChannel && isAdmin;
    const isPrivateClosedChannel = isCommunityChannel &&
        Channel.isPrivate(channel) &&
        !channel.isParentGroupMember;
    const handleNameClick = () => {
        if (isCommunityChannelAdmin) {
            snackbar({
                message: lang.use('me_channel_name_snackbar_text'),
                action: lang.use('me_channel_name_snackbar_action'),
                onActionClick: () => {
                    const screenName = Channel.getCommunityChannelParentScreenName(channel);
                    if (screenName) {
                        window.open(`https://${vkDomain}/${screenName}?act=edit`, '_blank');
                    }
                },
            });
        }
    };
    const handleAvatarClick = () => {
        if (isCommunityChannelAdmin) {
            snackbar({
                message: lang.use('me_channel_avatar_snackbar_text'),
                action: lang.use('me_channel_avatar_snackbar_action'),
                onActionClick: () => {
                    const screenName = Channel.getCommunityChannelParentScreenName(channel);
                    if (screenName) {
                        window.open(`https://${vkDomain}/${screenName}?act=edit`, '_blank');
                    }
                },
            });
        }
    };
    const channelDescription = useChannelSubscribersCountLang(channel);
    const showChannelProfileCommentsSettings = isAdmin;
    const showChannelProfileInvintationLink = channel.screenName && !isPrivateClosedChannel;
    return (React.createElement(React.Fragment, null,
        React.createElement(StickyHeader, { left: React.createElement(RightPanelIconButton, { side: "left", onClick: onPanelEscape, "aria-label": panelCount > 1 ? lang.use('me_back') : lang.use('me_close') }, panelCount > 1 ? React.createElement(Icon24Back, null) : React.createElement(Icon24CancelOutline, null)), right: isAdmin && !isCommunityChannel ? (React.createElement(RightPanelIconButton, { side: "right", "aria-label": lang.use('me_channel_profile_settings'), onClick: () => replace({
                    kind: 'ChannelPanel',
                    channelId: channel.id,
                    section: 'settings',
                }) },
                React.createElement(Icon24GearOutline, null))) : null, containerRef: containerRef, sections: sections }),
        React.createElement(ScrollbarProvider, { className: "ChannelProfile__scroll", scrollableProps: scrollableProps, contentProps: contentProps, overflowX: "hidden" }, ({ scrollableRef, scrollableProps, contentProps }) => {
            containerRef.current = scrollableRef.current;
            return (React.createElement("div", { ...scrollableProps },
                React.createElement("div", { ...contentProps },
                    React.createElement("div", { ref: informationRef, className: "ChannelProfile__anchor ChannelProfile__anchor--information" }),
                    React.createElement(AvatarCard, { avatar: React.createElement("div", { role: "button", tabIndex: isCommunityChannelAdmin ? 0 : -1, "aria-disabled": !isCommunityChannelAdmin, onClick: handleAvatarClick, className: cx('ChannelProfile__avatar', {
                                'ChannelProfile__avatar--clickable': isCommunityChannelAdmin,
                            }) }, isPrivateClosedChannel ? (React.createElement("div", { className: "ChannelProfile__privateStub" },
                            React.createElement(Icon36LockOutline, { fill: "var(--vkui--color_icon_tertiary)" }))) : (React.createElement(ChannelAvatar, { photo: channel.photo, name: channel.name, size: 80 }))), name: React.createElement(ChannelName, { channelName: isPrivateClosedChannel
                                ? lang.use('me_community_channel_private_title')
                                : channel.name, isVerified: channel.isVerified, onClick: isCommunityChannelAdmin ? handleNameClick : undefined }), description: channelDescription && (React.createElement(Paragraph, { inline: true, className: "ChannelProfile__descriptionParagraph" }, channelDescription)), className: "ChannelProfile__section ChannelProfile__avatarCard" }),
                    !isPrivateClosedChannel && (React.createElement(ChannelProfileMenu, { channel: channel, onPinChannel: onPinChannel, className: "ChannelProfile__section" })),
                    !isCommunityChannel && (React.createElement(React.Fragment, null,
                        React.createElement(Separator, null),
                        React.createElement("div", { className: "ChannelProfile__information ChannelProfile__section" },
                            Boolean(channel.description.length) && (React.createElement(InfoCell, { left: React.createElement("div", { className: "ChannelProfile__descriptionIcon" },
                                    React.createElement(Icon20ArticleOutline, null)), key: "description", className: "ChannelProfile__description" },
                                React.createElement(ClampText, { lines: 4, trigger: React.createElement(ClampTextTrigger, { className: "ChannelProfile__descriptionButtonText" }, lang.use('me_convo_profile_information_show_more')), className: "ChannelProfile__descriptionText" },
                                    React.createElement(React.Fragment, null, channel.description.map((chunk, i) => {
                                        switch (chunk.kind) {
                                            case 'Text':
                                            case 'Emoji':
                                                return (React.createElement(React.Fragment, { key: i }, chunk.text));
                                            case 'Code':
                                                return React.createElement(CodeBlock, { code: chunk, key: i });
                                            case 'Mention': {
                                                const peer = peers.get(chunk.peerId);
                                                return (React.createElement(Link, { key: i, to: {
                                                        kind: 'PeerPanel',
                                                        peerId: chunk.peerId,
                                                        screenName: peer && Peer.screenName(peer),
                                                    }, className: "ChannelProfile__descriptionLink" }, chunk.displayName));
                                            }
                                            case 'ScreenNameMention':
                                                return (React.createElement(Link, { key: i, to: {
                                                        kind: 'ScreenNameProxyRoute',
                                                        screenName: chunk.screenName,
                                                    }, className: "ChannelProfile__descriptionLink" }, chunk.displayName));
                                            case 'MassMention':
                                                return (React.createElement(React.Fragment, { key: i }, chunk.displayName));
                                            case 'Email':
                                                return (React.createElement(ExternalLink, { key: i, href: `mailto:${chunk.email}`, className: "ChannelProfile__descriptionLink" }, chunk.email));
                                            case 'Url':
                                                return (React.createElement(ExternalLink, { key: i, href: chunk.href, className: "ChannelProfile__descriptionLink" }, chunk.caption));
                                            case 'Hashtag':
                                                return (React.createElement(Link, { key: i, to: {
                                                        kind: 'ChannelRoute',
                                                        channelId: channel.id,
                                                        search: chunk.tag,
                                                    }, className: "ChannelProfile__descriptionLink" }, chunk.tag));
                                            case 'HashtagMention':
                                                return (React.createElement(React.Fragment, { key: i },
                                                    React.createElement(Link, { key: i, to: {
                                                            kind: 'ChannelRoute',
                                                            channelId: channel.id,
                                                            search: chunk.tag,
                                                        }, className: "ChannelProfile__descriptionLink" }, chunk.tag),
                                                    "@",
                                                    chunk.screenName));
                                            case 'LineBreak':
                                                return React.createElement("br", { key: i });
                                            default:
                                                return exhaustivenessCheck(chunk);
                                        }
                                    }))))),
                            channel.screenName && (React.createElement(ChannelProfileInvitationLink, { link: channelLink, openConvo: openConvo }))))),
                    isCommunityChannel && (React.createElement(React.Fragment, null,
                        (showChannelProfileCommentsSettings ||
                            showChannelProfileInvintationLink) && React.createElement(Separator, null),
                        React.createElement("div", { className: "ChannelProfile__information ChannelProfile__section" }, showChannelProfileInvintationLink && (React.createElement(ChannelProfileInvitationLink, { link: channelLink, openConvo: openConvo, showSettings: channel.isMember }))))),
                    !isEdu && !isCommunityChannel && channel.screenName && (React.createElement(React.Fragment, null,
                        React.createElement(Separator, null),
                        React.createElement(ProfileUserLink, { kind: "Group", className: "ChannelProfile__section", screenName: channel.screenName }))),
                    canSeeMembers && !isCommunityChannel && (React.createElement(React.Fragment, null,
                        React.createElement("div", { ref: attachmentsRef, className: "ChannelProfile__anchor ChannelProfile__anchor--members" }),
                        React.createElement("div", { className: "ChannelProfile__divider" }),
                        React.createElement(ChannelMembers, { channel: channel }))))));
        }),
        channelSettingsModal.isActive && isAdmin && (React.createElement(RightPanel, { indexInStack: channelSettingsModal.indexInStack, isActive: channelSettingsModal.isActive, className: "RightPanel__profile", onEscape: () => replace({
                kind: 'ChannelPanel',
                channelId: channel.id,
                section: undefined,
            }) },
            React.createElement(RightPanelTitle, { left: React.createElement(RightPanelIconButton, { side: "left", "aria-label": lang.use('me_back'), onClick: () => replace({
                        kind: 'ChannelPanel',
                        channelId: channel.id,
                        section: undefined,
                    }) },
                    React.createElement(Icon24Back, null)) }, lang.use('me_convo_profile_settings_title')),
            React.createElement(ChannelSettings, { channel: channel })))));
};
// Может возникнуть кейс, когда название канала занимает всю ширину,
// а икнока verified показывается одной на следующей строке
// Разбиваем название на слова и объединяем последнее слово с иконкой,
// чтобы они переносились как одно слово
const ChannelName = ({ channelName, isVerified, onClick, }) => {
    const splittedChannelName = channelName.split(' ');
    const lastWord = splittedChannelName.length > 1 ? splittedChannelName.pop() : undefined;
    return (React.createElement("div", { className: cx('ChannelProfile__name', {
            'ChannelProfile__name--clickable': Boolean(onClick),
        }), role: "button", tabIndex: onClick ? 0 : -1, "aria-disabled": !onClick, onClick: onClick },
        splittedChannelName.join(' '),
        React.createElement("div", { className: "ChannelProfile__lastNameWord" },
            lastWord && React.createElement(React.Fragment, null,
                "\u00A0",
                lastWord),
            isVerified && (React.createElement(Icon20VerifiedBadgeAltLight, { className: "ChannelProfile__verifiedIcon" })))));
};
function getChannelLink(channel, domain, isEdu) {
    if (isEdu) {
        return `https://${SFERUM_DOMAIN}/?p=channel&channelId=${channel.id}`;
    }
    if (Channel.isCommunityChannel(channel)) {
        return `https://${domain}/im/channels/${channel.id}`;
    }
    return `https://${domain}/${channel.screenName}`;
}
//# sourceMappingURL=ChannelProfile.js.map