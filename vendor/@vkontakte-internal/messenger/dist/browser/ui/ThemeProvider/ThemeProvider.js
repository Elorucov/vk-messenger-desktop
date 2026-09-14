import React, { useCallback, useEffect, useLayoutEffect, useRef, useState, } from 'react';
import { matchAddEventListener } from '../../hooks/misc';
import { exhaustivenessCheck } from '../../../core/utils/misc';
import { AdaptivityProvider, AppRoot, ConfigProvider } from '@vkontakte/vkui';
/**
 * Провайдер для темы оформления у основного
 * приложения MEApp. Использовать только там,
 * где приложения является единственной сущностью
 * в body. Для интеграции в vkcom необходимо
 * использовать AppRootProvider из vkcom-kit
 *
 */
export const ThemeProvider = ({ locale, theme: settingsTheme, children, onThemeUpdated, }) => {
    const [theme, setTheme] = useState(settingsTheme !== 'system' ? settingsTheme : 'light');
    const removeMediaListenerRef = useRef(null);
    const handleThemeChange = useCallback((e) => {
        setTheme(e.matches ? 'dark' : 'light');
    }, []);
    useEffect(() => {
        const match = window.matchMedia('(prefers-color-scheme: dark)');
        switch (settingsTheme) {
            case 'light':
            case 'dark':
                setTheme(settingsTheme);
                /**
                 * Убираем listener
                 */
                removeMediaListenerRef.current?.();
                break;
            case 'system': {
                /**
                 * Добавляем listener с fallback на сафари
                 */
                removeMediaListenerRef.current = matchAddEventListener(match, handleThemeChange);
                setTheme(match.matches ? 'dark' : 'light');
                break;
            }
            default:
                exhaustivenessCheck(settingsTheme);
        }
    }, [handleThemeChange, settingsTheme]);
    useEffect(() => () => removeMediaListenerRef.current?.(), []);
    /**
     * Обновление темы извне ThemeProvider
     * Применимо, к примеру, на странице авторизации с VK ID
     */
    useLayoutEffect(() => {
        document.body.setAttribute('scheme', theme === 'dark' ? 'space_gray' : 'bright_light');
        onThemeUpdated?.(theme);
    }, [onThemeUpdated, theme]);
    return (React.createElement(ConfigProvider, { locale: locale, colorScheme: theme },
        React.createElement(AdaptivityProvider, null,
            React.createElement(AppRoot, null, children))));
};
//# sourceMappingURL=ThemeProvider.js.map