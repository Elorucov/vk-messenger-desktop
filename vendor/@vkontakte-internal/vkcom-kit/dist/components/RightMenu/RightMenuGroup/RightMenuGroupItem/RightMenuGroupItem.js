import { jsx as _jsx } from "react/jsx-runtime";
import { expectNever } from '@vkontakte-internal/utils';
import { cloneElement, Fragment, isValidElement } from 'react';
import { RightMenuItem } from '../../RightMenuItem/RightMenuItem';
export const RightMenuGroupItem = ({ selectedId, config: { id, label, ...config }, onSelect, onReselect, ...restProps }) => {
    switch (config.type) {
        case 'item': {
            const { type, onClick, ...restConfig } = config;
            const handleClick = (event) => {
                onClick?.(event);
                if (!event.isPropagationStopped()) {
                    selectedId !== id ? onSelect?.(id) : onReselect?.(id);
                }
            };
            return (_jsx(RightMenuItem, { id: id, ...restProps, ...restConfig, mode: "secondary", selected: id === selectedId, onClick: (onClick || onSelect) && handleClick, children: label }, id));
        }
        case 'custom': {
            return isValidElement(config.content) ? (cloneElement(config.content, {
                key: id,
                ...restProps,
            })) : (_jsx(Fragment, { children: config.content }, id));
        }
        default:
            return expectNever(config);
    }
};
//# sourceMappingURL=RightMenuGroupItem.js.map