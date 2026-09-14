import { jsx as _jsx } from "react/jsx-runtime";
import { Avatar, Chip, ChipsSelect, CustomSelectOption } from '@vkontakte-internal/vkcom-kit';
import { useLang } from '../../hooks/useLang';
export const CustomChipsSelect = ({ loading, setSelected, setInputValue, inputValue, selected, conversations, }) => {
    const { getLang } = useLang();
    return (_jsx(ChipsSelect, { placeholder: getLang('calls_enter_recipient_or_dialog_name'), onChange: setSelected, onInputChange: (event) => {
            setInputValue(event.target.value);
        }, inputValue: inputValue, value: selected, options: conversations, closeAfterSelect: false, renderChip: (props, option) => {
            if (!props) {
                return null;
            }
            const { label, removable, ...rest } = props;
            return (_jsx(Chip, { before: _jsx(Avatar, { size: 20, alt: label, src: option.src }), ...rest, removable: removable, removeLabel: getLang('calls_delete'), children: label }));
        }, fetching: loading, emptyText: getLang('calls_search_empty_list'), renderOption: (props, option) => {
            return (_jsx(CustomSelectOption, { before: option.icon ? (_jsx(Avatar, { size: 20, children: option.icon })) : (_jsx(Avatar, { size: 20, alt: option.label, src: option.src })), ...props }));
        } }));
};
//# sourceMappingURL=CustomChipsSelect.js.map