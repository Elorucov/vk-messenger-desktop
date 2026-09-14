import React, { memo, useCallback, useEffect, useLayoutEffect, useState, } from 'react';
import cx from 'classnames';
import { useResizeObserver, } from '../../hooks/useResizeObserver';
import '../../ui/MessageReactionPickerExpandableContainer/MessageReactionPickerExpandableContainer.css';
import { useStoreState } from '../../hooks/misc';
const REACTION_PICKER_PARENT_OFFSET = 24;
export const REACTION_PICKER_DEFAULT_HEIGHT = 60;
export const MessageReactionPickerExpandableContainer = memo(({ isVisible, isCentered, content: renderContent, offsetLeft = '-34px', offsetTop = '0px', onReactionPickerHeightChange, }) => {
    const containerWidth = useStoreState('containerSize').width;
    const [width, setWidth] = useState();
    const [reactionPickerHeight, setReactionPickerHeight] = useState();
    const [reactionsContainer, setReactionsContainer] = useState(null);
    const [reactionContainerRect, setReactionsContainerRect] = useState(null);
    const { observe } = useResizeObserver({ debounceInterval: 150 });
    const onReactionContainerResize = useCallback((entity) => {
        setReactionsContainerRect(entity.target.getBoundingClientRect());
    }, []);
    const onHeightChange = useCallback(setReactionPickerHeight, [
        setReactionPickerHeight,
    ]);
    useLayoutEffect(() => {
        if (!reactionsContainer) {
            return;
        }
        return observe(reactionsContainer, onReactionContainerResize);
    }, [onReactionContainerResize, reactionsContainer, observe]);
    //Ограничиваем ширину пикера, чтобы влезал на небольших экранах и если справа мало места
    useEffect(() => {
        if (!reactionContainerRect || !containerWidth) {
            return;
        }
        const overflowingContainerPx = reactionContainerRect.right +
            REACTION_PICKER_PARENT_OFFSET -
            containerWidth;
        const isPickerOverflowingContainer = overflowingContainerPx > 0;
        if (isPickerOverflowingContainer) {
            setWidth(reactionContainerRect.width - overflowingContainerPx);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        reactionContainerRect?.width,
        reactionContainerRect?.right,
        containerWidth,
    ]);
    useLayoutEffect(() => {
        if (!reactionPickerHeight) {
            return;
        }
        onReactionPickerHeightChange?.(reactionPickerHeight);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reactionPickerHeight]);
    return (React.createElement("div", { className: cx('MessageReactionPickerExpandableContainer', {
            'MessageReactionPickerExpandableContainer--centered': isCentered,
            'MessageReactionPickerExpandableContainer--visible': isVisible,
        }), style: {
            '--reaction-picker-height': `${reactionPickerHeight ?? REACTION_PICKER_DEFAULT_HEIGHT}px`,
            '--reaction-picker-offset': 'calc(8px + var(--reaction-picker-height))',
            '--left-position': offsetLeft,
            '--top-position': `calc((${offsetTop} - var(--reaction-picker-offset))`,
        } },
        React.createElement("div", { className: "MessageReactionPickerExpandableContainer__reactions", ref: setReactionsContainer }, renderContent({ width, onHeightChange }))));
});
//# sourceMappingURL=MessageReactionPickerExpandableContainer.js.map