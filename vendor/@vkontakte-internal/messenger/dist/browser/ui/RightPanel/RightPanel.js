import React, { useEffect, useCallback, useState, } from 'react';
import { Portal } from '../../ui/Portal/Portal';
import { useLayoutData } from '../../ui/LayoutDataProvider/LayoutDataProvider';
import { useRightPanelContext } from '../../ui/RightPanel/RightPanelContext';
import cx from 'classnames';
import '../../ui/RightPanel/RightPanel.css';
import { useModuleKeyBoardHandlers } from '../../hooks/useKeyBoardHandlers';
import { useCollapsibleContainer } from '../../ui/CollapsibleContainer/CollapsibleContainer';
import { onElementKeyDownFactory, } from '../../utils/elementKeyDown';
import { FocusTrap } from '../../ui/FocusTrap/FocusTrap';
import { useStickersPopupAnimationStopperContext } from '../../hooks/useStickersPopupAnimation';
const ACTIVE_RIGHT_PANEL_ZINDEX = '1';
// Максимальное кол-во панелей, которые рендерим.
const RENDERED_PANELS_LIMIT = 5;
/** Компонент правой панели. Умеет рендерить детей внутри нужного dom-элемента.
 * Понимает, надо ли показывать тень от себя или нет - в зависимости от того,
 * есть ли в его контексте сжатые под его ширину элементы.
 */
export const RightPanel = ({ id, children, indexInStack, isActive, width = '375px', className, onEscape, }) => {
    const { containerRef, compressedElementId, setActivePanelWidth, stackSize } = useRightPanelContext();
    const { isMobileLayout, isOneColumnLayout, isTwoColumnLayout } = useLayoutData();
    const { width: mainPanelWidth, isOpen: isMainPanelOpen } = useCollapsibleContainer();
    const [contentElement, setContentElement] = useState(null);
    const { subscribeKeyDown, focusHandlerElement } = useModuleKeyBoardHandlers({
        moduleName: 'RightPanel',
        handlerElement: contentElement,
    });
    const { stopPopupStickerAnimation } = useStickersPopupAnimationStopperContext();
    // TODO: Удалить после включения Focus Trap.
    useEffect(() => {
        if (!isActive || !contentElement) {
            return;
        }
        focusHandlerElement();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isActive, contentElement]);
    const onKeyDown = useCallback((keyCombo, event) => {
        if (keyCombo === 'Escape') {
            event.stopPropagation();
            event.preventDefault();
            onEscape?.();
        }
    }, [onEscape]);
    useEffect(() => {
        if (!isActive) {
            return;
        }
        return subscribeKeyDown(onKeyDown);
    }, [isActive, onKeyDown, subscribeKeyDown]);
    useEffect(() => {
        if (isActive && contentElement) {
            setActivePanelWidth(contentElement.offsetWidth);
        }
    }, [isActive, contentElement, setActivePanelWidth]);
    useEffect(() => {
        if (isActive) {
            stopPopupStickerAnimation();
        }
    }, [isActive, stopPopupStickerAnimation]);
    const shouldRender = indexInStack !== null && indexInStack >= stackSize - RENDERED_PANELS_LIMIT;
    const isOverlapped = compressedElementId === null && isActive;
    const panel = (React.createElement(FocusTrap, { disabled: 
        // TODO: Пока отключаем фокус-трап. Нужно подумать как обрабатывать кейсы,
        // когда ломаются видимые на экране инпуты.
        // !isActive || !contentElement
        true },
        React.createElement("aside", { ref: setContentElement, style: {
                '--right_panel_zIndex': isActive
                    ? ACTIVE_RIGHT_PANEL_ZINDEX
                    : 'auto',
                '--panel_width': width,
                '--main_panel_width': (isMainPanelOpen ? mainPanelWidth : 0) + 'px',
            }, className: cx('RightPanel', {
                'RightPanel--one-column': isOneColumnLayout,
                'RightPanel--two-column': isTwoColumnLayout,
                'RightPanel--mobile': isMobileLayout,
                'RightPanel--visible': shouldRender,
                'RightPanel--compact': !isMainPanelOpen,
            }), tabIndex: -1, onKeyDown: onElementKeyDownFactory(onKeyDown), "data-testid": "me_right_panel" },
            React.createElement("div", { "aria-labelledby": id, className: cx('RightPanel__container', className, {
                    'RightPanel__container--active': isActive,
                    'RightPanel__container--overlapContent': isOverlapped,
                    'RightPanel__container--overlapContentWithShadow': isOverlapped && isTwoColumnLayout,
                }) }, shouldRender && children))));
    if (containerRef.current) {
        return React.createElement(Portal, { portalTarget: containerRef.current }, panel);
    }
    return panel;
};
//# sourceMappingURL=RightPanel.js.map