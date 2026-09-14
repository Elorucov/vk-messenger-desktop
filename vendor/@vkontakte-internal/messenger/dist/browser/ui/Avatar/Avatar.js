import '../../ui/Avatar/Avatar.css';
import React, { useMemo } from 'react';
import cx from 'classnames';
import { useLastSeen } from '../../hooks/misc';
import { PeerAvatar } from '../../ui/PeerAvatar/PeerAvatar';
import { usePerformanceSettings } from '../../hooks/usePerformanceSettings';
/**
 * Поскольку пир меняется редко, можем оптимизировать через React.memo
 */
export const Avatar = React.memo(function Avatar({ peer, size, activityIndicator, withOnline = false, withBirthday = false, activeCall, className, isCollapsed = false, }) {
    const { enableAnimations } = usePerformanceSettings();
    const lastSeen = useLastSeen(peer.id);
    const isOnline = withOnline && !!lastSeen?.isOnline;
    const hasActiveCall = !!activeCall;
    const isBirthdayShown = withBirthday && checkIfBirthday(peer);
    const figureStyle = useMemo(() => {
        return {
            width: size,
            height: size,
        };
    }, [size]);
    const frameId = getFrameId(isOnline, size, !isCollapsed && (hasActiveCall || isBirthdayShown));
    const clipPath = `url(#${frameId}Mask${peer.id})`;
    const classNames = cx('MEAvatar', `MEAvatar--size-${size}`, {
        'MEAvatar--animated': enableAnimations,
        'MEAvatar--withActivity': !!activityIndicator,
        'MEAvatar--collapsed': isCollapsed,
    }, className);
    return (React.createElement("figure", { style: figureStyle, className: classNames, "aria-hidden": true },
        React.createElement("div", { className: "MEAvatar__imgWrapper", style: { clipPath } },
            React.createElement(PeerAvatar, { peer: peer, size: size }),
            activityIndicator && (React.createElement("div", { className: "MEAvatar__activityIndicator" }, activityIndicator))),
        React.createElement(OnlineIndicator, { isOnline: isOnline }),
        isBirthdayShown && (React.createElement("div", { className: cx('MEAvatar__icon MEAvatar__birthday MEAvatar__icon--upper-right') },
            React.createElement("svg", { className: "MEAvatar__upperRightIconSvg" }, size === 32 ? React.createElement("use", { href: "#meCake8" }) : React.createElement("use", { href: "#meCake10" })))),
        hasActiveCall && (React.createElement("div", { className: cx('MEAvatar__icon MEAvatar__call', {
                'MEAvatar__call--empty': activeCall === 'empty',
                'MEAvatar__icon--hidden': isCollapsed && activeCall === 'empty',
                'MEAvatar__icon--upper-right': !isCollapsed,
                'MEAvatar__icon--bottom-right': isCollapsed,
            }) },
            React.createElement("svg", { className: "MEAvatar__upperRightIconSvg" }, size === 32 ? (React.createElement("use", { href: "#mePhone8" })) : (React.createElement("use", { href: "#mePhone10" }))))),
        React.createElement("svg", { className: "MEAvatar__svg" },
            React.createElement("clipPath", { id: frameId + 'Mask' + peer.id },
                React.createElement("use", { href: '#' + frameId })),
            React.createElement("use", { href: '#' + frameId, className: "MEAvatar__shadow", clipPath: clipPath }))));
});
function getFrameId(isOnline, size, withTopRightIcon) {
    return `mePeerFrame${isOnline ? 'Online' : 'Offline'}${size}${withTopRightIcon ? 'c' : ''}`;
}
const OnlineIndicator = ({ isOnline }) => {
    return isOnline && React.createElement("div", { className: "MEAvatar__online" });
};
function checkIfBirthday(peer) {
    if (peer.kind !== 'User' || !peer.bdate) {
        return false;
    }
    const now = new Date();
    const currentDay = String(now.getDate());
    const currentMonth = String(now.getMonth() + 1);
    /**
     * Формат bdate = 'день.месяц<.год>?'
     * Пример: '1.6' или, если установлен год '1.6.1999'
     */
    const { day, month } = /(?<day>\d+)\.(?<month>\d+)/.exec(peer.bdate)?.groups || {};
    return day === currentDay && month === currentMonth;
}
//# sourceMappingURL=Avatar.js.map