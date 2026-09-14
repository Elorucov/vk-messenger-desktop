import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"SimpleCell":["Adopted",{"className":1}],"Footnote":["Adopted",{"className":1}],"Typography":["Adopted",{"className":1}]} */
import { Icon20CheckCircleOn } from '@vkontakte/icons';
import { classNames } from '@vkontakte/vkjs';
import { isValidElement } from 'react';
import { Footnote, Headline, SimpleCell, Spinner, Text } from '../Adopted';
import { Skeleton } from '../Skeleton/Skeleton';
import { TextClamp } from '../TextClamp/TextClamp';
import { useDropdownActionSheetContext } from './DropdownActionSheetContext';
import { DropdownActionSheetEmptyIcon } from './DropdownActionSheetEmptyIcon';
import styles from './DropdownActionSheetItem.module.css';
const sizeModifiersMap = {
    s: styles.containerSizeS,
    m: styles.containerSizeM,
};
const typeModifiersMap = {
    default: undefined,
    header: styles.containerTypeHeader,
    contrast: styles.containerTypeContrast,
    destructive: styles.containerTypeDestructive,
};
export const DropdownActionSheetItem = ({ meta, type = 'default', after, before, loading, keepOpen, selected, subtitle, multiline, subtitleBefore, badgeAfterTitle, children, className, ['data-testid']: dataTestId, onClick, ...restProps }) => {
    const { size, setIsShown } = useDropdownActionSheetContext();
    const handleClick = (event) => {
        onClick?.(event);
        if (!keepOpen) {
            setIsShown(false);
        }
    };
    const Typography = before ? Text : Headline;
    const isHeader = type === 'header';
    const isSkeletonChildren = isValidElement(children) && children.type === Skeleton;
    const hasBefore = before || loading;
    let title = (_jsxs(_Fragment, { children: [children, !!badgeAfterTitle && _jsx("span", { className: styles.titleBadge, children: badgeAfterTitle })] }));
    if (!isSkeletonChildren) {
        title = (_jsx(TextClamp, { Component: "span", lines: multiline ? 0 : 1, children: title }));
    }
    return (_jsx(SimpleCell, { "data-testid": dataTestId ?? 'dropdownactionsheet-item', className: classNames(styles.container, sizeModifiersMap[size], typeModifiersMap[type], hasBefore && styles.containerHasBefore, subtitle && styles.containerHasSubtitle, className), before: !!hasBefore && (_jsx("div", { className: styles.before, children: loading ? (_jsx(DropdownActionSheetEmptyIcon, { children: _jsx(Spinner, { size: "small" }) })) : (before) })), subtitle: !!subtitle && (_jsxs(Footnote, { Component: "span", className: styles.subtitle, children: [!!subtitleBefore && _jsx("span", { className: styles.subtitleBefore, children: subtitleBefore }), multiline || (isValidElement(subtitle) && subtitle.type === Skeleton) ? (subtitle) : (_jsx(TextClamp, { lines: 1, children: subtitle }))] })), after: Boolean(after || selected) && (_jsxs("div", { className: styles.after, children: [after, " ", selected && _jsx(Icon20CheckCircleOn, {})] })), hasHover: !isHeader, hasActive: !isHeader, onClick: handleClick, multiline: true, ...restProps, children: _jsxs(Typography, { Component: "span", className: styles.in, children: [title, !!meta && _jsx("span", { className: styles.meta, children: meta })] }) }));
};
//# sourceMappingURL=DropdownActionSheetItem.js.map