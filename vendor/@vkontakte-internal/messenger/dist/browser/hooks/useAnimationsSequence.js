import { LottieManager, } from '@vkontakte-internal/rlottie';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
function hideNode(node) {
    node.style.visibility = 'hidden';
}
function showNode(node) {
    node.style.visibility = 'visible';
}
export function useAnimationsSequence({ animations, sizes, group, loop = false, onStart, onStop, }) {
    const $refs = useRef([]);
    const $players = useRef([]);
    const $isReady = useRef(false);
    const $currentAnimationIndex = useRef(-1);
    const $isPlaying = useRef(false);
    const $onStart = useRef(onStart);
    $onStart.current = onStart;
    const $onStop = useRef(onStop);
    $onStop.current = onStop;
    const [isReady, setReady] = useState(false);
    const [isPlaying, setPlaying] = useState(false);
    const $loop = useRef(loop);
    $loop.current = loop;
    const onAnimationStart = useCallback(() => {
        $isPlaying.current = true;
        setPlaying(true);
        $onStart.current?.();
    }, []);
    const onAnimationStop = useCallback(() => {
        $isPlaying.current = false;
        $currentAnimationIndex.current = -1;
        setPlaying(false);
        $onStop.current?.();
        $players.current.forEach((player) => player.destroy());
    }, []);
    const loadAnimation = useCallback(async (url, container, size) => {
        const player = await LottieManager.loadAnimation({
            containers: [container],
            animationUrl: url,
            autoplay: false,
            loop: false,
            lazyLoading: false,
            width: size?.width,
            height: size?.height,
            group,
        });
        return player;
    }, [group]);
    const getPlayers = useCallback(async () => {
        try {
            return await Promise.all(animations.map((animation, index) => {
                const node = $refs.current[index];
                const size = sizes?.[index];
                if (!animation || !node) {
                    throw new Error();
                }
                return loadAnimation(animation, node, size);
            }));
        }
        catch {
            return null;
        }
    }, [animations, loadAnimation, sizes]);
    const play = useCallback(async () => {
        if (!$isReady.current || $isPlaying.current || $refs.current.length === 0) {
            return;
        }
        const players = await getPlayers();
        if (players === null) {
            return;
        }
        $players.current = players;
        onAnimationStart?.();
        function playNext() {
            const currentNode = $refs.current[$currentAnimationIndex.current];
            const currentPlayer = $players.current[$currentAnimationIndex.current];
            if (currentPlayer) {
                //loop для одной анимации приходится обрабатывать отдельно
                //тк иначе уходит в вечный цикл
                if ($loop.current &&
                    $players.current.length === 1 &&
                    $isPlaying.current) {
                    return;
                }
                currentNode && hideNode(currentNode);
                currentPlayer.removeEventListener('loopComplete', playNext);
                currentPlayer.stop();
            }
            if (!$isPlaying.current ||
                $currentAnimationIndex.current === $players.current.length - 1) {
                onAnimationStop();
                return;
            }
            let nextIndex = $currentAnimationIndex.current + 1;
            if ($currentAnimationIndex.current === $players.current.length - 1 &&
                $loop.current) {
                nextIndex = 0;
            }
            const player = $players.current[nextIndex];
            if (!player) {
                onAnimationStop();
                return;
            }
            const node = $refs.current[nextIndex];
            node && showNode(node);
            $currentAnimationIndex.current = nextIndex;
            player.addEventListener('loopComplete', playNext);
            if ($players.current.length === 1) {
                player.setLoop($loop.current);
            }
            player.play();
        }
        playNext();
    }, [getPlayers, onAnimationStart, onAnimationStop]);
    const stop = useCallback((immediate = false) => {
        if (!$isPlaying.current) {
            return;
        }
        if (immediate) {
            $players.current[$currentAnimationIndex.current]?.stop();
            const currentNode = $refs.current[$currentAnimationIndex.current];
            currentNode && hideNode(currentNode);
            $currentAnimationIndex.current = -1;
            onAnimationStop();
            return;
        }
        $isPlaying.current = false;
    }, [onAnimationStop]);
    useEffect(() => {
        if ($isPlaying.current) {
            stop(true);
        }
        $isReady.current = false;
        setReady(false);
        $players.current.forEach((player) => {
            player.destroy();
        });
        getPlayers().then((players) => {
            if (players === null) {
                return;
            }
            players.forEach((player) => {
                player.destroy();
            });
            $isReady.current = true;
            setReady(true);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [animations]);
    const setRefs = useMemo(() => Array.from({ length: animations.length }, (_, i) => (node) => {
        $refs.current[i] = node;
        node && hideNode(node);
    }), [animations]);
    useEffect(() => {
        return () => {
            $players.current.forEach((player) => {
                player.destroy();
            });
            $players.current = [];
        };
    }, []);
    return {
        setRefs,
        play,
        stop,
        isPlaying,
        isReady,
    };
}
//# sourceMappingURL=useAnimationsSequence.js.map