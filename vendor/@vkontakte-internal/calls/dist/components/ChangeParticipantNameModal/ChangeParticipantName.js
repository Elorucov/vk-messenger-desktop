import { jsx as _jsx } from "react/jsx-runtime";
import { Icon16Clear } from '@vkontakte/icons';
import { forwardRef, useCallback } from 'react';
import { useLang } from '../../hooks/useLang';
import { decodeHTMLEntities } from '@vkontakte-internal/vkjs/lib/emoji/HTMLEntities';
import { IconButton, Input, FormItem, FormLayout, EllipsisText, Div, getColorClass, Card, FormItemLabel, ShowMoreText, } from '@vkontakte-internal/vkcom-kit';
export const ChangeParticipantName = forwardRef((props, ref) => {
    const { langReplace, getLang } = useLang();
    let bottomText = '';
    if (!props.isAnonymous) {
        // В чате всегда видно имя профиля ({name})
        const text = props.isMyNameChanging
            ? getLang('calls_real_name_always_visible_in_chat')
            : getLang('calls_name_always_visible_in_chat');
        bottomText = langReplace(text, {
            name: decodeHTMLEntities(props.participantRealName || ''), // В чате всегда видно имя профиля ({name})
        });
    }
    if (props.error) {
        // Используйте только буквы, цифры, пробел и дефис
        bottomText = getLang('calls_use_letters_digits_space_and_hyphen');
    }
    const onSubmit = useCallback((e) => {
        e.preventDefault();
        props.onSubmit();
    }, [props.changedName]);
    return (_jsx(FormLayout, { onSubmit: onSubmit, children: _jsx(FormItem, { top: props.top, bottom: _jsx(FormItemLabel, { children: _jsx(ShowMoreText, { mode: "inline", lines: 10, children: bottomText }) }), status: props.error ? 'error' : 'default', noPadding: true, children: props.disabled ? (_jsx(Card, { mode: "outline", children: _jsx(Div, { mode: "vertical", spacing: 0, paddingTop: 4, paddingBottom: 4, children: _jsx(Div, { mode: "horizontal", spacing: 6, className: getColorClass('color_text_secondary'), children: _jsx(EllipsisText, { maxWidth: 344, children: decodeHTMLEntities(props.changedName) }) }) }) })) : (_jsx(Input, { maxLength: 25, placeholder: decodeHTMLEntities(props.placeholder || ''), onChange: props.onNameChange, value: decodeHTMLEntities(props.changedName), getRef: ref, size: 32, "data-testid": "calls_change_participant_name_input", after: _jsx(IconButton, { hoverMode: "opacity", 
                    // Очистить поле
                    label: getLang('calls_clear_field'), "data-testid": "calls_change_participant_name_input_clear", onClick: props.onClearName, children: _jsx(Icon16Clear, {}) }) })) }) }));
});
ChangeParticipantName.displayName = 'ChangeParticipantName';
//# sourceMappingURL=ChangeParticipantName.js.map