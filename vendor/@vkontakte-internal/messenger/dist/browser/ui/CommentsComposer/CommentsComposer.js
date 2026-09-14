import '../../ui/CommentsComposer/CommentsComposer.css';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, } from 'react';
import { useBrowserEnv, useDispatch, useFeatureFlags, usePeers, useViewer, } from '../../hooks/misc';
import { ComposerInput } from '../../ui/ComposerInput/ComposerInput';
import { sanitizeText, getSelectionRange, } from '../../ui/ComposerInput/ComposerEditor';
import * as TextChunk from '../../../core/model/TextChunk';
import * as Peer from '../../../core/model/Peer';
import * as Viewer from '../../../core/model/Viewer';
import cx from 'classnames';
import { Icon24AddCircleOutline, Icon24BlockOutline, Icon24CheckCircleOutline, Icon24DeleteOutline, Icon24Send, Icon24SmileOutline, } from '@vkontakte/icons';
import * as CommentsComposerDraft from '../../../core/model/CommentsComposerDraft';
import { ComposerAttaches } from '../../ui/ComposerAttaches/ComposerAttaches';
import { useComposerAttachments } from '../../ui/ConvoComposer/useComposerAttachments';
import { Clip } from '../../ui/Clip/Clip';
import { FilePicker } from '../../ui/FilePicker/FilePicker';
import { useModal } from '../../hooks/useModal';
import { Button, Spinner } from '@vkontakte/vkui';
import { DropArea } from '../../ui/DropArea/DropArea';
import { ComposerEditingComment } from '../../ui/ComposerOverMessage/ComposerEditing';
import { ComposerCommentReply } from '../../ui/ComposerOverMessage/ComposerReply';
import { StickerEmojiMenuPopper } from '../../ui/StickerEmojiMenu/StickerEmojiMenu';
import { StickerEmojiKeyboardVariant, Tab, } from '@vkontakte-internal/sticker-picker';
import { fromContextSticker } from '../../../data/converter/StickerConverter';
import { ModalInterface } from '../../ui/ModalInterface/ModalInterface';
import { FormattedLangKey } from '../../ui/FormattedLangKey/FormattedLangKey';
import { useErrorModal } from '../../ui/ConvoComposer/useErrorModal';
import { ErrorModal } from '../../ui/ErrorModal/ErrorModal';
import { MAX_COMMENT_SIZE } from '../../../core/config/config';
import { useStickerEmojiMenu } from '../../ui/StickerEmojiMenu/StickerEmojiMenuContext';
import { IApi } from '../../../data/env/IApi';
import { CommentsComposerAuthorMenu } from '../../ui/CommentsComposerAuthorMenu/CommentsComposerAuthorMenu';
import { usePopupSticker } from '@vkontakte-internal/stickers-kit';
import { useRouter } from '../../ui/Router/Router';
import { useLayoutData } from '../../ui/LayoutDataProvider/LayoutDataProvider';
const MAX_ATTACHES_COUNT = 2;
export const CommentsComposer = ({ channelId, postCmid, composerDraft, commentGroups, isSending, isLoading, isCommunityChannel, className, onCommentSent, }) => {
    const { lang } = useBrowserEnv();
    const viewer = useViewer();
    const { navigate } = useRouter();
    const dispatch = useDispatch();
    const peers = usePeers();
    const { isMobileLayout } = useLayoutData();
    const isCtrlSubmitEnabled = Viewer.isCtrlSubmitEnabled(viewer, isMobileLayout);
    const $editor = useRef(null);
    const filePickerModal = useModal();
    const deleteEditingModal = useModal();
    const errorModal = useErrorModal();
    const { vkm_channels_comments_attaches, vkm_channels_comments_stickers, vkm_channel_comments_reply, } = useFeatureFlags();
    const [inputText, setInputText] = useState({
        value: '',
        selection: {
            from: 0,
            to: 0,
        },
    });
    const [groupAuthorId, setGroupAuthorId] = useState(undefined);
    const handleGroupAuthorIdSelect = useCallback((peerId) => {
        if (Peer.isUserPeerId(peerId)) {
            return setGroupAuthorId(undefined);
        }
        setGroupAuthorId(peerId);
    }, []);
    const { editing, reply } = composerDraft;
    const isDraftEmpty = CommentsComposerDraft.isEmpty(composerDraft, sanitizeText(inputText.value));
    const isTextOutOfLimit = inputText.value.length > MAX_COMMENT_SIZE;
    const hasUploads = CommentsComposerDraft.hasActiveUploads(composerDraft);
    const canSend = !isDraftEmpty &&
        !hasUploads &&
        !isSending &&
        !isTextOutOfLimit &&
        !isLoading;
    const showLoadingIcon = hasUploads || isSending;
    const showSubmitIcon = !editing && !showLoadingIcon;
    const showEditingIcon = editing && !isDraftEmpty && !showLoadingIcon && !isTextOutOfLimit;
    const showDeleteIcon = editing && isDraftEmpty && !showLoadingIcon;
    const showBlockIcon = editing && !isDraftEmpty && !showLoadingIcon && isTextOutOfLimit;
    const canUploadAttaches = isCommunityChannel
        ? vkm_channels_comments_attaches
        : true;
    const showStickers = isCommunityChannel
        ? vkm_channels_comments_stickers
        : true;
    const createEditor = useCallback((editor) => {
        $editor.current = editor;
    }, []);
    const { uploaderState, attaches, addAttaches, uploadFiles, rearrangeAttaches, removeAttaches, } = useComposerAttachments({
        composerDraft,
        channelId,
        isPostponed: false,
        postCmid,
        isChannel: true,
        isComment: true,
    });
    const { attachesCount, canUploadCount, uploadsCount } = useMemo(() => {
        const attachesCount = Object.values(attaches).flat().length;
        const uploadsCount = composerDraft.uploadsTrackIds.size;
        const canUploadCount = Math.max(MAX_ATTACHES_COUNT - attachesCount - uploadsCount, 0);
        return {
            attachesCount,
            uploadsCount,
            canUploadCount,
        };
    }, [attaches, composerDraft.uploadsTrackIds.size]);
    const addAttachesWithLimit = useCallback((attaches) => {
        const totalCount = attachesCount + uploadsCount + 1;
        if (totalCount > MAX_ATTACHES_COUNT) {
            return errorModal.open(lang.use('me_comments_composer_attaches_limit', {
                values: {
                    count: MAX_ATTACHES_COUNT.toString(),
                },
            }));
        }
        addAttaches(attaches);
    }, [addAttaches, attachesCount, errorModal, lang, uploadsCount]);
    const uploadFilesWithLimit = useCallback((files, options, handlers) => {
        const totalCount = attachesCount + uploadsCount + files.length;
        if (totalCount > MAX_ATTACHES_COUNT) {
            errorModal.open(lang.use('me_comments_composer_attaches_limit', {
                values: {
                    count: MAX_ATTACHES_COUNT.toString(),
                },
            }));
        }
        files = files.slice(0, canUploadCount);
        if (files.length) {
            uploadFiles(files, options, handlers);
        }
    }, [
        attachesCount,
        canUploadCount,
        errorModal,
        lang,
        uploadFiles,
        uploadsCount,
    ]);
    const { isOpen: isStickerEmojiMenuOpen, toggleIsOpen: toggleStickerEmojiMenuIsOpen, } = useStickerEmojiMenu();
    const { popupStore } = usePopupSticker();
    useEffect(() => {
        popupStore?.destroyWithFadeOut();
    }, [isStickerEmojiMenuOpen, popupStore]);
    const triggerCommentSend = useCallback(() => {
        // Редактируемый комментарий полностью пустой, значит удаляем его
        if (editing && isDraftEmpty) {
            deleteEditingModal.open();
        }
        if (!canSend) {
            return;
        }
        const sendText = sanitizeText(inputText.value);
        const hasStickerAttach = !!attaches.sticker || !!attaches.ugcSticker;
        const onComplete = () => {
            $editor.current?.resetText();
            dispatch({
                type: 'UserClearedCommentsComposerDraft',
                channelId,
                postCmid,
            });
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
        if (editing && !hasStickerAttach) {
            dispatch({
                type: 'UserHitEditComment',
                channelId,
                postCmid,
                commentCmid: editing.cmid,
                text: sendText,
                attaches,
                onComplete,
                onFail,
            });
        }
        else {
            dispatch({
                type: 'UserHitCommentSend',
                channelId,
                postCmid,
                text: sendText,
                attaches,
                replyCmid: reply?.cmid,
                replyPeerId: reply?.peerId,
                fromGroupId: groupAuthorId,
                onComplete: (response) => {
                    onComplete();
                    onCommentSent?.(response);
                },
                onFail,
            });
        }
    }, [
        editing,
        isDraftEmpty,
        canSend,
        inputText.value,
        attaches,
        deleteEditingModal,
        dispatch,
        onCommentSent,
        channelId,
        postCmid,
        errorModal,
        lang,
        reply?.cmid,
        reply?.peerId,
        groupAuthorId,
    ]);
    const handleRemoveReply = () => {
        if (!$editor.current) {
            return;
        }
        dispatch({
            type: 'UserChangedCommentsComposerDraft',
            kind: 'reply',
            channelId,
            postCmid,
        });
        // Получаем из эдитора html-текст и преобразуем его в сырой
        let rawText = transformFormattedHtmlStringToRaw($editor.current?.getHtml());
        const chunks = TextChunk.fromClientText(rawText);
        const replyPeerId = composerDraft.reply?.peerId;
        let startChunk = chunks.at(0);
        // Если при удалении реплая в строке в начале стоит меншен пользователя,
        // которому адресован реплай, то удаляем меншен (и запятую при наличии)
        if (startChunk?.kind === 'Mention' && startChunk.peerId === replyPeerId) {
            chunks.shift();
            startChunk = chunks.at(0);
            if (startChunk?.kind === 'Text' && startChunk.text.startsWith(',')) {
                chunks[0] = {
                    ...startChunk,
                    text: startChunk.text.slice(1).trimStart(),
                };
            }
        }
        // Собираем сырой текст из чанков и записывапем эдитор
        rawText = TextChunk.toRawText(chunks);
        $editor.current?.resetText(transformRawToFormattedHtmlString(rawText), true);
    };
    const handleCancelEditing = useCallback(() => {
        dispatch({
            type: 'UserClearedCommentsComposerDraft',
            channelId,
            postCmid,
        });
        $editor.current?.resetText();
    }, [channelId, dispatch, postCmid]);
    const confirmDeleteEditing = useCallback(() => {
        if (!editing) {
            return;
        }
        dispatch({
            type: 'UserChangedComment',
            userAction: {
                kind: 'delete',
            },
            channelId,
            postCmid,
            commentCmid: editing.cmid,
        });
        deleteEditingModal.close();
        handleCancelEditing();
    }, [
        channelId,
        deleteEditingModal,
        dispatch,
        editing,
        handleCancelEditing,
        postCmid,
    ]);
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
            type: 'UserHitCommentSend',
            channelId,
            postCmid,
            text: '',
            attaches,
            extra,
            replyCmid: reply?.cmid,
            fromGroupId: groupAuthorId,
        });
        toggleStickerEmojiMenuIsOpen(false, false);
    }, [
        channelId,
        dispatch,
        groupAuthorId,
        postCmid,
        reply?.cmid,
        toggleStickerEmojiMenuIsOpen,
    ]);
    /**
     * Преобразует html из эдитора и сохраняет его в драфт в сыром виде
     */
    const saveDraftText = useCallback(() => {
        if (!$editor.current) {
            return;
        }
        const text = vkm_channel_comments_reply
            ? transformFormattedHtmlStringToRaw($editor.current.getHtml())
            : $editor.current.getText();
        dispatch({
            type: 'UserChangedCommentsComposerDraft',
            kind: 'text',
            text,
            channelId,
            postCmid,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [channelId, dispatch, postCmid]);
    /**
     * Рендер StickerEmojiMenuPopper занимает много времени, обернули его в memo,
     * потому что при каждом рендере этого компонента в него попадают новые children,
     * и это ведет к ререндеру.
     */
    const stickerEmojiMenuPopper = useMemo(() => (React.createElement(StickerEmojiMenuPopper, { contentClassName: "CommentsComposer__stickerEmojiMenuPopper", isOpen: isStickerEmojiMenuOpen, visibleTab: showStickers ? undefined : Tab.EMOJI, variant: StickerEmojiKeyboardVariant.WIDE, toggleIsOpen: toggleStickerEmojiMenuIsOpen, onStickerSend: handleStickerSend, onEmojiInsert: handleEmojiInsert },
        React.createElement("button", { className: "CommentsComposer__button", "aria-label": lang.use('me_composer_sticker_picker_aria_label') },
            React.createElement("i", { role: "img", className: "CommentsComposer__buttonIcon" },
                React.createElement(Icon24SmileOutline, null))))), [
        handleEmojiInsert,
        handleStickerSend,
        isStickerEmojiMenuOpen,
        lang,
        toggleStickerEmojiMenuIsOpen,
        showStickers,
    ]);
    // Подписка на различные ивенты эдитора
    useEffect(() => {
        if (vkm_channel_comments_reply) {
            $editor.current?.onContentChange((_, selection) => {
                if (!$editor.current) {
                    return;
                }
                const rawText = transformFormattedHtmlStringToRaw($editor.current?.getHtml());
                setInputText({
                    value: rawText,
                    selection,
                });
            });
            // Сохранение драфта при смене фокуса
            $editor.current?.onFocusChange((isFocused) => {
                if (!isFocused) {
                    saveDraftText();
                }
            });
        }
        else {
            $editor.current?.onContentChange((text, selection) => {
                setInputText({
                    value: text,
                    selection,
                });
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [saveDraftText]);
    useEffect(() => {
        const handleKeyCombo = (keyCombo, event) => {
            if (!$editor.current) {
                return;
            }
            switch (keyCombo) {
                case 'Mod+Enter': {
                    event.stopPropagation();
                    if (isCtrlSubmitEnabled) {
                        triggerCommentSend();
                    }
                    else {
                        $editor.current.insertAtSelection('\n');
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
                    if (editing) {
                        handleCancelEditing();
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
        editing,
        handleCancelEditing,
        isStickerEmojiMenuOpen,
        isCtrlSubmitEnabled,
        toggleStickerEmojiMenuIsOpen,
        triggerCommentSend,
    ]);
    useEffect(() => $editor.current?.onPaste((files) => {
        if (canUploadAttaches) {
            uploadFilesWithLimit(files);
        }
    }), [canUploadAttaches, uploadFilesWithLimit]);
    // Сохранение написанного текста при смене поста/канала
    useEffect(() => () => saveDraftText(), [saveDraftText]);
    // Сохранение написанного текста при переключении вкладки
    useEffect(() => {
        window.addEventListener('blur', saveDraftText);
        return () => {
            window.removeEventListener('blur', saveDraftText);
        };
    }, [saveDraftText]);
    /**
     * Обработка клика по меншену в композере
     */
    useEffect(() => {
        if (vkm_channel_comments_reply) {
            const handleMentionSelect = (e) => {
                const target = e.target;
                if (target instanceof HTMLElement) {
                    const mentionElement = target.closest(`.${mentionClassName}`);
                    if (mentionElement instanceof HTMLElement) {
                        const { range } = getSelectionRange(mentionElement);
                        range?.setStartBefore(mentionElement);
                        range?.setEndAfter(mentionElement);
                    }
                }
            };
            window.addEventListener('dblclick', handleMentionSelect);
            return () => {
                window.removeEventListener('dblclick', handleMentionSelect);
            };
        }
        return () => { };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigate, peers]);
    // Вставка текста из черновика при первом открытии
    useLayoutEffect(() => {
        if (vkm_channel_comments_reply) {
            const htmlText = transformRawToFormattedHtmlString(composerDraft.text);
            $editor.current?.resetText(htmlText, true);
        }
        else {
            $editor.current?.resetText(composerDraft.text);
        }
        return () => {
            $editor.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    useEffect(() => {
        if (commentGroups.isReady) {
            return;
        }
        dispatch({
            type: 'LoadCommentGroups',
        });
    }, [commentGroups.isReady, dispatch]);
    // Замена текста и автофокус при редактировании
    useLayoutEffect(() => {
        if (!editing || !$editor.current) {
            return;
        }
        if (editing) {
            const htmlText = transformRawToFormattedHtmlString(composerDraft.text);
            $editor.current.resetText(htmlText, true);
        }
        $editor.current.focus();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editing]);
    // Замена текста и автофокус при редактировании
    useLayoutEffect(() => {
        if (!reply || !$editor.current) {
            return;
        }
        if (reply) {
            if (vkm_channel_comments_reply) {
                const htmlText = transformRawToFormattedHtmlString(composerDraft.text);
                $editor.current.resetText(htmlText, true);
            }
            else {
                $editor.current.resetText(composerDraft.text);
            }
        }
        $editor.current.focus();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reply]);
    return (React.createElement("div", { className: cx(className, 'CommentsComposer') },
        React.createElement(DropArea, { disabled: !canUploadAttaches, onFilesAdd: uploadFilesWithLimit }),
        reply && (React.createElement(ComposerCommentReply, { reply: reply, className: "CommentsComposer__reply", isCompactView: false, onRemoveReply: handleRemoveReply })),
        editing && (React.createElement(ComposerEditingComment, { comment: editing, className: "CommentsComposer__editing", isCompactView: false, onCancelEditing: handleCancelEditing })),
        React.createElement(ComposerAttaches, { source: "commentsComposer", className: "CommentsComposer__attaches", attaches: attaches, optimistAttaches: uploaderState, onRemove: removeAttaches, rearrangeAttachments: rearrangeAttaches }),
        React.createElement("div", { className: "CommentsComposer__inputPanel" },
            React.createElement(CommentsComposerAuthorMenu, { channelId: channelId, ariaLabel: lang.use('me_composer_author_picker_aria_label'), className: "CommentsComposer__authorMenu", buttonClassName: "CommentsComposer__authorButton", commentGroupIds: commentGroups.ids, onSelect: handleGroupAuthorIdSelect }),
            canUploadAttaches && (React.createElement(Clip, { addFileAttachments: uploadFilesWithLimit, classNames: {
                    wrapper: 'ConvoComposer__clip',
                    portal: 'MEConfig',
                }, onOpenFilePicker: filePickerModal.open },
                React.createElement("button", { className: "CommentsComposer__button", "aria-label": lang.use('me_composer_file_picker_aria_label') },
                    React.createElement(Icon24AddCircleOutline, null)))),
            React.createElement(ComposerInput, { onCreate: createEditor, className: "CommentsComposer__inputWrapper", inputClassName: "CommentsComposer__input", placeholder: lang.use('me_comments_composer_input_placeholder') }),
            stickerEmojiMenuPopper,
            React.createElement("button", { className: cx('CommentsComposer__button', {
                    'CommentsComposer__button--submit': showSubmitIcon,
                    'CommentsComposer__button--submitActive': canSend,
                    'CommentsComposer__button--loading': showLoadingIcon,
                    'CommentsComposer__button--edit': showEditingIcon,
                    'CommentsComposer__button--delete': showDeleteIcon,
                    'CommentsComposer__button--block': showBlockIcon,
                }), "aria-label": lang.use('me_composer_send_aria_label'), onClick: triggerCommentSend },
                React.createElement("i", { role: "img", className: "CommentsComposer__buttonIcon CommentsComposer__buttonIcon--submit" },
                    React.createElement(Icon24Send, null)),
                React.createElement("i", { role: "img", className: "CommentsComposer__buttonIcon CommentsComposer__buttonIcon--edit" },
                    React.createElement(Icon24CheckCircleOutline, null)),
                React.createElement("i", { role: "img", className: "CommentsComposer__buttonIcon CommentsComposer__buttonIcon--loading" },
                    React.createElement(Spinner, { size: "s" })),
                React.createElement("i", { role: "img", className: "CommentsComposer__buttonIcon CommentsComposer__buttonIcon--delete" },
                    React.createElement(Icon24DeleteOutline, null)),
                React.createElement("i", { role: "img", className: "CommentsComposer__buttonIcon CommentsComposer__buttonIcon--block" },
                    React.createElement(Icon24BlockOutline, null)))),
        React.createElement(ErrorModal, { errorText: errorModal.errorText, onClose: errorModal.close }),
        filePickerModal.isActive && (React.createElement(FilePicker, { onClose: filePickerModal.close, setAttachments: addAttachesWithLimit, addFileAttachments: uploadFilesWithLimit, selected: composerDraft.attaches.docs })),
        deleteEditingModal.isActive && (React.createElement(ModalInterface, { onClose: deleteEditingModal.close, closeLabel: lang.use('me_close'), contextClass: "MEConfig", title: lang.use('me_comment_delete_modal_title'), buttons: [
                React.createElement(Button, { mode: "tertiary", key: "cancel", onClick: deleteEditingModal.close }, lang.use('me_cancel')),
                React.createElement(Button, { mode: "primary", key: "submit", onClick: confirmDeleteEditing }, lang.use('me_comment_action_delete')),
            ] },
            React.createElement(FormattedLangKey, { values: { bold: (text) => React.createElement("b", null, text) }, langkey: 'me_comment_delete_modal_text' })))));
};
const mentionClassName = 'CommentsComposer__mention';
const mentionLinkClassName = 'CommentsComposer__mentionLink';
/**
 * Преобразует текст в HTML-строку, обрабатывая упоминания как ссылки внутри <span>.
 * Другие фрагменты текста добавляются как обычный текст.
 */
function transformRawToFormattedHtmlString(text) {
    const chunks = TextChunk.fromClientText(text);
    const fragment = document.createDocumentFragment();
    chunks.forEach((chunk) => {
        if (chunk?.kind === 'Mention') {
            const span = document.createElement('span');
            span.setAttribute('contenteditable', 'false');
            span.setAttribute('data-peer-id', chunk.peerId.toString());
            span.classList.add(mentionClassName);
            const link = document.createElement('a');
            link.setAttribute('draggable', 'false');
            link.classList.add(mentionLinkClassName);
            link.textContent = chunk.displayName;
            span.appendChild(link);
            fragment.appendChild(span);
        }
        else {
            fragment.appendChild(document.createTextNode(TextChunk.transformChunkToPlainText(chunk, { multiline: true })));
        }
    });
    const container = document.createElement('div');
    container.appendChild(fragment);
    return container.innerHTML;
}
/**
 * Преобразует HTML-строку обратно в текст, извлекая упоминания в формате [id<peerId>|<peerName>]
 * и оставляя обычный текст без изменений.
 */
function transformFormattedHtmlStringToRaw(html) {
    const container = document.createElement('div');
    container.innerHTML = html;
    return Array.from(container.childNodes)
        .map((node) => {
        // Для текстовой ноды возвращаем содержимое в виде текста
        if (node.nodeType === Node.TEXT_NODE) {
            return node.textContent;
        }
        const isEmojiNode = node instanceof Element &&
            node.tagName === 'IMG' &&
            node.classList.contains('Emoji');
        const isMentionNode = node instanceof Element && node.hasAttribute('data-peer-id');
        // Для меншена возвращаем строку в формате, считываемом бэкэндом
        if (isMentionNode) {
            const element = node;
            const peerId = element.dataset.peerId;
            const peerName = element.textContent?.trim();
            return `[id${peerId}|${peerName}]`;
        }
        // Для эмоджи отправляем контент, содержащийся в аттрибуте alt
        if (isEmojiNode) {
            const element = node;
            return element.alt;
        }
        return '';
    })
        .join('');
}
//# sourceMappingURL=CommentsComposer.js.map