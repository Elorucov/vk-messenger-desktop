import * as React from 'react';
import { Image } from '../../common/Image/Image';
import { WidgetFooter } from '../../common/Footer/Footer';
import { WidgetHeader } from '../../common/Header/Header';
import { ActionTappable } from '../../common/Action/ActionTappable';
import { WidgetContainer } from '../../common/containers/containers';
// @elephizeTarget
export const GridContainer = ({ children }) => {
    return (React.createElement("div", { className: "SAKWidgetGrid" }, children));
};
// @elephizeTarget
export const Grid = ({ mini_apps, profiles, games, groups, item }) => {
    const meta = { groups, profiles, mini_apps, games };
    const { header_title: headerTitle, header_icon: headerIcons, items, action, root_style: rootStyle, } = item.payload;
    const headerIcon = headerIcons && headerIcons[0];
    const headerIconUrl = headerIcon === null || headerIcon === void 0 ? void 0 : headerIcon.url;
    return (React.createElement(WidgetContainer, { action: action, meta: meta },
        headerTitle && React.createElement(WidgetHeader, { action: action, label: headerTitle, size: 24, icon: headerIconUrl }),
        React.createElement(GridContainer, null, items && items.map((item, index) => {
            const size = rootStyle.size === 'medium'
                ? 'medium'
                : 'large';
            return (React.createElement("div", { key: index, className: `SAKWidgetGrid__item SAKWidgetGrid__item--${size}` },
                React.createElement(ActionTappable, { action: item.action, className: "SAKWidgetGrid__itemInner" },
                    React.createElement(Image, { styles: {}, items: [item], meta: meta, widthPrior: "100%", heightPrior: "100%" }))));
        })),
        React.createElement(WidgetFooter, { item: item, mini_apps: mini_apps, profiles: profiles, games: games, groups: groups, showDivider: false })));
};
//# sourceMappingURL=Grid.js.map