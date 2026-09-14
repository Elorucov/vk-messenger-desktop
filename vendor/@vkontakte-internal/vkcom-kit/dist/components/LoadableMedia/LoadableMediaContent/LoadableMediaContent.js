import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Icon28RefreshOutline } from '@vkontakte/icons';
import { classNames } from '@vkontakte/vkjs';
import { useStableCallback } from '@vkontakte-internal/react-utils';
import { expectNever } from '@vkontakte-internal/utils';
import { memo, useEffect, useState, } from 'react';
import { IconButton, Spinner, VisuallyHidden } from '../../Adopted';
import { useLoadableMediaContext } from '../LoadableMediaContext';
import { LoadableMediaErrorPlaceholder } from '../LoadableMediaErrorPlaceholder/LoadableMediaErrorPlaceholder';
import styles from './LoadableMediaContent.module.css';
export const LoadableMediaContent = memo(function LoadableMediaContent({ reloadKey, 'children': render, onReload, onLoadingStateChange, 'data-testid': testId = 'loadablemediacontent', ...restProp }) {
    const [state, setState] = useState('loading');
    const { loadingErrorMessage, loadingErrorActionLabel, loadingStateChangeHandler } = useLoadableMediaContext();
    const updateState = (newState) => {
        setState(newState);
        loadingStateChangeHandler?.(newState);
        onLoadingStateChange?.(newState);
    };
    const onLoad = () => updateState('loaded');
    const onError = () => updateState('error');
    const reloadStable = useStableCallback(() => {
        updateState('loading');
        // eslint-disable-next-line @vkontakte-internal/vkcom-plugins/no-then
        onReload().then(onLoad, onError);
    });
    useEffect(() => {
        reloadStable();
    }, [reloadKey, reloadStable]);
    const renderContent = () => {
        const content = render(onLoad, onError, state);
        switch (state) {
            case 'loaded':
                return (_jsx("div", { "data-testid": `${testId}-loaded`, className: styles.content, children: content }));
            case 'loading':
                /** Заворачиваем контент чтобы установить минимальную высоту (чтобы спиннер влез) */
                return (_jsxs(_Fragment, { children: [_jsx("div", { className: styles.content, children: content }), _jsx("div", { className: classNames(styles.overlay, styles.overlayStretched), children: _jsx(Spinner, { size: "medium" }) })] }));
            case 'error':
                /** Контент нам не нужен, но мы все равно его рендерим (скрытым), чтобы в компонентах-пользователях не слетел ref */
                return (_jsxs(_Fragment, { children: [_jsx(VisuallyHidden, { children: content }), loadingErrorMessage ? (_jsx("div", { className: styles.overlay, children: _jsx(LoadableMediaErrorPlaceholder, { loadingErrorMessage: loadingErrorMessage, loadingErrorActionLabel: loadingErrorActionLabel, onRetry: reloadStable }) })) : (_jsx("div", { className: classNames(styles.overlay, styles.overlayStretched), children: _jsx(IconButton, { onClick: reloadStable, children: _jsx(Icon28RefreshOutline, {}) }) }))] }));
            default:
                return expectNever(state);
        }
    };
    return (_jsx("div", { "data-testid": testId, ...restProp, children: renderContent() }));
});
//# sourceMappingURL=LoadableMediaContent.js.map