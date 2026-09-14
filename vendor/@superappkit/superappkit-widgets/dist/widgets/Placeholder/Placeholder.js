import * as React from 'react';
import { Button } from '../../common/Button/Button';
import { TextContainer, Text } from '../../common/Text/Text';
import { WidgetContainer } from '../../common/containers/containers';
import { WidgetHeader } from '../../common/Header/Header';
import { WidgetFooter } from '../../common/Footer/Footer';
import { ActionTappable } from '../../common/Action/ActionTappable';
// @elephizeTarget
export const Placeholder = ({ item, mini_apps, profiles, games, groups, onAction, onFormatLink }) => {
    const { button, title, root_style: rootStyle, action, header_title: headerTitle, header_icon: headerIcons, } = item.payload;
    const headerIcon = headerIcons && headerIcons[headerIcons.length - 1];
    const headerIconUrl = headerIcon === null || headerIcon === void 0 ? void 0 : headerIcon.url;
    const titleStyle = title && title.style;
    const mergedTitleStyle = Object.assign(Object.assign({}, rootStyle.title), titleStyle);
    const buttonStyle = {
        type: 'outline',
    };
    return (React.createElement(WidgetContainer, { action: action, meta: { mini_apps, games, profiles, groups } },
        headerTitle && React.createElement(WidgetHeader, { label: headerTitle, size: 24, icon: headerIconUrl, action: action }),
        React.createElement(ActionTappable, { action: action },
            React.createElement("div", { className: "SAKWidgetPlaceholder" },
                React.createElement("div", { className: "SAKWidgetPlaceholder__text" },
                    React.createElement(TextContainer, null, title && React.createElement(Text, { title: title.value, styles: mergedTitleStyle }))),
                button && button.title && React.createElement("div", { className: "SAKWidgetPlaceholder__button" },
                    React.createElement(Button, { title: button.title.value, styles: buttonStyle, action: button.action })))),
        React.createElement(WidgetFooter, { item: item, mini_apps: mini_apps, profiles: profiles, games: games, groups: groups, showDivider: true })));
};
//# sourceMappingURL=Placeholder.js.map