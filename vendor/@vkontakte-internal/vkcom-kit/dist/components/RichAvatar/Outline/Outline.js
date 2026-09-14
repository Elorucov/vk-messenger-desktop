import { jsx as _jsx } from "react/jsx-runtime";
import { classNames } from '@vkontakte/vkjs';
import { useContext } from 'react';
import { ImageBaseContext } from '../../Adopted';
import { useRichAvatarNFTContext } from '../RichAvatarNFTContext';
import styles from './Outline.module.css';
const sizeModifiersMap = {
    s: styles.rootSizeS,
    m: styles.rootSizeM,
    l: styles.rootSizeL,
};
const appearanceModifiersMap = {
    accent: styles.rootAccent,
    positive: styles.rootPositive,
    negative: styles.rootNegative,
    gray: styles.rootGray,
    orange: styles.rootOrange,
    purple: styles.rootPurple,
    contrast: styles.rootContrast,
};
export const RichAvatarOutline = ({ size, noPadding, gradient, appearance, ...restProps }) => {
    const { size: imageSize } = useContext(ImageBaseContext);
    const nft = useRichAvatarNFTContext();
    if (imageSize < 20) {
        return null;
    }
    size ??= getSize(imageSize);
    const className = classNames(styles.root, sizeModifiersMap[size], noPadding && styles.rootNoPadding, appearance && appearanceModifiersMap[appearance]);
    const style = {
        '--vkui_internal--rich_avatar_outline_width': imageSize < 28 ? '1px' : undefined,
    };
    if (nft) {
        return (_jsx("svg", { viewBox: "0 0 42 42", className: classNames(styles.rootNft, className), style: style, ...restProps, children: _jsx("foreignObject", { width: "100%", height: "100%", clipPath: "url(#AvatarDecorationNftClip)", mask: !noPadding ? 'url(#AvatarDecorationNftMask)' : undefined, children: _jsx("div", { className: styles.nftOutline, style: {
                        background: gradient,
                        ...style,
                    } }) }) }));
    }
    return (_jsx("div", { "data-testid": `richavatar-outline-${appearance}`, className: classNames(className, styles.rootRounded), style: {
            background: gradient,
            ...style,
        }, ...restProps }));
};
function getSize(imageSize) {
    if (imageSize >= 80) {
        return 'l';
    }
    if (imageSize >= 36) {
        return 'm';
    }
    return 's';
}
//# sourceMappingURL=Outline.js.map