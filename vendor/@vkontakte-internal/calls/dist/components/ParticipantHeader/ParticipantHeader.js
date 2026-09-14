import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"Icon16PinDot":["@vkontakte/icons",{"className":1}],"Icon16Pin":["@vkontakte/icons",{"className":1}],"header":["global",{"className":1}],"div":["global",{"className":3}],"img":["global",{"className":1}]} */
import { AdaptivityProvider, SizeType } from '@vkontakte-internal/vkcom-kit';
import { classNames as cx } from '@vkontakte/vkjs';
import { Icon16Pin, Icon16PinDot, Icon24Privacy } from '@vkontakte/icons';
import { ParticipantMenuWidget } from '../ParticipantMenu';
import { ActionsIcon } from './ActionsIcon';
const ParticipantMenuContainer = ({ children }) => (_jsx(AdaptivityProvider, { sizeX: SizeType.REGULAR, sizeY: SizeType.COMPACT, children: children }));
const ParticipantMenuButton = ({ hasActions, ...rest }) => hasActions && _jsx(ActionsIcon, { ...rest });
export const ParticipantHeader = ({ externalId, isPinned, isPinnedByAdmin, isVisible, isHandRaised, reaction, reactions, raisedHandLabel, }) => {
    const isPinVisible = isPinned || isPinnedByAdmin;
    const getPinIcon = () => {
        return isPinnedByAdmin ? (_jsx(Icon16PinDot, { className: "Participant__pin" })) : (_jsx(Icon16Pin, { className: "Participant__pin" }));
    };
    if (!isVisible) {
        return null;
    }
    return (_jsxs("header", { className: "Participant__header", children: [_jsxs("div", { className: "Participant__indicators", children: [isHandRaised && (_jsx("div", { "aria-label": raisedHandLabel, "aria-live": "polite", className: cx('Participant__indicator', 'Participant__indicator--hand'), children: _jsx(Icon24Privacy, {}) })), !!(reaction && reactions) && (_jsx("div", { className: cx('Participant__indicator', 'Participant__indicator--reaction'), children: _jsx("img", { className: "Participant__indicator--reaction__pic", src: reactions[24][reaction.key], srcSet: `${reactions[48][reaction.key]} 1.5x`, alt: reaction.key }) }))] }), isPinVisible && getPinIcon(), _jsx(ParticipantMenuWidget, { buttonComponent: ParticipantMenuButton, containerComponent: ParticipantMenuContainer, externalId: externalId, trigger: "click", useLegacyDropdown: true })] }));
};
export default ParticipantHeader;
//# sourceMappingURL=ParticipantHeader.js.map