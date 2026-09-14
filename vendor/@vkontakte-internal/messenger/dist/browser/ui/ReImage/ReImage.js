import '../../ui/ReImage/ReImage.css';
import React, { useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import { isImageLoaded } from '../../utils/files';
import { useUrlFromBaseUrl } from '../../hooks/misc';
import { usePerformanceSettings } from '../../hooks/usePerformanceSettings';
const MIN_RETRY_TIMEOUT = 1000;
const MAX_RETRY_TIMEOUT = 10 * 1000;
const DEFAULT_RETRIES_COUNT = 5;
export const ReImage = ({ image, alt, width, height, className, style, retries = DEFAULT_RETRIES_COUNT, onLoad, }) => {
    const { enableAnimations } = usePerformanceSettings();
    const url = useUrlFromBaseUrl(image, height, width);
    const [isLoaded, setLoaded] = useState(() => url ? isImageLoaded(url) : false);
    const [retryAttempts, setRetryAttempts] = useState(0);
    const retryTimeoutId = useRef();
    useEffect(() => {
        return () => {
            if (retryTimeoutId.current) {
                clearTimeout(retryTimeoutId.current);
            }
        };
    }, []);
    const handleOnError = () => {
        if (retryAttempts >= retries) {
            return;
        }
        const timeout = Math.min(MAX_RETRY_TIMEOUT, 2 ** retryAttempts * MIN_RETRY_TIMEOUT);
        retryTimeoutId.current = window.setTimeout(() => {
            retryTimeoutId.current = undefined;
            setRetryAttempts((prev) => prev + 1);
        }, timeout);
    };
    const handleLoad = () => {
        onLoad?.();
        setLoaded(true);
    };
    return (React.createElement("div", { className: cx('ReImage', className), style: {
            '--thumbhashUrl': image.thumbhashUrl && `url(${image.thumbhashUrl})`,
            height,
            width,
            ...style,
        } },
        React.createElement("div", { className: "ReImage__blur" }),
        React.createElement("img", { key: retryAttempts, className: cx('ReImage__img', {
                'ReImage__img--loaded': !enableAnimations || isLoaded,
            }), src: url, alt: alt, onLoad: handleLoad, onError: handleOnError })));
};
//# sourceMappingURL=ReImage.js.map