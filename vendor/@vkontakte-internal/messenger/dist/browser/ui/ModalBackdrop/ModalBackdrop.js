import '../../ui/ModalBackdrop/ModalBackdrop.css';
import React, { forwardRef, useContext, useEffect, useImperativeHandle, useRef, } from 'react';
import cx from 'classnames';
import { ModalConfigContext } from '../../ui/ModalConfigProvider/ModalConfigProvider';
import { StickersPopupRootContainer } from '../../ui/StickersPopupRootContainer/StickersPopupRootContainer';
export const ModalBackdrop = forwardRef(function ModalBackdrop({ isClear, isBodyScrollDisabled, onClick, children, className, stopPropagation = false, stickersPopupRootContainerId, }, ref) {
    const classNames = cx('RE_ModalBackdrop', {
        'RE_ModalBackdrop--tinted': !isClear,
    });
    const { isFullScreen } = useContext(ModalConfigContext);
    const containerClassNames = cx(className, 'RE_ModalBackdrop__container', isFullScreen
        ? 'RE_ModalBackdrop__container--fullScreen'
        : 'RE_ModalBackdrop__container--window');
    const $wrapper = useRef(null);
    useBodyScrollDisabling(Boolean(isBodyScrollDisabled));
    useImperativeHandle(ref, () => ({
        resetScroll: () => {
            if ($wrapper.current) {
                $wrapper.current.scrollTop = 0;
            }
        },
    }), []);
    return (React.createElement("div", { className: classNames, ref: $wrapper, onClick: (e) => {
            if (stopPropagation) {
                e.stopPropagation();
            }
        } },
        onClick && React.createElement("div", { className: "RE_ModalBackdrop__flesh", onClick: onClick }),
        stickersPopupRootContainerId ? (React.createElement(StickersPopupRootContainer, { id: stickersPopupRootContainerId, isUseAsFullscreen: true, role: "menu", className: containerClassNames, HtmlElement: "div" }, children)) : (React.createElement("div", { className: containerClassNames }, children))));
});
function useBodyScrollDisabling(isDisabled) {
    useEffect(() => {
        const $body = document.body;
        if (!isDisabled) {
            return;
        }
        const bodyRect = $body.getBoundingClientRect();
        /* Проверяем существование отступа от края экрана */
        const bodyOffset = window.innerWidth - (bodyRect.left + bodyRect.right);
        if (bodyOffset === 0) {
            return;
        }
        /**
         * Считаем, что если отступ есть, то из-за скроллбара, и
         * используем это значение для сохранение отступа при отключении скрола.
         * Используем бордер, учитывая низкую вероятность иного определения
         * этого свойства на body */
        const styles = document.createElement('style');
        styles.innerText = `body { overflow-y: hidden !important; }`;
        $body.appendChild(styles);
        $body.style.borderRight = `${bodyOffset}px solid transparent`;
        return () => {
            $body.style.borderRight = '';
            $body.removeChild(styles);
        };
    }, [isDisabled]);
}
//# sourceMappingURL=ModalBackdrop.js.map