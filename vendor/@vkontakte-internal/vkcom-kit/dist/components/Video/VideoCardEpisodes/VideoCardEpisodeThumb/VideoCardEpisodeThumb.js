import { jsx as _jsx } from "react/jsx-runtime";
import { Flex } from '../../../Adopted';
import styles from './VideoCardEpisodeThumb.module.css';
export const VideoCardEpisodeThumb = ({ thumbData: { frameHeight, frameWidth, imgHeight, imgOffsetX, imgOffsetY, imgSrc, imgWidth, maxSize }, children, }) => {
    return (_jsx(Flex, { justify: "center", align: "center", noWrap: true, className: styles.thumb, style: {
            backgroundImage: `url(${imgSrc})`,
            backgroundSize: `${imgWidth}px ${imgHeight}px`,
            backgroundPosition: `${imgOffsetX}px ${imgOffsetY}px`,
            minWidth: maxSize,
            maxWidth: maxSize,
            height: (maxSize * frameHeight) / frameWidth,
            minHeight: maxSize / 2,
        }, children: children }));
};
//# sourceMappingURL=VideoCardEpisodeThumb.js.map