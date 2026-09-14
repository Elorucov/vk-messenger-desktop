import { jsx as _jsx } from "react/jsx-runtime";
import { classNames } from '@vkontakte/vkjs';
import { useMemo, useState } from 'react';
import { vkuiCssVars } from '../../tokens/cssVars';
import { GridContextProvider } from './GridContext';
import { GridHorizontalScroll, } from './GridHorizontalScroll/GridHorizontalScroll';
import { GridItem } from './GridItem/GridItem';
import styles from './Grid.module.css';
const rowSpacingTokensMap = {
    regular: vkuiCssVars.sizeBasePaddingHorizontal.regular.value,
};
const columnSpacingTokensMap = {
    regular: vkuiCssVars.sizeBasePaddingVertical.regular.value,
};
const GridComponent = ({ getRootRef, spacing = 0, stretched, columns: columnsProp = 'dynamic', rowSpacing: rowSpacingProp, columnSpacing: columnSpacingProp, hasSeparator, children, className, style, ['data-testid']: testId = 'grid', ...restProps }) => {
    const columns = columnsProp === 'dynamic' ? 0 : columnsProp;
    const [hasHorizontalScroll, setHasHorizontalScroll] = useState();
    const context = useMemo(() => ({
        hasColumns: columns > 0,
        hasHorizontalScroll,
        setHasHorizontalScroll,
        hasSeparator,
    }), [columns, hasHorizontalScroll, hasSeparator]);
    const rowSpacing = rowSpacingProp ?? spacing;
    const columnSpacing = columnSpacingProp ?? spacing;
    const rootStyle = {
        '--grid-columns': String(columns),
        '--grid-row-spacing': typeof rowSpacing === 'string' ? rowSpacingTokensMap[rowSpacing] : `${rowSpacing}px`,
        '--grid-column-spacing': typeof columnSpacing === 'string' ? columnSpacingTokensMap[columnSpacing] : `${columnSpacing}px`,
        ...style,
    };
    return (_jsx(GridContextProvider, { value: context, children: _jsx("div", { "data-testid": testId, ref: getRootRef, className: classNames(styles.root, stretched && styles.rootStretched, hasHorizontalScroll && styles.rootHasHorizontalScroll, className), style: rootStyle, ...restProps, children: children }) }));
};
export const Grid = Object.assign(GridComponent, {
    Item: GridItem,
    HorizontalScroll: GridHorizontalScroll,
});
//# sourceMappingURL=Grid.js.map