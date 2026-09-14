import React, { useCallback, useRef } from 'react';
import { ModalInterface } from '../../ui/ModalInterface/ModalInterface';
import { ImageAreaSelector } from '../../ui/ImageAreaSelector/ImageAreaSelector';
import { useBrowserEnv } from '../../hooks/misc';
import { Button } from '@vkontakte/vkui';
import './AvatarAreaSelectorModal.css';
import { useScaleImage } from '../../hooks/useScaleImage';
import { classNames as cx } from '@vkontakte/vkjs';
const DENSITY_SCALE = 2;
export const AvatarAreaSelectorModal = ({ src, viewportWidth, viewportHeight, mode, contextClass, onClose, onSubmit, }) => {
    const $img = useRef(null);
    const { lang } = useBrowserEnv();
    const $transform = useRef({
        x: 0,
        y: 0,
        scale: 1,
    });
    const $viewportOffset = useRef({
        x: 0,
        y: 0,
    });
    const { getScaledImage, canvasRef } = useScaleImage();
    const handleTransformChange = useCallback((transform, viewportOffset) => {
        $transform.current = transform;
        $viewportOffset.current = viewportOffset;
    }, []);
    const handleSubmit = useCallback(async () => {
        if (!$img.current) {
            return;
        }
        const blob = await getScaledImage({
            img: $img.current,
            dx: $transform.current.x - $viewportOffset.current.x,
            dy: $transform.current.y - $viewportOffset.current.y,
            height: viewportHeight,
            width: viewportWidth,
            scale: $transform.current.scale,
            density: DENSITY_SCALE,
        });
        onSubmit(blob);
    }, [onSubmit, getScaledImage, viewportHeight, viewportWidth]);
    return (React.createElement(ModalInterface, { onClose: onClose, closeLabel: lang.use('me_close'), title: lang.use('me_image_area_selector_title'), contextClass: cx('AvatarAreaSelectorModal', contextClass), buttons: [
            React.createElement(Button, { key: "submit", mode: "primary", onClick: handleSubmit }, lang.use('me_image_area_selector_action')),
        ] },
        React.createElement("div", { className: "AvatarAreaSelectorModal__content" },
            React.createElement(ImageAreaSelector, { src: src, viewportHeight: viewportHeight, viewportWidth: viewportWidth, mode: mode, onTransformChange: handleTransformChange }),
            React.createElement("div", { className: "AvatarAreaSelectorModal__hidden", "aria-hidden": "true" },
                React.createElement("canvas", { ref: canvasRef }),
                React.createElement("img", { src: src, ref: $img, alt: "" })))));
};
//# sourceMappingURL=AvatarAreaSelectorModal.js.map