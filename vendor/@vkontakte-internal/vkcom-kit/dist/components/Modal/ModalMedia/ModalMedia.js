import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { classNames } from '@vkontakte/vkjs';
import { useState } from 'react';
import { LoadableMedia } from '../../LoadableMedia/LoadableMedia';
import styles from './ModalMedia.module.css';
const isModalImageWithBackground = (modal) => 'type' in modal && 'src' in modal;
const iconAppearanceModifiers = {
    accent: styles.iconAccent,
    secondary: styles.iconSecondary,
    positive: styles.iconPositive,
};
export const ModalMedia = ({ children, iconAppearance, ...restProps }) => {
    const [loadingState, setLoadingState] = useState(undefined);
    const backgroundProps = isModalImageWithBackground(restProps) ? restProps : undefined;
    // Показываем фон, когда либо есть что показать (в т.ч. что-то загрузилось), либо есть сообщение об ошибке
    const hasBackground = Boolean(backgroundProps && (loadingState !== 'error' || backgroundProps.loadingErrorMessage));
    // Не показываем загрузку фона если не указано соотношение сторон, т.к. в этом случае нет гарантии, что контент влезет
    const shouldShowBackground = Boolean(hasBackground && (!children || loadingState !== 'loading' || backgroundProps?.aspectRatio));
    // Показываем контент, когда он есть и когда фон загрузился без ошибок или его нет
    const hasContent = Boolean(children && (loadingState !== 'error' || !hasBackground));
    return (_jsxs("div", { className: classNames(styles.root, 'vkuiInternalRoundedMedia', shouldShowBackground && styles.rootWithBackground), children: [hasBackground && backgroundProps && (_jsx(LoadableMedia, { ...backgroundProps, visible: shouldShowBackground, onLoadingStateChange: setLoadingState })), hasContent && (_jsx("div", { className: classNames(styles.content, iconAppearance && iconAppearanceModifiers[iconAppearance]), children: children }))] }));
};
//# sourceMappingURL=ModalMedia.js.map