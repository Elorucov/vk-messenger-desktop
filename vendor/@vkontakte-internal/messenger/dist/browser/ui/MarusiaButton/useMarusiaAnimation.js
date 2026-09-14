import { useBrowserEnv } from '../../hooks/misc';
import { useCallback, useEffect, useRef, } from 'react';
import { LottieManager } from '@vkontakte-internal/rlottie';
import { sleep } from '../../../core/utils/misc';
import { useApiFetch } from '../../hooks/useApiFetch';
const MARUSIA_ANIMATION_GROUP = 'marusia';
export const loadAnimations = async (apiFetch) => {
    const resp = await apiFetch('marusia.getWebStatic', {});
    const animations = [...Object.entries(resp.animations)];
    const animationData = await Promise.all(animations.map((a) => fetch(a[1]).then((r) => r.json())));
    const loadedAnimations = {
        intro: '',
        load_loop: '',
        load_to_mic: '',
        load_to_stop: '',
        mic_to_error: '',
        mic_to_wave: '',
        stop_to_mic: '',
        stop_to_wave: '',
        wave_to_load: '',
        wave_to_stop: '',
        mic_to_loader: '',
        stop_to_loader: '',
    };
    animations.forEach((a, i) => {
        const name = a[0];
        const animData = animationData[i];
        loadedAnimations[name] = animData;
    });
    return {
        ...resp,
        animations: loadedAnimations,
    };
};
export class LottieAnimation {
    _id = 0;
    currentId = null;
    currentAnimation = null;
    animations;
    targetEl;
    constructor(targetEl, animationsData) {
        this.targetEl = targetEl;
        this.animations = Object.entries(animationsData).reduce((acc, [name, animationData]) => ({
            ...acc,
            [name]: (params) => {
                const container = document.createElement('div');
                container.className = 'MarusiaButton__lottie';
                container.dataset.animName = name;
                this.targetEl.appendChild(container);
                const defaultParams = {
                    containers: [container],
                    animationData,
                    name,
                    autoplay: false,
                    loop: false,
                    width: 24,
                    height: 45,
                    speed: 0.7,
                    group: MARUSIA_ANIMATION_GROUP,
                };
                return (async () => {
                    const player = await LottieManager.loadAnimation({
                        ...defaultParams,
                        ...params,
                    });
                    return {
                        player,
                        container,
                    };
                })();
            },
        }), {});
    }
    play(name, params) {
        return new Promise((resolve) => {
            const id = `${name}-${this._id++}`;
            this.currentId = id;
            if (this.currentAnimation) {
                cleanup(this.currentAnimation.player, this.currentAnimation.container);
                this.currentAnimation.resolve();
                this.currentAnimation = null;
            }
            ;
            (async () => {
                // тротлим 100мс, чтобы лишний раз не спавнить rlottie воркера
                await sleep(100);
                if (id !== this.currentId) {
                    return resolve();
                }
                const newAnimation = await this.animations?.[name]?.(params);
                if (!newAnimation) {
                    return resolve();
                }
                const { container: newContainer, player: newPlayer } = newAnimation;
                // пока грузилась анимация пришел запрос на новую, прерываем текущую
                if (id !== this.currentId) {
                    cleanup(newPlayer, newContainer);
                    return resolve();
                }
                this.currentAnimation = {
                    player: newPlayer,
                    container: newContainer,
                    resolve: resolve,
                };
                newPlayer.addEventListener('loopComplete', () => {
                    resolve();
                });
                newPlayer.play();
            })();
        });
    }
}
const cleanup = (player, container) => {
    player.destroy();
    container.remove();
};
export const useMarusiaAnimation = (onLoad) => {
    const { storage } = useBrowserEnv();
    const apiFetch = useApiFetch();
    const animationRef = useRef();
    const containerRef = useRef(null);
    const initLottie = useCallback(({ animations, images }) => {
        if (containerRef.current) {
            animationRef.current = new LottieAnimation(containerRef.current, animations);
            onLoad(images.marusia_bg);
        }
    }, [onLoad]);
    useEffect(() => {
        const animations = storage.get('marusia-web-static');
        if (!animations) {
            void loadAnimations(apiFetch).then((r) => {
                storage.set('marusia-web-static', r);
                initLottie(r);
            });
        }
        else {
            initLottie(animations);
        }
    }, [apiFetch, storage, initLottie]);
    return {
        animationRef,
        containerRef,
    };
};
//# sourceMappingURL=useMarusiaAnimation.js.map