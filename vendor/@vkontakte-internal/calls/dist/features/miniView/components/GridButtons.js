import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":5}]} */
import { classNames } from '@vkontakte/vkjs';
import { Overlay, Flex } from '@vkontakte-internal/vkcom-kit';
import { CallsIconButton } from '../../../components/CallsIconButton';
import { Button } from './Button';
import styles from './GridButtons.module.css';
export function GridButtons({ topLeft, topRight, bottomLeft, bottomRight, redesign }) {
    return (_jsx(Overlay, { zIndex: 1, children: _jsxs("div", { className: classNames(styles.grid, redesign && styles.redesign), children: [_jsx("div", { className: styles.topLeft, children: makeButtons(topLeft, redesign) }), _jsx("div", { className: styles.topRight, children: makeButtons(topRight, redesign) }), _jsx("div", { className: styles.bottomLeft, children: makeButtons(bottomLeft, redesign) }), _jsx("div", { className: styles.bottomRight, children: makeButtons(bottomRight, redesign) })] }) }));
}
function makeButtons(buttons, redesign) {
    if (!buttons || !buttons.length) {
        return;
    }
    return (_jsx(Flex, { gap: "2xs", children: buttons.map(({ children, dataTestId, dataFocusFirst, ...rest }, i) => redesign ? (_jsx(Button, { "data-testid": dataTestId, "data-focus-first": dataFocusFirst, ...rest, children: children }, i)) : (_jsx(CallsIconButton, { "data-testid": dataTestId, "data-focus-first": dataFocusFirst, ...rest, children: children }, i))) }));
}
//# sourceMappingURL=GridButtons.js.map