import * as React from 'react';
import { Image } from '../Image/Image';
import { ActionTappable } from '../Action/ActionTappable';
// @elephizeTarget
const FooterDivider = () => {
    return React.createElement("div", { className: "SAKWidget__footerDivider" });
};
// @elephizeTarget
const FooterContainer = ({ children }) => {
    return React.createElement("div", { className: "SAKWidget__footer" }, children);
};
// @elephizeTarget
const FooterAccentText = ({ children }) => {
    return React.createElement("div", { className: "SAKWidget__footerTextAccent" }, children);
};
// @elephizeTarget
const FooterContent = ({ children, action }) => {
    return React.createElement(ActionTappable, { action: action, className: "SAKWidget__footerTappable" },
        React.createElement("div", { className: "SAKWidget__footerContent" }, children));
};
// @elephizeTarget
const FooterText = ({ children }) => {
    return React.createElement("div", { className: "SAKWidget__footerText" }, children);
};
// @elephizeTarget
export const WidgetFooterAccentButton = ({ payload, showDivider, action }) => {
    return (React.createElement(FooterContainer, null,
        showDivider && React.createElement(FooterDivider, null),
        React.createElement(FooterContent, { action: payload.action || action },
            React.createElement(FooterAccentText, null, payload === null || payload === void 0 ? void 0 : payload.title.value))));
};
// @elephizeTarget
export const WidgetFooterUserStack = ({ styles, payload, meta, action, showDivider }) => {
    const itemsToCast = payload === null || payload === void 0 ? void 0 : payload.items;
    const items = /* @elephizeTypecast array */ itemsToCast || []; // This should be strict array type to work in kphp
    return (React.createElement(FooterContainer, null,
        showDivider && React.createElement(FooterDivider, null),
        React.createElement(FooterContent, { action: payload.action || action },
            React.createElement(FooterText, null, payload === null || payload === void 0 ? void 0 : payload.description),
            React.createElement("div", { className: "SAKWidget__footerUserstack" }, items.map((item, index) => {
                const stylesToUse = styles.hasOwnProperty('image')
                    // @ts-ignore
                    ? Object.assign({}, styles === null || styles === void 0 ? void 0 : styles.image) : {};
                return (React.createElement("div", { key: index, className: "SAKWidget__footerAvatars", style: {
                        zIndex: items.length - index,
                    } },
                    React.createElement(Image, { noContainer: true, styles: stylesToUse, items: item.items || [item], meta: meta, widthPrior: "24px", heightPrior: "24px", className: "SAKWidget__footerAvatar" })));
            })))));
};
// @elephizeTarget
export function WidgetFooterInner({ styles, footer, meta, action, showDivider }) {
    const { type, payload } = footer;
    const mergedStyles = Object.assign(Object.assign({}, styles), { image: {
            type: 'circle',
        } });
    if (!payload) {
        return null;
    }
    if (type === 'user_stack') {
        return React.createElement(WidgetFooterUserStack, { styles: mergedStyles, payload: payload, meta: meta, action: action, showDivider: showDivider });
    }
    if (type === 'accent_button') {
        return React.createElement(WidgetFooterAccentButton, { styles: mergedStyles, payload: payload, meta: meta, action: action, showDivider: showDivider });
    }
    return null;
}
// @elephizeTarget
export const WidgetFooter = ({ mini_apps, profiles, games, groups, item, showDivider }) => {
    const { footer, action, root_style } = item.payload;
    const meta = { mini_apps, profiles, games, groups };
    if (!footer) {
        return null;
    }
    return (React.createElement(WidgetFooterInner, { styles: root_style, showDivider: showDivider, footer: footer, action: action, meta: meta }));
};
//# sourceMappingURL=Footer.js.map