import '../../ui/LimitedGiftLayer/LimitedGiftLayer.css';
import { Flex } from '@vkontakte/vkui';
import React from 'react';
import { AttachGiftIcon } from '../../ui/AttachGiftIcon/AttachGiftIcon';
import { useGiftOverlayAnimation } from '@vkontakte-internal/gifts-kit';
export function LimitedGiftLayer({ gift, size, isReady, children, }) {
    const { containerRef } = useGiftOverlayAnimation({
        width: size,
        height: size,
    }, {
        disabled: !gift.rarity || !isReady,
    });
    if (!gift.rarity) {
        return null;
    }
    return (React.createElement("div", { className: "LimitedGiftLayer" },
        React.createElement(Flex, { className: "LimitedGiftLayer__animation", getRootRef: containerRef }),
        React.createElement(AttachGiftIcon, { rarityType: gift.rarity.type, className: "LimitedGiftLayer__rarityIcon" }),
        React.createElement(LimitedGiftGlass, { width: size, height: size, className: "LimitedGiftLayer__glass" }),
        children));
}
function LimitedGiftGlass({ width, height, className }) {
    return (React.createElement("svg", { width: width, height: height, viewBox: "0 0 524 524", fill: "none", xmlns: "http://www.w3.org/2000/svg", className: className },
        React.createElement("g", { filter: "url(#filter0_i_20230_54688)" },
            React.createElement("rect", { x: "6", y: "6", width: "512", height: "512", rx: "30.5591", fill: "white", "fill-opacity": "0.33" }),
            React.createElement("rect", { x: "3", y: "3", width: "518", height: "518", rx: "33.5591", stroke: "white", "stroke-opacity": "0.72", "stroke-width": "6" })),
        React.createElement("defs", null,
            React.createElement("filter", { id: "filter0_i_20230_54688", x: "0", y: "0", width: "524", height: "524", filterUnits: "userSpaceOnUse", "color-interpolation-filters": "sRGB" },
                React.createElement("feFlood", { "flood-opacity": "0", result: "BackgroundImageFix" }),
                React.createElement("feBlend", { mode: "normal", in: "SourceGraphic", in2: "BackgroundImageFix", result: "shape" }),
                React.createElement("feColorMatrix", { in: "SourceAlpha", type: "matrix", values: "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0", result: "hardAlpha" }),
                React.createElement("feOffset", null),
                React.createElement("feGaussianBlur", { stdDeviation: "35.7849" }),
                React.createElement("feComposite", { in2: "hardAlpha", operator: "arithmetic", k2: "-1", k3: "1" }),
                React.createElement("feColorMatrix", { type: "matrix", values: "0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.48 0" }),
                React.createElement("feBlend", { mode: "normal", in2: "shape", result: "effect1_innerShadow_20230_54688" })))));
}
//# sourceMappingURL=LimitedGiftLayer.js.map