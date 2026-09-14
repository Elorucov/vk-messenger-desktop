import { jsx as _jsx } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { size } from '@floating-ui/core';
import { DropdownActionSheet, } from '@vkontakte-internal/vkcom-kit';
/** Отступ от нижнего края меню до границы экрана */
export const MENU_MARGIN_BOTTOM = 8;
/** Дополнительный правый пэддинг пункта меню, препятствующий обрезанию текста многоточием */
export const MENU_ITEM_PADDING_RIGHT = 2;
/** максимальная ширина меню */
export const MENU_MAX_WIDTH = 280;
export function Menu({ children, onShownChanged, ...props }) {
    const [maxHeight, setMaxHeight] = useState(0);
    const [width, setWidth] = useState(undefined);
    const customMiddlewares = useMemo(() => [
        size({
            apply({ availableHeight, rects, elements }) {
                const newMaxHeight = availableHeight - MENU_MARGIN_BOTTOM;
                setWidth((width) => width || Math.min(rects.floating.width + MENU_ITEM_PADDING_RIGHT, MENU_MAX_WIDTH));
                setMaxHeight(newMaxHeight);
                Object.assign(elements.floating.style, { maxHeight: `${newMaxHeight}px` });
            },
            padding: MENU_MARGIN_BOTTOM,
        }),
    ], []);
    const handleShownChanged = (value) => {
        onShownChanged?.(value);
        if (!value) {
            // Сбрасываем сохраненную ширину меню для пересчета при каждом закрытии
            setWidth(undefined);
        }
    };
    let sizeProps = {};
    if (maxHeight && width) {
        sizeProps = {
            maxHeight,
            width,
        };
    }
    return (_jsx(DropdownActionSheet, { ...props, customMiddlewares: customMiddlewares, onShownChanged: handleShownChanged, ...sizeProps, children: children }));
}
//# sourceMappingURL=Menu.js.map