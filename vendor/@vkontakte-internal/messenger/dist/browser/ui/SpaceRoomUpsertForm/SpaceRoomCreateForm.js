import '../../ui/SpaceRoomUpsertForm/SpaceRoomCreateForm.css';
import React, { useMemo } from 'react';
import cx from 'classnames';
import { Cell, CellButton, Counter, Footnote, FormItem, Headline, Input, Radio, Select, Separator, Spacing, Subhead, } from '@vkontakte/vkui';
import * as Space from '../../../core/model/Space';
import { Icon24Add, Icon24ChevronCompactRight, Icon24TextOutline, Icon24VolumeOutline, Icon24ErrorCircleOutline, } from '@vkontakte/icons';
import { useSnackbar } from '../../hooks/useSnackbar';
import { useBrowserEnv } from '../../hooks/misc';
import { debounce } from '../../../core/utils/misc';
import { SpaceRoomUpsertFormWrapper } from '../../ui/SpaceRoomUpsertForm/SpaceRoomUpsertFormWrapper';
import { SpaceRoomFormInputLabel } from '../../ui/SpaceRoomUpsertForm/SpaceRoomUpsertFormWrapper';
import { getNameLength, } from '../../ui/SpaceRoomUpsert/useSpaceRoomUpsert';
export const SpaceRoomCreateForm = ({ space, formData, formErrors, focusedFields, setFormData, setFocusedFields, onSectionCreateClick, onSpeakersSelectionCellClick, className, }) => {
    const { lang } = useBrowserEnv();
    const snackbar = useSnackbar();
    const debouncedSnackbar = debounce(snackbar, 2000, true);
    const spaceSections = useMemo(() => Array.from(space.sections.values(), (section) => ({
        label: section.name,
        value: section.id,
    })), [space]);
    const onChangeName = (value) => {
        const nameLength = getNameLength(value);
        if (nameLength <= Space.ROOM_NAME_MAX_LENGTH) {
            setFormData('name', value.trimStart());
        }
    };
    const onChangeLimit = (value) => {
        const max = 100;
        const min = 1;
        const limitValue = parseInt(value.replace(/\D+/, ''), 10);
        if (isNaN(limitValue)) {
            return setFormData('limit', '');
        }
        if (limitValue > max) {
            debouncedSnackbar({
                // SPC-TODO: Не финальный текст, после доработки дизайна поменяется, заменить на lang.use
                message: `Нельзя установить больше ${max} участников`,
                autoClose: true,
                duration: 4000,
                mode: 'dark',
                before: (React.createElement(Icon24ErrorCircleOutline, { style: { color: 'var(--vkui--color_icon_negative)' } })),
            });
            return;
        }
        setFormData('limit', Math.max(limitValue, min));
    };
    return (React.createElement(SpaceRoomUpsertFormWrapper, { className: className },
        React.createElement(FormItem, { top: React.createElement(FormItem.Top, null,
                React.createElement(FormItem.TopLabel, { Component: "h5" },
                    React.createElement(SpaceRoomFormInputLabel, { label: lang.use('me_space_room_form_name_input_label'), right: lang.use('me_space_room_form_name_input_current_length', {
                            values: {
                                currentValue: getNameLength(formData.name).toString(),
                                maxValue: Space.ROOM_NAME_MAX_LENGTH.toString(),
                            },
                        }) }))), status: focusedFields.name && formErrors.has('name') ? 'error' : 'default', onInput: () => {
                !focusedFields.name &&
                    setFocusedFields((prev) => ({ ...prev, name: true }));
            } },
            React.createElement(Input, { autoFocus: true, type: "text", placeholder: lang.use('me_space_room_form_name_input_placeholder'), value: formData.name, onChange: (v) => onChangeName(v.currentTarget.value) })),
        React.createElement(FormItem, { top: React.createElement(FormItem.Top, null,
                React.createElement(FormItem.TopLabel, { Component: "h5" },
                    React.createElement(SpaceRoomFormInputLabel, { label: lang.use('me_space_room_form_section_input_label') }))) },
            React.createElement(Select, { allowClearButton: true, placeholder: lang.use('me_space_room_form_section_input_placeholder'), value: formData.sectionId, options: spaceSections, onChange: ({ currentTarget: { value } }) => setFormData('sectionId', value ? Space.resolveSectionId(Number(value)) : undefined) })),
        React.createElement(CellButton, { before: React.createElement(Icon24Add, null), onClick: onSectionCreateClick }, lang.use('me_space_room_form_section_create_button')),
        React.createElement(Spacing, null),
        React.createElement(FormItem, { top: React.createElement(FormItem.Top, null,
                React.createElement(FormItem.TopLabel, { Component: "h5" },
                    React.createElement(SpaceRoomFormInputLabel, { label: lang.use('me_space_room_form_type_radio_label') })),
                ' ') },
            React.createElement(SpaceRoomCreateFormTypeRadioGroup, { value: formData.type, onChange: (value) => {
                    setFormData('type', value);
                } })),
        React.createElement(Spacing, { size: 6 }),
        formData.type === 'text' && (React.createElement(React.Fragment, null,
            React.createElement(FormItem, { top: React.createElement(FormItem.Top, null,
                    React.createElement(FormItem.TopLabel, { Component: "h5" },
                        React.createElement(SpaceRoomFormInputLabel, { label: lang.use('me_space_room_form_text_type_label') })),
                    ' ') },
                React.createElement(Radio, { name: "textType", value: "conversation", checked: formData.textType === 'conversation', onChange: () => {
                        setFormData('textType', 'conversation');
                    } }, lang.use('me_space_room_form_text_type_conversation')),
                React.createElement(Radio, { name: "textType", value: "channel", description: lang.use('me_space_room_form_text_type_channel_description'), checked: formData.textType === 'channel', onChange: () => {
                        setFormData('textType', 'channel');
                    } }, lang.use('me_space_room_form_text_type_channel'))),
            React.createElement(Spacing, { size: 63 }))),
        formData.type === 'voice' && (React.createElement(React.Fragment, null,
            React.createElement(FormItem, { top: React.createElement(SpaceRoomFormInputLabel, { label: lang.use('me_space_room_form_voice_type_label') }), style: { paddingBottom: 6 }, topComponent: "h5" },
                React.createElement(Radio, { name: "voiceType", value: "call", checked: formData.voiceType === 'call', onChange: () => {
                        setFormData('voiceType', 'call');
                    } }, lang.use('me_space_room_form_voice_type_call')),
                React.createElement(Radio, { name: "voiceType", value: "tribune", description: lang.use('me_space_room_form_voice_type_tribune_description'), checked: formData.voiceType === 'tribune', onChange: () => {
                        setFormData('voiceType', 'tribune');
                    } }, lang.use('me_space_room_form_voice_type_tribune'))),
            React.createElement(Separator, { style: {
                    marginTop: 6,
                    marginBottom: 6,
                    paddingLeft: 12,
                    paddingRight: 12,
                    height: '1px',
                } }),
            formData.voiceType === 'call' && (React.createElement(FormItem, { className: "SpaceRoomCreateForm__callLimit" },
                React.createElement(Subhead, { style: { color: 'var(--vkui--color_text_subhead)' } }, lang.use('me_space_room_form_call_limit_label')),
                React.createElement(Input, { value: formData.limit, className: "SpaceRoomCreateForm__callLimitInput", inputMode: "numeric", onChange: (e) => {
                        onChangeLimit(e.target.value);
                    } }))),
            formData.voiceType === 'tribune' && (React.createElement(Cell, { after: React.createElement("div", { className: "SpaceRoomCreateForm__tribuneAfter" },
                    !!formData.speakerIds.length && (React.createElement(Counter, { size: "s", mode: "primary", appearance: "accent" }, formData.speakerIds.length)),
                    React.createElement(Icon24ChevronCompactRight, { color: "var(--vkui--color_icon_tertiary)" })), hasActive: false, onClick: onSpeakersSelectionCellClick },
                React.createElement(Headline, { Component: "h4", weight: "3", useAccentWeight: true }, lang.use('me_space_room_form_select_speakers_text')),
                React.createElement(Subhead, { style: {
                        color: 'var(--vkui--color_text_subhead)',
                        marginTop: 2,
                        fontSize: '13px',
                        lineHeight: '16px',
                    } }, lang.use('me_space_room_form_select_speakers_description'))))))));
};
const SpaceRoomCreateFormTypeRadioGroup = ({ value, onChange }) => {
    const { lang } = useBrowserEnv();
    return (React.createElement("div", { className: "SpaceRoomCreateFormTypeRadioGroup" },
        React.createElement("label", null,
            React.createElement("input", { type: "radio", name: "type", id: "text", value: "text", onChange: () => onChange('text') }),
            React.createElement("div", { className: cx('SpaceRoomCreateFormTypeRadioGroup__radio', {
                    'SpaceRoomCreateFormTypeRadioGroup__radio--selected': value === 'text',
                }) },
                React.createElement(Icon24TextOutline, { className: "SpaceRoomCreateFormTypeRadioGroup__icon" }),
                React.createElement(Headline, { level: "2", weight: "2", style: { marginTop: 6, marginBottom: 2, lineHeight: '18px' }, Component: "h4", useAccentWeight: true }, lang.use('me_space_room_form_type_text_title')),
                React.createElement(Footnote, { className: "SpaceRoomCreateFormTypeRadioGroup__radioNote" }, lang.use('me_space_room_form_type_text_description')))),
        React.createElement("label", null,
            React.createElement("input", { type: "radio", name: "type", id: "voice", value: "voice", onChange: () => onChange('voice') }),
            React.createElement("div", { className: cx('SpaceRoomCreateFormTypeRadioGroup__radio', {
                    'SpaceRoomCreateFormTypeRadioGroup__radio--selected': value === 'voice',
                }) },
                React.createElement(Icon24VolumeOutline, { className: "SpaceRoomCreateFormTypeRadioGroup__icon" }),
                React.createElement(Headline, { level: "2", weight: "2", style: { marginTop: 6, marginBottom: 2, lineHeight: '18px' }, Component: "h4", useAccentWeight: true }, lang.use('me_space_room_form_type_voice_title')),
                React.createElement(Footnote, { className: "SpaceRoomCreateFormTypeRadioGroup__radioNote" }, lang.use('me_space_room_form_type_voice_description'))))));
};
//# sourceMappingURL=SpaceRoomCreateForm.js.map