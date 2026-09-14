import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"Avatar":["Adopted",{"className":1}]} */
import { classNames } from '@vkontakte/vkjs';
// eslint-disable-next-line no-restricted-imports
import { isValidElement, useLayoutEffect } from 'react';
import { Avatar } from '../Adopted';
import { RichAvatarBadge } from './Badge/Badge';
import { RichAvatarBadgeWithPreset } from './Badge/BadgeWithPreset';
import { NFTHeptagon } from './NFTHeptagon/NFTHeptagon';
import { RichAvatarOutline } from './Outline/Outline';
import { RichAvatarNFTContextProvider } from './RichAvatarNFTContext';
import { appendNFTSVGSprite } from './utils/appendNFTSVGSprite';
import styles from './RichAvatar.module.css';
const RichAvatarComponent = ({ nft, noBorder, withTransparentBackground, className, children, ...restProps }) => {
    const { src, size } = restProps;
    if (size && size < 28) {
        nft = false;
    }
    useLayoutEffect(() => {
        appendNFTSVGSprite();
    }, []);
    const hasOutline = (!Array.isArray(children) ? [children] : children).some((child) => isValidElement(child) && child.type === RichAvatarOutline);
    return (_jsx(RichAvatarNFTContextProvider, { value: Boolean(nft), children: _jsxs(Avatar, { ...restProps, className: classNames(nft && styles.rootNft, 'vkuiInternalRichAvatar', className), noBorder: nft ? true : noBorder, role: src === undefined ? 'presentation' : restProps.role, withTransparentBackground: Boolean(nft) || withTransparentBackground, children: [children, nft && !hasOutline && _jsx(NFTHeptagon, {})] }) }));
};
export const RichAvatar = Object.assign(RichAvatarComponent, Avatar, {
    Badge: RichAvatarBadge,
    Outline: RichAvatarOutline,
    BadgeWithPreset: RichAvatarBadgeWithPreset,
});
//# sourceMappingURL=RichAvatar.js.map