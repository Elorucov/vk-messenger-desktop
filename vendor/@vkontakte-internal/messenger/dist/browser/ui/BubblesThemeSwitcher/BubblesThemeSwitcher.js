import React, { useMemo } from 'react';
import cx from 'classnames';
import { useBrowserEnv, useThemeStyles } from '../../hooks/misc';
import { ConvoStack } from '../../ui/ConvoStack/ConvoStack';
import { Avatar } from '../../ui/Avatar/Avatar';
import { ConvoMessageHeader } from '../../ui/ConvoMessageHeader/ConvoMessageHeader';
import { MessageText } from '../../ui/MessageText/MessageText';
import { ConvoMessageBottomInfo } from '../../ui/ConvoMessageBottomInfo/ConvoMessageBottomInfo';
import { ConvoMessageLightBubble } from '../../ui/ConvoMessageLightBubble/ConvoMessageLightBubble';
import { getMessageMock, getPeerMock, } from '../../ui/BubblesThemeSwitcher/utils';
import './BubblesThemeSwitcher.css';
import { useWithoutBubblesTheme } from '../../hooks/useWithoutBubblesTheme';
import { ConvoMessageInfoWithoutBubblesTheme } from '../../ui/ConvoMessageInfoWithoutBubblesTheme/ConvoMessageInfoWithoutBubblesTheme';
import { useThemeStylesOverride } from '../../hooks/useThemeStylesOverride';
import { ThemeBackground } from '../../ui/ThemeBackground/ThemeBackground';
import { useNow } from '../../hooks/useNow';
const getMessage = (peer, message, isWithoutBubblesTheme) => {
    const { isOut } = message;
    return (React.createElement(ConvoStack, { peer: peer, isOut: isOut, isCentered: false, selected: [], isOneToOneConvo: false, isWithoutBubblesTheme: isWithoutBubblesTheme },
        React.createElement("div", { className: cx('ConvoHistory__messageBlock', {
                'ConvoHistory__messageBlock--out MEAppThemeStylesContrastEnable': isOut,
            }) },
            React.createElement("div", { className: cx('ConvoHistory__messageWrapper', {
                    'ConvoHistory__messageWrapper--withoutBubbles': isWithoutBubblesTheme,
                }) },
                React.createElement(ConvoMessageLightBubble, { isWithoutBubblesTheme: isWithoutBubblesTheme, isOut: isOut },
                    isWithoutBubblesTheme && (React.createElement("div", { className: "ConvoMessageWithoutBubble__avatar" },
                        React.createElement(Avatar, { peer: peer, size: 36 }))),
                    React.createElement("div", { className: isWithoutBubblesTheme
                            ? 'ConvoMessageWithoutBubble__wrapper'
                            : 'ConvoMessage__wrapper' },
                        React.createElement("div", { className: isWithoutBubblesTheme
                                ? 'ConvoMessageWithoutBubble__content'
                                : 'ConvoMessage__content' },
                            (isWithoutBubblesTheme || !isOut) && (React.createElement(ConvoMessageHeader, { author: peer, isShortenedPeer: true, disabledProfileClick: true })),
                            React.createElement(MessageText, { ...message }),
                            !isWithoutBubblesTheme && (React.createElement(ConvoMessageBottomInfo, { className: "ConvoMessage__info", message: message, isUnread: false, showDate: true }))),
                        isWithoutBubblesTheme && (React.createElement(ConvoMessageInfoWithoutBubblesTheme, { message: message, isUnread: false }))))))));
};
const THEME_BACKGROUND_SIZE = {
    width: 252,
    height: 146,
};
export const BubblesThemeSwitcher = ({ author, activeThemeStyleId, onClick, }) => {
    const { styles, appearances, backgrounds } = useThemeStyles();
    const { lang } = useBrowserEnv();
    const now = useNow();
    const { outMessage, inMessage } = useMemo(() => ({
        outMessage: getMessageMock(lang.use('me_settings_bubbles_theme_out_message'), true, {
            sentAt: now,
        }),
        inMessage: getMessageMock(lang.use('me_settings_bubbles_theme_in_message'), false, {
            sentAt: now,
        }),
    }), [lang, now]);
    const [firstName = 'Alex', secondName = 'S'] = lang
        .use('me_settings_bubbles_theme_peer_name')
        .split(' ');
    const peer = getPeerMock(firstName, secondName);
    const isWithoutBubblesTheme = useWithoutBubblesTheme();
    const activeThemeStyle = styles.get(activeThemeStyleId);
    const themeAppearance = activeThemeStyle && appearances.get(activeThemeStyle.appearanceId);
    const themeBackground = activeThemeStyle && backgrounds.get(activeThemeStyle.backgroundId);
    const themeAppearanceStyles = useThemeStylesOverride({
        themeAppearance,
    });
    return (React.createElement("div", { className: "BubblesThemeSwitcher", role: "radiogroup", "aria-label": lang.use('me_settings_messages_theme_title') },
        React.createElement("div", { className: cx(
            /**
             * Добавляем классов для корректных значений переменных в используемых
             * ниже компонентах.
             */
            'MEAppConfig', 'MEAppConfig__withoutBubbles', 'BubblesThemeSwitcher__option', {
                'BubblesThemeSwitcher__option--selected': isWithoutBubblesTheme,
            }), onClick: () => {
                if (!isWithoutBubblesTheme) {
                    onClick('disabled');
                }
            }, role: "radio", "aria-checked": isWithoutBubblesTheme, "aria-label": lang.use('me_settings_messages_theme_classic_label') },
            React.createElement("div", { className: "BubblesThemeSwitcher__convoHistory", role: "menu" },
                getMessage(author, outMessage, true),
                getMessage(peer, inMessage, true)),
            React.createElement("div", { className: "BubblesThemeSwitcher__label" }, lang.use('me_settings_messages_theme_classic_label'))),
        React.createElement("div", { className: cx('MEAppConfig', 'BubblesThemeSwitcher__option', {
                'BubblesThemeSwitcher__option--selected': !isWithoutBubblesTheme,
            }), onClick: () => {
                if (isWithoutBubblesTheme) {
                    onClick('enabled');
                }
            }, role: "radio", "aria-checked": !isWithoutBubblesTheme, "aria-label": lang.use('me_settings_bubbles_theme_block_label') },
            React.createElement("div", { className: "BubblesThemeSwitcher__convoHistory BubblesThemeSwitcher__convoHistory--bubbled", style: themeAppearanceStyles, role: "menu" },
                themeBackground && (React.createElement(ThemeBackground, { themeBackground: themeBackground, containerSize: THEME_BACKGROUND_SIZE })),
                getMessage(author, outMessage, false),
                getMessage(peer, inMessage, false)),
            React.createElement("div", { className: "BubblesThemeSwitcher__label" }, lang.use('me_settings_bubbles_theme_block_label')))));
};
//# sourceMappingURL=BubblesThemeSwitcher.js.map