import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"TextTooltip":["@vkontakte-internal/vkcom-kit",{"className":1}],"Icon16InfoOutline":["@vkontakte/icons",{"className":1}]} */
import { classNames } from '@vkontakte/vkjs';
import { Icon16InfoOutline } from '@vkontakte/icons';
import { useLangPack } from '@vkontakte-internal/langs';
import { TextTooltip } from '@vkontakte-internal/vkcom-kit';
import styles from './Tooltip.module.css';
// eslint-disable-next-line css-modules/no-unused-class
import headerStyles from '../StickersKeyboardHeader.module.css';
export function Tooltip({ pack: { tooltip } }) {
    const { translate } = useLangPack();
    if (!tooltip) {
        return null;
    }
    const { text, header } = tooltip;
    return (_jsx(TextTooltip, { className: styles.tooltip, appearance: "black", offsetByMainAxis: 8, usePortal: true, ...tooltip, header: !!header && translate(String(header)), text: !!text && translate(String(text)), children: _jsx(Icon16InfoOutline, { className: classNames(styles.icon, headerStyles.icon) }) }));
}
//# sourceMappingURL=Tooltip.js.map