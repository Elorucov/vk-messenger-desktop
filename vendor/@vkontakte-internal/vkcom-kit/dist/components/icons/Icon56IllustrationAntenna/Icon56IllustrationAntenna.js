import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { 
// eslint-disable-next-line no-restricted-imports
Icon56IllustrationAntennaDark, 
// eslint-disable-next-line no-restricted-imports
Icon56IllustrationAntennaLight, } from '@vkontakte-internal/icons-private';
import { useAppearance } from '../../Adopted';
export const Icon56IllustrationAntenna = ({ appearance: appearanceExternal, }) => {
    const appearance = useAppearance();
    const theme = appearanceExternal ?? appearance;
    return _jsx(_Fragment, { children: theme === 'dark' ? _jsx(Icon56IllustrationAntennaDark, {}) : _jsx(Icon56IllustrationAntennaLight, {}) });
};
//# sourceMappingURL=Icon56IllustrationAntenna.js.map