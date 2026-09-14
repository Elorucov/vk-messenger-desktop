import { jsx as _jsx } from "react/jsx-runtime";
import { LottiePlayer } from '../LottiePlayer/LottiePlayer';
export const MainAnimationLayout = ({ layer, popUpLayerStyle, onAnimationLoaded, onFirstFrameRender, onLayerLoopCompleted, }) => {
    return (_jsx(LottiePlayer, { layer: layer, style: popUpLayerStyle, onAnimationLoaded: onAnimationLoaded, onFirstFrameRender: onFirstFrameRender, onLayerLoopCompleted: onLayerLoopCompleted }));
};
//# sourceMappingURL=MainAnimationLayout.js.map