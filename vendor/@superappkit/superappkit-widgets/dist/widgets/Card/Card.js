import * as React from 'react';
import { Image } from '../../common/Image/Image';
import { WidgetFooter } from '../../common/Footer/Footer';
import { WidgetHeader } from '../../common/Header/Header';
import { Text, TextContainer } from '../../common/Text/Text';
import { WidgetContent, WidgetContainer } from '../../common/containers/containers';
import { ActionTappable } from '../../common/Action/ActionTappable';
// @elephizeTarget
const CardImageContainer = ({ children, padding }) => {
    const classNames = ['SAKWidgetCard__image'];
    if (padding) {
        classNames.push('SAKWidgetCard__image--padding');
    }
    return React.createElement("div", { className: classNames.join(' ') }, children);
};
// @elephizeTarget
export const Card = ({ item, mini_apps, groups, profiles, games }) => {
    const { subtitle, title, second_subtitle: secondSubtitle, header_title: headerTitle, header_icon: headerIcons, image, action, root_style: rootStyle, } = item.payload;
    const headerIcon = headerIcons && headerIcons[0];
    const headerIconUrl = headerIcon === null || headerIcon === void 0 ? void 0 : headerIcon.url;
    const titleStyle = title && title.style;
    const mergedTitleStyle = Object.assign(Object.assign({}, rootStyle.title), titleStyle);
    const subTitleStyle = subtitle && subtitle.style;
    const mergedSubtitleStyle = Object.assign(Object.assign({}, rootStyle.subtitle), subTitleStyle);
    const secondSubtitleStyle = secondSubtitle && secondSubtitle.style;
    const mergedSecondSubtitleStyle = Object.assign(Object.assign({}, rootStyle.second_subtitle), secondSubtitleStyle);
    const mergedImageStyles = image ? {
        image: {
            type: image.type,
        },
    } : undefined;
    const titleValue = title && title.value;
    const subtitleValue = subtitle && subtitle.value;
    const secondSubtitleValue = secondSubtitle && secondSubtitle.value;
    const hasText = !!(titleValue || subtitleValue || secondSubtitleValue);
    return (React.createElement(WidgetContainer, { action: action, meta: { mini_apps, games, profiles, groups } },
        headerTitle && React.createElement(WidgetHeader, { action: action, label: headerTitle, size: 24, icon: headerIconUrl }),
        React.createElement(ActionTappable, { action: action },
            React.createElement(WidgetContent, { direction: "column" },
                React.createElement(CardImageContainer, { padding: !!rootStyle.image_padding }, image && React.createElement(Image, { styles: mergedImageStyles, items: [image], meta: { groups, profiles, mini_apps, games }, heightPrior: "100%", widthPrior: "100%" })),
                hasText && React.createElement(TextContainer, { className: "SAKWidgetCard__text" },
                    React.createElement(Text, { title: title === null || title === void 0 ? void 0 : title.value, styles: mergedTitleStyle }),
                    React.createElement(Text, { title: subtitle === null || subtitle === void 0 ? void 0 : subtitle.value, styles: mergedSubtitleStyle, isSubtitle: true }),
                    React.createElement(Text, { title: secondSubtitle === null || secondSubtitle === void 0 ? void 0 : secondSubtitle.value, styles: mergedSecondSubtitleStyle, isSubtitle: true })))),
        React.createElement(WidgetFooter, { item: item, mini_apps: mini_apps, games: games, profiles: profiles, groups: groups, showDivider: true })));
};
//# sourceMappingURL=Card.js.map