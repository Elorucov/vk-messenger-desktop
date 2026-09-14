import * as React from 'react';
import { Image } from '../Image/Image';
// @elephizeTarget
export const Icon = ({ styles, payload, items, meta, widthPrior, heightPrior }) => {
    const mergedStyles = {
        image: Object.assign(Object.assign({}, styles.icon), payload && payload.style),
    };
    const itemsToUse = payload && payload.items
        ? payload.items
        : items;
    return (React.createElement(Image, { isIcon: true, styles: mergedStyles, items: itemsToUse, meta: meta, heightPrior: heightPrior, widthPrior: widthPrior }));
};
//# sourceMappingURL=Icon.js.map