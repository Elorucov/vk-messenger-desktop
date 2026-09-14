import '../../ui/ConvoHistoryPlaceholderUserInfo/ConvoHistoryPlaceholderUserInfo.css';
import React, { Fragment, useMemo } from 'react';
import { PeerAvatar } from '../../ui/PeerAvatar/PeerAvatar';
import * as Peer from '../../../core/model/Peer';
import { Icon20CakeOutline, Icon20EducationOutline, Icon20HomeOutline, Icon20WorkOutline, } from '@vkontakte/icons';
import { useBrowserEnv } from '../../hooks/misc';
import { useMutualHint } from '../../hooks/useMutualFriends';
import cx from 'classnames';
import { UsersStack } from '../../ui/UsersStack/UsersStack';
import { EmployeeVacationMark } from '../../ui/EmployeeVacationMark/EmployeeVacationMark';
import { useNow } from '../../hooks/useNow';
import { Time } from '../../../core/utils/time';
export const ConvoHistoryPlaceholderUserInfo = ({ peer, isCompactView, isEdu }) => {
    const { lang } = useBrowserEnv();
    // Обновление текущей даты нам тут на практике не нужно,
    // поэтому выставим очень большой интервал обновления
    const now = useNow(Time.Hour);
    const mutualFriends = useMutualHint(peer);
    const contactName = peer.contactName;
    const additionalInfo = () => {
        if (isEdu) {
            return null;
        }
        if (peer.occupation) {
            const icon = peer.occupation.type === 'work' ? (React.createElement(Icon20WorkOutline, null)) : (React.createElement(Icon20EducationOutline, null));
            return (React.createElement(React.Fragment, null,
                icon,
                " ",
                peer.occupation.name));
        }
        if (peer.bdate) {
            const [day, month] = peer.bdate.split('.').map(Number);
            if (day && month) {
                const textDate = lang.use('global_short_date', {
                    now,
                    // Замокаем год, поскольку он не важен для отображения
                    date: new Date(1970, month - 1, day).getTime(),
                });
                return (React.createElement(React.Fragment, null,
                    React.createElement(Icon20CakeOutline, null),
                    " ",
                    textDate));
            }
        }
        if (peer.city) {
            return (React.createElement(React.Fragment, null,
                React.createElement(Icon20HomeOutline, null),
                " ",
                peer.city.title));
        }
        return React.createElement(React.Fragment, null);
    };
    const additionalInfoText = additionalInfo();
    const callToWriteText = useMemo(() => {
        if (peer.isDeactivated &&
            peer.deactivationReason === Peer.DEACTIVATED_REASON_DELETED) {
            return lang.use('me_convo_empty_history_call_to_write_deleted');
        }
        if (peer.isDeactivated &&
            peer.deactivationReason === Peer.DEACTIVATED_REASON_BANNED) {
            return lang.use('me_convo_empty_history_call_to_write_banned');
        }
        return lang.use('me_convo_empty_history_call_to_write_new', {
            sex: peer.sex,
        });
    }, [peer, lang]);
    const userName = useMemo(() => {
        if (peer.isDeactivated &&
            peer.deactivationReason === Peer.DEACTIVATED_REASON_DELETED) {
            return lang.use('me_convo_empty_history_user_name_deleted');
        }
        if (peer.isDeactivated &&
            peer.deactivationReason === Peer.DEACTIVATED_REASON_BANNED) {
            return lang.use('me_convo_empty_history_user_name_banned');
        }
        return Peer.name(peer);
    }, [peer, lang]);
    return (React.createElement("div", { className: cx('ConvoHistoryPlaceholderUserInfo', {
            'ConvoHistoryPlaceholderUserInfo--s': isCompactView,
        }) },
        React.createElement("div", { className: "ConvoHistoryPlaceholderUserInfo__photoWrap" },
            React.createElement(PeerAvatar, { peer: peer, size: isCompactView ? 64 : 80 })),
        React.createElement("div", { className: "ConvoHistoryPlaceholderUserInfo__name" }, userName),
        React.createElement(EmployeeVacationMark, { hasIcon: true, capitalize: true, peer: peer, Wrapper: ({ children }) => (React.createElement("div", { className: "ConvoHistoryPlaceholderUserInfo__badge" }, children)) }),
        contactName && (React.createElement("div", { className: "ConvoHistoryPlaceholderUserInfo__savedAs" }, lang.use('me_saved_in_contacts_as', {
            sex: peer.sex,
            values: {
                contact: contactName,
            },
        }))),
        !isCompactView && (React.createElement("div", { className: "ConvoHistoryPlaceholderUserInfo__description" }, callToWriteText.split('\n').map((item, index) => (React.createElement(Fragment, { key: index },
            item,
            " ",
            React.createElement("br", null)))))),
        !isEdu && additionalInfoText && !peer.isDeactivated && (React.createElement("div", { className: "ConvoHistoryPlaceholderUserInfo__additionalInfo" }, additionalInfoText)),
        !isEdu &&
            mutualFriends &&
            mutualFriends.count > 0 &&
            !peer.isDeactivated && (React.createElement(UsersStack, { count: mutualFriends.count, photos: mutualFriends.hint
                .map((user) => user?.photo)
                .filter((photo) => photo !== undefined), className: "ConvoHistoryPlaceholderUserInfo__mutualFriends" }, lang.use('me_n_common_friends', {
            num: mutualFriends.count,
        })))));
};
//# sourceMappingURL=ConvoHistoryPlaceholderUserInfo.js.map