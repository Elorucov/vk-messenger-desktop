import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { isMainAnimationLayout } from '../../helpers/layer';
import { MainAnimationLayout } from './components/MainAnimationLayout/MainAnimationLayout';
export const AnimationLayer = ({ layer, animationState, onAnimationPlayBackAreaLoaded, onAnimationPlayBackAreaFinished, ...props }) => {
    const isMainAnimation = isMainAnimationLayout(layer);
    const [isFinished, setIsFinished] = useState(false);
    const handleAnimationPlayBackAreaFinished = () => {
        if (isFinished) {
            return;
        }
        onAnimationPlayBackAreaFinished();
        animationState.markStateAsFinished();
        setIsFinished(true);
    };
    const handleAnimationLoaded = () => {
        onAnimationPlayBackAreaLoaded();
        animationState.markStateAsLoaded();
    };
    const handleAnimationPlaying = () => {
        animationState.markStateAsPlaying();
    };
    if (isFinished) {
        return null;
    }
    return (_jsx(_Fragment, { children: isMainAnimation && (_jsx(MainAnimationLayout, { layer: layer, onFirstFrameRender: handleAnimationPlaying, onAnimationLoaded: handleAnimationLoaded, onLayerLoopCompleted: handleAnimationPlayBackAreaFinished, ...props })) }));
};
//# sourceMappingURL=AnimationLayer.js.map