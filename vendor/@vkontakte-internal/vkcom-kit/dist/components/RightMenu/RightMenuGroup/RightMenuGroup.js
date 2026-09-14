import { jsx as _jsx } from "react/jsx-runtime";
import { expectNever } from '@vkontakte-internal/utils';
import { RightMenuAccordionGroup } from './RightMenuAccordionGroup';
import { RightMenuDefaultGroup } from './RightMenuDefaultGroup';
import { RightMenuDropdownGroup } from './RightMenuDropdownGroup';
export const RightMenuGroup = ({ mode = 'default', ...restProps }) => {
    switch (mode) {
        case 'default':
            return _jsx(RightMenuDefaultGroup, { ...restProps });
        case 'dropdown':
            return _jsx(RightMenuDropdownGroup, { ...restProps });
        case 'accordion':
            return _jsx(RightMenuAccordionGroup, { ...restProps });
        default:
            return expectNever(mode);
    }
};
//# sourceMappingURL=RightMenuGroup.js.map