import './MEAppLoader.css';
import React, { useEffect, useRef } from 'react';
import { getAnimation } from './LogoAnimation';
import { LottieManager } from '@vkontakte-internal/rlottie';
import { useColorScheme } from '@vkontakte/vkui';
const CYCLE_ANIMATION_FRAMES = {
    from: 31,
    to: 71,
};
const ANIMATION_SIZE = 350;
export const MEAppLoader = ({ onIntroFinish, }) => {
    const theme = useColorScheme();
    const $animationContainer = useRef(null);
    const $player = useRef(null);
    const $theme = useRef(theme);
    useEffect(() => {
        const animationContainer = $animationContainer.current;
        if (!animationContainer) {
            return;
        }
        $player.current?.destroy();
        let player;
        let introCallbackCalled = false;
        const onLoopComplete = () => {
            if (!player) {
                return;
            }
            if (!introCallbackCalled) {
                introCallbackCalled = true;
                onIntroFinish?.();
            }
            player.playPart(CYCLE_ANIMATION_FRAMES);
        };
        const initPlayer = async () => {
            $theme.current = theme;
            player = await LottieManager.loadAnimation({
                containers: [animationContainer],
                height: ANIMATION_SIZE,
                width: ANIMATION_SIZE,
                name: 'MEAppLoader',
                group: 'MEAppLoader',
                animationData: getAnimation(theme),
                autoplay: true,
                loop: false,
            });
            if ($theme.current !== theme) {
                return player.destroy();
            }
            $player.current = player;
            player.addEventListener('loopComplete', onLoopComplete);
        };
        initPlayer();
        return () => {
            if (player) {
                player.destroy();
            }
        };
    }, [onIntroFinish, theme]);
    useEffect(() => {
        return () => {
            $player.current?.destroy();
        };
    }, []);
    return React.createElement("div", { className: "MEAppLoader", ref: $animationContainer });
};
//# sourceMappingURL=MEAppLoader.js.map