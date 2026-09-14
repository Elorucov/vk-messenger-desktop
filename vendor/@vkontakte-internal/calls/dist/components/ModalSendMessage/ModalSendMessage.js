import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useState } from 'react';
import { Button, FormItemLabel, FormItem, Textarea, FormLayout, Div, } from '@vkontakte-internal/vkcom-kit';
import { CallsModal } from '../../components/CallsModal';
import { getMessageForTextLimit } from '../../helpers/helpers';
import { useLang } from '../../hooks/useLang';
import { CustomChipsSelect } from './CustomChipsSelect';
export const ModalSendMessage = ({ onClose, title, onSubmit, options, submitDisabled, initialText, onChangeInput, loading, maxLength, attachment, }) => {
    const { getLang } = useLang();
    // текст сообщения
    const [text, setText] = useState(initialText || '');
    const [inputValue, setInputValue] = useState('');
    const [selected, setSelected] = useState();
    useEffect(() => {
        onChangeInput?.(inputValue);
    }, [inputValue]);
    const handleChangeTextarea = useCallback((event) => {
        const val = event.target.value;
        setText(val);
    }, []);
    /** прокси для onSubmit для сбора финальных данных */
    const handleSubmit = useCallback(() => {
        const ids = selected?.map((option) => option.value);
        if (!ids?.length || (!text && !attachment)) {
            return;
        }
        onSubmit({ text, ids, attachment });
    }, [text, selected, onSubmit, attachment]);
    const limitMessage = !!maxLength && getMessageForTextLimit(text.length, maxLength, getLang);
    const isTextMoreThanLimit = !!maxLength && text.length > maxLength;
    /* локальный флаг выключенной кнопки Submit */
    const disabled = (!text && !attachment) || isTextMoreThanLimit || !selected?.length;
    return (_jsx(CallsModal, { className: "ModalSendMessage", onClose: onClose, title: title, actionButtons: _jsx(Button, { mode: "primary", size: "m", onClick: handleSubmit, disabled: disabled || submitDisabled, children: getLang('calls_send') }), disableEscapeClose: true, disableBodyScroll: true, children: _jsx(Div, { children: _jsxs(FormLayout, { children: [_jsx(FormItem, { children: _jsx(CustomChipsSelect, { loading: loading, setSelected: setSelected, conversations: options, inputValue: inputValue, setInputValue: setInputValue, selected: selected }) }), _jsx(FormItem, { top: _jsx(FormItemLabel, { mode: "primary", children: getLang('calls_your_message') }), bottom: limitMessage && _jsx(FormItemLabel, { aside: limitMessage }), children: _jsx(Textarea, { value: text, onChange: handleChangeTextarea }) })] }) }) }));
};
//# sourceMappingURL=ModalSendMessage.js.map