import { Button, FormItem, FormItemLabel, Textarea, } from '@vkontakte-internal/vkcom-kit';
import React, { useCallback, useMemo, useRef } from 'react';
import { useBrowserEnv } from '../../hooks/misc';
export const MessageTemplateForm = ({ setName, setText, name, text, isLoading, validateName, validateText, }) => {
    const { lang } = useBrowserEnv();
    const textareaRef = useRef(null);
    const insertButtonText = useCallback((text) => {
        const textarea = textareaRef.current;
        if (!textarea)
            return;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const textBefore = textarea.value.substring(0, start);
        const textAfter = textarea.value.substring(end);
        setText(textBefore + text + textAfter);
        textarea.selectionStart = textarea.selectionEnd = start + text.length;
        textarea.focus();
    }, [setText]);
    const templateButtons = useMemo(() => [
        {
            name: lang.use('me_templates_modal_button_user_name'),
            text: '{user name}',
        },
        {
            name: lang.use('me_templates_modal_button_user_surname'),
            text: '{user surname}',
        },
        {
            name: lang.use('me_templates_modal_button_admin_name'),
            text: '{admin name}',
        },
        {
            name: lang.use('me_templates_modal_button_admin_surname'),
            text: '{admin surname}',
        },
        {
            name: lang.use('me_templates_modal_button_community'),
            text: '{community}',
        },
        {
            name: lang.use('me_templates_modal_button_greeting'),
            text: '{greeting}',
        },
        {
            name: lang.use('me_templates_modal_button_goodbye'),
            text: '{goodbye}',
        },
    ], [lang]);
    const onNameChange = useCallback((e) => {
        setName(e.target.value);
    }, [setName]);
    const onTextChange = useCallback((e) => {
        setText(e.target.value);
    }, [setText]);
    return (React.createElement(React.Fragment, null,
        React.createElement(FormItem, { top: React.createElement(FormItemLabel, null, lang.use('me_templates_new_template_modal_name_label')), status: validateName(name) ? 'default' : 'error', bottom: !validateName(name) &&
                lang.use('me_templates_new_template_modal_name_warning'), htmlFor: "templateName" },
            React.createElement(Textarea, { id: "templateName", placeholder: lang.use('me_templates_new_template_modal_name_placeholder'), onChange: onNameChange, rows: 1, value: name, disabled: isLoading })),
        React.createElement(FormItem, { top: React.createElement(FormItemLabel, null, lang.use('me_templates_new_template_modal_text_label')), status: validateText(text) ? 'default' : 'error', bottom: !validateText(text) &&
                (text.length < 5
                    ? lang.use('me_templates_new_template_modal_text_min_warning')
                    : lang.use('me_templates_new_template_modal_text_max_warning')), htmlFor: "templateText" },
            React.createElement(Textarea, { id: "templateText", placeholder: lang.use('me_templates_new_template_modal_text_placeholder'), onChange: onTextChange, getRef: textareaRef, value: text, disabled: isLoading })),
        React.createElement("div", { className: "SaveTemplateModal__templateButtons" }, templateButtons.map((button) => (React.createElement(Button, { onClick: () => insertButtonText(button.text), mode: "secondary", className: "SaveTemplateModal__templateButton", disabled: isLoading, key: button.text }, button.name))))));
};
//# sourceMappingURL=MessageTemplateForm.js.map