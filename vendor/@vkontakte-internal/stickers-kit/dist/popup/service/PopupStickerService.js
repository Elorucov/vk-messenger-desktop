import { makeAutoObservable } from 'mobx';
import { LottiePlayer } from './LottiePlayer/LottiePlayer';
import { PositionConflict } from './PositionConflict/PositionConflict';
import { setDestroyListeners, createDestroyListeners } from '../helpers/destroyListeners';
import { getBasePropsForPlaybackAreas } from '../helpers/getBaseProps';
import { findFixedElement, getPopupElementsFromFixedElement } from '../helpers/getDataAttrs';
import { CustomPopUpLayerTypes, SPEED_ON_DESTROY, DESTROY_ANIMATION_DURATION } from '../constants';
import { vkuiCssVars } from '@vkontakte-internal/vkcom-kit';
/**
 * Сервис отвечает за проигрывание попап анимации
 */
export class PopupStickerService {
    constructor() {
        this.isPlaying = false;
        this.isPreparing = false;
        this.isFinishing = false;
        this.playBackAreasProps = [];
        this.onAnimationClick = null;
        this.onEndPlay = null;
        this.onEndPrepare = null;
        this.errorHandlers = {};
        this.conflictBlocks = new PositionConflict();
        this.lottiePlayer = new LottiePlayer();
        this.setLottiePlayerOptions = (options) => {
            if (!this.isPlaying) {
                return;
            }
            this.lottiePlayer.setOptions(options);
        };
        this.setLottiePlayerOption = (option) => {
            if (!this.isPlaying) {
                return;
            }
            this.lottiePlayer.setOption(option);
        };
        this.preparePreview = (data) => {
            const layers = data.layers.slice();
            layers.unshift({
                type: CustomPopUpLayerTypes.Background,
                style: {
                    opacity: '0.9',
                    background: vkuiCssVars.colorBackgroundModal.normal.value,
                },
            });
            this.prepare({ ...data, layers });
        };
        this.prepareWithDestroyEvent = (data) => {
            const listeners = createDestroyListeners(this.destroyWithFadeOut.bind(this));
            this.prepare(setDestroyListeners(data, listeners));
        };
        this.prepare = ({ layers, stickerElement, onEndPrepare = null, onEndPlay = null, onAnimationClick = null, errorHandlers, mountNode, disableHardcodedZIndex, }) => {
            if (this.isPlaying || this.isPreparing) {
                onEndPrepare?.(false);
                throw new Error('Pop-up stickers are already playing');
            }
            this.isPreparing = true;
            const fixedElement = findFixedElement(stickerElement);
            const popUpElements = getPopupElementsFromFixedElement(fixedElement, stickerElement);
            const playBackAreasBaseProps = getBasePropsForPlaybackAreas({
                layers,
                popUpElements,
                conflictBlocks: this.conflictBlocks.blocks,
            }).map((prop) => ({
                ...prop,
                style: {
                    ...prop.style,
                    zIndex: disableHardcodedZIndex ? 'auto' : 1001,
                },
            }));
            const isConfigure = Boolean(playBackAreasBaseProps.length);
            const handleOnEndPlay = () => {
                this.reset();
                onEndPlay?.();
            };
            this.onEndPrepare = onEndPrepare;
            this.onEndPlay = handleOnEndPlay;
            this.onAnimationClick = onAnimationClick;
            if (isConfigure) {
                mountNode?.();
            }
            this.playBackAreasProps = playBackAreasBaseProps;
            if (errorHandlers) {
                this.errorHandlers = errorHandlers;
            }
            if (!isConfigure) {
                onEndPrepare?.(false);
                handleOnEndPlay();
            }
        };
        this.destroyBySpeedIncrement = () => {
            this.setLottiePlayerOption({ key: 'speed', value: SPEED_ON_DESTROY });
        };
        this.destroyByRemove = () => {
            if (this.onEndPlay) {
                this.onEndPlay();
                return;
            }
            this.reset();
        };
        this.destroyWithFadeOut = () => {
            this.isFinishing = true;
            setTimeout(() => {
                this.destroyByRemove();
            }, DESTROY_ANIMATION_DURATION);
        };
        this.startPlay = () => {
            this.isPlaying = true;
            this.isPreparing = false;
            this.onEndPrepare?.(true);
        };
        this.reset = () => {
            this.isPlaying = false;
            this.isPreparing = false;
            this.isFinishing = false;
            this.playBackAreasProps = [];
            this.onEndPlay = null;
            this.onAnimationClick = null;
            this.onEndPrepare = null;
            this.errorHandlers = {};
            this.lottiePlayer.reset();
        };
        makeAutoObservable(this);
    }
}
//# sourceMappingURL=PopupStickerService.js.map