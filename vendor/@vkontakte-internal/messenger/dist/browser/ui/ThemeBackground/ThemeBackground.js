import React, { memo, useLayoutEffect, useRef, useState } from 'react';
import './ThemeBackground.css';
import cx from 'classnames';
import { useResizeObserver } from '../../hooks/useResizeObserver';
import { exhaustivenessCheck } from '../../../core/utils/misc';
import { blurImage } from '../../../core/utils/blur';
import { useColorScheme } from '@vkontakte/vkui';
const THROTTLE_INTERVAL = 32;
export const ThemeBackgroundResizeable = memo(({ themeBackground }) => {
    const $container = useRef(null);
    const [containerSize, setContainerSize] = useState({
        width: 0,
        height: 0,
    });
    const { observe } = useResizeObserver({
        throttleInterval: THROTTLE_INTERVAL,
    });
    useLayoutEffect(() => {
        const container = $container.current;
        if (!container) {
            return;
        }
        const { width, height } = container.getBoundingClientRect();
        setContainerSize({
            width,
            height,
        });
        return observe(container, (entry) => {
            if (!entry.borderBoxSize[0]) {
                return;
            }
            const { inlineSize: width, blockSize: height } = entry.borderBoxSize[0];
            setContainerSize({
                width: width,
                height: height,
            });
        });
    }, [observe]);
    return (React.createElement(ThemeBackground, { ref: $container, themeBackground: themeBackground, containerSize: containerSize }));
});
export const ThemeBackground = memo(React.forwardRef(({ themeBackground, containerSize }, ref) => {
    const theme = useColorScheme();
    const background = themeBackground[theme];
    const renderContent = () => {
        switch (background.kind) {
            case 'raster': {
                return React.createElement(ThemeBackgroundRaster, { background: background });
            }
            case 'vector': {
                return (React.createElement(ThemeBackgroundVector, { containerSize: containerSize, background: background, theme: theme }));
            }
            default:
                exhaustivenessCheck(background);
        }
    };
    return (React.createElement("div", { ref: ref, className: "ThemeBackground" }, renderContent()));
}));
const ThemeBackgroundRaster = ({ background, }) => {
    return (React.createElement("div", { className: "ThemeBackgroundRaster", style: {
            '--themeBackgroundRasterImage': `url(${background.url})`,
        } }));
};
const CANVAS_RENDER_SIZE = 50;
const MAX_BLUR_PART = 4;
const PATTERN_MIN_SIZE = 300;
const PATTERN_REPEAT_COUNT = 3;
const PATTERN_ACCENT_COLOR = { dark: '#FFFFFF', light: '#000000' };
const ThemeBackgroundVector = ({ background, containerSize, theme, }) => {
    const { blur, colorEllipses, gradient, svg } = background;
    const $canvas = useRef(null);
    useLayoutEffect(() => {
        const canvas = $canvas.current;
        if (!canvas) {
            return;
        }
        canvas.width = CANVAS_RENDER_SIZE;
        canvas.height = CANVAS_RENDER_SIZE;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            return;
        }
        ctx.clearRect(0, 0, CANVAS_RENDER_SIZE, CANVAS_RENDER_SIZE);
        if (gradient) {
            addGradientLayer(ctx, CANVAS_RENDER_SIZE, CANVAS_RENDER_SIZE, gradient);
        }
        if (colorEllipses) {
            addEllipsesLayer(ctx, CANVAS_RENDER_SIZE, CANVAS_RENDER_SIZE, colorEllipses);
        }
        if (blur) {
            addBlurLayer(ctx, CANVAS_RENDER_SIZE, CANVAS_RENDER_SIZE, blur);
        }
    }, [blur, colorEllipses, gradient]);
    const patternSize = svg &&
        (containerSize.width <= svg.width
            ? containerSize.width
            : Math.max(containerSize.width / PATTERN_REPEAT_COUNT, PATTERN_MIN_SIZE));
    return (React.createElement("div", { className: "ThemeBackgroundVector", style: {
            '--themeBackgroundVectorPatternUrl': svg?.url && `url(${svg.url})`,
            '--themeBackgroundVectorPatternOpacity': svg?.opacity,
            '--themeBackgroundVectorPatternColor': PATTERN_ACCENT_COLOR[theme],
            '--themeBackgroundVectorPatternSize': svg && `${patternSize}px`,
        } },
        React.createElement("canvas", { className: "ThemeBackgroundVector__canvas", ref: $canvas }),
        svg && (React.createElement("div", { className: cx('ThemeBackgroundVector__pattern', {
                'ThemeBackgroundVector__pattern--overlay': svg.isOverlay,
                'ThemeBackgroundVector__pattern--full': !svg.isOverlay,
            }) }))));
};
const addGradientLayer = (ctx, width, height, gradient) => {
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    const angleInRad = ((gradient.angle - 180) / 180) * Math.PI;
    const lineLength = Math.abs(width * Math.sin(angleInRad)) +
        Math.abs(height * Math.cos(angleInRad));
    const pointX = (Math.sin(angleInRad) * lineLength) / 2;
    const pointY = (Math.cos(angleInRad) * lineLength) / 2;
    const x1 = Math.round(halfWidth + pointX);
    const y1 = Math.round(halfHeight - pointY);
    const x2 = Math.round(halfWidth - pointX);
    const y2 = Math.round(halfHeight + pointY);
    const gradientFill = ctx.createLinearGradient(x1, y1, x2, y2);
    const step = 1 / Math.max(1, gradient.colors.length - 1);
    gradient.colors.forEach((color, index) => {
        gradientFill.addColorStop(Math.min(1, step * index), color);
    });
    ctx.fillStyle = gradientFill;
    ctx.fillRect(0, 0, width, height);
};
const addEllipsesLayer = (ctx, width, height, ellipses) => {
    ellipses.forEach((ellipse) => {
        ctx.beginPath();
        ctx.ellipse(ellipse.x * width, ellipse.y * height, ellipse.radiusX * width, ellipse.radiusY * height, 0, 0, 2 * Math.PI);
        ctx.fillStyle = ellipse.color;
        ctx.fill();
        ctx.closePath();
    });
};
const addBlurLayer = (ctx, width, height, blur) => {
    const hexOpacity = Math.floor(blur.opacity * 255).toString(16);
    ctx.fillStyle = `${blur.color}${hexOpacity}`;
    ctx.fillRect(0, 0, width, height);
    const radius = Math.min(Math.floor(Math.min(width, height) / MAX_BLUR_PART), blur.radius);
    const imageData = ctx.getImageData(0, 0, width, height);
    blurImage(imageData.data, width, height, radius);
    ctx.putImageData(imageData, 0, 0);
};
//# sourceMappingURL=ThemeBackground.js.map