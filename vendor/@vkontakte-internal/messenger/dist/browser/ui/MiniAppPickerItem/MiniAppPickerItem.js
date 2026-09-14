import React from 'react';
import { useBrowserEnv, usePixelDensity } from '../../hooks/misc';
import { SimpleCell, Image, Button } from '@vkontakte/vkui';
import { Icon28ChevronRightCircleOutline, Icon28AddSquareOutline, } from '@vkontakte/icons';
export const MiniAppPickerItem = ({ id, action, title, type, smallIcon, bigIcon, onSendApp, isCompact }) => {
    const isDense = usePixelDensity();
    const { lang } = useBrowserEnv();
    const iconSrc = (isDense ? bigIcon : smallIcon) || smallIcon;
    const isApps = type === 'apps';
    return (React.createElement(SimpleCell, { before: React.createElement(Image, { size: 44, src: iconSrc, borderRadius: "m" }), subtitle: title, hasHover: isApps || isCompact, hasActive: isApps || isCompact, after: isApps ? React.createElement(Icon28ChevronRightCircleOutline, null) : null, indicator: !isApps &&
            (isCompact ? (React.createElement(Icon28AddSquareOutline, { onClick: () => onSendApp?.(id), fill: "var(--vkui--color_text_accent)" })) : (React.createElement(Button, { mode: "tertiary", appearance: "accent", size: "s", align: "center", onClick: () => onSendApp?.(id) }, lang.use('me_miniapps_picker_add_btn')))) }, action));
};
//# sourceMappingURL=MiniAppPickerItem.js.map