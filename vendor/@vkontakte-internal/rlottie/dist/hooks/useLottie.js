import { useIsMounted } from '@vkontakte-internal/react-utils';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { LottieManager } from '../manager';
export function useLottie(options, { play, show } = {}) {
    const { animationUrl, animationData } = options;
    const loadingRef = useRef(false);
    const containerRef = useRef(null);
    const playerRef = useRef(null);
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [rendered, setRendered] = useState(false);
    const isMounted = useIsMounted();
    const loadAnimation = async () => {
        const oldPlayer = playerRef.current;
        if (oldPlayer) {
            loadingRef.current = false;
        }
        else {
            setLoading(true);
            setRendered(false);
        }
        const container = containerRef.current;
        if ((!animationUrl && !animationData) || !container || loadingRef.current) {
            return;
        }
        loadingRef.current = true;
        setError(false);
        setErrorMessage(null);
        try {
            const player = await LottieManager.loadAnimation({
                containers: [container],
                ...options,
            });
            player.addEventListener('enterFrame', () => {
                requestAnimationFrame(() => {
                    setRendered(true);
                });
            }, {
                once: true,
            });
            player.addEventListener('destroy', () => {
                setRendered(false);
            }, {
                once: true,
            });
            setLoading(false);
            playerRef.current = player;
        }
        catch (error) {
            setError(true);
            setErrorMessage(error);
        }
        if (isMounted()) {
            oldPlayer?.destroy();
        }
    };
    useEffect(() => {
        const player = playerRef.current;
        if (!player || loading) {
            return;
        }
        if (play !== undefined) {
            if (play) {
                player.play();
            }
            else {
                player.pause();
            }
        }
        if (show !== undefined) {
            if (show) {
                player.show();
            }
            else {
                player.hide();
            }
        }
    }, [loading, play, show]);
    useLayoutEffect(() => {
        loadAnimation();
        return () => {
            playerRef.current?.destroy();
        };
    }, [animationUrl, animationData]);
    const loaded = !loading && !error;
    return {
        lottieError: error,
        lottieLoading: loading,
        lottieLoaded: loaded,
        lottieRendered: rendered,
        lottiePlayerRef: playerRef,
        lottieContainerRef: containerRef,
        lottieErrorMessage: errorMessage,
    };
}
//# sourceMappingURL=useLottie.js.map