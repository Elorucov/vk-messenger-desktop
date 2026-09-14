import React, { useEffect, useRef, useState } from 'react';
import { useBrowserEnv } from '../../hooks/misc';
import { useLayoutData } from '../../ui/LayoutDataProvider/LayoutDataProvider';
import { Search } from '@vkontakte/vkui';
import { onElementKeyDownFactory, } from '../../utils/elementKeyDown';
export const PickerSearchInput = ({ onQueryChange, placeholder, selection, onSearchInputKeyDown, }) => {
    const { lang } = useBrowserEnv();
    const inputRef = useRef(null);
    const [value, setValue] = useState('');
    const { isMobileLayout } = useLayoutData();
    const onChange = (event) => {
        setValue(event.currentTarget.value);
    };
    useEffect(() => {
        onQueryChange(value);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);
    /**
     * Возвращяем фокус после изменения списка
     */
    useEffect(() => {
        if (!inputRef.current) {
            return;
        }
        if (isMobileLayout) {
            return;
        }
        inputRef.current.focus();
    }, [isMobileLayout, selection]);
    const onInputKeyDown = (keyCombo, event) => {
        if (keyCombo === 'Escape') {
            event.preventDefault();
            if (!value) {
                return;
            }
            event.stopPropagation();
            setValue('');
            return;
        }
        onSearchInputKeyDown(keyCombo, event);
    };
    return (React.createElement(Search, { getRef: inputRef, className: "PickerSearchInput__input", placeholder: placeholder || lang.use('me_picker_peer_search_placeholder'), onChange: onChange, value: value, onKeyDown: onElementKeyDownFactory(onInputKeyDown) }));
};
//# sourceMappingURL=PickerSearchInput.js.map