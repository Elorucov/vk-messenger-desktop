import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"Icon20ListPlayOutline":["@vkontakte/icons",{"className":1}]} */
import { Icon20ListPlayOutline } from '@vkontakte/icons';
import { classNames } from '@vkontakte/vkjs';
import { Subhead } from '../../Adopted';
import { TextClamp } from '../../TextClamp/TextClamp';
import styles from './VideoPlaylistCardCounter.module.css';
export const VideoPlaylistCardCounter = ({ count, direction, }) => {
    return (_jsxs("div", { className: classNames(styles.container, direction === 'horizontal' && styles.containerHorizontal), children: [_jsx(Icon20ListPlayOutline, { className: styles.icon }), _jsx(TextClamp, { TypographyComponent: Subhead, Component: "div", lines: 1, "data-testid": "playlist_card_count_of_video", children: count })] }));
};
//# sourceMappingURL=VideoPlaylistCardCounter.js.map