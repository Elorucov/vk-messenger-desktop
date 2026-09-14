import * as React from 'react';
import { cx } from '../../common/helpers';
import { Text, TextContainer } from '../../common/Text/Text';
import { WidgetHeaderImage, WidgetHeaderIcon } from '../../common/Header/Header';
import { ActionTappable } from '../../common/Action/ActionTappable';
import { WidgetContainer } from '../../common/containers/containers';
// @elephizeTarget
export const Internal = ({ item, mini_apps, games, profiles, groups }) => {
    const { header_icon: headerIcons, root_style: rootStyle, title, subtitle, action, } = item.payload;
    // @ts-ignore
    const headerIcon = headerIcons && headerIcons[headerIcons.length - 1];
    const titleVal = title && title.value;
    const titleStyle = title && title.style;
    const mergedTitleStyle = Object.assign(Object.assign({}, rootStyle.title), titleStyle);
    const subtitleVal = subtitle && subtitle.value;
    const subtitleStyle = subtitle && subtitle.style;
    const mergedsubtitleStyle = Object.assign(Object.assign({}, rootStyle.subtitle), subtitleStyle);
    { /* TODO: widget header container */ }
    const className = [
        'SAKWidget__header',
    ];
    /* TODO: this action action is weird */
    return (React.createElement(WidgetContainer, { action: action, meta: { mini_apps, games, profiles, groups } },
        React.createElement(ActionTappable, { action: action },
            React.createElement("div", { className: cx(className) },
                React.createElement(WidgetHeaderImage, { icon: headerIcon === null || headerIcon === void 0 ? void 0 : headerIcon.url, size: 24 }),
                React.createElement(TextContainer, null,
                    titleVal && React.createElement(Text, { title: titleVal, styles: mergedTitleStyle }),
                    subtitleVal && React.createElement(Text, { title: subtitleVal, styles: mergedsubtitleStyle, isSubtitle: true })),
                React.createElement(WidgetHeaderIcon, null)))));
};
//# sourceMappingURL=Internal.js.map