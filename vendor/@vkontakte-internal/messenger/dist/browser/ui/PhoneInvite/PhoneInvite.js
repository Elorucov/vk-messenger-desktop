import React, { useCallback, useEffect, useRef, useState, } from 'react';
import { Icon56PhoneOutline } from '@vkontakte/icons';
import { Button, FormItem, Input, Title, Subhead, Spacing, } from '@vkontakte/vkui';
import { useFormatPhoneNumber } from '../../hooks/useFormatPhoneNumber';
import './PhoneInvite.css';
import { useBrowserEnv } from '../../hooks/misc';
export const PhoneInvite = ({ onSubmit, onErrorReset, isLoading = false, title, subtitle, action, error, focusOnMount, }) => {
    const [phone, setPhone] = useState('');
    const { isReady, format } = useFormatPhoneNumber();
    const $input = useRef(null);
    const handlePhoneChange = useCallback((event) => {
        onErrorReset?.();
        const value = format(event.target.value);
        setPhone(value);
    }, [format, onErrorReset]);
    const handleFormSubmit = (event) => {
        // Не даем странице перегружаться.
        event.preventDefault();
        if (!isLoading) {
            onSubmit(phone);
        }
    };
    const { lang } = useBrowserEnv();
    useEffect(() => {
        if (focusOnMount && $input.current) {
            $input.current.focus();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return (React.createElement("form", { className: "PhoneInvite", onSubmit: handleFormSubmit },
        React.createElement(Icon56PhoneOutline, { className: "PhoneInvite__icon", color: "var(--vkui--color_icon_accent)" }),
        React.createElement(Spacing, { size: 24 }),
        React.createElement(Title, { level: "2", weight: "2", className: "PhoneInvite__title", Component: "h3", useAccentWeight: true }, title),
        React.createElement(Spacing, { size: 8 }),
        React.createElement(Subhead, null, subtitle),
        React.createElement(Spacing, { size: 16 }),
        React.createElement(FormItem, { status: error ? 'error' : 'default', bottom: error, noPadding: true },
            React.createElement(Input, { type: "tel", name: "phone", autoComplete: "tel", value: phone, onChange: handlePhoneChange, placeholder: "+7 (000) 000-00-00", "aria-label": lang.use('me_phone_number_input_label'), getRef: $input })),
        React.createElement(Spacing, { size: 32 }),
        React.createElement(Button, { type: "submit", size: "l", stretched: true, mode: "primary", loading: isLoading || !isReady, disabled: !phone }, action)));
};
//# sourceMappingURL=PhoneInvite.js.map