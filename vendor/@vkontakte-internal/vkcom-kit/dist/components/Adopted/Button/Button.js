import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"VKUIButton":["@vkontakte/vkui",{"style":1,"className":1}]} */
import { classNames } from '@vkontakte/vkjs';
import { Button as VKUIButton } from '@vkontakte/vkui';
import styles from './Button.module.css';
const elevationModifiersMap = {
    1: styles.elevation1,
    2: styles.elevation2,
    3: styles.elevation3,
    4: styles.elevation4,
};
export const Button = ({ appearance, mode: modeProp, minWidth, elevation, className: classNameProp, style: styleProp, ...restProps }) => {
    const isTransparent = modeProp === 'secondary_transparent';
    /**
     * [VKCOMKIT-1559] определяем `mode` как `'secondary'` при `appearance === 'neutral'`
     *
     * Связано с https://github.com/VKCOM/VKUI/pull/7802
     */
    const mode = (modeProp === undefined && appearance === 'neutral') || isTransparent ? 'secondary' : modeProp;
    return (_jsx(VKUIButton, { ...restProps, style: {
            ...styleProp,
            ...(isTransparent
                ? {
                    // eslint-disable-next-line @vkontakte-internal/vkcom-plugins/no-vkui-tokens-in-string-usage
                    '--vkui--color_background_contrast_secondary_alpha': 'rgba(0, 0, 0, 0.36)',
                    // eslint-disable-next-line @vkontakte-internal/vkcom-plugins/no-vkui-tokens-in-string-usage
                    '--vkui--color_background_contrast_secondary_alpha--hover': 'rgba(0, 0, 0, 0.32)',
                    // eslint-disable-next-line @vkontakte-internal/vkcom-plugins/no-vkui-tokens-in-string-usage
                    '--vkui--color_background_contrast_secondary_alpha--active': 'rgba(0, 0, 0, 0.3)',
                }
                : undefined),
            ...(minWidth ? { minWidth } : undefined),
        }, mode: mode, appearance: isTransparent ? 'overlay' : appearance, className: classNames(styles.root, elevation && elevationModifiersMap[elevation], classNameProp) }));
};
//# sourceMappingURL=Button.js.map