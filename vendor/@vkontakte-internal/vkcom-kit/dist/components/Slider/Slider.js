import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"TextTooltip":["Adopted",{"style":1}]} */
import { classNames, getOffsetRect, isNumber } from '@vkontakte/vkjs';
import { useRef, useState, } from 'react';
import { TextTooltip } from '../Adopted';
import styles from './Slider.module.css';
const sizeModifiersMap = {
    m: styles.sliderSizeM,
    l: styles.sliderSizeL,
    xl: styles.sliderSizeXl,
};
const modeModifiersMap = {
    primary: styles.sliderPrimary,
    contrast: styles.sliderContrast,
};
const fillColorModifiers = {
    track_buffer: styles.fillTrackBuffered,
    write_bar_icon: styles.fillWriteBarIcon,
    accent_orange_peach: styles.fillAccentOrangePeach,
    track_background: styles.fillTrackBackground,
    transparent: styles.fillTransparent,
    contrast: styles.fillContrast,
    primary: styles.fillTextPrimary,
    accent: styles.fillTextAccent,
};
const backColorModifiers = {
    track_background: styles.backTrackBackground,
    search_field_background: styles.backSearchFieldBackground,
    transparent: styles.backTransparent,
    contrast: styles.backContrast,
    background_tertiary_alpha: styles.backBackgroundTertiaryAlpha,
    tertiary: styles.rootBackModeTertiary,
};
const valueToPercent = (value, min, max) => {
    if (value < min) {
        return 0;
    }
    if (value > max) {
        return 100;
    }
    return ((value - min) * 100) / (max - min);
};
const getZeroPosition = (min, max) => {
    return valueToPercent(0, min, max);
};
const getFillPosition = (value, zeroPosition) => {
    const left = Math.min(value, zeroPosition);
    const width = Math.abs(value - zeroPosition);
    return {
        left,
        width,
        bottom: left,
        height: width,
    };
};
const percentToValue = (percentValue, min, max) => {
    return Math.round(((percentValue * (max - min)) / 100 + min) * 100) / 100;
};
export const Slider = ({ min = 0, max = 100, step = 0, hasZero, hasHandle, vertical, minHeight, fillMode = 'track_buffer', backMode = 'track_background', readOnly, hideHandle, handleAlwaysActive, formatHint, gravity = 0, inheritCursor, onChange, value, defaultValue = 0, size = 'm', mode = 'primary', tooltipProps, heightByLine, destroyWindowEventsRef, 'data-testid': dataTestId, ...restProps }) => {
    const isControlledOutside = value !== undefined;
    const [isActive, setIsActive] = useState(false);
    const [hintPosition, setHintPosition] = useState(0);
    const [percentValueUncontrolled, setPercentValueUncontrolled] = useState(() => {
        if (value) {
            return valueToPercent(value, min, max);
        }
        else if (defaultValue) {
            return valueToPercent(defaultValue, min, max);
        }
        else {
            return getZeroPosition(min, max);
        }
    });
    const percentValue = isControlledOutside ? valueToPercent(value, min, max) : percentValueUncontrolled;
    const sliderRef = useRef(null);
    const zeroPosition = getZeroPosition(min, max);
    const fillPosition = getFillPosition(percentValue, zeroPosition);
    const hasValue = percentValue !== zeroPosition;
    const formattedValue = formatHint?.(percentToValue(hintPosition, min, max));
    const getOffset = (e) => {
        const { left, width, top, height } = getOffsetRect(sliderRef.current);
        let offset = vertical ? height - (e.clientY - top) - window.scrollY : e.clientX - left + window.scrollX;
        if (isNumber(step) && step > 0) {
            const stepCount = (max - min) / step;
            const stepValue = (vertical ? height : width) / stepCount;
            offset = Math.round(offset / stepValue) * stepValue;
        }
        return { offset, left, width, top, height };
    };
    const update = (e) => {
        const { offset, width, height } = getOffset(e);
        let updatedPercentValue = valueToPercent(offset, 0, vertical ? height : width);
        if (gravity &&
            gravity > 0 &&
            updatedPercentValue >= zeroPosition - gravity &&
            updatedPercentValue <= zeroPosition + gravity) {
            updatedPercentValue = zeroPosition;
        }
        if (percentValue === updatedPercentValue) {
            return;
        }
        setHintPosition(updatedPercentValue);
        onChange?.(percentToValue(updatedPercentValue, min, max));
        if (!isControlledOutside) {
            setPercentValueUncontrolled(updatedPercentValue);
        }
    };
    const updateHint = (e) => {
        const { offset, width, height } = getOffset(e);
        setHintPosition(valueToPercent(offset, 0, vertical ? height : width));
    };
    const onMouseMove = (e) => {
        requestAnimationFrame(() => update(e));
    };
    const onMouseUp = () => {
        setIsActive(false);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
    };
    const onMouseEnter = () => {
        window.addEventListener('mousemove', updateHint);
    };
    const onMouseLeave = () => {
        window.removeEventListener('mousemove', updateHint);
    };
    const onMouseDown = (e) => {
        if (e.button !== 0) {
            return;
        }
        e.preventDefault();
        update(e);
        setIsActive(true);
        window.addEventListener('mouseup', onMouseUp);
        window.addEventListener('mousemove', onMouseMove);
    };
    if (destroyWindowEventsRef) {
        destroyWindowEventsRef.current = () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }
    /**
     * Компонент получился полудоступный - есть aria-атрибуты показывающие его значение,
     * но управлять с клавиатуры им нельзя, по этому отключаем фокус.
     */
    const slider = (
    /* eslint-disable-next-line jsx-a11y/interactive-supports-focus, jsx-a11y/prefer-tag-over-role */
    _jsxs("div", { className: classNames(styles.root, readOnly && styles.readonly, inheritCursor && styles.rootCursorInherit, heightByLine && hideHandle && styles.heightByLine, vertical && styles.vertical, sizeModifiersMap[size], modeModifiersMap[mode], backColorModifiers[backMode]), style: vertical && minHeight ? { height: minHeight } : undefined, ref: sliderRef, role: "slider", "aria-valuemin": min, "aria-valuemax": max, "aria-valuenow": percentValue, onMouseDown: !readOnly ? onMouseDown : undefined, onMouseEnter: !readOnly ? onMouseEnter : undefined, onMouseLeave: !readOnly ? onMouseLeave : undefined, "data-testid": dataTestId, ...restProps, children: [_jsx("input", { type: "hidden", name: "slider", value: percentValue, "data-testid": "slider_input" }), hasZero && hasValue && (_jsx("div", { className: styles.middletick, style: vertical ? { bottom: `${zeroPosition}%` } : { left: `${zeroPosition}%` } })), _jsx("div", { className: classNames(styles.fill, fillColorModifiers[fillMode]), style: vertical
                    ? { bottom: `${fillPosition.bottom}%`, height: `${fillPosition.height}%` }
                    : { left: `${fillPosition.left}%`, width: `${fillPosition.width}%` } }), !hideHandle && (_jsx("div", { className: classNames(styles.handle, (hasValue || handleAlwaysActive) && styles.handleActive, hasHandle && styles.handleShow, isActive && styles.handleVisible), style: vertical ? { bottom: `${percentValue}%` } : { left: `${percentValue}%` }, "data-testid": "slider_handle" }))] }));
    if (readOnly || (!formattedValue && !isNumber(formattedValue))) {
        return slider;
    }
    const clientWidth = sliderRef.current?.clientWidth ?? 0;
    const clientHeight = sliderRef.current?.clientHeight ?? 0;
    return (_jsx(TextTooltip, { style: vertical
            ? {
                marginTop: -(clientHeight * (hintPosition - 50)) / 100,
            }
            : {
                marginLeft: (clientWidth * (hintPosition - 50)) / 100,
            }, text: formattedValue, appearance: "neutral", placement: vertical ? 'right' : 'top', hideWhenReferenceHidden: true, ...tooltipProps, children: slider }));
};
//# sourceMappingURL=Slider.js.map