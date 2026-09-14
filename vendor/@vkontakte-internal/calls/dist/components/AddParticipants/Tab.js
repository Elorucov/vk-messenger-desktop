import { jsx as _jsx } from "react/jsx-runtime";
import { CallsMultiSelect } from '../CallsMultiSelect/CallsMultiSelect';
import { useTabContentController } from './hooks/useTabContentController';
export const Tab = ({ tokens, onChange, selected, personCache, initMembers, memberType, }) => {
    /** контроллер текущего таба */
    const controller = useTabContentController({
        selected,
        onChange,
        personCache,
        initMembers,
        memberType,
    });
    return (_jsx(CallsMultiSelect, { "data-focus-first": true, tokens: tokens, onRemoveToken: controller.onRemoveToken, value: controller.query, onChange: controller.onChangeHandler, onSelect: controller.onSelect, renderSuggest: controller.renderSuggest, data: controller.found }));
};
//# sourceMappingURL=Tab.js.map