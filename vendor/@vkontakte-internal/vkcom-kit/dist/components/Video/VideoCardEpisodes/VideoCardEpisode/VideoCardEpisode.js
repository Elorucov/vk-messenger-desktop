import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"Icon12Poll":["@vkontakte/icons",{"className":1}]} */
import { Icon12Poll } from '@vkontakte/icons';
import { formatDuration } from '@vkontakte/vkjs';
import { getColorClass } from '../../../../utils/getColorClass/getColorClass';
import { HorizontalCell, Image, Text } from '../../../Adopted';
import { TextClamp } from '../../../TextClamp/TextClamp';
import { VideoCardEpisodeThumb } from '../VideoCardEpisodeThumb/VideoCardEpisodeThumb';
import styles from './VideoCardEpisode.module.css';
const MAX_SIZE = 120;
export const VideoCardEpisode = ({ thumbData, text, time, onClick, active, }) => {
    const handleClick = (event) => {
        onClick(event, time);
    };
    return (_jsx(HorizontalCell, { size: "l", subtitle: _jsx(TextClamp, { className: getColorClass('color_text_primary'), lines: 2, children: text }), onClick: handleClick, children: _jsx(VideoCardEpisodeThumb, { thumbData: { ...thumbData, maxSize: MAX_SIZE }, children: _jsx(Image.Overlay, { visibility: "always", theme: "dark", children: _jsxs(_Fragment, { children: [active && _jsx(Icon12Poll, { className: styles.activeEpisodeIcon }), _jsx(Text, { weight: "3", children: formatDuration(time) })] }) }) }) }));
};
//# sourceMappingURL=VideoCardEpisode.js.map