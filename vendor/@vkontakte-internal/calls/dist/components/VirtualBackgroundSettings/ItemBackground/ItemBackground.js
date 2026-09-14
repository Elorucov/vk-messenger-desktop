import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"dangerouslySetInnerHTML":1,"className":1}]} */
import { memo, useCallback, useMemo, useEffect, useRef, useState, } from 'react';
import { classNames as cx } from '@vkontakte/vkjs';
import { DeleteBackgroundIcon } from './DeleteBackgroundIcon';
import { useLang } from '../../../hooks/useLang';
import { WithRadioButton } from '../WithRadioButton/WithRadioButton';
import { TextTooltip, Skeleton } from '@vkontakte-internal/vkcom-kit';
const ItemBackgroundComponent = ({ backgroundUrl, checked, onDelete, photoId, isPredefinedBackground, isStarBackground, ...props }) => {
    const { getLang } = useLang();
    const $containerEl = useRef(null);
    const [loadingImage, setLoadingImage] = useState(true);
    const tooltipText = useMemo(() => {
        return (_jsx("div", { dangerouslySetInnerHTML: {
                __html: checked ? getLang('calls_cant_remove_background') : getLang('calls_delete_background'),
            } }));
    }, [checked]);
    const onDeleteBackground = useCallback((e) => {
        e.stopPropagation();
        if (!checked) {
            onDelete(photoId);
        }
    }, [checked, photoId]);
    useEffect(() => {
        let observer;
        let image;
        if ($containerEl.current) {
            observer = new IntersectionObserver((entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        observer.disconnect();
                        image = new Image();
                        image.src = backgroundUrl;
                        image.onload = () => {
                            setLoadingImage(false);
                            image.remove();
                        };
                    }
                }
            }, { threshold: 0.0, root: null });
            observer.observe($containerEl.current);
        }
        return () => {
            if (image) {
                image.onload = null;
                image.remove();
            }
            observer?.disconnect();
        };
    }, []);
    return (_jsxs(WithRadioButton, { ...props, checked: checked, className: cx('VirtualBackgroundSettings__item', 'VirtualBackgroundSettings__item--background', {
            'VirtualBackgroundSettings__item--background-star': !loadingImage && !!isStarBackground,
        }), passedRef: $containerEl, 
        // изображение превьюшки
        style: {
            backgroundImage: loadingImage ? undefined : `url(${backgroundUrl})`,
        }, children: [loadingImage && _jsx(Skeleton, { height: 80, borderRadius: 12 }), !isPredefinedBackground && !loadingImage && (_jsx(TextTooltip, { text: tooltipText, placement: "top", children: _jsx("div", { className: cx('VirtualBackgroundSettings__item--background__deletebtn', {
                        'VirtualBackgroundSettings__item--background__deletebtn--disabled': checked,
                    }), onClick: onDeleteBackground, children: _jsx(DeleteBackgroundIcon, {}) }) }))] }));
};
export const ItemBackground = memo(ItemBackgroundComponent);
//# sourceMappingURL=ItemBackground.js.map