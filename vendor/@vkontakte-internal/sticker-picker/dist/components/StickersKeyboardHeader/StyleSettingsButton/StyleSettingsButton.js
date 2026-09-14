import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"Icon20GearOutline":["@vkontakte/icons",{"className":1}]} */
import { classNames } from '@vkontakte/vkjs';
import { Icon20GearOutline } from '@vkontakte/icons';
import { useStickersKeyboard } from '../../../hooks/stickersKeyboard';
import styles from './StyleSettingsButton.module.css';
// eslint-disable-next-line css-modules/no-unused-class
import headerStyles from '../StickersKeyboardHeader.module.css';
export function StyleSettingsButton({ pack }) {
    const { onStockItemSettingsClick } = useStickersKeyboard();
    if (!onStockItemSettingsClick) {
        return null;
    }
    const hasSettings = pack?.hasStyles || pack?.isStyle || pack?.isVmoji;
    if (!pack || !hasSettings) {
        return null;
    }
    const { stockItem } = pack;
    const handleSettingsClick = () => {
        if (!stockItem) {
            return;
        }
        onStockItemSettingsClick?.(stockItem);
    };
    return (_jsx(Icon20GearOutline, { className: classNames(styles.icon, headerStyles.icon), onClick: handleSettingsClick }));
}
//# sourceMappingURL=StyleSettingsButton.js.map