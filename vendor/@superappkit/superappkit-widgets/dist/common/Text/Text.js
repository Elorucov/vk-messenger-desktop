import * as React from 'react';
import { getOpeningStyle } from "../../isomorphic";
// @elephizeTarget
export const FormattedText = ({ text }) => {
    const hasInlineStyle = text.includes('[/style]');
    if (hasInlineStyle) {
        const separator = '>>><<<';
        const preparedTitle = text
            .replace(/\[style/g, `${separator}[style`)
            .replace(/style\]/g, `style]${separator}`);
        const phrases = preparedTitle
            .split(separator)
            .map((phrase) => {
            const openingStyleTag = getOpeningStyle(phrase);
            if (openingStyleTag === null) {
                return { style: {}, value: phrase };
            }
            const rawStyle = openingStyleTag[0]
                .replace(/^\[style/, '')
                .replace(/\]$/, '');
            const keyValuePairs = rawStyle.split(';').map((pair) => pair.trim());
            const styles = keyValuePairs.reduce((acc, rawStyle) => {
                const [key, value] = rawStyle.split('=');
                acc[key] = value.replace(/['"]+/g, '');
                return acc;
            }, {});
            const styleProps = Object.keys(styles).reduce((acc, key) => {
                if (styles[key].includes('#')) {
                    const color = styles[key].split('#')[1];
                    acc[key] = `#${color}`;
                }
                else {
                    acc[key] = `var(--${key}-${styles[key]})`;
                }
                return acc;
            }, {});
            const result = phrase
                .replace(/\[style.*?\]/g, '')
                .replace(/\[\/style\]/g, '');
            // trim to imitate vkcom behaviour
            return { style: styleProps, value: result };
        });
        return React.createElement(React.Fragment, null, phrases
            .filter(({ value }) => value.length > 0)
            .map(({ value, style }, index) => (React.createElement("span", { style: style, key: `${value}_${index}` }, value.trim()))));
    }
    return window._elephizeIsServer ? React.createElement(React.Fragment, null, text.split('\n').map((e) => React.createElement("span", null,
        e,
        React.createElement("br", null)))) : React.createElement("span", null, text);
};
// @elephizeTarget
export const Text = ({ title, styles, isSubtitle, isScroll, breakAll, className }) => {
    const classNames = ['SAKWidget__text'];
    if (styles) {
        const color = styles.color || '';
        const weight = styles.weight || '';
        if (color) {
            classNames.push(`SAKWidget__text--color-${color.replace('text_', '')}`);
        }
        if (weight) {
            classNames.push(`SAKWidget__text--weight-${weight}`);
        }
    }
    if (isSubtitle) {
        classNames.push('SAKWidget__text--subtitle');
    }
    if (isScroll) {
        classNames.push('SAKWidget__text--scroll');
    }
    if (breakAll) {
        classNames.push('SAKWidget__text--breakall');
    }
    if (className) {
        classNames.push(className);
    }
    return (React.createElement("div", { className: classNames.join(' ') },
        React.createElement(FormattedText, { text: title || '' })));
};
// @elephizeTarget
export const TextContainer = ({ children, align, className }) => {
    let classNames = ['SAKWidget__textContainer'];
    if (align) {
        classNames.push(`SAKWidget__textContainer--align-${align}`);
    }
    if (className) {
        classNames.push(className);
    }
    return (React.createElement("div", { className: classNames.join(' ') }, children));
};
//# sourceMappingURL=Text.js.map