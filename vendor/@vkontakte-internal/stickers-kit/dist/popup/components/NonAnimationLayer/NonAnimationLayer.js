import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { isBackgroundLayer, isGradientLayer } from '../../helpers/layer';
import { GradientLayer } from './components/GradientLayer/GradientLayer';
import { BackgroundLayer } from './components/BackgroundLayer/BackgroundLayer';
export const NonAnimationLayer = ({ layer, parentState, popUpLayerStyle, popUpLayerStyleData, }) => {
    const isGradient = isGradientLayer(layer);
    const isBackground = isBackgroundLayer(layer);
    const [isShow, setIsShow] = useState(!parentState);
    useEffect(() => {
        /**
         * parentState - стейт слоя анимации, к которой привязан наш NonAnimationLayer.
         * У нас градиент привязан к слою основной анимации, когда
         * основная анимация заканчивает играть, мы должны убирать привязанный к ней градиент с экрана.
         * Если parentState нет, то данный слой уничтожается, когда проиграются все доступные анимации(код в PopUpPortal).
         */
        if (!parentState) {
            return;
        }
        const handlePlayBackAreaFinished = () => {
            setIsShow(false);
        };
        const handlePlayBackAreaStarted = () => {
            setIsShow(true);
        };
        parentState.listenable.once('onPlaying', handlePlayBackAreaStarted);
        parentState.listenable.once('onFinished', handlePlayBackAreaFinished);
        return () => {
            parentState.listenable.off('onPlaying', handlePlayBackAreaStarted);
            parentState.listenable.off('onFinished', handlePlayBackAreaFinished);
        };
    }, []);
    if (!isShow) {
        return null;
    }
    return (_jsxs(_Fragment, { children: [isGradient && (_jsx(GradientLayer, { popUpLayerStyle: popUpLayerStyle, popUpLayerStyleData: popUpLayerStyleData })), isBackground && _jsx(BackgroundLayer, { popUpLayerStyle: popUpLayerStyle })] }));
};
//# sourceMappingURL=NonAnimationLayer.js.map