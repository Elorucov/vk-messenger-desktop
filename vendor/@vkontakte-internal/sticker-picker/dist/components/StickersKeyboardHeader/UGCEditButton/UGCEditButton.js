import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"Icon20GearOutline":["@vkontakte/icons",{"className":1}]} */
import { useStore } from 'effector-react';
import { classNames } from '@vkontakte/vkjs';
import { Icon20GearOutline } from '@vkontakte/icons';
import { $ugcInfo } from '../../../model/stickers/ugc/info';
import { useStickersKeyboard } from '../../../hooks/stickersKeyboard';
// eslint-disable-next-line css-modules/no-unused-class
import styles from '../StickersKeyboardHeader.module.css';
export function UGCEditButton({ pack }) {
    const { onUGCEditClick } = useStickersKeyboard();
    const ugcInfo = useStore($ugcInfo);
    if (!pack?.isPack || !ugcInfo?.can_edit || !ugcInfo?.items?.length || !onUGCEditClick) {
        return null;
    }
    return (_jsx(Icon20GearOutline, { className: classNames(styles.icon, styles.headerAside), onClick: onUGCEditClick }));
}
//# sourceMappingURL=UGCEditButton.js.map