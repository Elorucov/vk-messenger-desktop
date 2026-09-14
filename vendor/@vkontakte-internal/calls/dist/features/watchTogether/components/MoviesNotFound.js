import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"span":["global",{"className":2}]} */
import { Placeholder } from '@vkontakte-internal/vkcom-kit';
import { Icon56VideoOutline } from '@vkontakte/icons';
import { useLang } from '../../../hooks/useLang';
export const MoviesNotFound = ({ query }) => {
    const { getLang } = useLang();
    return (_jsxs(Placeholder, { stretched: true, icon: _jsx(Icon56VideoOutline, {}), children: [!!query && (_jsxs("span", { className: "MoviesNotFound__description", children: [getLang('calls_movie_choose_empty_query_start'), "\u00A0", _jsx("b", { children: query }), " ", getLang('calls_movie_choose_empty_query_end')] })), !query && (_jsx("span", { className: "MoviesNotFound__description", children: getLang('calls_movie_choose_video_not_found') }))] }));
};
//# sourceMappingURL=MoviesNotFound.js.map