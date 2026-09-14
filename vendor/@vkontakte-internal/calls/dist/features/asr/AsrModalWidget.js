import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":1}]} */
import { createWidget } from '@vkontakte-internal/di';
import { observer } from 'mobx-react-lite';
import { useCallback } from 'react';
import { AsrModal } from './AsrModal/AsrModal';
import { useLang } from '../../hooks/useLang';
import { Button, FormItem, FormLayout, ButtonGroup, Input } from '@vkontakte-internal/vkcom-kit';
import { useCloseModal } from '../../hooks/useCloseModal';
import { useFormInputValue } from '../../hooks/useFormInputValue';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { getCallConversation } from '../../selectors';
import { dateFormatter } from '../../constants';
import { AsrModalModelProvider, useAsrModalModel } from './AsrModalModel';
const MAX_ASR_NAME_LENGTH = 128;
const DISABLED_SYMBOLS_REGEXP = /[#%&{}\\\/<>*?$!`"':@+|=]/;
const ONLY_SPACE_REGEXP = /^\s*$/;
const AsrModalView = observer(function AsrModalView() {
    const { startAsr, stopAsr, asr: asrState } = useAsrModalModel();
    const { getLang, langReplace } = useLang();
    const onClose = useCloseModal();
    const conversation = useTypedSelector(getCallConversation);
    const isSferum = useTypedSelector((state) => state.config.sferum);
    const validator = useCallback((fileName) => {
        if (DISABLED_SYMBOLS_REGEXP.test(fileName) || ONLY_SPACE_REGEXP.test(fileName)) {
            return getLang('calls_asr_modal_validation_wrong_symbols');
        }
        if (fileName.length > MAX_ASR_NAME_LENGTH) {
            return getLang('calls_asr_modal_validation_length');
        }
        return false;
    }, []);
    const currentDateTitle = dateFormatter.format(new Date());
    const conversationNamePlaceholder = conversation?.name ? `${conversation.name} ${currentDateTitle}` : '';
    const docNamePlaceholder = langReplace(getLang('calls_asr_start_modal_content_default_value'), {
        date: currentDateTitle,
    });
    const { onChange, value, error } = useFormInputValue({
        initialValue: conversationNamePlaceholder || docNamePlaceholder,
        validator,
    });
    const handleStartAsr = useCallback(() => {
        return startAsr(value || conversationNamePlaceholder || docNamePlaceholder);
    }, [value, docNamePlaceholder]);
    const toggleFeature = useCallback((e) => {
        e.preventDefault();
        const toggle = asrState ? stopAsr : handleStartAsr;
        toggle().finally(onClose);
    }, [asrState, handleStartAsr, stopAsr, onClose]);
    const title = asrState ? getLang('calls_asr_stop_modal_title') : getLang('calls_asr_start_modal_title');
    const bottomText = isSferum
        ? getLang('calls_asr_start_modal_content_description_without_chat')
        : getLang('calls_asr_start_modal_content_description');
    const content = asrState ? (_jsx("div", { className: "AsrStopContent", children: getLang('calls_asr_stop_modal_content') })) : (_jsx(FormLayout, { onSubmit: toggleFeature, children: _jsx(FormItem, { top: getLang('calls_asr_start_modal_content_title'), bottom: error || bottomText, status: error ? 'error' : 'default', children: _jsx(Input, { value: value, onChange: onChange, placeholder: docNamePlaceholder }) }) }));
    const buttonText = asrState
        ? getLang('calls_asr_modal_stop_button')
        : getLang('calls_asr_modal_start_button');
    return (_jsx(AsrModal, { title: title, actionButtons: _jsxs(ButtonGroup, { children: [_jsx(Button, { size: "m", mode: "secondary", onClick: onClose, children: getLang('calls_asr_modal_cancel_button') }), _jsx(Button, { "data-focus-first": true, size: "m", mode: "primary", onClick: toggleFeature, disabled: !!error, children: buttonText })] }), onClose: onClose, children: content }));
});
export const AsrModalWidget = createWidget(AsrModalModelProvider, AsrModalView);
//# sourceMappingURL=AsrModalWidget.js.map