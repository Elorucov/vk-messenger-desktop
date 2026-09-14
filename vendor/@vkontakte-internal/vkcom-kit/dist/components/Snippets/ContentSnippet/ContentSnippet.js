import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"Image":["Adopted",{"className":1}]} */
import { Icon28Play } from '@vkontakte/icons';
import { Avatar, Footnote, Image, Text } from '../../Adopted';
import { TextClamp } from '../../TextClamp/TextClamp';
import { SnippetCard } from '../SnippetCard/SnippetCard';
import { getContentSnippetAttachIcon } from './attachments';
import styles from './ContentSnippet.module.css';
export const ContentSnippet = ({ ownerPhotoUrl, ownerName, date, text, hasAttach, attachType, attachPreviewUrl, attachCanPlay, ...restProps }) => {
    const Icon = getContentSnippetAttachIcon(attachType);
    return (_jsx(SnippetCard, { ...restProps, children: _jsxs("div", { className: styles.containerIn, children: [_jsxs("div", { className: styles.header, children: [Boolean(ownerPhotoUrl) && _jsx(Avatar, { size: 24, src: ownerPhotoUrl }), _jsx(TextClamp, { className: styles.ownerName, TypographyComponent: Text, lines: 1, weight: "2", children: ownerName }), _jsx(TextClamp, { className: styles.date, TypographyComponent: Footnote, lines: 1, weight: "3", children: date })] }), _jsxs("div", { className: styles.body, children: [_jsx(TextClamp, { TypographyComponent: Text, weight: "3", className: styles.text, lines: 3, children: text }), hasAttach && (
                        // eslint-disable-next-line @vkontakte-internal/vkcom-plugins/check-required-props-usage
                        _jsx(Image, { className: styles.attach, size: 60, src: attachPreviewUrl, fallbackIcon: _jsx(Icon, {}), children: attachCanPlay && (_jsx(Image.Overlay, { theme: "dark", visibility: "always", children: _jsx(Icon28Play, {}) })) }))] })] }) }));
};
//# sourceMappingURL=ContentSnippet.js.map