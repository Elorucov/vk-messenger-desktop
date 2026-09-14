import '../../ui/ConvoPlayer/ConvoPlayer.css';
import '../../ui/RangeInput/RangeInput.css';
import React, { useCallback, useRef } from 'react';
import { Touch } from '@vkontakte/vkui';
import cx from 'classnames';
export const RangeInput = (props) => {
    const { rangeClassName, onChangeEnd, onChangeStart, onChange, children } = props;
    const el = useRef(null);
    const getValue = useCallback((clientX) => {
        if (!el.current) {
            return 0;
        }
        const cr = el.current.getBoundingClientRect();
        const { width, left, right } = cr;
        if (clientX >= right) {
            return 1;
        }
        if (clientX <= left) {
            return 0;
        }
        return (clientX - left) / width;
    }, []);
    const handleMove = useCallback((e) => {
        if (!onChange) {
            return;
        }
        const value = getValue(e.startX + e.shiftX);
        onChange(value);
    }, [getValue, onChange]);
    const handleMoveEnd = useCallback((e) => {
        if (!onChangeEnd) {
            return;
        }
        const value = getValue(e.startX + e.shiftX);
        onChangeEnd(value);
    }, [getValue, onChangeEnd]);
    const handleMoveStart = useCallback((e) => {
        if (!onChangeStart) {
            return;
        }
        const value = getValue(e.startX + e.shiftX);
        onChangeStart(value);
    }, [getValue, onChangeStart]);
    const handleClick = useCallback((e) => {
        const value = getValue(e.clientX);
        onChangeStart?.(value);
        onChange?.(value);
        onChangeEnd?.(value);
    }, [getValue, onChange, onChangeEnd, onChangeStart]);
    return (React.createElement(Touch, { getRootRef: el, onStartX: handleMoveStart, onMoveX: handleMove, onEndX: handleMoveEnd, onClick: handleClick, className: cx(rangeClassName, {
            // Дублируем логику touchEnabled, используемую в https://vkcom.github.io/VKUI/#/Touch
            // TODO [@vkontakte/vkui@>=7.2.0]: удалить, так как пофикшено в https://github.com/VKCOM/VKUI/pull/8480
            'VKUITouch--blockSVGPointerEvents': 'ontouchstart' in window,
        }) }, children));
};
//# sourceMappingURL=RangeInput.js.map