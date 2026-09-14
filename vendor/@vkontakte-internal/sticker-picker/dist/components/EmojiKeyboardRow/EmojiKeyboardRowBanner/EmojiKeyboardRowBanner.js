import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":1}]} */
import { Banner } from '@vkontakte-internal/vkcom-kit';
import { classNames } from '@vkontakte/vkjs';
import { useStore } from 'effector-react';
import { $variant } from '../../../model/variant';
import { rowVariantModifier } from '../EmojiKeyboardRow';
export const EmojiKeyboardRowBanner = ({ className, ...props }) => {
    const variant = useStore($variant);
    return (_jsx("div", { className: classNames(className, rowVariantModifier[variant]), children: _jsx(Banner, { noPadding: true, ...props }) }));
};
//# sourceMappingURL=EmojiKeyboardRowBanner.js.map