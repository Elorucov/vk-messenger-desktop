import '../../ui/MarusiaButton/MarusiaButton.css';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import { useBrowserEnv } from '../../hooks/misc';
import { Icon28SendMarusiaForeground } from '@vkontakte-internal/icons-private';
import { Icon12Spinner } from '@vkontakte/icons';
import { useMarusiaWave } from './useMarusiaWave';
import { useMarusiaAnimation, } from './useMarusiaAnimation';
export const MarusiaButton = ({ sendMessage, typing, instanceId, }) => {
    const [marusiaState, setMarusiaState] = useState('ready');
    const { marusia } = useBrowserEnv();
    const [backgroundIconUrl, setBackgroundIconUrl] = useState(undefined);
    const onLoad = useCallback((url) => setBackgroundIconUrl(url), []);
    const { animationRef, containerRef: $animation } = useMarusiaAnimation(onLoad);
    const { waveRef, containerRef: $wave, isDense } = useMarusiaWave();
    const [waveVisible, setWaveVisible] = useState(false);
    const [sessionLoaded, setSessionLoaded] = useState(false);
    const readyShownFirstTime = useRef(false);
    const prevStateRef = useRef();
    const [animationPlaying, setAnimationPlaying] = useState(false);
    const handleStateChange = useCallback((newState) => {
        if (!backgroundIconUrl) {
            return;
        }
        if (!sessionLoaded) {
            return;
        }
        const prevState = prevStateRef.current;
        if (prevState === newState) {
            return;
        }
        prevStateRef.current = newState;
        const animation = animationRef.current;
        const wave = waveRef.current;
        if (!animation || !wave) {
            return;
        }
        if (newState === 'listen') {
            wave.start();
        }
        else {
            wave.stop();
        }
        setWaveVisible(false);
        const maybeShowWave = () => {
            if (prevStateRef.current === 'listen') {
                setWaveVisible(true);
            }
        };
        const maybePlayLoadLoop = () => {
            if (prevStateRef.current === 'loading') {
                void animation.play('load_loop', { loop: true });
            }
        };
        switch (newState) {
            case 'ready':
                if (prevState === 'loading') {
                    setAnimationPlaying(true);
                    void animation.play('load_to_mic').then(() => {
                        setAnimationPlaying(false);
                    });
                }
                else if (prevState === 'answering') {
                    void animation.play('stop_to_mic');
                }
                else if (prevState === 'listen') {
                    void animation.play('load_to_mic');
                }
                else if (prevState === 'typing') {
                    if (!readyShownFirstTime.current) {
                        readyShownFirstTime.current = true;
                        void animation.play('intro');
                    }
                }
                else {
                    void animation.play('intro');
                }
                break;
            case 'loading':
                if (prevState === 'listen') {
                    setAnimationPlaying(true);
                    void animation.play('wave_to_load')?.then(() => {
                        setAnimationPlaying(false);
                        // TODO check if media command is playing sound
                        // if (playerStore.get().isPlaying) {
                        //   return;
                        // }
                        maybePlayLoadLoop();
                    });
                }
                else if (prevState === 'ready') {
                    setAnimationPlaying(true);
                    void animation.play('mic_to_loader')?.then(() => {
                        setAnimationPlaying(false);
                        maybePlayLoadLoop();
                    });
                }
                else if (prevState === 'answering') {
                    void animation.play('stop_to_loader')?.then(maybePlayLoadLoop);
                }
                break;
            case 'listen':
                if (prevState === 'ready') {
                    void animation.play('mic_to_wave')?.then(maybeShowWave);
                }
                else if (prevState === 'answering') {
                    void animation.play('stop_to_wave')?.then(maybeShowWave);
                }
                else if (prevState === 'loading') {
                    void animation.play('mic_to_wave')?.then(maybeShowWave);
                }
                break;
            case 'answering':
                if (prevState === 'loading') {
                    void animation.play('load_to_stop');
                }
                else if (prevState === 'listen') {
                    void animation.play('wave_to_stop');
                }
                else if (prevState === 'ready') {
                    void animation.play('load_to_stop');
                }
                break;
            case 'error':
                if (prevState === 'ready') {
                    void animation.play('mic_to_error');
                }
                break;
            default:
                break;
        }
    }, [
        animationRef,
        waveRef,
        backgroundIconUrl,
        sessionLoaded,
        setAnimationPlaying,
    ]);
    const handleClick = useCallback(() => {
        if ((marusiaState === 'ready' && !typing) ||
            marusiaState === 'loading' ||
            marusiaState === 'listen' ||
            marusiaState === 'answering') {
            marusia?.handleAction({
                type: 'start_recording',
                payload: { instanceId },
            });
            return;
        }
        sendMessage();
    }, [marusiaState, sendMessage, marusia, typing, instanceId]);
    useEffect(() => {
        const unsubscribe = marusia?.subscribe((event) => {
            switch (event.type) {
                case 'state_update':
                    setMarusiaState(event.payload.state);
                    break;
                case 'wave_update':
                    waveRef.current?.update(event.payload.node);
                    break;
                case 'session_create':
                    setSessionLoaded(true);
                    break;
                default:
                    break;
            }
        });
        return unsubscribe;
    }, [marusia, setSessionLoaded, waveRef]);
    useEffect(() => {
        handleStateChange(marusiaState);
    }, [
        marusiaState,
        animationRef,
        waveRef,
        backgroundIconUrl,
        handleStateChange,
        sessionLoaded,
    ]);
    const isLoading = !backgroundIconUrl || !sessionLoaded;
    const canShowTyping = typing &&
        marusiaState !== 'listen' &&
        marusiaState !== 'loading' &&
        !animationPlaying;
    return (React.createElement("button", { disabled: isLoading, className: cx('MarusiaButton', {
            'MarusiaButton--loading': isLoading,
            'MarusiaButton--typing': canShowTyping,
            'MarusiaButton--wave': marusiaState === 'listen' && waveVisible,
        }), style: { backgroundImage: `url('${backgroundIconUrl}')` }, onClick: handleClick },
        React.createElement("span", { className: "MarusiaButton__wrapper" },
            React.createElement("div", { className: "MarusiaButton__animation", ref: $animation }),
            React.createElement("span", { className: "MarusiaButton__typing" },
                React.createElement(Icon28SendMarusiaForeground, null)),
            React.createElement("span", { className: cx('MarusiaButton__wave', {
                    'MarusiaButton__wave--dense': isDense,
                }), ref: $wave })),
        React.createElement("span", { className: "MarusiaButton__spin" },
            React.createElement(Icon12Spinner, null))));
};
//# sourceMappingURL=MarusiaButton.js.map