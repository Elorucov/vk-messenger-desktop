import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Spacing } from '../../Adopted';
import { Skeleton } from '../../Skeleton/Skeleton';
import { VideoCardInfoLayout, } from '../VideoCardInfoLayout/VideoCardInfoLayout';
const VIDEO_CARD_AVATAR_SIZE = 36;
const SPACING_SIZE = 5;
export const VideoCardInfoSkeleton = ({ hasLayoutStretched, noAvatar, direction = 'vertical', size = 'm', className, singleLineTitle, ownerVisibilityMode, }) => {
    return (_jsx(VideoCardInfoLayout, { avatar: _jsx(Skeleton, { width: VIDEO_CARD_AVATAR_SIZE, height: VIDEO_CARD_AVATAR_SIZE, circle: true }), title: _jsxs(_Fragment, { children: [_jsx(Skeleton, { width: "95%" }), !singleLineTitle && _jsx(Skeleton, { width: "95%" }), _jsx(Spacing, { size: SPACING_SIZE })] }), ownerComponent: _jsx(Skeleton, { width: "48%" }), additionalInfo: _jsx(Skeleton, { width: "60%" }), description: _jsxs(_Fragment, { children: [_jsx(Skeleton, { width: "95%" }), _jsx(Skeleton, { width: "80%" })] }), stretched: hasLayoutStretched, noAvatar: noAvatar, direction: direction, size: size, className: className, ownerVisibilityMode: ownerVisibilityMode, avatarWrapperLabel: "" }));
};
//# sourceMappingURL=VideoCardInfoSkeleton.js.map