import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"Icon20More":["@vkontakte/icons",{"className":1}]} */
import { useStore } from 'effector-react';
import { classNames } from '@vkontakte/vkjs';
import { useLangPack } from '@vkontakte-internal/langs';
import { Icon20More, Icon20ReportOutline } from '@vkontakte/icons';
import { DropdownActionSheet } from '@vkontakte-internal/vkcom-kit';
import { $ugcInfo } from '../../../model/stickers/ugc/info';
import { useStickersKeyboard } from '../../../hooks/stickersKeyboard';
// eslint-disable-next-line css-modules/no-unused-class
import styles from '../StickersKeyboardHeader.module.css';
export function UGCMoreButton({ pack }) {
    const { translate } = useLangPack();
    const { onUGCReportClick } = useStickersKeyboard();
    const ugcInfo = useStore($ugcInfo);
    if (!pack?.isPack || ugcInfo?.can_edit || !ugcInfo?.items?.length || !onUGCReportClick) {
        return null;
    }
    const reportClickHandler = () => {
        onUGCReportClick(pack.rawData);
    };
    return (_jsx(DropdownActionSheet, { content: _jsx(DropdownActionSheet.Item, { type: "destructive", before: _jsx(Icon20ReportOutline, {}), onClick: reportClickHandler, children: translate('stickers_picker_report') }), placement: "bottom-end", usePortal: false, children: _jsx(Icon20More, { className: classNames(styles.icon, styles.headerAside) }) }));
}
//# sourceMappingURL=UGCMoreButton.js.map