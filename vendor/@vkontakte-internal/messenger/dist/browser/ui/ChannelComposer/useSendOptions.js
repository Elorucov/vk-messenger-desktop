import { useMemo, useState } from 'react';
const getInitialSendOption = (initialSelected = [], initialDisabled = []) => ({
    selected: new Set(initialSelected),
    disabled: new Set(initialDisabled),
});
export const useSendOptions = (initialOptions) => {
    const [sendOptions, setSendOptions] = useState(getInitialSendOption(initialOptions.selected, initialOptions.disabled));
    const { handleSendOptionClick, resetInitialSendOptions, toggleSendOptionDisabled, } = useMemo(() => {
        return {
            toggleSendOptionDisabled: (optionKey, isDisabled = false) => {
                setSendOptions((prev) => {
                    const disabled = new Set(prev.disabled);
                    if (isDisabled) {
                        disabled.add(optionKey);
                    }
                    else {
                        disabled.delete(optionKey);
                    }
                    return {
                        selected: prev.selected,
                        disabled,
                    };
                });
            },
            resetInitialSendOptions: () => {
                setSendOptions(getInitialSendOption());
            },
            handleSendOptionClick: (optionKey, disable = false) => {
                setSendOptions((prev) => {
                    const selected = new Set(prev.selected);
                    const disabled = new Set(prev.disabled);
                    const toggleSelected = (keys, value) => keys.forEach((key) => value ? selected.add(key) : selected.delete(key));
                    const toggleSendOptionDisabled = (keys, value) => keys.forEach((key) => value ? disabled.add(key) : disabled.delete(key));
                    toggleSelected([optionKey], !selected.has(optionKey));
                    toggleSendOptionDisabled([optionKey], disable);
                    return {
                        selected,
                        disabled,
                    };
                });
            },
        };
    }, []);
    return {
        sendOptions,
        handleSendOptionClick,
        resetInitialSendOptions,
        toggleSendOptionDisabled,
    };
};
//# sourceMappingURL=useSendOptions.js.map