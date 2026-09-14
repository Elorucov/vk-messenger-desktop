import '../../ui/SpaceSettings/SpaceSettings.css';
import React, { useId, useMemo, useState } from 'react';
import * as TextChunk from '../../../core/model/TextChunk';
import { Button, FormItem, IconButton, Input, Textarea } from '@vkontakte/vkui';
import { Icon16Clear, Icon24Add } from '@vkontakte/icons';
import { useBrowserEnv, useDispatch } from '../../hooks/misc';
import { getLengthWithEmoji } from '../../../core/utils/emoji';
import { SpaceAvatarSelector } from '../../ui/SpaceAvatarSelector/SpaceAvatarSelector';
const MIN_SPACE_NAME_LENGTH = 2;
const MAX_SPACE_NAME_LENGTH = 50;
const MAX_SPACE_DESCRIPTION_LENGTH = 200;
export const SpaceSettings = ({ space }) => {
    const { lang } = useBrowserEnv();
    const dispatch = useDispatch();
    const [name, setName] = useState(space.name);
    const [description, setDescription] = useState(TextChunk.toPlainText(space.description, { multiline: true }));
    const nameId = useId();
    const descriptionId = useId();
    const coverId = useId();
    const onNameEdit = (event) => {
        setName(event.target.value.trimStart());
    };
    const onNameClear = () => {
        setName('');
    };
    const onDescriptionEdit = (event) => {
        const length = getLengthWithEmoji(event.target.value);
        if (length <= MAX_SPACE_DESCRIPTION_LENGTH) {
            setDescription(event.target.value);
        }
    };
    const isNameChanged = name !== space.name;
    const isDescriptionChanged = description !==
        TextChunk.toPlainText(space.description, { multiline: false });
    const save = () => {
        if (isNameChanged || isDescriptionChanged) {
            dispatch({
                type: 'UserChangedSpace',
                spaceId: space.id,
                ...(isNameChanged && { name: name.trim() }),
                ...(isDescriptionChanged && { description }),
            });
        }
    };
    const isValidForm = useMemo(() => {
        const nameLength = getLengthWithEmoji(name);
        return (nameLength >= MIN_SPACE_NAME_LENGTH &&
            nameLength <= MAX_SPACE_NAME_LENGTH &&
            (isNameChanged || isDescriptionChanged));
    }, [name, isNameChanged, isDescriptionChanged]);
    return (React.createElement("div", { className: "SpaceSettings" },
        React.createElement(SpaceAvatarSelector, { space: space }),
        React.createElement("form", { className: "SpaceSettings__form", onSubmit: (e) => {
                // Не даем странице перегружаться.
                e.preventDefault();
                if (!isValidForm) {
                    return;
                }
                save();
            } },
            React.createElement(FormItem, { top: lang.use('me_space_edit_name_label'), htmlFor: nameId, status: "default" },
                React.createElement(Input, { type: "text", placeholder: lang.use('me_space_edit_name_placeholder'), onChange: onNameEdit, value: name, id: nameId, after: name && (React.createElement(IconButton, { hoverMode: "opacity", "aria-label": lang.use('me_clear_field'), onClick: onNameClear },
                        React.createElement(Icon16Clear, null))) })),
            React.createElement(FormItem, { top: lang.use('me_space_edit_description_label'), htmlFor: descriptionId },
                React.createElement(Textarea, { id: descriptionId, maxHeight: 96, value: description, onChange: onDescriptionEdit, placeholder: lang.use('me_space_edit_description_placeholder') })),
            React.createElement(FormItem, { top: lang.use('me_space_edit_cover_label'), htmlFor: coverId, bottom: lang.use('me_space_edit_cover_hint') },
                React.createElement("div", { className: "SpaceSettings__addCover" },
                    React.createElement(Button, { before: React.createElement(Icon24Add, null), hasHover: false, mode: "link", hasActive: false, onClick: () => { } }, lang.use('me_space_edit_cover_button')),
                    React.createElement("p", { className: "SpaceSettings__addCoverDescription" }, lang.use('me_space_edit_cover_button_description'))))),
        React.createElement("footer", { className: "SpaceSettings__footer" },
            React.createElement(Button, { size: "s", onClick: save, disabled: !isValidForm }, lang.use('me_save')))));
};
//# sourceMappingURL=SpaceSettings.js.map