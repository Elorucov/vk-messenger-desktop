import React, { useCallback, useState } from 'react';
import { Dropdown } from '../../ui/Dropdown/Dropdown';
import { ActionsMenu, ActionsMenuAction, } from '../../ui/ActionsMenu/ActionsMenu';
import { HopNavigationButton } from '../../ui/HopNavigationButton/HopNavigationButton';
import { Icon20MessageCheckOutline, Icon20Stars } from '@vkontakte/icons';
import { useBrowserEnv } from '../../hooks/misc';
import { useAdaptivityWithJSMediaQueries } from '@vkontakte/vkui';
const OPEN_DELAY = 2000;
export const ReactionHopNavigation = ({ count, isVisible, title, onClick, onReactionsReadAllClick, }) => {
    const { hasPointer } = useAdaptivityWithJSMediaQueries();
    const { lang } = useBrowserEnv();
    const [isReadAllOpened, setReadAllOpened] = useState(false);
    const [key, setKey] = useState(1);
    const handleOpen = useCallback(() => {
        setReadAllOpened(true);
    }, []);
    const handleClose = useCallback(() => {
        setReadAllOpened(false);
    }, []);
    const handleClick = useCallback(() => {
        if (!isReadAllOpened) {
            setKey((prevKey) => ++prevKey);
        }
        onClick?.();
    }, [isReadAllOpened, onClick]);
    return (React.createElement(Dropdown, { key: key, content: React.createElement(ActionsMenu, null,
            React.createElement(ActionsMenuAction, { title: lang.use('me_hop_nav_reactions_all'), leftIcon: React.createElement(Icon20MessageCheckOutline, null), onClick: onReactionsReadAllClick })), ...(!hasPointer
            ? {
                openType: 'longtouch',
            }
            : {
                openType: 'hover',
                delay: OPEN_DELAY,
            }), align: "center", position: "top", classNames: {
            contentWrapper: 'ConvoHopNavigation__reactions-all',
        }, adaptation: "vertical", hideOnClick: true, onClose: handleClose, onOpen: handleOpen },
        React.createElement(HopNavigationButton, { count: count, isVisible: isVisible, isCounterVisible: count > 1, icon: React.createElement(Icon20Stars, null), title: title, onClick: handleClick })));
};
//# sourceMappingURL=ReactionHopNavigation.js.map