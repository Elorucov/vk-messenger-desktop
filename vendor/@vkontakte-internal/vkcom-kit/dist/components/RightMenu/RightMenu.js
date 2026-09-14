import { jsx as _jsx } from "react/jsx-runtime";
import { expectNever } from '@vkontakte-internal/utils';
import { Fragment } from 'react';
import { Group } from '../Adopted';
import { RightMenuContextProvider } from './RightMenuContext';
import { RightMenuGroup } from './RightMenuGroup/RightMenuGroup';
import { RightMenuItem } from './RightMenuItem/RightMenuItem';
import { RightMenuSeparator } from './RightMenuSeparator/RightMenuSeparator';
import styles from './RightMenu.module.css';
export const RightMenu = ({ items, selectedId, onSelect, onReselect, loading, ...restProps }) => {
    let itemIndex = 0;
    const renderRightMenuItem = (config) => {
        switch (config.type) {
            case 'separator': {
                const { type, ...rest } = config;
                const key = config.id ?? `separator-${itemIndex++}`;
                return _jsx(RightMenuSeparator, { ...rest }, key);
            }
            case 'item': {
                const { type, label, onClick, ...rest } = config;
                const handleClick = (event) => {
                    onClick?.(event);
                    if (!event.isPropagationStopped()) {
                        selectedId !== config.id ? onSelect?.(config.id) : onReselect?.(config.id);
                    }
                };
                return (_jsx(RightMenuItem, { ...rest, selected: config.id === selectedId, onClick: (onClick || onSelect) && handleClick, children: label }, config.id));
            }
            case 'group':
            case 'dropdown':
            case 'accordion': {
                const { type, label, ...rest } = config;
                const mode = type === 'group' ? 'default' : type;
                return (_jsx(RightMenuGroup, { ...rest, mode: mode, selectedId: selectedId, onSelect: onSelect, onReselect: onReselect, children: label }, config.id));
            }
            case 'custom': {
                const key = config.id ?? `custom-${itemIndex++}`;
                return _jsx(Fragment, { children: config.content }, key);
            }
            default:
                return expectNever(config);
        }
    };
    return (_jsx(RightMenuContextProvider, { value: Boolean(loading), children: _jsx(Group, { "data-testid": "rightmenu", ...restProps, children: _jsx("div", { "data-testid": "rightmenu-in", className: styles.container, children: items.map(renderRightMenuItem) }) }) }));
};
//# sourceMappingURL=RightMenu.js.map