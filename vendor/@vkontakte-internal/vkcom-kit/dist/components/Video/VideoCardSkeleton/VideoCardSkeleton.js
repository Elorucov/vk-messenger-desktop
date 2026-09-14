import { jsx as _jsx } from "react/jsx-runtime";
import { Skeleton } from '../../Skeleton/Skeleton';
import { VideoCardInfoSkeleton } from '../VideoCardInfoSkeleton/VideoCardInfoSkeleton';
import { VideoCardLayout } from '../VideoCardLayout/VideoCardLayout';
import styles from './VideoCardSkeleton.module.css';
const BORDER_RADIUS_THUMB = 10;
export const VideoCardSkeleton = ({ withAvatar, singleLineTitle, size = 'm', direction = 'vertical', videoContainerWidth, stretched, ownerVisibilityMode, }) => {
    const isVerticalFullWidth = direction !== 'horizontal' && stretched;
    return (_jsx(VideoCardLayout, { size: size, stretched: stretched, direction: direction, videoContainerWidth: videoContainerWidth, preview: _jsx(Skeleton, { className: styles.thumbnail, borderRadius: isVerticalFullWidth ? 0 : BORDER_RADIUS_THUMB, height: "100%" }), info: _jsx(VideoCardInfoSkeleton, { hasLayoutStretched: isVerticalFullWidth, noAvatar: !withAvatar, direction: direction, size: size, singleLineTitle: singleLineTitle, ownerVisibilityMode: ownerVisibilityMode }) }));
};
//# sourceMappingURL=VideoCardSkeleton.js.map