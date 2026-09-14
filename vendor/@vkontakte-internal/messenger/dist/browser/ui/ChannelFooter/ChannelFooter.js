import '../../ui/ChannelFooter/ChannelFooter.css';
import React, { useState } from 'react';
import * as Channel from '../../../core/model/Channel';
import { Icon24CancelOutline, Icon24Info, Icon24Square4Outline, } from '@vkontakte/icons';
import { useBrowserEnv, useChannel, useDispatch, useFeatureFlags, } from '../../hooks/misc';
import { useChannelComposerDraft } from '../../hooks/useComposerDraft';
import cx from 'classnames';
import { useWithoutBubblesTheme } from '../../hooks/useWithoutBubblesTheme';
import { ChannelComposerBlocked } from '../../ui/ComposerBlocked/ComposerBlocked';
import { ChannelComposer } from '../../ui/ChannelComposer/ChannelComposer';
import { Button, useColorScheme } from '@vkontakte/vkui';
import { ChannelActionButton } from '../../ui/ChannelActionButton/ChannelActionButton';
import { useRouter } from '../../ui/Router/Router';
import { useCurrentThemeStyle } from '../../hooks/useCurrentThemeStyle';
import { useThemeStylesOverride } from '../../hooks/useThemeStylesOverride';
export const ChannelFooter = ({ className, channelId, parentId, isMember, isArchived, isCommentsRestricted, adminLevel, canSendDonut, actionButton, menu, banInfo, onClose, isMuted, isCommunityChannel, }) => {
    const dispatch = useDispatch();
    const { lang } = useBrowserEnv();
    const draft = useChannelComposerDraft(channelId);
    const channel = useChannel(channelId);
    const isWithoutBubblesTheme = useWithoutBubblesTheme();
    const isLightTheme = useColorScheme() === 'light';
    const [isMenuOpened, setIsMenuOpened] = useState(false);
    const { screenRoute } = useRouter();
    const { vkm_channel_composer_ban_info, vkm_channels_notification_btn } = useFeatureFlags();
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const { isThemed, themeAppearance } = useCurrentThemeStyle({});
    const themeAppearanceStyles = useThemeStylesOverride({
        themeAppearance,
    });
    const onChannelJoinClick = () => {
        if (!channel) {
            return;
        }
        const source = (screenRoute.kind === 'ChannelRoute' && screenRoute.entrypoint) ||
            'channel';
        const trackCode = screenRoute.kind === 'ChannelRoute'
            ? screenRoute.searchTrackCode
            : undefined;
        setButtonDisabled(true);
        dispatch({
            type: 'UserChangedChannel',
            userAction: Channel.isInboundRequest(channel)
                ? 'join_inbound_request'
                : 'join',
            source,
            channelId,
            trackCode,
            onComplete: () => setButtonDisabled(false),
            onFail: () => setButtonDisabled(false),
        });
    };
    const onChannelUnarchiveClick = () => {
        dispatch({
            type: 'UserChangedChannel',
            userAction: 'unarchive',
            channelId,
        });
    };
    const handleToggleMuteStateClick = (userAction) => {
        dispatch({
            type: 'UserChangedChannel',
            channelId: channelId,
            userAction,
        });
    };
    const renderFooter = () => {
        if (vkm_channel_composer_ban_info && banInfo) {
            return (React.createElement(ChannelComposerBlocked, { className: "CallChatMain__composerContent", banInfo: banInfo }));
        }
        if (adminLevel >= 2 /* Peer.GroupAdminLevel.Editor */ && !isArchived && isMember) {
            return (React.createElement(ChannelComposer, { composerDraft: draft, canSendDonut: canSendDonut, channelId: channelId, isCommunityChannel: isCommunityChannel, parentId: parentId, isCommentsRestricted: isCommentsRestricted, onClose: onClose }));
        }
        const isClosed = channel?.kind === 'Channel' && Channel.isClosed(channel);
        const shouldShowAccessDeniedBlock = !isCommunityChannel &&
            !isMember &&
            isClosed &&
            adminLevel < 2 /* Peer.GroupAdminLevel.Editor */;
        // Подписаться можно если не подписан на канал, но являешься членом СОО или это открытое СОО
        const shouldShowChannelSubscribeButton = channel?.kind === 'Channel' &&
            !channel.isMember &&
            (channel?.isParentGroupMember || !isClosed);
        return (React.createElement(React.Fragment, null,
            isMember && isArchived && (
            /**
             * ChannelFooter__backdrop - это подложка под кнопку, тк кнопка прозрачная и в темах просвечивается насквозь =\
             */
            React.createElement("div", { className: cx('ChannelFooter__backdrop', {
                    'ChannelFooter__backdrop--shadow': isLightTheme,
                }) },
                React.createElement(Button, { mode: "secondary", appearance: "accent", size: "l", stretched: true, onClick: onChannelUnarchiveClick }, lang.use('me_channel_footer_unarchive')))),
            vkm_channels_notification_btn &&
                isMember &&
                !isArchived &&
                isCommunityChannel && (React.createElement("div", { className: cx('ChannelFooter__backdrop', {
                    'ChannelFooter__backdrop--shadow': isLightTheme,
                }), style: isThemed ? themeAppearanceStyles : undefined },
                React.createElement(Button, { mode: "tertiary", appearance: isThemed ? 'neutral' : 'accent', size: "l", stretched: true, className: cx({
                        'ChannelFooter_notificationButton--themed': isThemed,
                    }), onClick: () => handleToggleMuteStateClick(isMuted ? 'unmute' : 'mute') }, isMuted
                    ? lang.use('me_turn_on_notifications')
                    : lang.use('me_turn_off_notifications')))),
            !isCommunityChannel &&
                actionButton &&
                isMember &&
                !isArchived &&
                actionButton.isEnabled && (React.createElement("div", { className: cx('ChannelFooter__backdrop', {
                    'ChannelFooter__backdrop--shadow': isLightTheme,
                }) },
                React.createElement(ChannelActionButton, { className: "ChannelFooter__button", ...actionButton }))),
            !isCommunityChannel && menu && isMember && !isArchived && (React.createElement("div", { className: cx('ChannelFooter__backdrop', {
                    'ChannelFooter__backdrop--shadow': isLightTheme,
                }) },
                React.createElement(Button, { mode: "secondary", appearance: "accent", size: "l", stretched: true, onClick: () => setIsMenuOpened((v) => !v), before: isMenuOpened ? (React.createElement(Icon24CancelOutline, { className: "ChannelFooter__buttonIcon" })) : (React.createElement(Icon24Square4Outline, { className: "ChannelFooter__buttonIcon" })) }, isMenuOpened
                    ? lang.use('me_channel_footer_group_menu_close')
                    : lang.use('me_channel_footer_group_menu')))),
            shouldShowAccessDeniedBlock && (React.createElement("div", { className: "ChannelFooter__blocked" },
                React.createElement("span", { className: "ChannelFooter__blockedIcon" },
                    React.createElement(Icon24Info, null)),
                React.createElement("span", null, lang.use('me_channel_access_denied_text')))),
            shouldShowChannelSubscribeButton && (React.createElement("div", { className: cx('ChannelFooter__backdrop', {
                    'ChannelFooter__backdrop--shadow': isLightTheme,
                }) },
                React.createElement(Button, { mode: "secondary", appearance: "accent", size: "l", stretched: true, onClick: onChannelJoinClick, disabled: buttonDisabled }, lang.use(isCommunityChannel
                    ? channel.isParentGroupMember
                        ? 'me_community_channel_footer_subscribe'
                        : 'me_community_channel_and_group_footer_subscribe'
                    : 'me_channel_footer_subscribe'))))));
    };
    return (React.createElement("div", { className: cx(className, 'ChannelFooter', {
            'ChannelFooter--secondary': isWithoutBubblesTheme,
        }) },
        isMenuOpened && React.createElement("div", { className: "ChannelFooter__menuWrapper" }, menu),
        renderFooter()));
};
//# sourceMappingURL=ChannelFooter.js.map