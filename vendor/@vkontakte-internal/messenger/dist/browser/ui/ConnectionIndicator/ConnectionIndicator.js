import React, { useContext } from 'react';
import { useColorScheme } from '@vkontakte/vkui';
import { useBrowserEnv } from '../../hooks/misc';
import cx from 'classnames';
import '../../ui/ConnectionIndicator/ConnectionIndicator.css';
const ConnectionIndicatorContext = React.createContext(true);
export const ConnectionIndicatorProvider = ConnectionIndicatorContext.Provider;
export const ConnectionIndicator = React.memo(({ className, isOpen }) => {
    const { lang } = useBrowserEnv();
    const isOpenFromContext = useContext(ConnectionIndicatorContext);
    const theme = useColorScheme();
    const isActive = isOpen !== undefined ? isOpen : isOpenFromContext;
    return (React.createElement("div", { className: cx('ConnectionIndicator', theme === 'dark'
            ? 'ConnectionIndicator--dark'
            : 'ConnectionIndicator--light', {
            'ConnectionIndicator--active': isActive,
        }, className), "aria-hidden": !isActive },
        React.createElement("span", { className: "ConnectionIndicator__text" }, lang.use('me_app_connecting'))));
});
//# sourceMappingURL=ConnectionIndicator.js.map