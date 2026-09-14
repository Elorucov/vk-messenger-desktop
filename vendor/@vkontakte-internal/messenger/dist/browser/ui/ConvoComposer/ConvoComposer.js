import '../../ui/ConvoComposer/ConvoComposer.css';
import React, { useCallback, useEffect, useMemo, useRef, useState, useImperativeHandle, } from 'react';
import { useBrowserEnv, useDispatch, useFeatureFlags, useHelpHints, useOwner, useSelectConvo, useViewer, useCommunityMessagingWithToggle, } from '../../hooks/misc';
import { ComposerInput } from '../../ui/ComposerInput/ComposerInput';
import * as Peer from '../../../core/model/Peer';
import * as Convo from '../../../core/model/Convo';
import * as Message from '../../../core/model/Message';
import * as ComposerDraft from '../../../core/model/ComposerDraft';
import * as Sticker from '../../../core/model/Sticker';
import * as Viewer from '../../../core/model/Viewer';
import { Tooltip } from '../../ui/Tooltip/Tooltip';
import { Icon16Microphone, Icon24CancelOutline, Icon24ChevronDown, Icon24KeyboardBotsOutline, Icon24Stop, Icon24ArticleOutline, } from '@vkontakte/icons';
import { sanitizeText, } from '../../ui/ComposerInput/ComposerEditor';
import { ComposerMentionAutocomplete, } from '../../ui/ComposerMentionAutocomplete/ComposerMentionAutocomplete';
import { ComposerForward } from '../../ui/ComposerOverMessage/ComposerForward';
import { ComposerReply } from '../../ui/ComposerOverMessage/ComposerReply';
import { ComposerEditingMessage } from '../../ui/ComposerOverMessage/ComposerEditing';
import cx from 'classnames';
import { useConvoComposerDraft } from './useConvoComposerDraft';
import { ModalInterface } from '../../ui/ModalInterface/ModalInterface';
import { Button } from '@vkontakte/vkui';
import { FormattedLangKey } from '../../ui/FormattedLangKey/FormattedLangKey';
import { useModal } from '../../hooks/useModal';
import { useRouter } from '../../ui/Router/Router';
import { useErrorModal } from './useErrorModal';
import { useComposerAttachments } from './useComposerAttachments';
import { DropArea } from '../../ui/DropArea/DropArea';
import { ComposerAttaches } from '../../ui/ComposerAttaches/ComposerAttaches';
import { FilePicker } from '../../ui/FilePicker/FilePicker';
import { ErrorModal } from '../../ui/ErrorModal/ErrorModal';
import { PollCreateModal } from '../../ui/PollCreateModal/PollCreateModal';
import { StickerEmojiMenu } from '../../ui/StickerEmojiMenu/StickerEmojiMenu';
import { fromApiSticker, fromContextSticker, } from '../../../data/converter/StickerConverter';
import { StickersPanel } from '../../ui/StickersPanel/StickersPanel';
import { useStickerSuggestionsMenu } from '../../hooks/useStickerSuggestionsMenu';
import { StickerEmojiKeyboardVariant, } from '@vkontakte-internal/sticker-picker';
import { useVoiceRecording } from '../../hooks/useVoiceRecording';
import { VoiceRecording } from '../../ui/VoiceRecording/VoiceRecording';
import { useSnackbar } from '../../hooks/useSnackbar';
import { BotKeyboard } from '../../ui/BotKeyboard/BotKeyboard';
import { exhaustivenessCheck, noop } from '../../../core/utils/misc';
import { StickerContext } from '@vkontakte-internal/sticker';
import { MAX_MESSAGE_ATTACHES, MAX_MESSAGE_SIZE, } from '../../../core/config/config';
import { useSendUserActivity } from '../../hooks/useComposer';
import { MiniAppPicker } from '../../ui/MiniAppPicker/MiniAppPicker';
import { useStickerEmojiMenu } from '../../ui/StickerEmojiMenu/StickerEmojiMenuContext';
import { Avatar } from '../../ui/Avatar/Avatar';
import { subscribeCharKeysHandler } from '../../hooks/useKeyBoardHandlers';
import { useLayoutData } from '../../ui/LayoutDataProvider/LayoutDataProvider';
import { getKeyCombo } from '../../utils/keyBoardCombos';
import { ComposerFormattingMenu } from '../../ui/ComposerFormattingMenu/ComposerFormattingMenu';
import { useComposerFormatting } from '../../ui/ComposerFormattingMenu/useComposerFormatting';
import { useStickersPopupAnimationContext } from '../../hooks/useStickersPopupAnimation';
import { buildMessageFormatData } from '../../../data/utils/formatData/build';
import { useNow } from '../../hooks/useNow';
import { Time } from '../../../core/utils/time';
import { PostponedMessageCalendarModal } from '../../ui/PostponedMessageCalendarModal/PostponedMessageCalendarModal';
import { Templates } from '../../ui/Templates/Templates';
import { ClipButton } from '../../ui/ConvoComposer/ClipButton';
import { StickerMenuButton } from '../../ui/ConvoComposer/StickerMenuButton';
import { SendButton } from '../../ui/ConvoComposer/SendButton';
import { DeferredRendering } from '../../ui/DeferredRendering/DeferredRendering';
export const COMPOSER_TOOLTIP_OPEN_DELAY = 1000;
export const ConvoComposer = React.memo(({ peerId, className, composerDraft = ComposerDraft.empty(), stickers, stickersKeywords, hasBirthdayBanner, isCompactView = false, isBotKeyboardOpened, canUseMassMentions, showBirthdayStickers, isPostponed, setShowBirthdayStickers, onBotKeyboardSend, setBotKeyboardOpened, onCallbackButtonClick, scrollToMessage, onEscapePress, onMessageSend, onLastMessageEdit, onOpenStickersKeyboard, withAvatar, onlyNativePickers, disableStickerEmojiMenu, availableOnboardingTooltips, focusOnMount = true, focusOnCharKey, controlHandleRef, isNavigating, setIsNavigating, onNavigationStart, onOpenStickersSuggestionsBot, }) => {
    const owner = useOwner();
    const dispatch = useDispatch();
    const { lang, uploader, envFeatureFlags } = useBrowserEnv();
    const viewer = useViewer();
    const { settings } = viewer;
    const { screenRoute, navigate, rightPanel } = useRouter();
    const snackbar = useSnackbar();
    const helpHints = useHelpHints();
    const featureFlags = useFeatureFlags();
    const now = useNow();
    const { isMobileLayout } = useLayoutData();
    const isCtrlSubmitEnabled = Viewer.isCtrlSubmitEnabled(viewer, isMobileLayout);
    const { isEmptyConvo, isNewConvo, isCasperConvo, botKeyboard, isSendingPostponedAvailable, isUserConvo, } = useSelectConvo(peerId, useCallback((convo) => ({
        isEmptyConvo: Convo.isEmpty(convo),
        isNewConvo: Convo.isNew(convo),
        isCasperConvo: Convo.isCasper(convo),
        botKeyboard: convo.currentKeyboard,
        isSendingPostponedAvailable: Convo.postponedMessagingPermissions(convo)
            .isSendingPostponedAvailable,
        isUserConvo: convo.kind === 'UserConvo',
    }), []));
    const isCommunityMessaging = useCommunityMessagingWithToggle();
    const isPostponedMessagesAvailable = envFeatureFlags.isPostponedMessagesAvailable &&
        isSendingPostponedAvailable;
    const filePickerModal = useModal();
    const miniAppPickerModal = useModal();
    const errorModal = useErrorModal();
    const deleteEditingModal = useModal();
    const calendarModal = useModal();
    const [postponedSticker, setPostponedSticker] = useState();
    const $editor = useRef(null);
    const createEditor = useCallback((editor) => {
        $editor.current = editor;
    }, []);
    const updateUserActivity = useSendUserActivity(peerId, isPostponed);
    const [inputText, setInputText] = useState({
        value: '',
        selection: {
            from: 0,
            to: 0,
        },
    });
    const isDraftEmpty = useMemo(() => ComposerDraft.isEmpty(composerDraft, sanitizeText(inputText.value)), [composerDraft, inputText]);
    const isDraftEmptyOmitReply = useMemo(() => {
        const hasAttaches = Object.keys(composerDraft.attaches).length !== 0;
        return (sanitizeText(inputText.value).length === 0 &&
            !composerDraft.forward &&
            !hasAttaches &&
            !ComposerDraft.hasActiveUploads(composerDraft));
    }, [composerDraft, inputText]);
    const [isFocused, setIsFocused] = useState(false);
    const [areTemplatesOpened, setAreTemplatesOpened] = useState(false);
    const openErrorModalWithLangKey = useCallback((langKey) => {
        errorModal.open(lang.use(langKey));
    }, [errorModal, lang]);
    const { editing, forward, reply } = composerDraft;
    const isReplyOnClip = reply &&
        reply.kind === 'Normal' &&
        Message.isClipOnly(reply) &&
        !reply.isOut;
    const isReplyOnPost = reply &&
        reply.kind === 'Normal' &&
        !reply.isOut &&
        Message.isPostOnly(reply);
    const { cancelEditing, removeForward, removeReply, deleteEditingMessage } = useConvoComposerDraft({
        peerId,
        composerDraft,
        focusEditor: $editor.current?.focus,
        getEditorText: $editor.current?.getText,
        getEditorHtml: $editor.current?.getHtml,
        resetEditorText: $editor.current?.resetText,
        isDraftEmpty,
        isFocused,
        isPostponed,
    });
    const handleUploadProgressUpdate = useCallback((activityType) => {
        updateUserActivity(activityType);
    }, [updateUserActivity]);
    const { attaches, uploaderState, uploadFiles, addAttaches: addAttachesRaw, rearrangeAttaches, removeAttaches, } = useComposerAttachments({
        composerDraft,
        peerId,
        isChannel: false,
        isComment: false,
        isPostponed,
        groupId: owner.kind === 'Group' ? owner.id : undefined,
        onUploadStart: useCallback(() => {
            setBotKeyboardOpened(false);
            try {
                /**
                 * На Safari здесь возникает ошибка
                 * "InvalidStateError: The object is in an invalid state",
                 * если инпут недоступен (например при записи ГС)
                 */
                $editor.current?.focus();
            }
            catch { }
        }, [setBotKeyboardOpened]),
        onUploadProgressUpdate: handleUploadProgressUpdate,
    });
    const addAttaches = useCallback((attaches) => {
        addAttachesRaw(attaches);
        setBotKeyboardOpened(false);
        $editor.current?.focus();
    }, [addAttachesRaw, setBotKeyboardOpened]);
    const { voice: voiceRecord, activeVoice, startRecordingVoice, pauseRecordingVoice, resumeRecordingVoice, removeRecordingVoice, onVoiceRecordingStop, onVoiceRecordingRemove, } = useVoiceRecording(peerId, isPostponed, uploadFiles, openErrorModalWithLangKey);
    const voice = voiceRecord || uploaderState.voice || attaches.voice;
    const voiceRecordingInProgress = useRef(!!voiceRecord || !!activeVoice);
    voiceRecordingInProgress.current = !!voiceRecord || !!activeVoice;
    const removeRecordingVoiceRef = useRef(removeRecordingVoice);
    removeRecordingVoiceRef.current = removeRecordingVoice;
    const $mentionAutocomplete = useRef(null);
    const isConvoOwner = owner.id === peerId;
    const hasUploads = ComposerDraft.hasActiveUploads(composerDraft) &&
        !uploaderState.voice?.error;
    const shouldShowStickerEmojiMenu = !voice && !activeVoice;
    const canSendMessage = (!isDraftEmptyOmitReply || !!activeVoice || !!voice) && !hasUploads;
    const canRecord = isDraftEmptyOmitReply &&
        !editing &&
        !activeVoice &&
        !voice &&
        !isCompactView &&
        owner.kind !== 'Group';
    const canDrop = !activeVoice &&
        !voice &&
        !uploaderState.voice &&
        errorModal.errorText === undefined;
    const showSubmitIcon = canSendMessage && !editing;
    const showDisabledSubmitIcon = !showSubmitIcon && !canRecord && !hasUploads && !editing;
    const canSendExpiringMessage = !isCasperConvo;
    const attachesCount = Object.values(attaches).flat().length;
    const isTextOutOfLimit = inputText.value.length > MAX_MESSAGE_SIZE;
    const isAttachesOutOfLimit = attachesCount > MAX_MESSAGE_ATTACHES;
    const [messageSendOptions, setMessagesSendOptions] = useState(null);
    const triggerMessageSend = useCallback(async (extra) => {
        if (!$editor.current) {
            return;
        }
        if (uploaderState.voice && uploaderState.voice.error) {
            uploader.retryUpload(uploaderState.voice.id);
            return;
        }
        if (voiceRecord || activeVoice) {
            try {
                await onVoiceRecordingStop();
                await removeRecordingVoice();
                setMessagesSendOptions(extra);
            }
            catch { }
            return;
        }
        const sendText = sanitizeText($editor.current.getText());
        if (ComposerDraft.isEmpty(composerDraft, sendText) ||
            ComposerDraft.hasActiveUploads(composerDraft)) {
            return;
        }
        let formatData;
        if (featureFlags.vkm_composer_formatting) {
            const html = $editor.current?.getHtmlWithEmojisAsText();
            if (html) {
                formatData = buildMessageFormatData(html);
            }
        }
        $editor.current.resetText();
        onMessageSend(sendText, attaches, extra || formatData ? { ...(extra || {}), formatData } : {});
        dispatch({
            type: 'UserClearedComposerDraft',
            peerId,
            withoutLog: true,
            isPostponed,
        });
    }, [
        uploaderState.voice,
        voiceRecord,
        activeVoice,
        composerDraft,
        onMessageSend,
        attaches,
        dispatch,
        peerId,
        uploader,
        onVoiceRecordingStop,
        removeRecordingVoice,
        featureFlags.vkm_composer_formatting,
        isPostponed,
    ]);
    useEffect(() => {
        /**
         * Нам нужно отправить ГС сразу после его загрузки в случае,
         * если после записи пользователь нажал кнопку отправки.
         *
         * Процесс состоит из
         * 1) остановки записи
         * 2) ее загрузки
         * 3) ее добавления в драфт
         * 4) вызова метода отправки сообщения
         *
         * Если messageSendOptions === null, то загрузка произошла не по кнопке отправки сообщения,
         * а например, если пользователь во время записи ГС перешел в другой чат, в таком случае
         * произойдут пункты 1,2 и 3, а вот 4 позволим пользователю сделать самому по возвращению
         * в чат.
         */
        if (composerDraft.attaches.voice && messageSendOptions !== null) {
            triggerMessageSend(messageSendOptions);
            setMessagesSendOptions(null);
        }
    }, [composerDraft.attaches.voice, triggerMessageSend, messageSendOptions]);
    const handleCalendarOpen = useCallback(async () => {
        if (!calendarModal.isActive) {
            if (voiceRecordingInProgress) {
                try {
                    await onVoiceRecordingStop();
                }
                catch { }
            }
            calendarModal.open();
        }
    }, [calendarModal, onVoiceRecordingStop, voiceRecordingInProgress]);
    const handleCalendarClose = useCallback(() => {
        if (calendarModal.isActive) {
            calendarModal.close();
        }
        setPostponedSticker(undefined);
    }, [calendarModal]);
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
    const handleTemplateInsert = useCallback((template) => {
        if (!$editor.current) {
            return;
        }
        /**
         * см. handleEmojiInsert
         */
        $editor.current.focus();
        $editor.current.insertAtSelection(template, inputText.selection);
        setAreTemplatesOpened(false);
    }, [inputText.selection]);
    const { setAnimationShouldBeStopped: setPopupStickerAnimationShouldBeStopped, } = useStickersPopupAnimationContext();
    const handleStickerSend = useCallback((sticker, referrer = '') => {
        let attaches;
        let extra;
        if (sticker instanceof StickerContext) {
            const attach = fromContextSticker(sticker);
            switch (attach.kind) {
                case 'UgcSticker':
                    attaches = {
                        ugcSticker: attach,
                    };
                    extra = {
                        ugcSticker: {
                            referrer,
                        },
                    };
                    break;
                case 'Sticker':
                    attaches = {
                        sticker: attach,
                    };
                    extra = {
                        sticker: {
                            id: Sticker.resolveStickerId(attach.id),
                            referrer,
                        },
                    };
                    break;
                default:
                    exhaustivenessCheck(attach);
            }
        }
        else {
            attaches = {
                sticker: fromApiSticker(sticker),
            };
            extra = {
                sticker: {
                    id: Sticker.resolveStickerId(sticker.sticker_id),
                    referrer,
                },
            };
        }
        if (isPostponed) {
            setPostponedSticker({ attaches, extra });
            handleCalendarOpen();
        }
        else {
            onMessageSend('', attaches, extra);
        }
    }, [handleCalendarOpen, isPostponed, onMessageSend]);
    const { isOpen: isStickerEmojiMenuOpen, toggleIsOpen: toggleStickerEmojiMenuIsOpen, } = useStickerEmojiMenu();
    const [isStickerEmojiMenuClosing, setStickerEmojiMenuClosing] = useState(false);
    const extendedToggleStickersEmojiMenuIsOpen = useCallback((isOpen, withTimeout, handleToggle) => {
        setStickerEmojiMenuClosing(!isOpen);
        const onToggle = () => {
            if (isOpen) {
                onOpenStickersKeyboard?.();
                if (isMobileLayout) {
                    setPopupStickerAnimationShouldBeStopped(true);
                }
            }
            handleToggle?.();
            setStickerEmojiMenuClosing(false);
        };
        toggleStickerEmojiMenuIsOpen(isOpen, withTimeout, onToggle);
    }, [
        isMobileLayout,
        toggleStickerEmojiMenuIsOpen,
        setPopupStickerAnimationShouldBeStopped,
        onOpenStickersKeyboard,
    ]);
    const handleStickerMenuSend = useCallback((apiSticker, referrer) => {
        extendedToggleStickersEmojiMenuIsOpen(false, false);
        if (!isMobileLayout) {
            $editor.current?.focus();
        }
        handleStickerSend(apiSticker, referrer);
    }, [
        isMobileLayout,
        handleStickerSend,
        extendedToggleStickersEmojiMenuIsOpen,
    ]);
    const isSuggestionsHidden = () => {
        if (!settings.stickerHintsEnabled) {
            return true;
        }
        if (editing) {
            return true;
        }
        if (isEmptyConvo || showBirthdayStickers) {
            return false;
        }
        return !isFocused;
    };
    const handlePostponedMessageSend = (date) => {
        const delayedUntil = date
            ? date.getTime()
            : new Date(now + Time.Hour).getTime();
        if (postponedSticker) {
            const { attaches, extra } = postponedSticker;
            onMessageSend('', attaches, { ...extra, delayedUntil });
        }
        else {
            triggerMessageSend({ delayedUntil });
        }
        handleCalendarClose();
    };
    const withOnlyReplyOnClipStickers = isReplyOnClip &&
        !inputText.value &&
        featureFlags.vkm_reply_on_clip_stickers;
    const withOnlyReplyOnPostStickers = isReplyOnPost &&
        !inputText.value &&
        featureFlags.vkm_quick_sticker_suggest_post;
    const handleStickerSuggestionSend = useCallback((sticker) => {
        if (!$editor.current) {
            return;
        }
        if (!showBirthdayStickers) {
            $editor.current.resetText();
        }
        setShowBirthdayStickers?.(false);
        handleStickerSend(sticker.item, withOnlyReplyOnPostStickers
            ? 'wall_reaction'
            : 'im_new_conversation_suggestion');
    }, [
        handleStickerSend,
        setShowBirthdayStickers,
        showBirthdayStickers,
        withOnlyReplyOnPostStickers,
    ]);
    const { isVisible: isStickerSuggestionsVisible, setVisible: setStickerSuggestionsVisible, sendSticker: handleStickerSuggestionClick, suggestedStickers, stickerToPackMap, } = useStickerSuggestionsMenu({
        text: inputText.value,
        isDisabled: isSuggestionsHidden(),
        stickers,
        isEmptyConvo,
        isNewConvo,
        withOnlyBirthdayStickers: showBirthdayStickers,
        withOnlyReplyOnClipStickers,
        withOnlyReplyOnPostStickers,
        hasBirthdayBanner,
        onStickerSend: handleStickerSuggestionSend,
        stickersByKeywords: stickersKeywords,
    });
    const submitComposerDraft = useCallback((extra) => {
        switch (true) {
            // В редактируемом сообщении привышен лимит текста
            case editing && isTextOutOfLimit:
                errorModal.open(lang.use('me_message_edit_error_too_long'));
                break;
            // В редактируемом сообщении привышен лимит аттачей
            case editing && isAttachesOutOfLimit:
                errorModal.open(lang.use('me_message_edit_error_attaches_count'));
                break;
            // Редактируемое сообщение полностью пустое, значит удаляем его
            case editing && isDraftEmpty:
                deleteEditingModal.open();
                break;
            case isPostponed && canSendMessage:
                if (editing) {
                    triggerMessageSend(extra);
                }
                else {
                    handleCalendarOpen();
                }
                break;
            case canSendMessage:
                if (featureFlags.vkm_composer_formatting) {
                    const html = $editor.current?.getHtmlWithEmojisAsText();
                    if (!html) {
                        triggerMessageSend(extra);
                        break;
                    }
                    const formatData = buildMessageFormatData(html);
                    triggerMessageSend({ ...extra, formatData });
                }
                else {
                    triggerMessageSend(extra);
                }
                break;
            case hasUploads:
            case isCompactView:
                break;
            case canRecord:
                void startRecordingVoice();
                setBotKeyboardOpened(false);
                break;
            default:
                break;
        }
    }, [
        editing,
        isTextOutOfLimit,
        errorModal,
        lang,
        isAttachesOutOfLimit,
        isDraftEmpty,
        deleteEditingModal,
        canSendMessage,
        triggerMessageSend,
        hasUploads,
        isCompactView,
        startRecordingVoice,
        setBotKeyboardOpened,
        canRecord,
        isPostponed,
        handleCalendarOpen,
        featureFlags.vkm_composer_formatting,
    ]);
    const handleSmileIconClick = useCallback((event) => {
        if (!$editor.current) {
            return;
        }
        event.preventDefault();
        const nextIsStickerEmojiMenuOpen = !isStickerEmojiMenuOpen;
        const shouldFocus = isMobileLayout && !nextIsStickerEmojiMenuOpen;
        extendedToggleStickersEmojiMenuIsOpen(nextIsStickerEmojiMenuOpen, undefined, () => {
            const scrollToComposer = () => {
                if (!shouldFocus) {
                    return;
                }
                /**
                 * Доскролливаем до композера после закрытия меню стикеров,
                 * так как иначе он уезжает под виртуальную клавиатуру.
                 */
                $editor.current?.getElement().scrollIntoView();
            };
            setTimeout(scrollToComposer, 0);
        });
        /**
         * Для мобилок важно фокусить в обратчике пользовательского
         * действия, чтобы появилась виртуальная клавиатура
         */
        if (shouldFocus) {
            $editor.current.focus();
        }
    }, [
        isStickerEmojiMenuOpen,
        extendedToggleStickersEmojiMenuIsOpen,
        isMobileLayout,
    ]);
    const confirmDeleteEditing = useCallback(() => {
        deleteEditingModal.close();
        deleteEditingMessage(!isConvoOwner);
    }, [deleteEditingMessage, deleteEditingModal, isConvoOwner]);
    useEffect(() => {
        if (showBirthdayStickers) {
            $editor.current?.focus();
        }
    }, [showBirthdayStickers]);
    const composerFormatting = useComposerFormatting($editor.current?.getElement());
    const forciblyCloseFormatting = composerFormatting.forciblyClose;
    // Подписка на различные ивенты эдитора
    useEffect(() => $editor.current?.onContentChange((text, selection) => {
        setIsNavigating?.(false);
        setInputText(({ value: prevText }) => {
            if (prevText !== text) {
                forciblyCloseFormatting();
            }
            return {
                value: text,
                selection,
            };
        });
        setBotKeyboardOpened(false);
        updateUserActivity();
    }), [
        setBotKeyboardOpened,
        updateUserActivity,
        setIsNavigating,
        forciblyCloseFormatting,
    ]);
    useEffect(() => $editor.current?.onPaste((files) => {
        uploadFiles(files);
    }), [uploadFiles]);
    useEffect(() => $editor.current?.onFocusChange((isFocused) => {
        setIsFocused(isFocused);
        if (!isFocused) {
            setShowBirthdayStickers?.(false);
        }
    }), [setShowBirthdayStickers]);
    useEffect(() => $editor.current?.onMouseDown(), []);
    useEffect(() => {
        if (!focusOnCharKey || screenRoute.kind !== 'ConvoRoute') {
            return;
        }
        return subscribeCharKeysHandler((event) => {
            event.preventDefault();
            event.stopPropagation();
            $editor.current?.focus();
            $editor.current?.insertAtSelection(event.key);
        });
    }, [focusOnCharKey, screenRoute]);
    useEffect(() => {
        const handleKeyCombo = (keyCombo, event) => {
            if (!$mentionAutocomplete.current || !$editor.current) {
                return;
            }
            switch (keyCombo) {
                case 'Mod+Enter': {
                    event.stopPropagation();
                    if (isCtrlSubmitEnabled) {
                        /**
                         * Не даем начинать запись ГС по нажатию на Mod+Enter
                         */
                        if (canRecord) {
                            return;
                        }
                        submitComposerDraft();
                    }
                    else {
                        $editor.current.insertAtSelection('\n');
                    }
                    return;
                }
                case 'Tab': {
                    /**
                     * TODO: https://jira.mvk.com/browse/ME-75647
                     * Необходимо доработать переход в режим навигации по сообщениям.
                     * Проблема заключается в том, что для слабовидящих пользователей добавляется один лишний шаг в навигации через TAB
                     * и этот шаг никак не описан, следовательно это путает пользователя, так как нажатие TAB подразумеваем переход к следующему элементу.
                     * Необходимо чтобы при нажатии на TAB польователь получал информацию о том, что включился режим навигации по сообщениям.
                     */
                    /* if (!isNavigating && setIsNavigating) {
                      event.stopPropagation()
                      event.preventDefault()
                      setIsNavigating?.(true)
                      return
                    }
        
                    if (isNavigating) setIsNavigating?.(false) */
                    return;
                }
                case 'Enter': {
                    // Если панель стикеров открыта, блокируем все действия кроме выбора эмоджи
                    if (isStickerEmojiMenuOpen) {
                        return;
                    }
                    event.stopPropagation();
                    if ($mentionAutocomplete.current.hasSuggestions()) {
                        event.preventDefault();
                        $mentionAutocomplete.current.acceptSelected();
                        return;
                    }
                    if (!isCtrlSubmitEnabled) {
                        event.preventDefault();
                        /**
                         * Не даем начинать запись ГС по нажатию на Enter
                         */
                        if (canRecord) {
                            return;
                        }
                        submitComposerDraft();
                    }
                    return;
                }
                case 'Escape': {
                    event.stopPropagation();
                    event.preventDefault();
                    if (isStickerSuggestionsVisible) {
                        setStickerSuggestionsVisible(false);
                        return;
                    }
                    if ($mentionAutocomplete.current.hasSuggestions()) {
                        $mentionAutocomplete.current.reset();
                        return;
                    }
                    if (editing) {
                        cancelEditing();
                        return;
                    }
                    if (isNavigating && setIsNavigating) {
                        setIsNavigating(false);
                        return;
                    }
                    onEscapePress?.();
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
                    // Перемещенеи внутри автокомплита
                    if ($mentionAutocomplete.current.hasSuggestions() &&
                        (keyCombo === 'ArrowUp' || keyCombo === 'ArrowDown')) {
                        event.preventDefault();
                        return $mentionAutocomplete.current.move({
                            ArrowUp: 'up',
                            ArrowDown: 'down',
                        }[keyCombo]);
                    }
                    // Переход к навигации по сообщениям.
                    if (keyCombo === 'ArrowUp' && isNavigating && onNavigationStart) {
                        event.preventDefault();
                        onNavigationStart();
                        return;
                    }
                    // Редактирование последнего сообщения
                    if (keyCombo === 'ArrowUp' && isDraftEmpty) {
                        event.preventDefault();
                        return onLastMessageEdit();
                    }
                    return;
                }
                case 'Mod+B':
                case 'Mod+U':
                case 'Mod+I':
                case 'Mod+S':
                case 'Mod+K': {
                    event.preventDefault();
                    if (!featureFlags.vkm_composer_formatting) {
                        return;
                    }
                    switch (keyCombo) {
                        case 'Mod+B':
                            composerFormatting.bold();
                            return;
                        case 'Mod+I':
                            composerFormatting.italic();
                            return;
                        case 'Mod+U':
                            composerFormatting.underline();
                            return;
                        // case 'Mod+S':
                        //   composerFormatting.strikethrough()
                        //   return
                        case 'Mod+K':
                            if (!composerFormatting.isLinkInputOpen) {
                                composerFormatting.openLinkInput();
                            }
                            return;
                        default:
                            return;
                    }
                }
                case 'Shift+Enter': {
                    /**
                     * Делаем так, чтобы текущий формат (жирный, подчеркнутый и тд)
                     * не наследовался после переноса строки
                     * https://jira.mvk.com/browse/ME-66640
                     */
                    $editor.current.removeFormat();
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
        isCtrlSubmitEnabled,
        editing,
        isDraftEmpty,
        canRecord,
        composerDraft,
        cancelEditing,
        onLastMessageEdit,
        submitComposerDraft,
        extendedToggleStickersEmojiMenuIsOpen,
        onEscapePress,
        isStickerEmojiMenuOpen,
        isStickerSuggestionsVisible,
        setStickerSuggestionsVisible,
        isNavigating,
        setIsNavigating,
        onNavigationStart,
        composerFormatting,
        featureFlags.vkm_composer_formatting,
    ]);
    useEffect(() => {
        if (featureFlags.vkm_composer_formatting) {
            $editor.current?.resetText(composerDraft.html, true, focusOnMount);
        }
        else {
            $editor.current?.resetText(composerDraft.text, false, focusOnMount);
        }
        return () => {
            $editor.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    /**
     * Если велась запись голосового сообщения во время начала редактирования
     * другого сообщения, то показываем снекбар с отменой записи
     */
    useEffect(() => {
        if (editing && voiceRecordingInProgress.current) {
            snackbar({
                message: lang.use('me_voice_recording_cancelled'),
            });
            void removeRecordingVoiceRef.current();
        }
    }, [editing, lang, snackbar]);
    const handleTemplateToggleClick = () => {
        if (!areTemplatesOpened) {
            updateUserActivity('choosing_template');
        }
        setAreTemplatesOpened(!areTemplatesOpened);
    };
    useImperativeHandle(controlHandleRef, () => ({
        focus: () => $editor.current?.focus(),
    }), [$editor]);
    const handleComposerFocusChange = useCallback(() => {
        setIsNavigating?.(false);
    }, [setIsNavigating]);
    const handleComposerKeyDown = useCallback((event) => {
        const keyCombo = getKeyCombo(event);
        if (!keyCombo)
            return;
        const { code } = keyCombo;
        switch (code) {
            case 'Escape': {
                if (isStickerEmojiMenuOpen) {
                    event.stopPropagation();
                    event.preventDefault();
                    toggleStickerEmojiMenuIsOpen(!isStickerEmojiMenuOpen);
                }
                return;
            }
            case 'Tab':
            case 'Shift+Tab': {
                event.stopPropagation();
                // Закрываем стикерпикер при смене фокуса.
                if (isStickerEmojiMenuOpen) {
                    toggleStickerEmojiMenuIsOpen(!isStickerEmojiMenuOpen);
                }
                return;
            }
            default:
                return;
        }
    }, [isStickerEmojiMenuOpen, toggleStickerEmojiMenuIsOpen]);
    const handleLoadMoreMembers = useCallback(() => {
        if (!Peer.isChatPeerId(peerId)) {
            return;
        }
        dispatch({
            type: 'LoadChatMembers',
            peerId,
        });
    }, [dispatch, peerId]);
    const isSendingPostponedMessagesOnboardingVisible = isPostponedMessagesAvailable &&
        showSubmitIcon &&
        !rightPanel &&
        !isPostponed &&
        helpHints.has('im:sending_postponed_messages');
    const rightButtons = (React.createElement(React.Fragment, null,
        !disableStickerEmojiMenu && shouldShowStickerEmojiMenu && (React.createElement(StickerMenuButton, { peerId: peerId, onClick: handleSmileIconClick, isStickerEmojiMenuOpen: isStickerEmojiMenuOpen, isCompactView: isCompactView, extendedToggleStickersEmojiMenuIsOpen: extendedToggleStickersEmojiMenuIsOpen, onStickerSend: handleStickerMenuSend, onEmojiInsert: handleEmojiInsert })),
        React.createElement(SendButton, { triggerMessageSend: triggerMessageSend, isPostponed: isPostponed, isSendingPostponedMessagesOnboardingVisible: isSendingPostponedMessagesOnboardingVisible, isPostponedMessagesAvailable: isPostponedMessagesAvailable, canSendExpiringMessage: canSendExpiringMessage, sendPostponedMessage: handleCalendarOpen, showSubmitIcon: showSubmitIcon, showOnboarding: showSubmitIcon && screenRoute.kind === 'ConvoRoute' && !rightPanel, showDisabledSubmitIcon: showDisabledSubmitIcon, canRecord: canRecord, hasEditing: !!editing, isDraftEmpty: isDraftEmpty, isConvoOwner: isConvoOwner, hasUploads: hasUploads, isOutOfLimit: isTextOutOfLimit || isAttachesOutOfLimit, submitComposerDraft: submitComposerDraft, isSendOptionsOnboardingVisible: showSubmitIcon &&
                helpHints.has('im:web_send_options') &&
                availableOnboardingTooltips.has('im:web_send_options') &&
                !rightPanel })));
    return (React.createElement("div", { className: cx(className, 'ConvoComposer', {
            'ConvoComposer--navigating': isFocused && isNavigating,
        }), onFocus: handleComposerFocusChange, onKeyDown: handleComposerKeyDown },
        React.createElement(DropArea, { disabled: !canDrop, onFilesAdd: uploadFiles }),
        React.createElement(StickersPanel, { className: "ConvoComposer__stickersPanel", text: inputText.value, isOpen: isStickerSuggestionsVisible, stickers: suggestedStickers, stickerToPackMap: stickerToPackMap, size: isCompactView ? 64 : 96, withKeywordsBotLink: !withOnlyReplyOnClipStickers && !withOnlyReplyOnPostStickers, onStickerClick: handleStickerSuggestionClick, onOpenStickersSuggestionsBot: onOpenStickersSuggestionsBot }),
        editing && !isBotKeyboardOpened && (React.createElement(ComposerEditingMessage, { className: "ConvoComposer__editing", isCompactView: isCompactView, message: editing, onCancelEditing: cancelEditing })),
        reply && !isBotKeyboardOpened && (React.createElement(ComposerReply, { className: "ConvoComposer__reply", isCompactView: isCompactView, reply: reply, scrollToMessage: scrollToMessage, onRemoveReply: removeReply })),
        forward && !isBotKeyboardOpened && (React.createElement(ComposerForward, { className: "ConvoComposer__reply", isCompactView: isCompactView, forward: forward, onRemoveForward: removeForward })),
        React.createElement(ComposerMentionAutocomplete, { ref: $mentionAutocomplete, isInputFocused: isFocused, className: cx('ConvoComposer__mentionAutocomplete', {
                'ConvoComposer__mentionAutocomplete--compact': isCompactView,
                'ConvoComposer__mentionAutocomplete--rounded': (!reply && !forward && !editing) || isBotKeyboardOpened,
            }), searchText: inputText.value, onInsert: $editor.current?.insertAtSelection || noop, textSelection: inputText.selection, maxDisplayCount: 4, loadMoreMembers: handleLoadMoreMembers, searchSpecial: canUseMassMentions, peerId: peerId, isCompactView: isCompactView }),
        isBotKeyboardOpened && botKeyboard && !isPostponed && (React.createElement(BotKeyboard, { className: "ConvoComposer__botKeyboard", keyboard: botKeyboard, onButtonClick: onBotKeyboardSend, onCallbackButtonClick: onCallbackButtonClick, isCompact: isCompactView })),
        isCommunityMessaging &&
            !voice &&
            !activeVoice &&
            areTemplatesOpened &&
            owner.kind === 'Group' /* явно указываем тип для owner */ && (React.createElement(Templates, { className: "ConvoComposer__templates", owner: owner, peerId: peerId, viewer: viewer.viewer, onTemplateInsert: handleTemplateInsert })),
        !isBotKeyboardOpened && (React.createElement(ComposerAttaches, { className: cx('ConvoComposer__attaches', {
                'ConvoComposer__attaches--compact': isCompactView,
            }), source: "composer", isCompactView: isCompactView, attaches: attaches, optimistAttaches: uploaderState, onRemove: removeAttaches, rearrangeAttachments: rearrangeAttaches })),
        React.createElement("div", { className: "ConvoComposer__inputPanel" },
            !voice && !activeVoice ? (React.createElement(React.Fragment, null,
                withAvatar && (React.createElement(Tooltip, { content: Peer.name(owner) },
                    React.createElement("div", { className: "ConvoComposer__avatar" },
                        React.createElement(Avatar, { size: 24, peer: owner, withOnline: false })))),
                React.createElement(ClipButton, { peerId: peerId, onlyNativePickers: onlyNativePickers, addAttaches: addAttaches, openErrorModalWithLangKey: openErrorModalWithLangKey, filePickerModal: filePickerModal, miniAppPickerModal: miniAppPickerModal, isPostponed: isPostponed, isConvoOwner: isConvoOwner, isCompactView: isCompactView, addFileAttachments: uploadFiles }))) : (React.createElement("div", { className: "ConvoComposer__remove-record" },
                React.createElement("button", { className: "ConvoComposer__button ConvoComposer__buttonIcon--removeRecord", "aria-label": lang.use('me_composer_cancel_recording_tooltip'), onClick: () => {
                        onVoiceRecordingRemove(uploaderState.voice?.id);
                    } },
                    React.createElement(Tooltip, { content: lang.use('me_composer_cancel_recording_tooltip'), align: "center", position: "top", delay: COMPOSER_TOOLTIP_OPEN_DELAY },
                        React.createElement("i", { role: "img", className: "ConvoComposer__buttonIcon" },
                            React.createElement(Icon24CancelOutline, null)))))),
            React.createElement(ComposerInput, { onCreate: createEditor, inputMode: 
                /**
                 * Важно сменить inputMode когда меню стикеров
                 * только начало закрываться, поскольку для
                 * мобилок требуется фокусировать композер сразу
                 * в обработчике клика для появления виртуальной
                 * клавиатуры.
                 */
                !isStickerEmojiMenuClosing && isStickerEmojiMenuOpen
                    ? 'none'
                    : 'text', className: cx('ConvoComposer__inputWrapper', {
                    'ConvoComposer__inputWrapper--hidden': voice || activeVoice,
                }), inputClassName: "ConvoComposer__input", placeholderClassName: "ConvoComposer__inputPlaceholder", placeholder: lang.use('me_composer_input_placeholder'), onClick: handleComposerFocusChange }),
            $editor.current && featureFlags.vkm_composer_formatting && (React.createElement(ComposerFormattingMenu, { composerFormatting: composerFormatting, root: $editor.current.getElement(), withLinkPreview: !isMobileLayout })),
            (voice || activeVoice) && (React.createElement("div", { className: "ConvoComposer__voice" },
                React.createElement(VoiceRecording, { peerId: peerId, voice: voice || activeVoice }, voiceRecord && !(!!attaches.voice || !!uploaderState.voice) ? (React.createElement("button", { className: "ConvoComposer__button ConvoComposer__buttonIcon--startRecording", "aria-label": lang.use('me_composer_continue_recording_tooltip'), onClick: resumeRecordingVoice },
                    React.createElement(Tooltip, { content: lang.use('me_composer_continue_recording_tooltip'), align: "center", position: "top", delay: COMPOSER_TOOLTIP_OPEN_DELAY },
                        React.createElement("i", { role: "img", className: "ConvoComposer__buttonIcon" },
                            React.createElement(Icon16Microphone, null))))) : (activeVoice && (React.createElement("button", { className: "ConvoComposer__button ConvoComposer__buttonIcon--stopRecording", "aria-label": lang.use('me_composer_stop_recording_tooltip'), onClick: pauseRecordingVoice },
                    React.createElement(Tooltip, { content: lang.use('me_composer_stop_recording_tooltip'), align: "center", position: "top", delay: COMPOSER_TOOLTIP_OPEN_DELAY },
                        React.createElement("i", { role: "img", className: "ConvoComposer__buttonIcon" },
                            React.createElement(Icon24Stop, { width: 16, height: 16 }))))))))),
            !voice && !activeVoice && botKeyboard && !isPostponed && (React.createElement("button", { className: cx('ConvoComposer__button', {
                    'ConvoComposer__botKeyboardButton--opened': isBotKeyboardOpened,
                    'ConvoComposer__botKeyboardButton--closed': !isBotKeyboardOpened,
                }), onClick: () => setBotKeyboardOpened(!isBotKeyboardOpened) },
                React.createElement("i", { className: "ConvoComposer__buttonIcon ConvoComposer__buttonIcon--botKeyboardOpened" },
                    React.createElement(Icon24ChevronDown, null)),
                React.createElement("i", { className: "ConvoComposer__buttonIcon ConvoComposer__buttonIcon--botKeyboardClosed" },
                    React.createElement(Icon24KeyboardBotsOutline, null)))),
            !voice &&
                !activeVoice &&
                isCommunityMessaging &&
                isUserConvo &&
                !isPostponed && (React.createElement("button", { className: cx('ConvoComposer__button', {
                    'ConvoComposer__templatesButton--opened': areTemplatesOpened,
                    'ConvoComposer__templatesButton--closed': !areTemplatesOpened,
                }), onClick: handleTemplateToggleClick },
                React.createElement("i", { className: "ConvoComposer__buttonIcon ConvoComposer__buttonIcon--templatesOpened" },
                    React.createElement(Icon24ChevronDown, null)),
                React.createElement("i", { className: "ConvoComposer__buttonIcon ConvoComposer__buttonIcon--templatesClosed" },
                    React.createElement(Icon24ArticleOutline, null)))),
            React.createElement(DeferredRendering, null, rightButtons)),
        isMobileLayout && isStickerEmojiMenuOpen && (React.createElement("div", { className: "ConvoComposer__stickerEmojiMenuFooter" },
            React.createElement(StickerEmojiMenu, { peerId: peerId, isVisible: isStickerEmojiMenuOpen, variant: StickerEmojiKeyboardVariant.ADAPTIVE, onStickerSend: handleStickerMenuSend, onEmojiInsert: handleEmojiInsert }))),
        screenRoute.createPoll && (React.createElement(PollCreateModal, { onClose: () => navigate({ ...screenRoute, createPoll: false }), onCreate: (poll) => addAttaches({ poll }), onError: openErrorModalWithLangKey, pollDraft: attaches.poll })),
        filePickerModal.isActive && (React.createElement(FilePicker, { onClose: filePickerModal.close, setAttachments: addAttaches, addFileAttachments: uploadFiles, selected: composerDraft.attaches.docs })),
        miniAppPickerModal.isActive && (React.createElement(MiniAppPicker, { onClose: miniAppPickerModal.close, peerId: peerId })),
        React.createElement(ErrorModal, { errorText: errorModal.errorText, onClose: errorModal.close }),
        calendarModal.isActive && (React.createElement(PostponedMessageCalendarModal, { onSave: handlePostponedMessageSend, onClose: calendarModal.close })),
        deleteEditingModal.isActive && (React.createElement(ModalInterface, { onClose: deleteEditingModal.close, closeLabel: lang.use('me_close'), contextClass: "MEConfig", title: lang.use('me_message_delete_modal_title'), buttons: [
                React.createElement(Button, { mode: "tertiary", key: "cancel", onClick: deleteEditingModal.close }, lang.use('me_cancel')),
                React.createElement(Button, { mode: "primary", key: "submit", onClick: confirmDeleteEditing }, lang.use('me_message_action_delete')),
            ] },
            React.createElement(FormattedLangKey, { values: { bold: (text) => React.createElement("b", null, text) }, langkey: isConvoOwner
                    ? 'me_message_delete_modal_text'
                    : 'me_message_delete_for_all_modal_text' })))));
});
//# sourceMappingURL=ConvoComposer.js.map