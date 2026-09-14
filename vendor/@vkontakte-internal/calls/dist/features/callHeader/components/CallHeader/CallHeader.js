import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":11}],"Icon16Connection":["@vkontakte/icons",{"className":1}]} */
import { memo, useEffect } from 'react';
import { Button, ColorSchemeProvider, TextTooltip, VisuallyHidden } from '@vkontakte-internal/vkcom-kit';
import { classNames as cx } from '@vkontakte/vkjs';
import { Icon12Chain, Icon16Connection, Icon16Hand } from '@vkontakte/icons';
import { useLang } from '../../../../hooks/useLang';
import { useTypedSelector } from '../../../../hooks/useTypedSelector';
import { E_ACTION, useTypedDispatch } from '../../../../hooks/useTypedDispatch';
import { getLocalNetworkRating, getNetworkRatingColorClass, getWasNetworkIndicatorShown, } from '../../../networkIndicator';
import { ClickHouseEventType, useSendStatsService } from '../../../../stats/clickHouse';
export const CallHeader = memo(function CallHeader({ translation, roomStatus, speakers, hands, time, networkTooltipText, isTranslationRecord, isChainControls, onChainClick, asr, }) {
    const { getLang, langNumeric } = useLang();
    const dispatch = useTypedDispatch();
    const localNetworkRating = useTypedSelector(getLocalNetworkRating);
    const wasNetworkIndicatorShown = useTypedSelector(getWasNetworkIndicatorShown);
    const sendStats = useSendStatsService();
    const CallInfoHandsClasses = cx('CallHeader__hands', {
        'CallHeader__hands--visible': hands > 0,
    });
    const isDividerShown = !!roomStatus || !!isTranslationRecord || !!asr;
    const networkStateColorClass = getNetworkRatingColorClass(localNetworkRating);
    // Логика отправки события отображения индикатора плохой собственной сети
    useEffect(() => {
        const isNetworkStateShown = !!networkStateColorClass;
        // Если сохраненное состояние в стейте и текущее в компоненте совпадают - ничего не делаем
        if ((wasNetworkIndicatorShown && isNetworkStateShown) ||
            (!wasNetworkIndicatorShown && !isNetworkStateShown)) {
            return;
        }
        // Если отобразился индикатор - отправляем событие
        if (isNetworkStateShown) {
            sendStats(ClickHouseEventType.CURRENT_USER_BAD_CONNECTION_ALERT, {
                // Переводим рейтинг в проценты, потому что event_param - int32
                event_param: Math.round(localNetworkRating * 100),
            });
        }
        // Сохраняем в стейт состояние отображения индикатора
        dispatch({
            type: E_ACTION.SET_WAS_NETWORK_INDICATOR_SHOWN,
            data: isNetworkStateShown,
        });
    }, [networkStateColorClass, wasNetworkIndicatorShown]);
    return (_jsxs("div", { className: "CallHeader", children: [_jsxs("div", { className: "CallHeader__main", children: [_jsxs("div", { className: cx({
                            'CallHeader__timeAndNetwork': true,
                            'CallHeader__timeAndNetwork--is-smaller': isDividerShown,
                        }), children: [networkStateColorClass && (_jsx(TextTooltip, { text: networkTooltipText, placement: "bottom", usePortal: false, children: _jsx("div", { className: "CallHeader__network", children: _jsx(Icon16Connection, { className: networkStateColorClass }) }) })), time] }), isDividerShown && _jsx("div", { className: "CallHeader__divider" }), roomStatus && _jsx("div", { className: "CallHeader__rooms", children: roomStatus }), translation && _jsx("div", { className: "CallHeader__translation", children: translation }), asr && _jsx("div", { className: "CallHeader__asr", children: asr })] }), _jsxs("div", { className: "CallHeader__aside", children: [_jsx("div", { className: "CallHeader__participants", children: speakers }), _jsxs("div", { className: CallInfoHandsClasses, children: [_jsx(Icon16Hand, {}), "\u00A0", hands, _jsxs(VisuallyHidden, { children: ["\u00A0", langNumeric(hands, 'calls_raised_hands', getLang('calls_raised_hands', 'raw'))] })] }), isChainControls && (_jsx(ColorSchemeProvider, { value: "dark", children: _jsx("div", { children: _jsx(Button, { "data-focus-first": true, appearance: "neutral", mode: "secondary", "data-testid": "calls_call_link_settings_button", before: _jsx(Icon12Chain, {}), size: "m", onClick: onChainClick, "aria-label": getLang('calls_menu_link_setup'), children: getLang('calls_link') }) }) }))] })] }));
});
//# sourceMappingURL=CallHeader.js.map