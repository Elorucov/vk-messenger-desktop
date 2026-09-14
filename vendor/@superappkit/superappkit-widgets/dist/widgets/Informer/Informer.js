var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import * as React from 'react';
import { Image } from '../../common/Image/Image';
import { Button } from '../../common/Button/Button';
import { WidgetHeader } from '../../common/Header/Header';
import { WidgetFooter } from '../../common/Footer/Footer';
import { Text, TextContainer } from '../../common/Text/Text';
import { ActionTappable } from '../../common/Action/ActionTappable';
import { Icon } from '../../common/Icon/Icon';
import { WidgetContainer, WidgetContent, } from '../../common/containers/containers';
const CIRCLE_IMAGE_TYPE = 'circle';
// @elephizeTarget
const InformerRightCounter = ({ payload, styles }) => {
    return (React.createElement("div", { className: "SAKWidgetInformer__counter" },
        React.createElement(Text, { title: payload === null || payload === void 0 ? void 0 : payload.value, styles: styles, className: "SAKWidgetInformer__counterText", breakAll: true })));
};
// @elephizeTarget
export function InformerContentDisplay(_a) {
    var { name } = _a, /* @elephizeTypecast array */ props = __rest(_a, ["name"]);
    switch (name) {
        case 'text':
            return React.createElement(Text, Object.assign({}, props));
        case 'button':
            return React.createElement(Text, Object.assign({}, props));
        case 'image':
            return React.createElement(Image, Object.assign({}, props));
        case 'icon':
            return React.createElement(Icon, Object.assign({}, props, { widthPrior: "28px", heightPrior: "28px" }));
        case 'counter':
            return React.createElement(InformerRightCounter, Object.assign({}, props));
        default:
            return null;
    }
}
// @elephizeTarget
export const InformerUserstackContainer = ({ children }) => {
    return React.createElement("div", { className: "SAKWidgetInformer__userStack" }, children);
};
// @elephizeTarget
const InformerRowLeft = ({ mini_apps, profiles, games, groups, left, root_style }) => {
    return (React.createElement("div", { className: "SAKWidgetInformer__left" },
        React.createElement(InformerContentDisplay, { name: left.type, styles: root_style, items: [left.payload], payload: left.payload, meta: { mini_apps, profiles, games, groups } })));
};
function getTitleStyle(title, root_style) {
    let titleValue = null;
    let style = {};
    if (title) {
        titleValue = title.value;
        style = Object.assign({}, title.style);
    }
    if (root_style) {
        style = Object.assign(Object.assign({}, style), root_style);
    }
    return [titleValue, style];
}
// @elephizeTarget
const ImageMarginContainer = ({ children }) => {
    return React.createElement("div", { className: "SAKWidgetInformer__image" }, children);
};
// @elephizeTarget
const InformerRowMiddle = ({ middle, /* @elephizeTypecast array */ root_style, groups, profiles, mini_apps, games }) => {
    const { avatars } = middle;
    const meta = { groups, profiles, mini_apps, games };
    const [title, mergedTitleStyle,] = getTitleStyle(/* @elephizeTypecast array */ middle.title, /* @elephizeTypecast array */ root_style === null || root_style === void 0 ? void 0 : root_style.title);
    const [subTitle, mergedSubtitleStyle,] = getTitleStyle(/* @elephizeTypecast array */ middle.subtitle, /* @elephizeTypecast array */ root_style === null || root_style === void 0 ? void 0 : root_style.subtitle);
    const [secondSubtitle, mergedSecondSubtitleStyle,] = getTitleStyle(/* @elephizeTypecast array */ middle.second_subtitle, /* @elephizeTypecast array */ root_style === null || root_style === void 0 ? void 0 : root_style.second_subtitle);
    let buttons = /* @elephizeTypecast array */ middle.buttons || [];
    if (!buttons.length && middle.button) {
        buttons = [middle.button];
    }
    return (React.createElement(TextContainer, { className: "SAKWidgetInformer__middle" },
        title && React.createElement(Text, { title: title, styles: mergedTitleStyle }),
        subTitle && React.createElement(Text, { title: subTitle, styles: mergedSubtitleStyle, isSubtitle: true }),
        secondSubtitle && React.createElement(Text, { title: secondSubtitle, styles: mergedSecondSubtitleStyle, isSubtitle: true }),
        avatars && React.createElement(InformerUserstackContainer, null, avatars.map((avatar, index) => {
            const safeRootStyle = root_style || {};
            // @ts-ignore
            const imageRootStyles = safeRootStyle.image || {};
            const mergedImageStyles = {
                image: Object.assign(Object.assign({}, imageRootStyles), { type: avatar.style || CIRCLE_IMAGE_TYPE, 
                    // @ts-ignore
                    image_padding: root_style === null || root_style === void 0 ? void 0 : root_style.image_padding }),
            };
            return (React.createElement(ImageMarginContainer, { key: index },
                React.createElement(Image, { styles: mergedImageStyles, items: [avatar], meta: meta, widthPrior: "36px", heightPrior: "36px" })));
        })),
        buttons.length ? React.createElement("div", { className: "SAKWidgetInformer__buttons" }, buttons.map((button, index) => {
            var _a, _b;
            const buttonIcon = button && button.icon;
            const buttonTitle = button && ((_a = button.title) === null || _a === void 0 ? void 0 : _a.value);
            const buttonStyles = button && button.style;
            const rootButtonStyles = root_style ? root_style.button : {};
            const mergedButtonStyles = Object.assign(Object.assign({}, rootButtonStyles), buttonStyles);
            return React.createElement(Button, { key: `${(_b = button.title) === null || _b === void 0 ? void 0 : _b.value}${index}`, icon: buttonIcon, title: buttonTitle, styles: mergedButtonStyles, action: button.action, className: "SAKWidgetInformer__button" });
        })) : null));
};
// @elephizeTarget
const InformerContainerRight = ({ children }) => {
    return (React.createElement("div", { className: "SAKWidgetInformer__right" }, children));
};
// @elephizeTarget
const InformerRowRight = ({ right, root_style, mini_apps, profiles, games, groups }) => {
    const mergedRightStyles = Object.assign({}, root_style);
    return (React.createElement(InformerContainerRight, null,
        React.createElement(InformerContentDisplay, { name: right.type, styles: mergedRightStyles, payload: right.payload, meta: { mini_apps, groups, profiles, games } })));
};
// @elephizeTarget
const InformerRow = ({ mini_apps, games, profiles, groups, row, root_style }) => {
    const { /* @elephizeTypecast array */ left, /* @elephizeTypecast array */ middle, /* @elephizeTypecast array */ right } = row;
    return (React.createElement(ActionTappable, { action: row.action },
        React.createElement(WidgetContent, { className: "SAKWidgetInformer__content" },
            left && React.createElement(InformerRowLeft, { profiles: profiles, groups: groups, games: games, mini_apps: mini_apps, left: left, root_style: root_style.left }),
            middle && React.createElement(InformerRowMiddle, { profiles: profiles, groups: groups, games: games, mini_apps: mini_apps, middle: middle, root_style: root_style.middle }),
            right && React.createElement(InformerRowRight, { profiles: profiles, groups: groups, games: games, mini_apps: mini_apps, right: right, root_style: root_style.right }))));
};
// @elephizeTarget
export const Informer = ({ mini_apps, profiles, games, groups, item }) => {
    const { header_title: headerTitle, header_icon: headerIcons, rows, root_style, action } = item.payload;
    const headerIcon = headerIcons && headerIcons[headerIcons.length - 1];
    return (React.createElement(WidgetContainer, { action: action, meta: { mini_apps, games, profiles, groups } },
        headerTitle && React.createElement(WidgetHeader, { action: action, label: headerTitle, size: 24, icon: headerIcon === null || headerIcon === void 0 ? void 0 : headerIcon.url }),
        rows && rows.map((row, index) => {
            return (React.createElement(InformerRow, { key: index, mini_apps: mini_apps, profiles: profiles, groups: groups, games: games, row: row, root_style: root_style[0] }));
        }),
        React.createElement(WidgetFooter, { item: item, mini_apps: mini_apps, profiles: profiles, games: games, groups: groups, showDivider: true })));
};
//# sourceMappingURL=Informer.js.map