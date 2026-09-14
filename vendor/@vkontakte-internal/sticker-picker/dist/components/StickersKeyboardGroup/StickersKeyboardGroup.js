import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":1,"style":1}]} */
import { useStore } from 'effector-react';
import { classNames } from '@vkontakte/vkjs';
import { useMemo, useRef, useState, useLayoutEffect } from 'react';
import { StickersKeyboardGroupItem } from '../StickersKeyboardGroupItem/StickersKeyboardGroupItem';
import { $selectedPackKey } from '../../model/stickers/packs/selected';
import { $packs, ServicePackKey } from '../../model/stickers/packs';
import { useStickersKeyboardSelect } from '../../hooks/stickersKeyboard';
import styles from './StickersKeyboardGroup.module.css';
const getDataTestID = (group) => {
    switch (group) {
        case ServicePackKey.FAVORITE:
            return 'stickers-keyboard-group-favorite';
        case ServicePackKey.RECENT:
            return 'stickers-keyboard-group-recent';
        case ServicePackKey.VMOJI:
            return 'stickers-keyboard-group-vmoji';
        case ServicePackKey.UGC:
            return 'stickers-keyboard-group-ugc';
        default:
            return '';
    }
};
export function StickersKeyboardGroup({ group, className, ...props }) {
    const { selectPack } = useStickersKeyboardSelect();
    const selectedPackKey = useStore($selectedPackKey);
    const { packs } = useStore($packs);
    const ref = useRef(null);
    const [itemWidth, setItemWidth] = useState();
    const handleStockItemClick = (key) => () => {
        selectPack(key);
    };
    const items = useMemo(() => {
        if (!Array.isArray(group)) {
            group = [group];
        }
        if (!packs) {
            return;
        }
        return group.map((key) => {
            const pack = packs.get(key);
            if (!pack) {
                return;
            }
            return (_jsx(StickersKeyboardGroupItem, { className: styles.item, pack: pack, active: key === selectedPackKey, onClick: handleStockItemClick(key) }, key));
        });
    }, [group, packs, selectedPackKey]);
    useLayoutEffect(() => {
        const container = ref.current;
        if (!container) {
            return;
        }
        const itemWidth = container.children[0]?.clientWidth;
        if (!itemWidth) {
            return;
        }
        setItemWidth(itemWidth);
    }, [ref]);
    const isActive = Boolean(Array.isArray(group) && Number(items?.length) > 1 && selectedPackKey && group.includes(selectedPackKey));
    return (_jsx("div", { "data-testid": getDataTestID(group), ref: ref, className: classNames(styles.group, className, {
            [styles.groupActive]: isActive,
            [styles.groupHidden]: !itemWidth,
        }), style: {
            '--group-item-width': `${itemWidth}px`,
        }, ...props, children: items }));
}
//# sourceMappingURL=StickersKeyboardGroup.js.map