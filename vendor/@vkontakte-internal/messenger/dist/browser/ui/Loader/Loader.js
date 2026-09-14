import '../../ui/Loader/Loader.css';
import React from 'react';
import { Icon24CancelOutline, Icon24RefreshOutline } from '@vkontakte/icons';
import cx from 'classnames';
import { Spinner } from '@vkontakte/vkui';
import { usePrevious, useThrottle } from '../../hooks/misc';
import { isUndefined } from '@vkontakte/vkjs';
export const Loader = ({ children, classNames, size = 'regular', onCancel, progress, isError, onRetry, alwaysShowLoader = false, }) => {
    const sizes = {
        regular: {
            viewBox: '0 0 42 42',
            cx: 21,
            cy: 21,
            r: 19,
        },
        small: {
            viewBox: '0 0 24 24',
            cx: 12,
            cy: 12,
            r: 11,
        },
    };
    const { viewBox, r, ...circleProps } = sizes[size];
    const circumference = calcCircumference(r);
    const shouldRetry = isError && onRetry;
    const loaderContentExists = typeof children !== 'undefined' && children !== null;
    const shouldShowLoader = (progress > 0 && progress < 100) || alwaysShowLoader || loaderContentExists;
    /**
     * Браузер не выводит огромное количество рендера, спиннер не отрисовывается
     * Чтобы убрать лишний рендер, нагрузку, и выровнять анимацию, срезаем излишнее изменение значения и рендер
     */
    const previousProgress = usePrevious(progress);
    const throttledProgress = useThrottle(progress, 50);
    const progressToRender = !isUndefined(previousProgress) && progress > previousProgress
        ? progress
        : throttledProgress;
    return (React.createElement("div", { role: "status", className: cx('Loader', `Loader--${size}`, classNames?.loader, {
            'Loader--retry': shouldRetry,
            'Loader--empty': !shouldShowLoader,
        }) }, shouldRetry ? (React.createElement("button", { className: "Loader__button", onClick: onRetry, "aria-label": "\u041F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u044C \u043F\u043E\u043F\u044B\u0442\u043A\u0443" },
        React.createElement(Icon24RefreshOutline, null))) : shouldShowLoader ? (React.createElement(React.Fragment, null,
        onCancel && (React.createElement("button", { className: "Loader__button", onClick: onCancel, "aria-label": "\u041E\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0443" },
            React.createElement(Icon24CancelOutline, null))),
        loaderContentExists && (React.createElement("div", { className: cx('Loader__content', classNames?.loaderContent) }, children)),
        React.createElement("div", { className: cx('Loader__progress', classNames?.loaderProgress) },
            React.createElement("svg", { viewBox: viewBox, xmlns: "http://www.w3.org/2000/svg" },
                React.createElement("circle", { r: r, ...circleProps, strokeDasharray: circumference, strokeDashoffset: setProgress(circumference, progressToRender) }))))) : (React.createElement(Spinner, null))));
};
function calcCircumference(radius) {
    return 2 * Math.PI * radius;
}
function setProgress(circumference, progress) {
    const limitedProgress = progress > 100 ? 100 : progress < 0 ? 0 : progress;
    const invertedProgress = 100 - limitedProgress;
    const progressAsDecimal = invertedProgress / 100;
    return (circumference * (Number.isNaN(progressAsDecimal) ? 1 : progressAsDecimal));
}
//# sourceMappingURL=Loader.js.map