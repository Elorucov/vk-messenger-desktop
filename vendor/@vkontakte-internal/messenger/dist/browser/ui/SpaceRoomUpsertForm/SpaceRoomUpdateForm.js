import React, { useMemo } from 'react';
import { CellButton, FormItem, Input, Radio, Select, Spacing, } from '@vkontakte/vkui';
import * as Space from '../../../core/model/Space';
import { Icon24Add } from '@vkontakte/icons';
import { useBrowserEnv } from '../../hooks/misc';
import { SpaceRoomUpsertFormWrapper } from '../../ui/SpaceRoomUpsertForm/SpaceRoomUpsertFormWrapper';
import { SpaceRoomFormInputLabel } from '../../ui/SpaceRoomUpsertForm/SpaceRoomUpsertFormWrapper';
import { getNameLength, } from '../../ui/SpaceRoomUpsert/useSpaceRoomUpsert';
export const SpaceRoomUpdateForm = ({ space, formData, formErrors, focusedFields, setFormData, setFocusedFields, onSectionCreateClick, className, }) => {
    const { lang } = useBrowserEnv();
    const spaceSections = useMemo(() => [...space.sections.values()].map((section) => ({
        label: section.name,
        value: section.id,
    })), [space]);
    const onChangeName = (value) => {
        const nameLength = getNameLength(value);
        if (nameLength <= Space.ROOM_NAME_MAX_LENGTH) {
            setFormData('name', value.trimStart());
        }
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
        React.createElement(Spacing, { size: 6 }),
        formData.type === 'text' && (React.createElement(React.Fragment, null,
            React.createElement(FormItem, { top: React.createElement(FormItem.Top, null,
                    React.createElement(FormItem.TopLabel, { Component: "h5" },
                        React.createElement(SpaceRoomFormInputLabel, { label: lang.use('me_space_room_form_text_type_label') }))) },
                React.createElement(Radio, { disabled: true, name: "textType", value: "conversation", checked: formData.textType === 'conversation', onChange: () => {
                        setFormData('textType', 'conversation');
                    } }, lang.use('me_space_room_form_text_type_conversation')),
                React.createElement(Radio, { disabled: true, name: "textType", value: "channel", description: lang.use('me_space_room_form_text_type_channel_description'), checked: formData.textType === 'channel', onChange: () => {
                        setFormData('textType', 'channel');
                    } }, lang.use('me_space_room_form_text_type_channel')))))));
};
//# sourceMappingURL=SpaceRoomUpdateForm.js.map