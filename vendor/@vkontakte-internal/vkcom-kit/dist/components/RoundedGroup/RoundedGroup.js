import { jsx as _jsx } from "react/jsx-runtime";
import { classNames } from '@vkontakte/vkjs';
import { useMemo } from 'react';
import { RoundedGroupContextProvider } from './RoundedGroupContext';
import { RoundedGroupItem } from './RoundedGroupItem/RoundedGroupItem';
import { RoundedGroupSeparatorSpacing } from './RoundedGroupSeparatorSpacing/RoundedGroupSeparatorSpacing';
import styles from './RoundedGroup.module.css';
const directionModifiersMap = {
    'vertical': styles.rootVertical,
    'vertical-left': classNames(styles.rootVertical, styles.rootLeft),
    'vertical-right': classNames(styles.rootVertical, styles.rootRight),
    'horizontal': styles.rootHorizontal,
    'horizontal-left': classNames(styles.rootHorizontal, styles.rootLeft),
    'horizontal-center': classNames(styles.rootHorizontal, styles.rootCenter),
    'horizontal-right': classNames(styles.rootHorizontal, styles.rootRight),
};
const RoundedGroupComponent = ({ gap, direction, ...restProps }) => {
    const context = useMemo(() => ({
        direction,
    }), [direction]);
    const style = {
        '--rounded-group-gap': `${gap ?? 0}px`,
    };
    return (_jsx(RoundedGroupContextProvider, { value: context, children: _jsx("div", { "data-testid": "roundedgroup", className: classNames(styles.root, gap && styles.rootWithGap, directionModifiersMap[direction]), style: style, ...restProps }) }));
};
export const RoundedGroup = Object.assign(RoundedGroupComponent, {
    Item: RoundedGroupItem,
    SeparatorSpacing: RoundedGroupSeparatorSpacing,
});
//# sourceMappingURL=RoundedGroup.js.map