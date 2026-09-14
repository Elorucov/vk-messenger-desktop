import React, { memo } from 'react';
import { Icon24KeyboardOutline, Icon24SmileOutline } from '@vkontakte/icons';
import cx from 'classnames';
import { useBrowserEnv, useFeatureFlags } from '../../hooks/misc';
import { useLayoutData } from '../../ui/LayoutDataProvider/LayoutDataProvider';
import { StickerEmojiMenuPopper } from '../../ui/StickerEmojiMenu/StickerEmojiMenu';
import { StickerEmojiKeyboardVariant, } from '@vkontakte-internal/sticker-picker';
export const StickerMenuButton = memo(function StickerMenuButton({ peerId, onClick, isStickerEmojiMenuOpen, isCompactView, extendedToggleStickersEmojiMenuIsOpen, onStickerSend, onEmojiInsert, }) {
    const featureFlags = useFeatureFlags();
    const { lang } = useBrowserEnv();
    const { isMobileLayout } = useLayoutData();
    const onFocusChange = (isFocused) => {
        if (!featureFlags.vas_keyboard_handler) {
            return;
        }
        extendedToggleStickersEmojiMenuIsOpen(isFocused);
    };
    const onTouch = (e) => {
        if (!featureFlags.vas_keyboard_handler) {
            return;
        }
        e.preventDefault();
        if (!isStickerEmojiMenuOpen) {
            e.currentTarget?.focus();
        }
        extendedToggleStickersEmojiMenuIsOpen(!isStickerEmojiMenuOpen);
    };
    if (isMobileLayout) {
        return (React.createElement("button", { onClick: onClick, className: "ConvoComposer__button" },
            React.createElement("i", { role: "img", className: "ConvoComposer__buttonIcon" }, isStickerEmojiMenuOpen ? (React.createElement(Icon24KeyboardOutline, null)) : (React.createElement(Icon24SmileOutline, null)))));
    }
    return (React.createElement(StickerEmojiMenuPopper, { peerId: peerId, contentClassName: cx('ConvoComposer__stickerEmojiMenuPopper', {
            'ConvoComposer__stickerEmojiMenuPopper--compact': isCompactView,
        }), isOpen: isStickerEmojiMenuOpen, variant: isCompactView
            ? StickerEmojiKeyboardVariant.COMPACT
            : StickerEmojiKeyboardVariant.WIDE, toggleIsOpen: extendedToggleStickersEmojiMenuIsOpen, onStickerSend: onStickerSend, onEmojiInsert: onEmojiInsert },
        React.createElement("button", { className: cx(
            // Будем контролировать активное состояние вручную вместо дефолтного ховера,
            // чтобы оно корректно отрабатывало на тач-девайсах
            // (повторный тап скрывает клавиатуру и ховера не должно быть)
            'ConvoComposer__button', {
                'ConvoComposer__button--stickersKeyboard': featureFlags.vas_keyboard_handler,
                'ConvoComposer__button--stickersKeyboardActive': featureFlags.vas_keyboard_handler && isStickerEmojiMenuOpen,
            }), "aria-label": lang.use('me_composer_sticker_picker_aria_label'), 
            // Для доступности и при переключении через tab
            onFocus: () => {
                onFocusChange(true);
            }, onBlur: () => {
                onFocusChange(false);
            }, 
            // Обрабатываем кейс для тач девайсов, если !isMobileLayout
            onTouchEnd: onTouch, onClick: (e) => {
                if (featureFlags.vas_keyboard_handler) {
                    return;
                }
                onClick(e);
            } },
            React.createElement("i", { role: "img", className: "ConvoComposer__buttonIcon" },
                React.createElement(Icon24SmileOutline, null)))));
});
//# sourceMappingURL=StickerMenuButton.js.map