import '../../ui/AttachesGrid/AttachesGrid.css';
import React, { Children, useCallback } from 'react';
import { computeAttachePhotosLayout } from '../../utils/imagesLayout';
import { getAttachForwardIndent } from '../../utils/misc';
import { useImagesLayout } from '../../ui/ConvoHistory/ImagesLayoutContext';
import { useWithoutBubblesTheme } from '../../hooks/useWithoutBubblesTheme';
import { classNames as cx } from '@vkontakte/vkjs';
import { useFeatureFlags } from '../../hooks/misc';
const ATTACH_GRID_GAP = 2;
/**
 * Компонент для отображения любых аттачей сообщения в сетке
 */
export const AttachesGrid = ({ children, forwardLevel = 0, withBorders = true, withBottomBorderRadius = true, onWidthChange, }) => {
    const featureFlags = useFeatureFlags();
    const forwardIndent = getAttachForwardIndent(forwardLevel, featureFlags.vkm_new_forward);
    const { width, minHeight, preferredRatio } = useImagesLayout();
    const commonLayoutWidth = width - forwardIndent;
    const attachesWithSizes = applyOnlyWithSizesAttachesFilter(Children.toArray(children));
    const attachesRectangulars = mapAttachToRectangle(children);
    /**
     * Столкнулись с тем, что в чатах сотрудников (со всякими вотчдогами) есть аттачи фото,
     * которые могут почему-то в объекте аттача фото иметь пустой массив с размерами (size)
     * и даже не иметь url.
     * Такие вещи пропускаем мимо и не "ужимаем" баббл и вообще не вмешиваемся дерево компонентов если они не имеют форму прямоугольника
     * (имеют пропсы width/height)
     */
    if (!attachesRectangulars.length && featureFlags.vkm_new_bubbles_width_calc) {
        return children;
    }
    if ((!attachesRectangulars.length &&
        !featureFlags.vkm_new_bubbles_width_calc) ||
        attachesRectangulars.length === 1) {
        return (React.createElement(GridContainer, { onWidthChange: onWidthChange, gap: ATTACH_GRID_GAP, withBorder: withBorders, withBottomBorderRadius: withBottomBorderRadius }, children));
    }
    const grid = applyGap(computeAttachePhotosLayout(preferredRatio, commonLayoutWidth, {
        minHeight,
    }, 
    // выше мы проверили что массив имеет элементы "if (!attachesRectangulars.length)"
    attachesRectangulars), ATTACH_GRID_GAP);
    const attachesGrid = grid.map((row, rowIndex, rowArr) => row.map((rect, colIndex, colArr) => {
        const { i, width, height } = rect;
        const attach = attachesWithSizes[i];
        if (!attach || !React.isValidElement(attach)) {
            return null;
        }
        return React.cloneElement(attach, {
            width,
            height,
            className: cx('AttachesGrid__item', {
                'AttachesGrid__item--radiusTopLeft': rowIndex === 0 && colIndex === 0,
                'AttachesGrid__item--radiusTopRight': rowIndex === 0 && colIndex === colArr.length - 1,
                'AttachesGrid__item--radiusBottomLeft': rowIndex === rowArr.length - 1 && colIndex === 0,
                'AttachesGrid__item--radiusBottomRight': rowIndex === rowArr.length - 1 && colIndex === colArr.length - 1,
            }),
        });
    }));
    return (React.createElement(GridContainer, { onWidthChange: onWidthChange, width: commonLayoutWidth, gap: ATTACH_GRID_GAP }, attachesGrid.map((row, i) => {
        return (React.createElement("div", { className: "AttachesGrid__row", key: i }, row));
    })));
};
/**
 * Отфильтровываем только аттачи имеющие ширину и высоту
 */
function applyOnlyWithSizesAttachesFilter(attaches) {
    return attaches.reduce((acc, attach) => {
        if (React.isValidElement(attach) &&
            attach.props.width &&
            attach.props.height) {
            acc.push(attach);
        }
        return acc;
    }, []);
}
function mapAttachToRectangle(children) {
    return applyOnlyWithSizesAttachesFilter(Children.toArray(children)).map((attach, i) => ({
        width: attach.props.width,
        height: attach.props.height,
        i,
    }));
}
function GridContainer({ gap, width, children, withBorder, withBottomBorderRadius, onWidthChange, }) {
    const isWithoutBubblesTheme = useWithoutBubblesTheme();
    const { vkm_new_bubbles_width_calc } = useFeatureFlags();
    const handleWidthChanged = useCallback((ref) => {
        if (vkm_new_bubbles_width_calc && onWidthChange) {
            // в vkm_new_bubbles_width_calc не учитывается ширина, учитывается только сам вызов, что нужно бабл ужать по ширине медиаконтента
            onWidthChange(0);
            return;
        }
        if (ref && onWidthChange) {
            const { width: _width } = ref.getBoundingClientRect();
            onWidthChange(width || _width);
        }
    }, [onWidthChange, width, vkm_new_bubbles_width_calc]);
    const styles = vkm_new_bubbles_width_calc
        ? {
            width: width || 'max-content',
            '--photoAttachGap': gap + 'px',
        }
        : {
            maxWidth: width || 'max-content',
            '--photoAttachGap': gap + 'px',
        };
    return (React.createElement("div", { ref: handleWidthChanged, className: cx('AttachesGrid AttachesGrid--radiusTop', {
            'AttachesGrid--radiusBottom': withBottomBorderRadius,
            'AttachesGrid--withBorder': withBorder,
            'AttachesGrid--withoutBubblesTheme': isWithoutBubblesTheme,
        }), style: styles }, children));
}
/**
 * Уменьшает размеры изображений с учётом зазора между ними,
 * чтобы уложиться в заданный размер сетки
 */
function applyGap(layout, gap) {
    layout.forEach((row) => row.forEach((item, index) => {
        // если элемент единственный в ряду, то у него не может быть гэпа с соседним элементом
        if (row.length === 1) {
            return;
        }
        if (index === 0 || index === row.length - 1) {
            item.width = item.width - gap / 2;
        }
        else {
            item.width = item.width - gap;
        }
    }));
    return layout;
}
//# sourceMappingURL=AttachesGrid.js.map