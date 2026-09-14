import React, { useEffect, useState } from 'react';
import { classNames as cx } from '@vkontakte/vkjs';
import '../../ui/AccountSwitchBanner/AccountSwitchBanner.css';
import { Icon24LogoSferumColor, Icon24LogoVkMeColor, } from '@vkontakte-internal/icons-private';
import { useBrowserEnv, useOwner } from '../../hooks/misc';
import * as Viewer from '../../../core/model/Viewer';
import * as Peer from '../../../core/model/Peer';
import { useApiFetch } from '../../hooks/useApiFetch';
import { getOwnerGroupId } from '../../../data/store/State';
import { ConvoListBanner } from '../../ui/ConvoListBanner/ConvoListBanner';
const UNREAD_COUNT_REFRESH_INTERVAL = 60000;
export const AccountSwitchBanner = ({ className, account, onSwitch, }) => {
    const { lang, stats } = useBrowserEnv();
    const apiFetch = useApiFetch();
    const owner = useOwner();
    const [unreadCount, setUnreadCount] = useState(null);
    const [isCounterVisible, setCounterVisible] = useState(false);
    const isEdu = Viewer.isEdu(account.profileType);
    useEffect(() => {
        const peerId = account.id;
        if (!Peer.isUserPeerId(peerId)) {
            return;
        }
        const updateCounter = async () => {
            try {
                const response = await apiFetch('messages.getCounters', {
                    filter: 'messages_unread_unmuted',
                    for_coupled: 1,
                    group_id: getOwnerGroupId(owner.id),
                });
                const count = response.messages_unread_unmuted ?? 0;
                setUnreadCount(count);
            }
            catch {
                // Ничего не делаем в случае ошибки
            }
        };
        const intervalId = window.setInterval(updateCounter, UNREAD_COUNT_REFRESH_INTERVAL);
        updateCounter();
        return () => {
            window.clearInterval(intervalId);
        };
    }, [apiFetch, account.id, owner.id]);
    useEffect(() => {
        if (unreadCount === null) {
            return;
        }
        setCounterVisible(unreadCount > 0);
    }, [setCounterVisible, unreadCount, isCounterVisible]);
    const renderIcon = () => {
        if (isEdu) {
            return React.createElement(Icon24LogoSferumColor, null);
        }
        return React.createElement(Icon24LogoVkMeColor, null);
    };
    const renderCaption = () => {
        if (isEdu) {
            return lang.use('me_account_switch_banner_sferum');
        }
        return lang.use('me_account_switch_banner_vk_me');
    };
    const onBannerClick = () => {
        stats.logEvent({
            type: 'click',
            banner_name: isEdu ? 'go_to_messenger' : 'go_to_sferum',
        });
        onSwitch();
    };
    return (React.createElement(ConvoListBanner, { className: cx('AccountSwitchBanner', { 'AccountSwitchBanner--edu': isEdu }, className), icon: renderIcon(), title: renderCaption(), onClick: onBannerClick },
        React.createElement("div", { className: cx('AccountSwitchBanner__counter', {
                'AccountSwitchBanner__counter--visible': isCounterVisible,
            }) }, unreadCount)));
};
//# sourceMappingURL=AccountSwitchBanner.js.map