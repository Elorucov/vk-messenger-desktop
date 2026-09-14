import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"span":["global",{"className":1}]} */
import { Placeholder } from '@vkontakte-internal/vkcom-kit';
import { Icon56VideoOutline } from '@vkontakte/icons';
import { useLang } from '../../../hooks/useLang';
export const AlbumsNotFound = () => {
    const { getLang } = useLang();
    return (_jsxs(Placeholder, { stretched: true, icon: _jsx(Icon56VideoOutline, {}), children: [_jsx("h1", { children: getLang('calls_movie_choose_albums_not_found_title') }), _jsx("span", { className: "MoviesNotFound__description", children: getLang('calls_movie_choose_albums_not_found') })] }));
};
//# sourceMappingURL=AlbumsNotFound.js.map