import React, { useCallback, useEffect, useRef } from 'react';
import './ForwardModalComposer.css';
import { Icon24Send, Icon24SmileOutline } from '@vkontakte/icons';
import * as Viewer from '../../../core/model/Viewer';
import { StickerEmojiMenuPopper, useStickerEmojiMenuPopper, } from '../../ui/StickerEmojiMenu/StickerEmojiMenu';
import { StickerEmojiKeyboardVariant, Tab, } from '@vkontakte-internal/sticker-picker';
import { ZWJ } from '../../ui/ComposerInput/ComposerEditor';
import { ComposerInput } from '../../ui/ComposerInput/ComposerInput';
import { useBrowserEnv, useFeatureFlags, useViewer } from '../../hooks/misc';
import { useLayoutData } from '../../ui/LayoutDataProvider/LayoutDataProvider';
export const ForwardModalComposer = ({ onChange, isDisabled, value, send, }) => {
    const { lang } = useBrowserEnv();
    const viewer = useViewer();
    const { isMobileLayout } = useLayoutData();
    const isCtrlSubmitEnabled = Viewer.isCtrlSubmitEnabled(viewer, isMobileLayout);
    const featureFlags = useFeatureFlags();
    const $editor = useRef(null);
    const stickerEmojiMenu = useStickerEmojiMenuPopper();
    const createEditor = useCallback((editor) => {
        $editor.current = editor;
    }, []);
    useEffect(() => $editor.current?.onContentChange((text) => {
        onChange(text);
    }), [onChange]);
    useEffect(() => {
        if (featureFlags.vkm_channels_new_forwards) {
            if (value) {
                onChange(value);
            }
            // важно только при ините
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, featureFlags]);
    useEffect(() => $editor.current?.onPaste(() => { }), []);
    useEffect(() => {
        const handleKeyCombo = (keyCombo, event) => {
            if (!$editor.current) {
                return;
            }
            switch (keyCombo) {
                case 'Mod+Enter': {
                    event.stopPropagation();
                    if (isCtrlSubmitEnabled) {
                        send();
                    }
                    else {
                        // Делаем перенос на новую строку.
                        // Так как перенос текста по символу: /n (аналогично <br/>) делается только в случае,
                        // если после него есть какой-то контент, то добавляем символ \u2060 (word joiner).
                        // Этот символ не занимает места, но он требует дополнительного нажатия backspace
                        // для удаления строки или arrow-клавиши для перехода.
                        $editor.current.insertAtSelection(`\n${ZWJ}`);
                    }
                    return;
                }
                case 'Enter': {
                    if (stickerEmojiMenu.isOpen || isDisabled) {
                        return;
                    }
                    event.stopPropagation();
                    if (!isCtrlSubmitEnabled) {
                        event.preventDefault();
                        send();
                    }
                    return;
                }
                default: {
                    event.stopPropagation();
                    return;
                }
            }
        };
        return $editor.current?.onKeyCombo(handleKeyCombo);
    }, [stickerEmojiMenu.isOpen, send, isDisabled, isCtrlSubmitEnabled]);
    const handleEmojiInsert = useCallback((emoji) => {
        if (!$editor.current) {
            return;
        }
        /**
         * Принудительно возвращаем фокус, чтобы решить несколько проблем:
         * 1. Баг в Safari на мобильных устройствах - без фокуса
         * последующий вызов document.execCommand не выполнит вставку.
         * 2. Такой же баг в десктопных браузерах.
         *
         * @see https://jira.mvk.com/browse/ME-55157
         * @see https://jira.mvk.com/browse/ME-49483
         */
        $editor.current.focus();
        $editor.current.insertAtSelection(emoji);
    }, []);
    return (React.createElement("div", { className: "ForwardModalComposer" },
        React.createElement(ComposerInput, { onCreate: createEditor, className: "ForwardModalComposer__inputWrapper", inputClassName: "ForwardModalComposer__input", placeholder: lang.use('me_forward_modal_composer_placeholder'), value: value }),
        React.createElement(StickerEmojiMenuPopper, { contentClassName: "ForwardModalComposer__emojiPopper", isOpen: stickerEmojiMenu.isOpen, visibleTab: Tab.EMOJI, variant: StickerEmojiKeyboardVariant.ADAPTIVE, toggleIsOpen: stickerEmojiMenu.toggleIsOpen, onEmojiInsert: handleEmojiInsert },
            React.createElement("button", { className: "ForwardModalComposer__button ForwardModalComposer__button--emoji" },
                React.createElement(Icon24SmileOutline, null))),
        React.createElement("button", { className: "ForwardModalComposer__button ForwardModalComposer__button--send", disabled: isDisabled, onClick: send },
            React.createElement(Icon24Send, null))));
};
//# sourceMappingURL=ForwardModalComposer.js.map