import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"Icon16Connection":["@vkontakte/icons",{"className":1}],"span":["global",{"className":1}],"button":["global",{"className":1}],"div":["global",{"className":1}]} */
import { memo, useCallback } from 'react';
import { TOOLTIP_DELAY } from '../../constants';
import { isParticipantScreenSharingEnabled, } from '@vkontakte-internal/calls-core';
import { Icon16Connection, Icon16MicrophoneSlash, Icon16Pin, Icon16PinDot } from '@vkontakte/icons';
import { getUserName } from '../../helpers/user';
import { useLang } from '../../hooks/useLang';
import { TextTooltip } from '@vkontakte-internal/vkcom-kit';
import { getNetworkRatingColorClass } from '../../features/networkIndicator';
export const OratorTitle = memo(function OratorTitle({ orator, me, isPinned, isPinnedByAdmin, isPinnedByMedia, isUnpinAllowed, onUnpin, oratorDevice, meGroup, }) {
    const { getLang } = useLang();
    const isButton = isPinnedByAdmin || isPinnedByMedia || isPinned;
    const unpinHandler = useCallback(() => {
        onUnpin();
    }, [onUnpin]);
    const isMe = orator.peerId === me;
    const isAudioDisabled = (oratorDevice.wasConnected || isMe) && !oratorDevice.mediaSettings?.isAudioEnabled;
    const isScreenSharingEnabled = isParticipantScreenSharingEnabled(oratorDevice);
    const curOrator = (meGroup && isMe ? meGroup : orator) || undefined;
    const name = getUserName(curOrator);
    const networkStateColorClass = getNetworkRatingColorClass(oratorDevice.networkStatus ?? 1);
    const content = (_jsxs(_Fragment, { children: [isPinnedByAdmin && _jsx(Icon16PinDot, {}), !isPinnedByAdmin && (isPinnedByMedia || isPinned) && _jsx(Icon16Pin, {}), networkStateColorClass && _jsx(Icon16Connection, { className: networkStateColorClass }), isScreenSharingEnabled && _jsx("span", { children: getLang('calls_orator_screen_sharing') }), _jsx("span", { className: "OratorTitle__name", children: name }), isAudioDisabled && _jsx(Icon16MicrophoneSlash, {})] }));
    const tooltipText = isPinnedByAdmin && isUnpinAllowed
        ? getLang('calls_hint_admin_pin_for_admin')
        : isPinnedByAdmin
            ? getLang('calls_hint_admin_pin_for_user')
            : getLang('calls_hint_user_pin');
    return isButton ? (_jsx(TextTooltip, { placement: "bottom-start", text: tooltipText, hoverDelay: TOOLTIP_DELAY, children: _jsx("button", { "data-testid": "calls_orator_title_button", "aria-label": isPinnedByAdmin ? getLang('calls_hint_admin_pin_for_admin') : getLang('calls_hint_user_pin'), className: "OratorTitle OratorTitle--button", onClick: unpinHandler, disabled: !isUnpinAllowed, children: content }) })) : (_jsx("div", { className: "OratorTitle", children: content }));
});
//# sourceMappingURL=OratorTitle.js.map