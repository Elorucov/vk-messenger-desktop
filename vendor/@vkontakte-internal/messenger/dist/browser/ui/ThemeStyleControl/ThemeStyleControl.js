import '../../ui/ThemeStyleControl/ThemeStyleControl.css';
import React, { useMemo } from 'react';
import * as ThemeStyle from '../../../core/model/ThemeStyle';
import { useBrowserEnv, useThemeStyles } from '../../hooks/misc';
import { ThemeBackground } from '../../ui/ThemeBackground/ThemeBackground';
import { HorizontalScroll } from '../../ui/HorizontalScroll/HorizontalScroll';
import { useColorScheme } from '@vkontakte/vkui';
import { Icon24CheckCircleOn } from '@vkontakte/icons';
export const ThemeStyleControl = ({ activeThemeStyleId, onChange, }) => {
    const { styles, appearances, backgrounds } = useThemeStyles();
    const { lang } = useBrowserEnv();
    const themeStylesList = useMemo(() => Array.from(styles.values())
        .filter((themeStyle) => !themeStyle.isHidden)
        .sort((a, b) => a.sortId - b.sortId)
        .reduce((acc, themeStyle) => {
        const themeAppearance = appearances.get(themeStyle.appearanceId);
        const themeBackground = backgrounds.get(themeStyle.backgroundId);
        if (themeAppearance && themeBackground) {
            acc.push({
                id: themeStyle.id,
                title: themeStyle.title,
                themeBackground,
                themeAppearance,
            });
        }
        return acc;
    }, []), [appearances, backgrounds, styles]);
    return (React.createElement("div", { className: "ThemeStyleControl" },
        React.createElement(HorizontalScroll, { arrowScrollStep: 200, arrowSize: "m", showArrows: true, bordersColor: "secondary" },
            React.createElement("div", { className: "ThemeStyleControl__list" },
                React.createElement(ThemeStylePreviewBase, { key: ThemeStyle.SYSTEM_STYLE_ID, title: lang.use('me_theme_style_system_title'), isSelected: activeThemeStyleId === ThemeStyle.SYSTEM_STYLE_ID, bubblesColor: "var(--messageOutBubbleBackground)", onClick: () => onChange(ThemeStyle.SYSTEM_STYLE_ID) }),
                themeStylesList.map((item) => (React.createElement(ThemeStylePreview, { key: item.id, ...item, isSelected: activeThemeStyleId === item.id, onClick: () => onChange(item.id) })))))));
};
const ThemeStylePreviewBase = ({ title, isSelected, background, bubblesColor, onClick, }) => {
    return (React.createElement("div", { className: "ThemeStylePreview", onClick: onClick, style: {
            '--bubblesColor': bubblesColor,
        } },
        React.createElement("div", { className: "ThemeStylePreview__background" },
            background,
            React.createElement("div", { className: "ThemeStylePreview__backgroundBubbles" }),
            isSelected && (React.createElement("i", { role: "img", className: "ThemeStylePreview__icon" },
                React.createElement(Icon24CheckCircleOn, null)))),
        React.createElement("span", { className: "ThemeStylePreview__title" }, title),
        React.createElement("svg", { height: "0", width: "0" },
            React.createElement("clipPath", { id: "themeStylePreviewbubbles" },
                React.createElement("path", { d: "M0 38.0001C0 32.4773 4.47715 28.0001 10 28.0001H58C63.5228 28.0001 68 32.4773 68 38.0001C68 43.523 63.5228 48.0001 58 48.0001H10C4.47715 48.0001 0 43.523 0 38.0001Z" }),
                React.createElement("path", { d: "M28 10.0001C28 4.47721 32.4772 6.10352e-05 38 6.10352e-05H58C63.5228 6.10352e-05 68 4.47721 68 10.0001C68 15.5229 63.5228 20.0001 58 20.0001H38C32.4772 20.0001 28 15.5229 28 10.0001Z" })))));
};
const PREVIEW_SIZE = {
    width: 92,
    height: 92,
};
const ThemeStylePreview = ({ themeAppearance, themeBackground, ...props }) => {
    const theme = useColorScheme();
    const appearance = themeAppearance?.[theme];
    const bubbleGradient = ThemeStyle.gradientToStyle(appearance.bubbleGradient);
    return (React.createElement(ThemeStylePreviewBase, { ...props, background: React.createElement(ThemeBackground, { themeBackground: themeBackground, containerSize: PREVIEW_SIZE }), bubblesColor: `linear-gradient(${bubbleGradient})` }));
};
//# sourceMappingURL=ThemeStyleControl.js.map