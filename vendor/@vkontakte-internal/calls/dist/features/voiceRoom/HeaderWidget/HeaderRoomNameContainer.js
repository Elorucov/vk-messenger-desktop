import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":2}],"Icon24InfoCircleOutline":["@vkontakte/icons",{"className":1}]} */
import { Header, Title, TextClamp, TextTooltip, Spacing, } from '@vkontakte-internal/vkcom-kit';
import { Icon24InfoCircleOutline } from '@vkontakte/icons';
import { useTypedSelector } from '../../../hooks/useTypedSelector';
import { getIsVoiceRoomTribuneMode, getVoiceRoomDescription, getVoiceRoomName } from '../selectors';
import { classNames as cx } from '@vkontakte/vkjs';
export const HeaderRoomNameContainer = () => {
    const roomName = useTypedSelector(getVoiceRoomName);
    const roomDescription = useTypedSelector(getVoiceRoomDescription);
    const isTribune = useTypedSelector(getIsVoiceRoomTribuneMode);
    const hint = (_jsx(TextTooltip, { maxWidth: 316, text: _jsxs(_Fragment, { children: [_jsx("div", { className: cx('VoiceRoom__roomHintContentTitle', 'VoiceRoom__roomHintContent'), children: roomName }), roomDescription && (_jsxs(_Fragment, { children: [_jsx(Spacing, { size: 8 }), _jsx("div", { className: "VoiceRoom__roomHintContent", children: roomDescription })] }))] }), children: _jsx(Icon24InfoCircleOutline, { className: "VoiceRoom__roomHint" }) }));
    return (_jsx(Header, { aside: isTribune && hint, children: _jsx(TextClamp, { lines: 1, Component: TitleLevel2, children: roomName }) }));
};
function TitleLevel2(props) {
    return _jsx(Title, { level: "2", ...props });
}
//# sourceMappingURL=HeaderRoomNameContainer.js.map