import '../../ui/VideoCommentsComposer/VideoCommentsComposer.css';
import React, { useCallback, useEffect, useMemo, useRef, useState, } from 'react';
import { useBrowserEnv, useDispatch, useViewer } from '../../hooks/misc';
import { ComposerInput } from '../../ui/ComposerInput/ComposerInput';
import { sanitizeText, } from '../../ui/ComposerInput/ComposerEditor';
import * as Viewer from '../../../core/model/Viewer';
import cx from 'classnames';
import { Icon24Info, Icon24Send, Icon24SmileOutline } from '@vkontakte/icons';
import { StickerEmojiMenuPopper } from '../../ui/StickerEmojiMenu/StickerEmojiMenu';
import { useStickerEmojiMenu } from '../../ui/StickerEmojiMenu/StickerEmojiMenuContext';
import { StickerEmojiKeyboardVariant, } from '@vkontakte-internal/sticker-picker';
import { fromContextSticker } from '../../../data/converter/StickerConverter';
import { useErrorModal } from '../../ui/ConvoComposer/useErrorModal';
import { ErrorModal } from '../../ui/ErrorModal/ErrorModal';
import { MAX_COMMENT_SIZE } from '../../../core/config/config';
import { IApi } from '../../../data/env/IApi';
import { usePopupSticker } from '@vkontakte-internal/stickers-kit';
import { useLayoutData } from '../../ui/LayoutDataProvider/LayoutDataProvider';
export const VideoCommentsComposer = ({ videoId, className, onSent, isRestricted, }) => {
    const { lang } = useBrowserEnv();
    const viewer = useViewer();
    const dispatch = useDispatch();
    const { isMobileLayout } = useLayoutData();
    const isCtrlSubmitEnabled = Viewer.isCtrlSubmitEnabled(viewer, isMobileLayout);
    const $editor = useRef(null);
    const errorModal = useErrorModal();
    const [inputText, setInputText] = useState({
        value: '',
        selection: {
            from: 0,
            to: 0,
        },
    });
    const isDraftEmpty = sanitizeText(inputText.value).length === 0;
    const isTextOutOfLimit = inputText.value.length > MAX_COMMENT_SIZE;
    const canSend = !isDraftEmpty && !isTextOutOfLimit;
    const createEditor = useCallback((editor) => {
        $editor.current = editor;
    }, []);
    const { isOpen: isStickerEmojiMenuOpen, toggleIsOpen: toggleStickerEmojiMenuIsOpen, } = useStickerEmojiMenu();
    const { popupStore } = usePopupSticker();
    useEffect(() => {
        popupStore?.destroyWithFadeOut();
    }, [isStickerEmojiMenuOpen, popupStore]);
    const triggerCommentSend = useCallback(() => {
        if (!canSend) {
            return;
        }
        const sendText = sanitizeText(inputText.value);
        const onComplete = () => {
            $editor.current?.resetText();
            onSent?.();
        };
        const onFail = (error) => {
            let errorText;
            if (!(error instanceof IApi.RequestError) ||
                typeof error.apiError.error_text !== 'string') {
                errorText = lang.use('me_comments_composer_error_unknown');
            }
            else {
                errorText = error.apiError.error_text;
            }
            errorModal.open(errorText);
        };
        dispatch({
            type: 'UserHitVideoCommentSend',
            videoId,
            text: sendText,
            attaches: {},
            onComplete,
            onFail,
        });
    }, [canSend, inputText.value, dispatch, videoId, onSent, errorModal, lang]);
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
    const handleStickerSend = useCallback((apiSticker, referrer) => {
        const attach = fromContextSticker(apiSticker);
        if (attach.kind !== 'Sticker') {
            return;
        }
        const attaches = {
            sticker: attach,
        };
        const extra = {
            sticker: {
                id: attach.id,
                referrer,
            },
        };
        dispatch({
            type: 'UserHitVideoCommentSend',
            videoId,
            text: '',
            attaches,
            extra,
        });
        toggleStickerEmojiMenuIsOpen(false, false);
    }, [videoId, dispatch, toggleStickerEmojiMenuIsOpen]);
    /**
     * Рендер StickerEmojiMenuPopper занимает много времени, обернули его в memo,
     * потому что при каждом рендере этого компонента в него попадают новые children,
     * и это ведет к ререндеру.
     */
    const stickerEmojiMenuPopper = useMemo(() => (React.createElement(StickerEmojiMenuPopper, { contentClassName: "VideoCommentsComposer__stickerEmojiMenuPopper", isOpen: isStickerEmojiMenuOpen, variant: StickerEmojiKeyboardVariant.ADAPTIVE, toggleIsOpen: toggleStickerEmojiMenuIsOpen, onStickerSend: handleStickerSend, onEmojiInsert: handleEmojiInsert },
        React.createElement("button", { className: "VideoCommentsComposer__button", "aria-label": lang.use('me_composer_sticker_picker_aria_label') },
            React.createElement("i", { role: "img", className: "VideoCommentsComposer__buttonIcon" },
                React.createElement(Icon24SmileOutline, null))))), [
        handleEmojiInsert,
        handleStickerSend,
        isStickerEmojiMenuOpen,
        lang,
        toggleStickerEmojiMenuIsOpen,
    ]);
    // Подписка на различные ивенты эдитора
    useEffect(() => $editor.current?.onContentChange((text, selection) => {
        setInputText({
            value: text,
            selection,
        });
    }), []);
    useEffect(() => {
        const handleKeyCombo = (keyCombo, event) => {
            if (!$editor.current || !keyCombo) {
                return;
            }
            switch (keyCombo) {
                case 'Mod+Enter': {
                    event.stopPropagation();
                    if (isCtrlSubmitEnabled) {
                        triggerCommentSend();
                    }
                    return;
                }
                case 'Tab': {
                    event.stopPropagation();
                    event.preventDefault();
                    toggleStickerEmojiMenuIsOpen(!isStickerEmojiMenuOpen);
                    return;
                }
                case 'Enter': {
                    // Если панель стикеров открыта, блокируем все действия кроме выбора эмоджи
                    if (isStickerEmojiMenuOpen) {
                        return;
                    }
                    event.stopPropagation();
                    if (!isCtrlSubmitEnabled) {
                        event.preventDefault();
                        triggerCommentSend();
                    }
                    return;
                }
                case 'Escape': {
                    event.stopPropagation();
                    event.preventDefault();
                    if (isStickerEmojiMenuOpen) {
                        toggleStickerEmojiMenuIsOpen(false);
                        return;
                    }
                    return;
                }
                case 'ArrowUp':
                case 'ArrowDown':
                case 'ArrowLeft':
                case 'ArrowRight': {
                    // Если панель стикеров открыта, блокируем все действия кроме выбора эмоджи
                    if (isStickerEmojiMenuOpen) {
                        return;
                    }
                    event.stopPropagation();
                    return;
                }
                default: {
                    event.stopPropagation();
                    return;
                }
            }
        };
        return $editor.current?.onKeyCombo(handleKeyCombo);
    }, [
        isStickerEmojiMenuOpen,
        isCtrlSubmitEnabled,
        toggleStickerEmojiMenuIsOpen,
        triggerCommentSend,
    ]);
    if (isRestricted) {
        return (React.createElement("div", { className: cx(className, 'VideoCommentsComposer') },
            React.createElement("div", { className: "VideoCommentsComposer__info" },
                React.createElement("i", { role: "img", className: "VideoCommentsComposer__blockedIcon" },
                    React.createElement(Icon24Info, null)),
                React.createElement("span", { className: "VideoCommentsComposer__blockedMessage" }, lang.use('me_composer_can_write_comments_restricted')))));
    }
    return (React.createElement("div", { className: cx(className, 'VideoCommentsComposer') },
        React.createElement("div", { className: "VideoCommentsComposer__inputPanel" },
            React.createElement(ComposerInput, { onCreate: createEditor, className: "VideoCommentsComposer__inputWrapper", inputClassName: "VideoCommentsComposer__input", placeholder: lang.use('me_comments_composer_input_placeholder') }),
            stickerEmojiMenuPopper,
            React.createElement("button", { className: cx('VideoCommentsComposer__button', 'VideoCommentsComposer__button--submit', {
                    'VideoCommentsComposer__button--submitActive': canSend,
                }), "aria-label": lang.use('me_composer_send_aria_label'), onClick: triggerCommentSend },
                React.createElement("i", { role: "img", className: "VideoCommentsComposer__buttonIcon VideoCommentsComposer__buttonIcon--submit" },
                    React.createElement(Icon24Send, null)))),
        React.createElement(ErrorModal, { errorText: errorModal.errorText, onClose: errorModal.close })));
};
//# sourceMappingURL=VideoCommentsComposer.js.map