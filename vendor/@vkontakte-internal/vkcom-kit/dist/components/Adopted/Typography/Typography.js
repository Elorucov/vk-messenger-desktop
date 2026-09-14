import { jsx as _jsx } from "react/jsx-runtime";
import { Caption as VKUICaption, DisplayTitle as VKUIDisplayTitle, Footnote as VKUIFootnote, Headline as VKUIHeadline, Paragraph as VKUIParagraph, Subhead as VKUISubhead, Text as VKUIText, Title as VKUITtitle, } from '@vkontakte/vkui';
export const Title = ({ Component, level = '1', ...restProps }) => {
    if (!Component) {
        Component = ('h' + level);
    }
    return _jsx(VKUITtitle, { Component: Component, level: level, useAccentWeight: true, ...restProps });
};
export const Headline = ({ Component = 'h4', weight = '3', ...restProps }) => (_jsx(VKUIHeadline, { Component: Component, useAccentWeight: true, weight: weight, ...restProps }));
export const Caption = (props) => _jsx(VKUICaption, { useAccentWeight: true, ...props });
export const DisplayTitle = (props) => (_jsx(VKUIDisplayTitle, { useAccentWeight: true, ...props }));
export const Footnote = (props) => _jsx(VKUIFootnote, { useAccentWeight: true, ...props });
export const Paragraph = (props) => _jsx(VKUIParagraph, { useAccentWeight: true, ...props });
export const Subhead = (props) => _jsx(VKUISubhead, { useAccentWeight: true, ...props });
export const Text = (props) => _jsx(VKUIText, { useAccentWeight: true, ...props });
//# sourceMappingURL=Typography.js.map