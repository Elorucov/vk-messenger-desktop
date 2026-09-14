import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Spinner, Placeholder, Headline, Div } from '@vkontakte-internal/vkcom-kit';
import { useLang } from '../../../hooks/useLang';
export const SpinnerMaxed = ({ isAlbums }) => {
    const { getLang } = useLang();
    const text = isAlbums
        ? getLang('calls_movie_choose_loader_albums_title')
        : getLang('calls_movie_choose_loader_title');
    return (_jsxs(Placeholder, { stretched: true, children: [_jsx(Spinner, { size: "large" }), _jsx(Div, { mode: "vertical", spacing: 0, children: _jsx(Headline, { level: "2", weight: "3", children: text }) })] }));
};
//# sourceMappingURL=SpinnerMaxed.js.map