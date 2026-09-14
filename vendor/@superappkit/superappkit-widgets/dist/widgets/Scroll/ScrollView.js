import * as React from 'react';
import { Text } from '../../common/Text/Text';
import { Image } from '../../common/Image/Image';
import { WidgetHeader } from '../../common/Header/Header';
import { ActionTappable } from '../../common/Action/ActionTappable';
import { ScrollBox, ScrollBoxInner } from '../../common/ScrollBox/ScrollBox';
import { WidgetFooter } from '../../common/Footer/Footer';
import { WidgetContainer } from '../../common/containers/containers';
// move to css
const aligns = {
    left: 'start',
    center: 'center',
    right: 'end',
    default: 'center',
};
// @elephizeTarget
const ScrollCardTextContainer = ({ children, align }) => {
    // TODO: wtf inline styles
    const textAlign = align ? aligns[align] : aligns.left;
    return (React.createElement("div", { style: { textAlign }, className: "SAKWidgetScroll__text" }, children));
};
// @elephizeTarget
const ScrollBadge = ({ badge, styles }) => {
    const textStyles = { color: 'white' };
    const classnames = ['SAKWidgetScroll__badge'];
    if (styles.align) {
        classnames.push(`SAKWidgetScroll__badge--align-${styles.align}`);
    }
    if (badge.type) {
        classnames.push(`SAKWidgetScroll__badge--type-${badge.type}`);
    }
    return (React.createElement("div", { className: classnames.join(' ') },
        React.createElement(Text, { title: badge.value, styles: textStyles })));
};
// @elephizeTarget
export const ScrollView = ({ mini_apps, profiles, games, groups, item, }) => {
    const meta = { mini_apps, games, profiles, groups };
    const { header_title: headerTitle, header_icon: headerIcons, root_style: rootStyle, items, action, } = item.payload;
    const headerIcon = headerIcons && headerIcons[headerIcons.length - 1];
    const headerIconUrl = headerIcon === null || headerIcon === void 0 ? void 0 : headerIcon.url;
    return (React.createElement(WidgetContainer, { action: action, meta: meta },
        headerTitle && React.createElement(WidgetHeader, { action: action, label: headerTitle, size: 24, icon: headerIconUrl }),
        React.createElement(ScrollBox, { className: "SAKWidgetScroll_box" },
            React.createElement(ScrollBoxInner, null, items && items.map((item, index) => {
                var _a, _b, _c, _d, _e;
                // TODO: temp ignored due to types
                // @ts-ignore
                const itemBadge = item.badge;
                const titleStyle = item.title && item.title.style;
                const mergedTitleStyle = Object.assign(Object.assign({}, rootStyle.title), titleStyle);
                const subTitleStyle = item.description && item.description.style;
                const mergedSubtitleStyle = Object.assign(Object.assign({}, rootStyle.description), subTitleStyle);
                return (React.createElement(ActionTappable, { action: item.action, key: `${(_a = item.title) === null || _a === void 0 ? void 0 : _a.value}${index}` },
                    React.createElement("div", { className: "SAKWidgetScroll__card" },
                        itemBadge && React.createElement(ScrollBadge, { badge: itemBadge, styles: rootStyle.badge }),
                        item.image && React.createElement(Image, { styles: rootStyle, items: [item.image], meta: meta, widthPrior: "56px", heightPrior: "56px" }),
                        React.createElement(ScrollCardTextContainer, { align: rootStyle.align },
                            ((_b = item.title) === null || _b === void 0 ? void 0 : _b.value) && React.createElement(Text, { title: (_c = item.title) === null || _c === void 0 ? void 0 : _c.value, styles: mergedTitleStyle, isScroll: true }),
                            ((_d = item.description) === null || _d === void 0 ? void 0 : _d.value) && React.createElement(Text, { title: (_e = item.description) === null || _e === void 0 ? void 0 : _e.value, styles: mergedSubtitleStyle, isSubtitle: true, isScroll: true })))));
            }))),
        React.createElement(WidgetFooter, { item: item, mini_apps: mini_apps, games: games, profiles: profiles, groups: groups, showDivider: true })));
};
//# sourceMappingURL=ScrollView.js.map