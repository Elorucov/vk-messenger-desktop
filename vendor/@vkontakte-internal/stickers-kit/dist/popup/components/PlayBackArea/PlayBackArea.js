import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { toJS } from 'mobx';
import { AnimationLayer } from '../AnimationLayer/AnimationLayer';
import { NonAnimationLayer } from '../NonAnimationLayer/NonAnimationLayer';
import { isAnimationLayer } from '../../helpers/layer';
import styles from './PlayBackArea.module.css';
export const PlayBackArea = ({ layer, popUpLayerStyle, animationState, onAnimationPlayBackAreaFinished, onAnimationPlayBackAreaLoaded, style, popUpLayerStyleData, ...props }) => {
    const isAnimation = isAnimationLayer(layer);
    return (_jsx("div", { className: styles.wrapper, style: toJS(style), ...props, children: _jsxs("div", { className: styles.area, children: [isAnimation && animationState && (_jsx(AnimationLayer, { layer: layer, animationState: animationState, popUpLayerStyle: popUpLayerStyle, onAnimationPlayBackAreaLoaded: onAnimationPlayBackAreaLoaded, onAnimationPlayBackAreaFinished: onAnimationPlayBackAreaFinished })), !isAnimation && (_jsx(NonAnimationLayer, { layer: layer, parentState: animationState, popUpLayerStyle: popUpLayerStyle, popUpLayerStyleData: popUpLayerStyleData }))] }) }));
};
//# sourceMappingURL=PlayBackArea.js.map