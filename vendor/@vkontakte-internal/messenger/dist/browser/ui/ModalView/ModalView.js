import '../../ui/ModalView/ModalView.css';
import React, { useCallback, useEffect, useState } from 'react';
import cx from 'classnames';
import { Portal } from '../../ui/Portal/Portal';
import { useLayer } from '../../ui/Layer/Layer';
import { useModuleKeyBoardHandlers } from '../../hooks/useKeyBoardHandlers';
import { onElementKeyDownFactory, } from '../../utils/elementKeyDown';
import { FocusTrap } from '../../ui/FocusTrap/FocusTrap';
export const ModalView = ({ children, isHidden, onEscape, contextClass, portalTarget, withFocusTrap = false, }) => {
    const layer = useLayer();
    const classNames = cx('RE_ModalView', {
        'RE_ModalView--hidden': Boolean(isHidden),
    });
    const [container, setContainer] = useState(null);
    const { subscribeKeyDown, focusHandlerElement } = useModuleKeyBoardHandlers({
        moduleName: 'Modal',
        blockGlobalHandlers: true,
        handlerElement: container,
    });
    const onKeyDown = useCallback((keyCombo, event) => {
        event.stopPropagation();
        if (keyCombo === 'Escape') {
            event.preventDefault();
            onEscape?.();
        }
    }, [onEscape]);
    useEffect(() => {
        if (isHidden) {
            return;
        }
        return subscribeKeyDown(onKeyDown);
    }, [isHidden, onKeyDown, subscribeKeyDown]);
    // TODO: Удалить после включения Focus Trap.
    useEffect(() => {
        if (isHidden || !container) {
            return;
        }
        focusHandlerElement();
        // container не определен в эффектах первого рендера,
        // поэтому добавляем его в зависимости.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [container, isHidden]);
    return (React.createElement(Portal, { portalClassName: contextClass, portalTarget: portalTarget || layer },
        React.createElement(FocusTrap, { disabled: 
            // TODO: Пока отключаем фокус-трап. Нужно подумать как обрабатывать кейсы,
            // когда ломаются модалки и обёртка миниаппов в интеграции.
            // isHidden || !container
            !withFocusTrap || isHidden || !container },
            React.createElement("div", { tabIndex: -1, onKeyDown: onElementKeyDownFactory(onKeyDown), "data-no-focus-lock": "true", ref: setContainer, className: classNames }, children))));
};
//# sourceMappingURL=ModalView.js.map