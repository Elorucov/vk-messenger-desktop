import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { Icon16ArrowUpRectangle, Icon16Hand, Icon16PinDot } from '@vkontakte/icons';
import { Icon16LiveBadge, Icon16LiveBadgeColor } from '@vkontakte-internal/icons-private';
import { getColorClass, IconButton, TextTooltip } from '@vkontakte-internal/vkcom-kit';
import { useLang } from '../../hooks/useLang';
import styles from './ParticipantItemIndicators.module.css';
export function ParticipantItemIndicators({ device, hasLiveTranslation, isHandRaised, isHandRaisedTooltipEnabled, isLiveTranslationStarted, isPinned, isScreenShared, onClickHandRaised, }) {
    const { getLang } = useLang();
    const indicators = [];
    if (isHandRaised) {
        let handButton = (_jsx(IconButton, { label: getLang('calls_put_hand_down'), className: styles.buttonHand, "data-testid": `calls_participant_item_indicators_hand_${device.externalId?.id}`, disabled: !onClickHandRaised, noPadding: true, onClick: onClickHandRaised, children: _jsx(Icon16Hand, {}) }, "hand"));
        if (isHandRaisedTooltipEnabled) {
            handButton = (_jsx(TextTooltip, { text: getLang('calls_put_hand_down'), children: handButton }, "hand"));
        }
        indicators.push(handButton);
    }
    if (hasLiveTranslation) {
        indicators.push(isLiveTranslationStarted ? (_jsx(Icon16LiveBadge, {}, "live")) : (_jsx(Icon16LiveBadgeColor, { className: getColorClass('color_icon_secondary') }, "live")));
    }
    if (isPinned) {
        indicators.push(_jsx(Icon16PinDot, { className: getColorClass('color_icon_secondary') }, "pinDot"));
    }
    if (isScreenShared) {
        indicators.push(_jsx(Icon16ArrowUpRectangle, { className: getColorClass('color_icon_secondary') }, "screenSharing"));
    }
    return indicators.length ? _jsx("div", { className: styles.indicators, children: indicators }) : _jsx(_Fragment, {});
}
//# sourceMappingURL=ParticipantItemIndicators.js.map