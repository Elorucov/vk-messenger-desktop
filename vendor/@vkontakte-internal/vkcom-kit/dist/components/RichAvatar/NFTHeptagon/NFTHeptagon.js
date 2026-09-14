import { jsx as _jsx } from "react/jsx-runtime";
import { useContext } from 'react';
import { ImageBaseContext } from '../../Adopted';
import styles from './NFTHeptagon.module.css';
export const NFTHeptagon = () => {
    const { size } = useContext(ImageBaseContext);
    const style = {
        '--rich-avatar-nft-frame-width': `${getNFTFrameWidth(size)}px`,
    };
    return (_jsx("svg", { "data-testid": "richavatar-nft-heptagon", className: styles.nftHeptagon, style: style, xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 48 48", children: _jsx("path", { 
            // Определяется в appendNFTSVGSprite.ts
            fill: "url(#avatar_hept_underlay_fill)", d: "M 15.0864 1.656 A 5.6496 5.6496 90 0 1 20.544 0.192 l 18.3504 4.9152 a 5.6496 5.6496 90 0 1 3.9936 3.9936 l 4.9152 18.3504 a 5.6496 5.6496 90 0 1 -1.464 5.4576 L 32.9136 46.344 a 5.6496 5.6496 90 0 1 -5.4576 1.464 l -18.3504 -4.9152 a 5.6496 5.6496 90 0 1 -3.9936 -3.9936 L 0.192 20.544 a 5.6496 5.6496 90 0 1 1.464 -5.4576 L 15.0864 1.656 Z" }) }));
};
function getNFTFrameWidth(size) {
    if (size >= 80) {
        return 5;
    }
    if (size >= 48) {
        return 3;
    }
    return 2;
}
//# sourceMappingURL=NFTHeptagon.js.map