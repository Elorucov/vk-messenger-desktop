import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"Icon24ChevronDown":["@vkontakte/icons",{"className":1,"width":1,"height":1}],"CustomScrollView":["Adopted",{"className":1}]} */
import { Icon24ChevronDown } from '@vkontakte/icons';
import { useEffect, useRef, useState } from 'react';
import { CustomScrollView, useAdaptivityWithJSMediaQueries } from '../Adopted';
import { DropdownActionSheetItem } from './DropdownActionSheetItem';
import { DropdownActionSubSheetItem } from './DropdownActionSubSheetItem';
import styles from './DropdownActionSubSheet.module.css';
const APPEARING_DELAY = 150;
const DropdownActionSubSheetComponent = ({ sheet, after, maxHeight, children, shown: shownProp, onClick: externalOnClick, ...restProps }) => {
    const { hasPointer } = useAdaptivityWithJSMediaQueries();
    const [isSubListShown, setIsSubListShown] = useState(false);
    const timeoutRef = useRef(null);
    const scrollViewRef = useRef(null);
    const onMouseEnter = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
            return;
        }
        timeoutRef.current = window.setTimeout(() => {
            setIsSubListShown(true);
            timeoutRef.current = null;
        }, APPEARING_DELAY);
    };
    const onMouseLeave = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
            return;
        }
        timeoutRef.current = window.setTimeout(() => {
            setIsSubListShown(false);
            timeoutRef.current = null;
        }, APPEARING_DELAY);
    };
    useEffect(() => () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
            return;
        }
    }, []);
    const onFocus = () => {
        setIsSubListShown(true);
    };
    const onClick = (e) => {
        setIsSubListShown((prevState) => !prevState);
        externalOnClick && externalOnClick(e);
    };
    if (!after) {
        /**
         * TODO Шеврона вниз 20 нет в библиотеке, нужно порешать
         */
        after = _jsx(Icon24ChevronDown, { className: styles.icon, width: 20, height: 20 });
    }
    const hasFocus = hasPointer && !shownProp;
    const hasClick = !hasPointer && !shownProp;
    const isShown = shownProp || isSubListShown;
    return (_jsxs(_Fragment, { children: [_jsx(DropdownActionSheetItem, { after: after, hasHover: !shownProp, hasActive: !shownProp, onPointerEnter: hasFocus ? onMouseEnter : undefined, onPointerLeave: hasFocus ? onMouseLeave : undefined, onFocus: hasFocus ? onFocus : undefined, onClick: hasClick ? onClick : undefined, keepOpen: true, ...restProps, children: children }), isShown && sheet && (
            // eslint-disable-next-line jsx-a11y/prefer-tag-over-role
            _jsx("div", { role: "list", ref: scrollViewRef, style: { maxHeight }, onMouseEnter: hasFocus ? onMouseEnter : undefined, children: Boolean(maxHeight) ? (_jsx(CustomScrollView, { boxRef: scrollViewRef, className: styles.scrollView, noOverscroll: true, children: sheet })) : (sheet) }))] }));
};
export const DropdownActionSubSheet = Object.assign(DropdownActionSubSheetComponent, {
    Item: DropdownActionSubSheetItem,
});
//# sourceMappingURL=DropdownActionSubSheet.js.map