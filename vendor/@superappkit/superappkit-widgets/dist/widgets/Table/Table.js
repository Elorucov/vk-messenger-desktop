import * as React from 'react';
import { Image } from '../../common/Image/Image';
import { WidgetHeader } from '../../common/Header/Header';
import { WidgetFooter } from '../../common/Footer/Footer';
import { Text, TextContainer } from '../../common/Text/Text';
import { ActionTappable } from '../../common/Action/ActionTappable';
import { WidgetContainer, WidgetContent, } from '../../common/containers/containers';
const getContent = (align) => {
    if (align === 'center') {
        return 'center';
    }
    if (align === 'left') {
        return 'flex-start';
    }
    if (align === 'right') {
        return 'flex-end';
    }
    return '';
};
// @elephizeTarget
const TableItemContainer = ({ children, flex, align, action }) => {
    // TODO: wtf inline styles
    const justifyContent = getContent(align);
    return React.createElement(ActionTappable, { action: action, className: "SAKWidgetTable__item", style: {
            flex,
            justifyContent,
        } }, children);
};
function formatItem(item, meta, rootStyle) {
    // Note: elephize nested .map is not supported
    return item.map((subItem, index) => {
        var _a, _b;
        const colStyle = rootStyle.columns[index];
        const mergedImageStyles = {
            image: {
                type: (_a = colStyle.image) === null || _a === void 0 ? void 0 : _a.type,
            },
        };
        const titleStyle = colStyle.title;
        const subtitleStyle = colStyle.subtitle;
        const isLeftAlign = colStyle.align === 'left' || colStyle.align === 'center';
        return (React.createElement(TableItemContainer, { align: colStyle.align, flex: rootStyle.sizes[index], action: subItem.action, key: `${(_b = subItem.title) === null || _b === void 0 ? void 0 : _b.value}${index}` },
            isLeftAlign && subItem.image && React.createElement("div", { className: "SAKWidgetTable__imageLeft" },
                React.createElement(Image, { styles: mergedImageStyles, items: [subItem.image], meta: meta, heightPrior: "24px", widthPrior: "24px" })),
            React.createElement(TextContainer, { className: "SAKWidgetTable__text", align: colStyle.align },
                subItem.title && React.createElement(Text, { title: subItem.title.value, styles: titleStyle, breakAll: true }),
                subItem.subtitle && React.createElement(Text, { title: subItem.subtitle.value, styles: subtitleStyle, isSubtitle: true, breakAll: true })),
            !isLeftAlign && subItem.image && React.createElement("div", { className: "SAKWidgetTable__imageRight" },
                React.createElement(Image, { styles: mergedImageStyles, items: [subItem.image], meta: meta, heightPrior: "24px", widthPrior: "24px" }))));
    });
}
// @elephizeTarget
export const Table = ({ mini_apps, profiles, games, groups, item }) => {
    const meta = { groups, profiles, mini_apps, games };
    const { header_title: headerTitle, header_icon: headerIcons, items: rows, root_style: rootStyle, action } = item.payload;
    const headerIcon = headerIcons && headerIcons[0];
    const headerIconUrl = headerIcon === null || headerIcon === void 0 ? void 0 : headerIcon.url;
    return (React.createElement(WidgetContainer, { action: action, meta: meta },
        headerTitle && React.createElement(WidgetHeader, { action: action, label: headerTitle, size: 24, icon: headerIconUrl }),
        rows && rows.map((item, index) => {
            return (React.createElement(WidgetContent, { direction: "row", key: index, className: "SAKWidgetTable__content" }, formatItem(/* @elephizeTypecast array */ item, meta, rootStyle)));
        }),
        React.createElement(WidgetFooter, { item: item, mini_apps: mini_apps, games: games, profiles: profiles, groups: groups, showDivider: true })));
};
//# sourceMappingURL=Table.js.map