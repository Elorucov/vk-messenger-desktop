import React, { useEffect } from 'react';
import { Icon56Users3Outline } from '@vkontakte/icons';
import { Button, Spinner } from '@vkontakte/vkui';
import cx from 'classnames';
import * as Viewer from '../../../core/model/Viewer';
import * as Channel from '../../../core/model/Channel';
import { useRouter } from '../../ui/Router/Router';
import { useBrowserEnv, useFeatureFlags, useViewer } from '../../hooks/misc';
import { IRouter } from '../../../data/env/IRouter';
import { exhaustivenessCheck } from '../../../core/utils/misc';
import { UnifiedServiceModal } from '../../ui/UnifiedServiceModal/UnifiedServiceModal';
import './ChannelMainWrapper.css';
import { ChannelRestricted } from '../../ui/ChannelRestricted/ChannelRestricted';
import { ChannelVkMeStub } from '../../ui/ChannelVkMeStub/ChannelVkMeStub';
export const ChannelMainWrapper = ({ channelId, postCmid, channelsCache, children, dispatch, onSetAccount, registerAccount, }) => {
    const viewer = useViewer();
    const { lang } = useBrowserEnv();
    const { screenRoute, replace, router } = useRouter();
    const featureFlags = useFeatureFlags();
    const channel = channelsCache.get(channelId);
    const isEdu = Viewer.isEdu(viewer.profileType);
    const accountToSwitch = isEdu
        ? Viewer.mainAccount(viewer)
        : Viewer.eduAccount(viewer);
    const switchAccount = () => {
        if (!accountToSwitch) {
            if (isEdu) {
                switch (screenRoute.kind) {
                    case 'ConvoRoute':
                    case 'ChannelRoute':
                    case 'MainRoute':
                        const { url } = router.fromEntity({
                            kind: 'ChannelJoinProxyRoute',
                            channelId,
                            postCmid,
                        }, IRouter.Action.Push);
                        if (!url) {
                            return;
                        }
                        window.open(url, '_blank');
                        break;
                    case 'CallJoinRoute':
                    case 'CallJoinShortenedRoute':
                    case 'ChannelsFolderRoute':
                    case 'ChatJoinRoute':
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
        onSetAccount(accountToSwitch.id, false);
    };
    useEffect(() => {
        dispatch({ type: 'UserOpenedChannel', channelId: channelId });
        return () => dispatch({ type: 'UserClosedChannel', channelId: channelId });
        // обновляем только когда получаем информацию о канале
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, channelId]);
    const handleClose = () => {
        replace({ kind: 'MainRoute', organiser: screenRoute.organiser });
    };
    const renderAccountSwitchModal = () => {
        const actionButton = (React.createElement(Button, { onClick: switchAccount, stretched: true, size: "l", className: cx('ChannelMainWrapper__button', {
                'ChannelMainWrapper__button--edu': isEdu,
            }) }, lang.use('me_proceed')));
        const icon = (React.createElement("div", { className: cx('ChannelMainWrapper__icon', {
                'ChannelMainWrapper__icon--edu': isEdu,
            }) },
            React.createElement(Icon56Users3Outline, null)));
        return (React.createElement(UnifiedServiceModal, { title: lang.use(isEdu
                ? 'me_switch_account_to_vk_channel_modal_title'
                : 'me_switch_account_to_sferum_channel_modal_title'), subtitle: lang.use(isEdu
                ? 'me_switch_account_to_vk_channel_modal_subtitle'
                : 'me_switch_account_to_sferum_channel_modal_subtitle'), image: icon, footer: actionButton, handleModalClose: handleClose }));
    };
    if (channel?.kind === 'Channel' &&
        !isEdu &&
        screenRoute.kind === 'ChannelRoute' &&
        screenRoute.edu) {
        return renderAccountSwitchModal();
    }
    if (channel?.kind === 'ChannelRestricted') {
        if (channel.needSwitchAccount) {
            return renderAccountSwitchModal();
        }
        return React.createElement(ChannelRestricted, { channel: channel });
    }
    if (featureFlags.vkm_old_channels_mock &&
        channel &&
        !Channel.isCommunityChannel(channel)) {
        return React.createElement(ChannelVkMeStub, null);
    }
    return !channel ? (React.createElement("div", { className: "MEApp__convoSpinner" },
        React.createElement(Spinner, { size: "m" }))) : (children({ channel }));
};
//# sourceMappingURL=ChannelMainWrapper.js.map