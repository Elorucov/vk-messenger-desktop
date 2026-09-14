import React, { memo, useCallback, useLayoutEffect, useMemo, useRef, } from 'react';
import { useViewer } from '../../hooks/misc';
import { MessageReactionPickerItem } from '../../ui/MessageReactionPickerItem/MessageReactionPickerItem';
import { Icon16MoreHorizontal } from '@vkontakte/icons';
import './MessageReactionPickerExtended.css';
import { useResizeObserver, } from '../../hooks/useResizeObserver';
import { classNames as cx } from '@vkontakte/vkjs';
export const MESSAGE_REACTION_SIZE = 36;
export const MESSAGE_REACTION_GAP = 8;
export const PICKER_PADDING = 8;
const MAX_PER_ROW = 8;
const MIN_PER_ROW = 1;
export const MessageReactionPickerExtended = memo(({ isExtended, isVisible, reactions, active, width, withDecorativeBubbles = false, withShadow = true, onClick, onHeightChange, onExtendClick, }) => {
    const { settings } = useViewer();
    const { observe } = useResizeObserver();
    const $container = useRef(null);
    const reactionsPerRow = useMemo(() => {
        if (!width) {
            return MAX_PER_ROW;
        }
        return Math.max(MIN_PER_ROW, Math.min(Math.ceil((width - PICKER_PADDING * 2) /
            (MESSAGE_REACTION_SIZE + MESSAGE_REACTION_GAP)), MAX_PER_ROW));
    }, [width]);
    const visibleReactions = useMemo(() => reactions.slice(0, reactionsPerRow - 1), [reactions, reactionsPerRow]);
    const reactionsChunks = useMemo(() => {
        const chunks = [];
        for (let i = 0; i < reactions.length; i += reactionsPerRow) {
            const chunk = reactions.slice(i, i + reactionsPerRow);
            chunks.push(chunk);
        }
        return chunks;
    }, [reactionsPerRow, reactions]);
    const handleMoreClick = useCallback((event) => {
        event.stopPropagation();
        onExtendClick();
    }, [onExtendClick]);
    useLayoutEffect(() => {
        const el = $container.current;
        if (el === null) {
            return;
        }
        const onResize = (entry) => {
            const height = entry.borderBoxSize[0]?.blockSize;
            // Если не обернуть в raf, то в сафари кидается ошибка:
            // "ResizeObserver loop completed with undelivered notifications."
            requestAnimationFrame(() => {
                onHeightChange?.(height);
            });
        };
        return observe(el, onResize);
    }, [observe, onHeightChange]);
    return (React.createElement("div", { className: cx('MessageReactionPickerExtended', {
            'MessageReactionPickerExtended--autoExtend': settings.autoExtendReactionPicker,
            'MessageReactionPickerExtended--extended': isExtended,
            'MessageReactionPickerExtended--visible': isVisible,
            'MessageReactionPickerExtended--withDecorativeBubbles': withDecorativeBubbles,
            'MessageReactionPickerExtended--withShadow': withShadow,
        }), ref: $container, style: {
            '--message-reaction-size': MESSAGE_REACTION_SIZE + 'px',
            '--message-reaction-gap': MESSAGE_REACTION_GAP + 'px',
            '--message-reaction-count': reactionsPerRow,
        } },
        React.createElement("div", { className: "MessageReactionPickerExtended__content" },
            isExtended &&
                reactionsChunks.map((chunk, index) => (React.createElement("ul", { className: "MessageReactionPickerExtended__list", key: index }, chunk.map((reaction) => (React.createElement("li", { className: "MessageReactionPickerExtended__item", style: { animationDelay: `${index * 50}ms` }, key: reaction.id },
                    React.createElement(MessageReactionPickerItem, { reaction: reaction, active: active === reaction.id, disableAnimation: !settings.messageReactionAnimation, onClick: onClick, size: MESSAGE_REACTION_SIZE }))))))),
            !isExtended && (React.createElement("ul", { className: "MessageReactionPickerExtended__list" },
                visibleReactions.map((reaction, index) => (React.createElement("li", { className: "MessageReactionPickerExtended__item", style: { animationDelay: `${index * 50}ms` }, key: reaction.id },
                    React.createElement(MessageReactionPickerItem, { reaction: reaction, active: active === reaction.id, disableAnimation: !settings.messageReactionAnimation, onClick: onClick, size: MESSAGE_REACTION_SIZE })))),
                reactions.length > reactionsPerRow - 1 && !isExtended && (React.createElement("li", { className: "MessageReactionPickerExtended__item" },
                    React.createElement("button", { className: "MessageReactionPickerExtended__more", onClick: handleMoreClick },
                        React.createElement(Icon16MoreHorizontal, { color: "var(--vkui--color_icon_secondary)", className: "MessageReactionPickerExtended__moreIcon" })))))))));
});
//# sourceMappingURL=MessageReactionPickerExtended.js.map