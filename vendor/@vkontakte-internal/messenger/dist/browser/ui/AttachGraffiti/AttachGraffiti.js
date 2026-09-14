import React, { useEffect } from 'react';
import { useFeatureFlags, usePixelDensity } from '../../hooks/misc';
import '../../ui/AttachGraffiti/AttachGraffiti.css';
import { getExpectedAttachWidth } from '../../utils/misc';
export const AttachGraffiti = ({ graffiti, isInBubble, forwardLevel = 0, onWidthChange, }) => {
    const isDense = usePixelDensity();
    const { vkm_new_bubbles_width_calc } = useFeatureFlags();
    const [previewWidth] = getExpectedAttachWidth(isDense, isInBubble, forwardLevel, 232);
    const preventSelection = (event) => {
        event.stopPropagation();
    };
    /**
     * Виртуализация сообщений рассчитывает высоту сообщения исходя из высоты элемента до загрузки изображения
     * Поэтому нужно получить высоту изображения после скейла еще до его фактической загрузки
     * @todo Удалить эту сложность как только виртуализация сможет работать с динамическим содержимым
     */
    const width = Math.min(previewWidth, graffiti.width);
    const scale = width / graffiti.width;
    const height = graffiti.height * scale;
    useEffect(() => {
        onWidthChange?.(width);
    }, [onWidthChange, width]);
    return (React.createElement("div", { className: "AttachGraffiti", style: vkm_new_bubbles_width_calc
            ? { width, height }
            : { maxWidth: width, maxHeight: height }, onClick: preventSelection },
        React.createElement("img", { src: graffiti.imageUrl, alt: "" })));
};
//# sourceMappingURL=AttachGraffiti.js.map