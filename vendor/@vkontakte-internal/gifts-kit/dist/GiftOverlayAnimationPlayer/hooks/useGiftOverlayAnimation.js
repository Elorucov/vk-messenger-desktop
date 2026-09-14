import { useLayoutEffect, useRef } from 'react';
import { GiftOverlayAnimationPlayersManager } from '../core/GiftOverlayAnimationPlayersManager';
export function useGiftOverlayAnimation(config, { disabled } = { disabled: false }) {
    const rendererRef = useRef(undefined);
    const containerRef = useRef(null);
    const destroyPlayer = () => {
        if (rendererRef.current) {
            GiftOverlayAnimationPlayersManager.destroyPlayer(rendererRef.current.id);
            rendererRef.current = undefined;
        }
    };
    useLayoutEffect(() => {
        if (!containerRef.current) {
            return;
        }
        if (disabled) {
            if (rendererRef.current) {
                destroyPlayer();
            }
            return;
        }
        rendererRef.current = GiftOverlayAnimationPlayersManager.initPlayer({
            container: containerRef.current,
            particleImage: config.particleImage,
            particleImagePath: config.particleImagePath,
            width: config.width,
            height: config.height,
            targetFps: config.targetFps,
        });
        return () => {
            destroyPlayer();
        };
    }, [JSON.stringify(config), disabled]);
    return {
        containerRef,
        rendererRef,
    };
}
//# sourceMappingURL=useGiftOverlayAnimation.js.map