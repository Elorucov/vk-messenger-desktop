import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":1}],"Subhead":["@vkontakte-internal/vkcom-kit",{"className":1}],"Icon20BrushOutline":["@vkontakte/icons",{"className":1}]} */
import { Subhead } from '@vkontakte-internal/vkcom-kit';
import { useStore } from 'effector-react';
import { classNames } from '@vkontakte/vkjs';
import { Icon20BrushOutline } from '@vkontakte/icons';
import { useLangPack } from '@vkontakte-internal/langs';
import { $vmojiPromotion } from '../../../model/stickers/vmojiPromotion';
import { useStickersKeyboard } from '../../../hooks/stickersKeyboard';
import styles from './VmojiEditButton.module.css';
// eslint-disable-next-line css-modules/no-unused-class
import headerStyle from '../StickersKeyboardHeader.module.css';
const MAX_COUNTER_VALUE = 99;
export function VmojiEditButton({ pack }) {
    const { translate } = useLangPack();
    const { onVmojiEditClick } = useStickersKeyboard();
    const vmojiPromotion = useStore($vmojiPromotion);
    if (!pack?.isVmoji || !onVmojiEditClick) {
        return null;
    }
    const { vmojiAvatar } = pack;
    const newItemsCounter = vmojiPromotion?.constructor_new_items?.counter_value;
    const newItemsOpenParams = vmojiPromotion?.constructor_new_items?.open_params;
    const hasNewItems = Number(newItemsCounter) > 0;
    const handleBrushClick = () => {
        if (!vmojiAvatar) {
            return;
        }
        onVmojiEditClick?.(vmojiAvatar, newItemsOpenParams);
    };
    let counter = translate('stickers_picker_vmoji_items_counter', {
        count: newItemsCounter,
    });
    if (Number(newItemsCounter) >= MAX_COUNTER_VALUE) {
        counter = translate('stickers_picker_vmoji_items_counter_max', {
            count: MAX_COUNTER_VALUE,
        });
    }
    return (_jsxs("div", { className: classNames(styles.brush, headerStyle.headerAside), onClick: handleBrushClick, children: [hasNewItems && (_jsx(Subhead, { className: classNames(styles.counter, headerStyle.icon), weight: "3", children: counter })), _jsx(Icon20BrushOutline, { className: headerStyle.icon })] }));
}
//# sourceMappingURL=VmojiEditButton.js.map