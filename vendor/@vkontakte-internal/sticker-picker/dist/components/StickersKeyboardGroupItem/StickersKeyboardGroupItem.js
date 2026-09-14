import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":2}],"img":["global",{"className":1}],"TextTooltip":["@vkontakte-internal/vkcom-kit",{"className":1}]} */
import { useStore } from 'effector-react';
import { classNames } from '@vkontakte/vkjs';
import { useLangPack } from '@vkontakte-internal/langs';
import { TextTooltip } from '@vkontakte-internal/vkcom-kit';
import { useEffect, useState } from 'react';
import { BaseUrlBuilder } from '@vkontakte-internal/sticker';
import { Icon24VmojiOutline } from '@vkontakte-internal/icons-private';
import { HelpHints, useHelpHint } from '@vkontakte-internal/help-hints';
import { Icon24FavoriteOutline, Icon24RecentOutline, Icon24UgcStickerOutline, Icon24StickerOutline, } from '@vkontakte/icons';
import { StickersKeyboardGroupItemIcon } from './Icon/Icon';
import { ServicePackKey } from '../../model/stickers/packs';
import { $tabbarActiveTabState } from '../../model/tabbarActiveTab';
import { $isTransitionActive } from '../View/model/transitionActive';
import { $vmojiPromotion } from '../../model/stickers/vmojiPromotion';
import styles from './StickersKeyboardGroupItem.module.css';
export const TAB_ICONS = new Map([
    [ServicePackKey.UGC, _jsx(Icon24UgcStickerOutline, {}, ServicePackKey.UGC)],
    [ServicePackKey.VMOJI, _jsx(Icon24VmojiOutline, {}, ServicePackKey.VMOJI)],
    [ServicePackKey.RECENT, _jsx(Icon24RecentOutline, {}, ServicePackKey.RECENT)],
    [ServicePackKey.FAVORITE, _jsx(Icon24FavoriteOutline, {}, ServicePackKey.FAVORITE)],
    [ServicePackKey.PHOTO_EDITOR, _jsx(Icon24StickerOutline, {}, ServicePackKey.PHOTO_EDITOR)],
]);
const dotColorModifier = {
    'blue': styles.inIndicator,
    'red': styles.inIndicatorRed,
    'gray': styles.inIndicatorGray,
    '': '',
};
export function StickersKeyboardGroupItem({ pack, active, children, indicator, ...props }) {
    const { translate } = useLangPack();
    const vmojiPromotion = useStore($vmojiPromotion);
    const isTransitionActive = useStore($isTransitionActive);
    const { isStickersActiveTab } = useStore($tabbarActiveTabState);
    const [isLoading, setIsLoading] = useState(true);
    const [isHintHidden, setIsHintHidden] = useState(false);
    const handleLoad = () => {
        setIsLoading(false);
    };
    const title = translate(pack?.title);
    const isNew = pack?.isNew;
    const isVmoji = pack?.isVmoji;
    const hintId = pack?.hintId;
    const hintWidth = pack?.hintWidth;
    const vmojiPromotionDotColor = vmojiPromotion?.dot_color || '';
    const tabIcon = TAB_ICONS.get(pack?.id) || children;
    const productIcon = new BaseUrlBuilder({
        size: 24,
        images: pack?.previews,
    }).build();
    const hint = useHelpHint(hintId);
    useEffect(() => {
        if (!tabIcon) {
            return;
        }
        setIsLoading(false);
    }, [tabIcon]);
    useEffect(() => {
        if (!hint || !active || isHintHidden) {
            return;
        }
        HelpHints.hide(hint);
        setIsHintHidden(true);
    }, [hint, active, isHintHidden]);
    let content = (_jsx("div", { ...props, children: _jsx("div", { className: classNames(styles.in, {
                [styles.inActive]: active,
                [styles.inHidden]: isLoading,
                [styles.inPlaceholder]: !productIcon && !tabIcon,
                [styles.inIndicator]: isNew || indicator,
                [dotColorModifier[vmojiPromotionDotColor]]: isVmoji,
            }), children: tabIcon ? (_jsx("div", { "aria-label": title, className: classNames(styles.icon, styles.iconService), children: tabIcon })) : (_jsxs(_Fragment, { children: [_jsx("img", { alt: title, className: styles.icon, src: productIcon, onLoad: handleLoad }), pack && _jsx(StickersKeyboardGroupItemIcon, { pack: pack })] })) }) }));
    if (hint) {
        const { title, description } = hint;
        content = (_jsx(TextTooltip, { className: styles.tooltip, maxWidth: hintWidth, placement: "top-start", appearance: "accent", header: title, text: description, offsetByMainAxis: -4, shown: !active && !isTransitionActive && !isHintHidden && isStickersActiveTab, children: content }));
    }
    return content;
}
//# sourceMappingURL=StickersKeyboardGroupItem.js.map