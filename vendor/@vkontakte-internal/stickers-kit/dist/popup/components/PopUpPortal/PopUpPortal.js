import { jsx as _jsx } from "react/jsx-runtime";
import { toJS } from 'mobx';
import { createPortal } from 'react-dom';
import { useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { PlayBackArea } from '../PlayBackArea/PlayBackArea';
import { usePopupStickerWithError } from '../PopupProvider/usePopupSticker';
import { isAnimationLayer } from '../../helpers/layer';
import { DESTROY_ANIMATION_DURATION } from '../../constants';
export const PopUpPortal = observer(({ portalElement = document.body }) => {
    const playBackAreasFinished = useRef(0);
    const playBackAreasLoaded = useRef(0);
    const { popupStore } = usePopupStickerWithError();
    const animationPlayBackAreasCount = popupStore.playBackAreasProps.filter(({ layer }) => isAnimationLayer(layer)).length;
    const handleFinish = () => {
        playBackAreasFinished.current = 0;
        playBackAreasLoaded.current = 0;
        popupStore.onEndPlay?.();
    };
    const handleAnimationPlayBackAreaFinished = () => {
        playBackAreasFinished.current++;
        if (playBackAreasFinished.current === animationPlayBackAreasCount) {
            handleFinish();
        }
    };
    const handleAllAnimationsLoaded = () => {
        popupStore.startPlay();
    };
    const handleAnimationPlayBackAreaLoaded = () => {
        playBackAreasLoaded.current++;
        if (playBackAreasLoaded.current === animationPlayBackAreasCount) {
            handleAllAnimationsLoaded();
        }
    };
    if (!popupStore.playBackAreasProps.length) {
        return null;
    }
    const portalChildren = toJS(popupStore.playBackAreasProps).map(({ style, popUpLayerStyle, ...props }, index) => (_jsx(PlayBackArea, { onAnimationPlayBackAreaLoaded: handleAnimationPlayBackAreaLoaded, onAnimationPlayBackAreaFinished: handleAnimationPlayBackAreaFinished, popUpLayerStyle: toJS(popUpLayerStyle), style: toJS({
            ...style,
            transition: popupStore.isFinishing
                ? `opacity ${DESTROY_ANIMATION_DURATION}ms`
                : style?.transition ?? '',
            opacity: popupStore.isFinishing ? '0' : style?.opacity ?? '',
        }), ...props }, index)));
    return createPortal(portalChildren, portalElement || document.body);
});
//# sourceMappingURL=PopUpPortal.js.map