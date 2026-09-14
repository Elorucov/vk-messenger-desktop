import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"span":["global",{"className":5}],"Icon16Hand":["@vkontakte/icons",{"className":1}],"Icon16MicrophoneSlash":["@vkontakte/icons",{"className":1}]} */
import { classNames as cx } from '@vkontakte/vkjs';
import CallingStatus from '../../components/CallingStatus/CallingStatus';
import { Icon16MicrophoneSlash, Icon16Hand } from '@vkontakte/icons';
import { VolumeMeterAnimation } from '../VolumeMeterAnimation/VolumeMeterAnimation';
import { useLang } from '../../hooks/useLang';
import { TextTooltip } from '@vkontakte-internal/vkcom-kit';
export const ParticipantIndicators = ({ showSpeaking, showAudioDisabled, showRaisedHand, showConnecting, showRaisedHandTooltip, onRaisedHandClick, }) => {
    const { getLang } = useLang();
    const raisedHandIcon = (_jsx("span", { className: cx('ParticipantIndicators__item', {
            'ParticipantIndicators__item--interactive': onRaisedHandClick !== undefined,
        }), onClick: onRaisedHandClick ?? undefined, children: _jsx(Icon16Hand, { className: "ParticipantIndicators__hand" }) }));
    return (_jsxs("span", { className: "ParticipantIndicators", "data-testid": "calls_participant_list_item_indicator", children: [showSpeaking && (_jsx("span", { className: "ParticipantIndicators__item", children: _jsx(VolumeMeterAnimation, {}) })), showAudioDisabled && (_jsx("span", { className: "ParticipantIndicators__item", children: _jsx(Icon16MicrophoneSlash, { className: "ParticipantIndicators__muted" }) })), showRaisedHand ? (showRaisedHandTooltip ? (_jsx(TextTooltip, { text: getLang('calls_participant_menu_enable_media_request'), placement: "top-end", appearance: "white", children: raisedHandIcon })) : (raisedHandIcon)) : null, showConnecting && (_jsx("span", { className: "ParticipantIndicators__item", children: _jsx(CallingStatus, {}) }))] }));
};
//# sourceMappingURL=ParticipantIndicators.js.map