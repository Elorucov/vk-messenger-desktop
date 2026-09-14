import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Button, FormItemLabel, Textarea, Input, FormItem, } from '@vkontakte-internal/vkcom-kit';
import { CallsModal } from '../../components/CallsModal';
import { classNames } from '@vkontakte/vkjs';
export const DialogSimpleInput = ({ title, placeholder, cancelTitle, submitTitle, onClose, onSubmit, onChange, disableSubmit = false, inputStatus, value: customValue, maxLength, minLength, isTextArea, isDisabledInput, hasLengthCounter, disableBackdropClick, }) => {
    const [localValue, setLocalValue] = useState('');
    const value = customValue || localValue;
    const handleChange = (e) => {
        setLocalValue(e.target.value);
        onChange?.(e.target.value);
    };
    const formInput = isTextArea ? (_jsx(Textarea, { placeholder: placeholder, value: value, onChange: handleChange, rows: 3, maxLength: maxLength, disabled: isDisabledInput })) : (_jsx(Input, { autoFocus: true, value: value, placeholder: placeholder, onChange: handleChange, status: inputStatus, maxLength: maxLength, minLength: minLength }));
    return (_jsx(CallsModal, { className: classNames('CallsDialogSimpleInput', isTextArea && 'CallsDialogSimpleInput--textarea'), title: title, onClose: onClose, disableBackdropClick: disableBackdropClick, actionButtons: _jsxs(_Fragment, { children: [_jsx(Button, { size: "m", onClick: onClose, mode: "tertiary", children: cancelTitle }), _jsx(Button, { size: "m", onClick: () => {
                        onSubmit(value);
                    }, disabled: disableSubmit, children: submitTitle })] }), children: hasLengthCounter ? (_jsx(FormItem, { bottom: _jsx(FormItemLabel, { aside: `${value.length} / ${maxLength}` }), children: formInput })) : (formInput) }));
};
//# sourceMappingURL=DialogSimpleInput.js.map