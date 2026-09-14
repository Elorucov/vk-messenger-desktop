import * as React from 'react';
import { Text } from '../../common/Text/Text';
import { WidgetHeader } from '../../common/Header/Header';
import { WidgetFooter } from '../../common/Footer/Footer';
import { ActionTappable } from '../../common/Action/ActionTappable';
import { ScrollBox } from '../../common/ScrollBox/ScrollBox';
import { WidgetContainer } from '../../common/containers/containers';
// @elephizeTarget
export const CounterItem = ({ children }) => {
    return React.createElement("div", { className: "SAKWidgetCounter__item" }, children);
};
// @elephizeTarget
export const CounterView = ({ mini_apps, profiles, games, groups, item, }) => {
    const { header_title: headerTitle, header_icon: headerIcons, items, root_style: rootStyle, action } = item.payload;
    const headerIcon = headerIcons && headerIcons[0];
    const headerIconUrl = headerIcon === null || headerIcon === void 0 ? void 0 : headerIcon.url;
    let size = 100;
    switch ((items || []).length) {
        case 1:
            size = 100;
            break;
        case 2:
            size = 50;
            break;
        case 3:
            size = 33;
            break;
        // Если больше 3 элементов, делаем что бы было видно что можно скроллить,
        // что бы один элемент уезжал подальше.
        // Если тут знать ширину виджета, можно сделать расчёты умнее,
        // в зависимости от ширины.
        default:
            size = 37;
    }
    return (React.createElement(WidgetContainer, { action: action, meta: { mini_apps, games, profiles, groups } },
        headerTitle && React.createElement(WidgetHeader, { action: action, label: headerTitle, size: 24, icon: headerIconUrl }),
        React.createElement(ScrollBox, null,
            React.createElement("div", { className: "SAKWidgetCounter__scrollRow" }, items && items.map((item, index) => {
                var _a;
                const titleStyle = item.title && item.title.style;
                const mergedTitleStyle = Object.assign(Object.assign({}, rootStyle.title), titleStyle);
                const subTitleStyle = item.subtitle && item.subtitle.style;
                const mergedSubtitleStyle = Object.assign(Object.assign({}, rootStyle.subtitle), subTitleStyle);
                // TODO: wtf inline styles
                return (React.createElement(ActionTappable, { key: `${(_a = item.title) === null || _a === void 0 ? void 0 : _a.value}${item.counter.value}`, action: item.action, className: "SAKWidgetCounter__tappable", style: {
                        width: `${size}%`,
                        minWidth: `${size}%`,
                        maxWidth: `${size}%`,
                    } },
                    React.createElement(CounterItem, { key: index },
                        item.counter && React.createElement(Text, { title: item.counter.value, styles: item.counter.style, className: "SAKWidgetCounter__text", breakAll: true }),
                        item.title && React.createElement(Text, { title: item.title.value, styles: mergedTitleStyle }),
                        item.subtitle && React.createElement(Text, { title: item.subtitle.value, styles: mergedSubtitleStyle, isSubtitle: true }))));
            }))),
        React.createElement(WidgetFooter, { item: item, mini_apps: mini_apps, profiles: profiles, games: games, groups: groups, showDivider: true })));
};
//# sourceMappingURL=CounterView.js.map