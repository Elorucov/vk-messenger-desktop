import React from 'react';
import { useBrowserEnv, useLastSeen } from '../../hooks/misc';
import * as Peer from '../../../core/model/Peer';
import { useNow } from '../../hooks/useNow';
export const getOnlineStatus = (lang, peer, now, lastSeen, isTyping) => {
    if (isTyping && peer.kind === 'User') {
        return lang.use('global_online', { sex: peer.sex });
    }
    if (Peer.isVkAdministration(peer.id)) {
        return lang.use('me_service_notifications_label');
    }
    if (peer.kind === 'Contact') {
        switch (peer.lastSeen) {
            case 'today':
                return lang.use('global_online_was_today', { sex: 'male' });
            case 'recently':
                return lang.use('global_online_was_recently', { sex: 'male' });
            default:
                return '';
        }
    }
    if (!lastSeen) {
        return '';
    }
    if (lastSeen.isOnline) {
        return lang.use('global_online', { sex: peer.sex });
    }
    if (typeof lastSeen.at === 'number') {
        return lang.use('me_online_was_time', {
            sex: peer.sex,
            values: {
                time: lang.formatDate(lastSeen.at, {
                    now,
                    variant: 'time-ago',
                }),
            },
        });
    }
    let langKey;
    switch (lastSeen.at) {
        case 'recently':
            langKey = 'global_online_was_recently';
            break;
        case 'last_week':
            langKey = 'global_online_was_week';
            break;
        case 'last_month':
            langKey = 'global_online_this_month';
            break;
        case 'long_ago':
        case 'not_show': // Лучше написать "заходил давно", чем ничего не писать
            langKey = 'global_online_long_ago';
            break;
        default:
            const _typeguard = lastSeen.at;
            return '';
    }
    return lang.use(langKey, { sex: peer.sex });
};
/**
 * Поскольку пользователь меняется редко, можем оптимизировать через React.memo
 */
export const OnlineStatus = React.memo(function OnlineStatus({ className, user, isTyping = false }) {
    const { lang } = useBrowserEnv();
    const lastSeen = useLastSeen(user.id);
    const now = useNow(1000 * 60 * 10);
    const value = getOnlineStatus(lang, user, now, lastSeen, isTyping);
    return React.createElement("span", { className: className }, value ?? React.createElement(React.Fragment, null, "\u00A0"));
});
//# sourceMappingURL=OnlineStatus.js.map