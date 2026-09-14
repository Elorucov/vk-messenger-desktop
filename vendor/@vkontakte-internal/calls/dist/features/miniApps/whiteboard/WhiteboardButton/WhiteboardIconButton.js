import { jsx as _jsx } from "react/jsx-runtime";
import { Icon24ScribblePencilRectangle, Icon24ScribblePencilRectangleOutline } from '@vkontakte/icons';
import { CallsIconButton } from '../../../../components/CallsIconButton';
export const WhiteboardIconButton = (props) => {
    const { active, disabled, href, onClick, tooltip } = props;
    return (_jsx(CallsIconButton, { active: active, after: "beta", disabled: disabled, href: href, onClick: onClick, target: href ? '_blank' : undefined, tooltip: tooltip, children: disabled ? _jsx(Icon24ScribblePencilRectangleOutline, {}) : _jsx(Icon24ScribblePencilRectangle, {}) }));
};
//# sourceMappingURL=WhiteboardIconButton.js.map