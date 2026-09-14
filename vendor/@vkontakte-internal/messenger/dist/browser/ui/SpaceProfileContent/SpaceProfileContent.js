import '../../ui/SpaceProfileContent/SpaceProfileContent.css';
import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import cx from 'classnames';
import * as Peer from '../../../core/model/Peer';
import { exhaustivenessCheck } from '../../../core/utils/misc';
import { StickyHeader, } from '../../ui/StickyHeader/StickyHeader';
import { useBrowserEnv, usePeers } from '../../hooks/misc';
import { useRouter } from '../../ui/Router/Router';
import { SpaceProfileTabs, } from '../../ui/SpaceProfileTabs/SpaceProfileTabs';
import { RightPanelIconButton } from '../../ui/RightPanel/RightPanelIconButton';
import { Icon20Add, Icon20ArticleOutline, Icon24Back, Icon24CancelOutline, Icon24GearOutline, } from '@vkontakte/icons';
import { useModal } from '../../hooks/useModal';
import { ScrollbarProvider } from '@vkontakte-internal/scrollbar';
import { AvatarCard } from '../../ui/AvatarCard/AvatarCard';
import { SpaceAvatar } from '../../ui/SpaceAvatar/SpaceAvatar';
import { SpaceProfileMenu } from '../../ui/SpaceProfileMenu/SpaceProfileMenu';
import { InfoCell } from '../../ui/InfoCell/InfoCell';
import { ClampText, ClampTextTrigger } from '../../ui/ClampText/ClampText';
import { ExternalLink, Link } from '../../ui/Link/Link';
import { Icon20VerifiedBadgeAltLight } from '@vkontakte-internal/icons-private';
import { CodeBlock } from '../../ui/CodeBlock/CodeBlock';
import { SpaceJoinButton } from '../../ui/SpaceJoinButton/SpaceJoinButton';
import { RightPanel } from '../../ui/RightPanel/RightPanel';
import { RightPanelTitle } from '../../ui/RightPanel/RightPanelTitle';
import { SpaceSettings } from '../../ui/SpaceSettings/SpaceSettings';
import { CellButton } from '@vkontakte/vkui';
export const SpaceProfileContent = ({ space, profileModalGroupId, onPanelEscape, }) => {
    const { lang } = useBrowserEnv();
    const { screenRoute } = useRouter();
    const settingsModal = useModal(profileModalGroupId, 'rightPanel');
    const containerRef = useRef(null);
    const informationRef = useRef(null);
    const membersRef = useRef(null);
    // SPC-TODO: Возможно табов не будет
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [tab, setTab] = useState(null);
    const rightPanelCount = screenRoute.rp?.length || 0;
    const sections = useMemo(() => [
        {
            id: 'info',
            content: lang.use('me_spaces_profile_info'),
            anchorRef: informationRef,
        },
        {
            id: 'members',
            content: lang.use('me_spaces_profile_members'),
            anchorRef: membersRef,
        },
    ], [informationRef, membersRef, lang]);
    const canOpenSettings = space.viewerData.isOwner;
    const settingsId = useId();
    useEffect(() => {
        /**
         * Если у пользователя исчезнет право на редактирование,
         * (сделают не администратором либо поменяют настройки прав в беседе),
         * а он в это время будет находиться в настройках беседы,
         * то нужно закрыть эту модалку, иначе будет показываться чернота
         */
        if (!canOpenSettings && settingsModal.isActive) {
            settingsModal.close();
        }
    }, [canOpenSettings, settingsModal]);
    return (React.createElement(React.Fragment, null,
        React.createElement(StickyHeader, { left: React.createElement(RightPanelIconButton, { side: "left", onClick: onPanelEscape, "aria-label": lang.use('me_close') }, rightPanelCount > 1 ? React.createElement(Icon24Back, null) : React.createElement(Icon24CancelOutline, null)), right: canOpenSettings ? (React.createElement(RightPanelIconButton, { side: "right", onClick: settingsModal.open, "aria-label": lang.use('me_spaces_profile_open_settings') },
                React.createElement(Icon24GearOutline, null))) : null, containerRef: containerRef, sections: sections }),
        React.createElement(ScrollbarProvider, { className: "SpaceProfileContent__scroll", overflowX: "hidden" }, ({ scrollableRef, scrollableProps, contentProps }) => {
            containerRef.current = scrollableRef.current;
            return (React.createElement("div", { ...scrollableProps, className: "SpaceProfileContent" },
                React.createElement("div", { ...contentProps, className: "SpaceProfileContent__content" },
                    React.createElement("div", { ref: informationRef, className: "SpaceProfileContent__anchor SpaceProfileContent__anchor--information" }),
                    React.createElement(AvatarCard, { avatar: React.createElement(SpaceAvatar, { size: 64, image: space.avatar, alt: space.name }), name: React.createElement(LongName, { name: space.name, isVerified: true }), 
                        // SPC-TODO поменять на реальный онлайн каунтер
                        description: `
                    ${Math.round(space.membersCount * 0.6)} ${lang.use('me_spaces_info_members_online')}
                    ·
                    ${lang.use('me_spaces_info_members_count', {
                            num: space.membersCount,
                            formatted: 'short',
                        })}
                  `, className: "SpaceProfileContent__section SpaceProfileContent__avatarCard" }),
                    React.createElement(SpaceProfileMenu, { space: space, className: "SpaceProfileContent__section" }),
                    !space.viewerData.isMember && (React.createElement("div", { className: "SpaceProfileContent__section" },
                        React.createElement(SpaceJoinButton, { space: space, variant: "profile" }))),
                    React.createElement(SpaceProfileDescription, { className: "SpaceProfileContent__section", description: space.description }),
                    React.createElement("div", { className: "SpaceProfileContent__divider SpaceProfileContent__divider--withMargin" }),
                    space.viewerData.isOwner && (React.createElement(React.Fragment, null,
                        React.createElement("div", { className: "SpaceProfileContent__createRooms" },
                            React.createElement(Link, { className: "SpaceProfileContent__createRoomsLink", to: {
                                    kind: 'SpaceRoomCreateModal',
                                    spaceId: space.id,
                                } },
                                React.createElement(CellButton, { before: React.createElement(Icon20Add, null), chevron: "always", hasActive: false }, lang.use('me_space_profile_create_room'))),
                            React.createElement(Link, { className: "SpaceProfileContent__createRoomsLink", to: {
                                    kind: 'SpaceSectionCreateModal',
                                    spaceId: space.id,
                                } },
                                React.createElement(CellButton, { before: React.createElement(Icon20Add, null), chevron: "always", hasActive: false }, lang.use('me_space_profile_create_section')))),
                        React.createElement("div", { className: "SpaceProfileContent__divider" }))),
                    React.createElement("div", { ref: membersRef, className: "SpaceProfileContent__anchor" }),
                    React.createElement(SpaceProfileTabs, { space: space, onTabChange: setTab, className: "SpaceProfileContent__section SpaceProfileContent__tabs" }))));
        }),
        settingsModal.isActive && canOpenSettings && (React.createElement(RightPanel, { id: settingsId, indexInStack: settingsModal.indexInStack, isActive: settingsModal.isActive, onEscape: settingsModal.close, className: "RightPanel__profile" },
            React.createElement(RightPanelTitle, { className: "ConvoProfile__settingsTitle", id: settingsId, left: React.createElement(RightPanelIconButton, { side: "left", onClick: settingsModal.close, "aria-label": lang.use('me_close') }, rightPanelCount > 1 ? React.createElement(Icon24Back, null) : React.createElement(Icon24CancelOutline, null)) }, lang.use('me_convo_profile_settings_title')),
            React.createElement(SpaceSettings, { space: space })))));
};
const SpaceProfileDescription = ({ description, className, }) => {
    const { lang } = useBrowserEnv();
    const peers = usePeers();
    if (!description.length) {
        return React.createElement(React.Fragment, null);
    }
    return (React.createElement(InfoCell, { left: React.createElement("div", { className: "SpaceProfileDescription__left" },
            React.createElement(Icon20ArticleOutline, null)), key: "description", className: cx('SpaceProfileDescription', className), style: { alignItems: 'flex-start' } },
        React.createElement(ClampText, { lines: 4, trigger: React.createElement(ClampTextTrigger, { className: "SpaceProfileDescription__descriptionButtonText" }, lang.use('me_spaces_profile_show_more')), className: "SpaceProfileDescription__descriptionText" },
            React.createElement(React.Fragment, null, description.map((chunk, i) => {
                switch (chunk.kind) {
                    case 'Text':
                    case 'Emoji':
                        return React.createElement(React.Fragment, { key: i }, chunk.text);
                    case 'Code':
                        return React.createElement(CodeBlock, { code: chunk, key: i });
                    case 'Mention': {
                        const peer = peers.get(chunk.peerId);
                        return (React.createElement(Link, { key: i, to: {
                                kind: 'PeerPanel',
                                peerId: chunk.peerId,
                                screenName: peer && Peer.screenName(peer),
                            }, className: "SpaceProfileDescription__link SpaceProfileDescription__link--text" }, chunk.displayName));
                    }
                    case 'ScreenNameMention':
                        return (React.createElement(Link, { key: i, to: {
                                kind: 'ScreenNameProxyRoute',
                                screenName: chunk.screenName,
                            }, className: "SpaceProfileDescription__link SpaceProfileDescription__link--text" }, chunk.displayName));
                    case 'MassMention':
                        return (React.createElement(React.Fragment, { key: i }, chunk.displayName));
                    case 'Email':
                        return (React.createElement(ExternalLink, { key: i, href: `mailto:${chunk.email}`, className: "SpaceProfileDescription__link SpaceProfileDescription__link--text" }, chunk.email));
                    case 'Url':
                        return (React.createElement(ExternalLink, { key: i, href: chunk.href, className: "SpaceProfileDescription__link SpaceProfileDescription__link--text" }, chunk.caption));
                    case 'Hashtag':
                        return React.createElement(React.Fragment, { key: i }, chunk.tag);
                    case 'HashtagMention':
                        return (React.createElement(React.Fragment, { key: i },
                            chunk.tag,
                            "@",
                            chunk.screenName));
                    case 'LineBreak':
                        return React.createElement("br", { key: i });
                    default:
                        return exhaustivenessCheck(chunk);
                }
            })))));
};
// Может возникнуть кейс, когда название канала занимает всю ширину,
// а иконка verified показывается одной на следующей строке
// Разбиваем название на слова и объединяем последнее слово с иконкой,
// чтобы они переносились как одно слово
export const LongName = ({ name, isVerified }) => {
    const splittedName = name.split(' ');
    const lastWord = splittedName.length > 1 ? splittedName.pop() : undefined;
    return (React.createElement("div", { className: "SpaceProfileContent__longName" },
        splittedName.join(' '),
        React.createElement("div", { className: "SpaceProfileContent__lastNameWord" },
            lastWord && React.createElement(React.Fragment, null,
                "\u00A0",
                lastWord),
            isVerified && (React.createElement(Icon20VerifiedBadgeAltLight, { className: "SpaceProfileContent__verifiedIcon" })))));
};
//# sourceMappingURL=SpaceProfileContent.js.map