import '../../ui/ChannelComposer/ChannelComposer.css';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, } from 'react';
import { Icon20AdvertisingCheckOutline, Icon20AdvertisingOutline, Icon20CameraOutline, Icon20DocumentOutline, Icon20PollOutline, Icon20VideoCircleOutline, Icon20MusicOutline, Icon24AddCircleOutline, Icon24GearOutline, Icon24Send, Icon24SmileOutline, Icon28SendClock, Icon28HistoryForwardOutline, Icon20Cancel, } from '@vkontakte/icons';
import { useBrowserEnv, useDispatch, useFeatureFlags, useViewer, } from '../../hooks/misc';
import { ComposerInput } from '../../ui/ComposerInput/ComposerInput';
import { sanitizeText, } from '../../ui/ComposerInput/ComposerEditor';
import { Spinner } from '@vkontakte/vkui';
import { isSameYear } from '../../../core/utils/misc';
import * as Viewer from '../../../core/model/Viewer';
import * as ChannelComposerDraft from '../../../core/model/ChannelComposerDraft';
import * as Post from '../../../core/model/Post';
import * as Attach from '../../../core/model/Attach';
import { OptionsListSelect, OptionsListSelectItem, OptionsListSelectTrigger, } from '../../ui/OptionsListSelect/OptionsListSelect';
import { useSendOptions } from './useSendOptions';
import { useErrorModal } from '../../ui/ConvoComposer/useErrorModal';
import { IApi } from '../../../data/env/IApi';
import { ErrorModal } from '../../ui/ErrorModal/ErrorModal';
import { IPerfStats } from '../../../data/env/IPerfStats';
import { CalendarModalNew } from '../../ui/CalendarModal/CalendarModalNew';
import { useModal } from '../../hooks/useModal';
import { useLayoutData } from '../../ui/LayoutDataProvider/LayoutDataProvider';
import { FormattedLangKey } from '../../ui/FormattedLangKey/FormattedLangKey';
import { ComposerAttaches } from '../../ui/ComposerAttaches/ComposerAttaches';
import { useComposerAttachments } from '../../ui/ConvoComposer/useComposerAttachments';
import { DropArea } from '../../ui/DropArea/DropArea';
import { FilePicker } from '../../ui/FilePicker/FilePicker';
import { exhaustivenessCheck } from '../../../core/utils/misc';
import { PollCreateModal } from '../../ui/PollCreateModal/PollCreateModal';
import { useRouter } from '../../ui/Router/Router';
import { IMAGE_TYPES, VIDEO_TYPES } from '../../../data/env/Uploader';
import { StickerEmojiMenuPopper } from '../../ui/StickerEmojiMenu/StickerEmojiMenu';
import { StickerEmojiKeyboardVariant, Tab, } from '@vkontakte-internal/sticker-picker';
import { ComposerEditingPost } from '../../ui/ComposerOverMessage/ComposerEditing';
import { useStickerEmojiMenu } from '../../ui/StickerEmojiMenu/StickerEmojiMenuContext';
import { useVkcomMediaPickers } from '../../ui/ConvoComposer/useVkcomMediaPickers';
import { ChannelComposerForward } from '../../ui/ChannelComposerForward/ChannelComposerForward';
import { ActionsMenuAction, ActionsMenuSeparator, } from '../../ui/ActionsMenu/ActionsMenu';
import { POST_ADS_MINIAPP_ID } from '../../../core/config/config';
import cx from 'classnames';
import { useUrlSnippets } from '../../ui/ChannelComposer/useUrlSnippets';
import { useSnackbar } from '../../hooks/useSnackbar';
import { useNow } from '../../hooks/useNow';
import { useApiFetch } from '../../hooks/useApiFetch';
import { ChannelComposerPushHint } from '../../ui/ChannelComposerPushHint/ChannelComposerPushHint';
import { subscribeCharKeysHandler } from '../../hooks/useKeyBoardHandlers';
const DAY_IN_SEC = 60 * 60 * 24;
export const ChannelComposer = ({ channelId, parentId, canSendDonut, composerDraft, isCommentsRestricted, isCommunityChannel, onClose, }) => {
    const viewer = useViewer();
    const isEdu = Viewer.isEdu(viewer.profileType);
    const { lang, perfStats, vkcom_me, stats } = useBrowserEnv();
    const { vkm_donut_setting_onboarding } = useFeatureFlags();
    const apiFetch = useApiFetch();
    const dispatch = useDispatch();
    const { isMobileLayout } = useLayoutData();
    const isCtrlSubmitEnabled = Viewer.isCtrlSubmitEnabled(viewer, isMobileLayout);
    const { screenRoute, navigate } = useRouter();
    const [isSendOptionsOpen, setIsSendOptionsOpen] = useState(false);
    const errorModal = useErrorModal();
    const snackbar = useSnackbar();
    const filePickerModal = useModal();
    const calendarModal = useModal();
    const $fileInput = useRef(null);
    const $editor = useRef(null);
    const createEditor = useCallback((editor) => {
        $editor.current = editor;
    }, []);
    const now = useNow();
    const getPlannedDate = () => {
        return dateOption ?? new Date(now);
    };
    const [{ value: inputText }, setInputText] = useState({
        value: composerDraft.text,
        selection: {
            from: 0,
            to: 0,
        },
    });
    const [, setIsFocused] = useState(false);
    // Различные опции отправки поста
    const [visibilityOption, setVisibilityOption] = useState(composerDraft.visibility);
    const [donutDelayOption, setDonutDelayOption] = useState(composerDraft.donutDelay);
    const isDraftEmpty = ChannelComposerDraft.isEmpty(composerDraft, sanitizeText(inputText));
    const hasUploads = ChannelComposerDraft.hasActiveUploads(composerDraft);
    const canSend = !isDraftEmpty && !hasUploads;
    const isPostponedChannelRoute = Boolean(screenRoute.kind === 'ChannelRoute' && screenRoute.postponed);
    const [isPostponed, setIsPostponed] = useState(composerDraft.date !== undefined);
    const showLoadingIcon = hasUploads;
    const showSubmitIcon = !showLoadingIcon;
    const showAdsMenuAction = !isEdu && !composerDraft.editing && !composerDraft.forward;
    const canShowDonsAction = () => {
        // Если хотя бы одно из этих условий выполняется, тогда не показываем действия для донов
        if (!canSendDonut || isEdu || screenRoute.kind !== 'ChannelRoute') {
            return false;
        }
        // Если редактируем НЕ донатный пост, тогда так же не показываем действия
        if (composerDraft.editing && visibilityOption !== 'donut') {
            return false;
        }
        return true;
    };
    const showPostponedAction = screenRoute.kind === 'ChannelRoute' &&
        !screenRoute.postponed &&
        !composerDraft.editing;
    const { sendOptions, handleSendOptionClick, toggleSendOptionDisabled, resetInitialSendOptions, } = useSendOptions(composerDraft.sendOptions);
    const filterSendOptions = (optionKey) => {
        if (optionKey === 'enable_comments') {
            return !isCommentsRestricted;
        }
        else if (optionKey === 'signed') {
            return !!composerDraft.forward ? false : true;
        }
        return true;
    };
    useEffect(() => {
        resetInitialSendOptions();
        composerDraft.sendOptions.selected.forEach((o) => handleSendOptionClick(o));
        composerDraft.sendOptions.disabled.forEach((o) => toggleSendOptionDisabled(o, true));
    }, [
        composerDraft.sendOptions,
        handleSendOptionClick,
        toggleSendOptionDisabled,
        resetInitialSendOptions,
    ]);
    useEffect(() => {
        $editor.current?.resetText(composerDraft.text);
    }, [composerDraft.text]);
    useEffect(() => {
        setVisibilityOption(composerDraft.visibility);
    }, [composerDraft.visibility]);
    useEffect(() => {
        setDonutDelayOption(composerDraft.donutDelay);
    }, [composerDraft.donutDelay]);
    const isPushHintAvailable = !isDraftEmpty && !sendOptions.selected.has('mute_notifications');
    const [dateOption, setDateOption] = useState(composerDraft.date ? new Date(composerDraft.date * 1000) : undefined);
    const hasLoggedSettingsOpenRef = useRef(false);
    const handleOpenSendOptions = useCallback(() => {
        setIsSendOptionsOpen(true);
        if (hasLoggedSettingsOpenRef.current) {
            return;
        }
        hasLoggedSettingsOpenRef.current = true;
        stats.logEvent({
            type: 'type_action',
            type_action: {
                type: 'type_messaging_action_item',
                type_messaging_action_item: {
                    action_type: 'CLICK_ON_SETTINGS',
                },
            },
        });
    }, [stats]);
    const handleCalendarOpen = useCallback(() => {
        if (!calendarModal.isActive) {
            calendarModal.open();
        }
    }, [calendarModal]);
    const handleCalendarClose = useCallback(() => {
        if (calendarModal.isActive) {
            calendarModal.close();
        }
    }, [calendarModal]);
    const shouldOpenCalendarModal = isMobileLayout ||
        (screenRoute.kind === 'ChannelRoute' && !composerDraft.editing);
    const handleDateChange = useCallback((date) => {
        setDateOption(date);
        if (!date || shouldOpenCalendarModal) {
            handleCalendarClose();
            // Для страницы отложенных сообщений в каналах - всегда true
            setIsPostponed(isPostponedChannelRoute);
        }
    }, [handleCalendarClose, shouldOpenCalendarModal, isPostponedChannelRoute]);
    const resetDateOption = useCallback(() => handleDateChange(), [handleDateChange]);
    const resetOptions = useCallback(() => {
        setDonutDelayOption(-1);
        setVisibilityOption('all');
        resetDateOption();
        resetInitialSendOptions();
    }, [resetDateOption, resetInitialSendOptions]);
    const { uploaderState, attaches, addAttaches, uploadFiles, rearrangeAttaches, removeAttaches, } = useComposerAttachments({
        composerDraft,
        channelId,
        isPostponed: false,
        isChannel: true,
        isComment: false,
        channelParentId: parentId,
    });
    const { isOpen: isStickerEmojiMenuOpen, toggleIsOpen: toggleStickerEmojiMenuIsOpen, } = useStickerEmojiMenu();
    const handlePhotoVideoAttachClick = useCallback((type) => {
        const el = $fileInput.current;
        if (!el) {
            return;
        }
        el.name = type;
        switch (type) {
            case 'photo':
                el.accept = IMAGE_TYPES.join(',');
                break;
            case 'video':
                el.accept = VIDEO_TYPES.join(',');
                break;
            default:
                exhaustivenessCheck(type);
        }
        el.value = '';
        el.click();
    }, []);
    const handleFileInputChange = useCallback(({ target: { files: fileList, name } }) => {
        const files = Array.from(fileList || []);
        if (!files.length) {
            return;
        }
        uploadFiles(files, { asFiles: name === 'uploadDocument' });
    }, [uploadFiles]);
    const onCancelEdit = useCallback(() => {
        dispatch({
            type: 'UserClearedChannelComposerDraft',
            channelId,
        });
    }, [dispatch, channelId]);
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
    const onFail = useCallback((error) => {
        const errorText = error instanceof IApi.RequestError
            ? getErrorText(error, lang)
            : lang.use('me_channel_composer_error_unknown');
        snackbar({
            message: errorText,
        });
    }, [lang, snackbar]);
    const handlePostSend = useCallback(async (publishDate = dateOption) => {
        const editor = $editor.current;
        if (!editor) {
            return;
        }
        const sendText = sanitizeText(editor.getText());
        if (!canSend) {
            return;
        }
        const onComplete = () => {
            perfStats?.addEventData(IPerfStats.EventType.channelPostSent, {
                sendEnd: perfStats.getCurrentTime(),
            });
            const event = perfStats?.getEvent(IPerfStats.EventType.channelPostSent);
            if (event) {
                perfStats?.logEvent(event);
                perfStats?.removeEvent(IPerfStats.EventType.channelPostSent);
            }
            editor.resetText();
            resetOptions();
            dispatch({
                type: 'UserClearedChannelComposerDraft',
                channelId,
            });
        };
        const onSendPostponedComplete = (cmid) => {
            onComplete();
            if (screenRoute.kind === 'ChannelRoute') {
                navigate({ ...screenRoute, postponed: cmid });
            }
        };
        const postponedCommonParams = {
            channel_id: channelId,
            message: sendText,
            attachments: Attach.ids(attaches).join(','),
            close_comments: convertBoolOption(!sendOptions.selected.has('enable_comments')),
            signed: convertBoolOption(sendOptions.selected.has('signed')),
            donut_paid_duration: visibilityOption === 'all'
                ? undefined
                : donutDelayOption === -1
                    ? donutDelayOption
                    : donutDelayOption * DAY_IN_SEC,
        };
        if (composerDraft.editing) {
            if (isPostponedChannelRoute) {
                try {
                    const response = await apiFetch('channels.editMessage', {
                        ...postponedCommonParams,
                        cmid: composerDraft.editing.cmid,
                        publish_date: composerDraft.editing.sentAt &&
                            Math.floor(composerDraft.editing.sentAt / 1000),
                    });
                    dispatch({
                        type: 'UserHitPostponedPostEdit',
                        channelId,
                        response,
                    });
                    onComplete();
                }
                catch (err) {
                    if (err instanceof IApi.RequestError) {
                        snackbar({
                            message: String(err.apiError?.error_text || ''),
                        });
                    }
                }
                return;
            }
            dispatch({
                type: 'UserHitPostEdit',
                text: sendText,
                attaches,
                channelId,
                isCommunityChannel,
                publishAt: composerDraft.editing.sentAt,
                cmid: composerDraft.editing.cmid,
                options: sendOptions.selected,
                visibility: visibilityOption,
                donutDelay: donutDelayOption,
                onComplete,
                onFail,
            });
            return;
        }
        if (isPostponedChannelRoute) {
            handleCalendarOpen();
        }
        else {
            perfStats?.removeEvent(IPerfStats.EventType.channelPostSent);
            perfStats?.addEvent(IPerfStats.EventType.channelPostSent, {
                data: {
                    sendStart: perfStats.getCurrentTime(),
                },
            });
            dispatch({
                type: 'UserHitPostSend',
                text: sendText,
                attaches,
                channelId,
                publishAt: publishDate,
                options: sendOptions.selected,
                visibility: visibilityOption,
                donutDelay: donutDelayOption,
                forwardingPost: composerDraft.forward?.items[0],
                ads: composerDraft.ads,
                onComplete: publishDate ? onSendPostponedComplete : onComplete,
                onFail,
            });
        }
    }, [
        dateOption,
        canSend,
        channelId,
        attaches,
        sendOptions.selected,
        visibilityOption,
        donutDelayOption,
        composerDraft.editing,
        composerDraft.forward?.items,
        composerDraft.ads,
        resetOptions,
        dispatch,
        screenRoute,
        navigate,
        onFail,
        apiFetch,
        snackbar,
        isPostponedChannelRoute,
        handleCalendarOpen,
        isCommunityChannel,
        perfStats,
    ]);
    const handlePostponedPostSend = async (publishDate) => {
        const editor = $editor.current;
        if (!editor) {
            return;
        }
        const sendText = sanitizeText(editor.getText());
        if (!canSend) {
            return;
        }
        try {
            const response = await apiFetch('channels.sendMessage', {
                channel_id: channelId,
                message: sendText,
                attachments: Attach.ids(attaches).join(','),
                close_comments: convertBoolOption(!sendOptions.selected.has('enable_comments')),
                signed: convertBoolOption(sendOptions.selected.has('signed')),
                donut_paid_duration: visibilityOption === 'all'
                    ? undefined
                    : donutDelayOption === -1
                        ? donutDelayOption
                        : donutDelayOption * DAY_IN_SEC,
                publish_date: publishDate && Math.floor(publishDate.getTime() / 1000),
                mark_as_ads: convertBoolOption(composerDraft.ads.isAd),
                ord_erid: composerDraft.ads.erId,
                mute_notifications: convertBoolOption(sendOptions.selected.has('mute_notifications')),
                from_group: 1,
            });
            dispatch({
                type: 'UserHitPostponedPostSend',
                response,
                channelId,
            });
            editor.resetText();
            resetOptions();
            dispatch({
                type: 'UserClearedChannelComposerDraft',
                channelId,
            });
            if (screenRoute.kind === 'ChannelRoute') {
                navigate({ ...screenRoute, postponed: Post.resolveCmid(response.cmid) });
            }
        }
        catch (err) {
            onFail(err);
        }
    };
    const hanldePostVisibility = () => {
        if (visibilityOption === 'all') {
            setVisibilityOption('donut');
            setDonutDelayOption(-1);
        }
        else {
            setVisibilityOption('all');
        }
    };
    /* Запланировать отправку отложенного сообщения */
    const handlePlanPostSend = (date) => {
        if (date) {
            setDateOption(date);
        }
        setIsPostponed(true);
        handleCalendarClose();
    };
    /* Обработчик клика по кнопке отправки сообщения */
    const handleSendButtonClick = useCallback(() => {
        if (isPostponedChannelRoute && !composerDraft.editing) {
            handleCalendarOpen();
        }
        else {
            handlePostSend();
        }
    }, [
        handlePostSend,
        handleCalendarOpen,
        isPostponedChannelRoute,
        composerDraft.editing,
    ]);
    const $triggerPostSend = useRef(handleSendButtonClick);
    $triggerPostSend.current = handleSendButtonClick;
    useUrlSnippets({
        text: inputText,
        attaches,
        initialText: composerDraft.text,
        onAttachesAdd: addAttaches,
    });
    // Подписка на различные ивенты эдитора
    useEffect(() => $editor.current?.onContentChange((text, selection) => {
        setInputText({
            value: text,
            selection,
        });
    }), []);
    useEffect(() => {
        const handleKeyCombo = (keyCombo, event) => {
            if (!$editor.current) {
                return;
            }
            switch (keyCombo) {
                case 'Mod+B':
                case 'Mod+U':
                case 'Mod+I':
                case 'Mod+S':
                case 'Mod+K': {
                    event.preventDefault();
                    break;
                }
                case 'Mod+Enter': {
                    event.stopPropagation();
                    if (isCtrlSubmitEnabled) {
                        $triggerPostSend.current();
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
                        $triggerPostSend.current();
                    }
                    return;
                }
                case 'Escape': {
                    event.stopPropagation();
                    event.preventDefault();
                    onClose();
                    break;
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
                    break;
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
        isStickerEmojiMenuOpen,
        toggleStickerEmojiMenuIsOpen,
        onClose,
    ]);
    useEffect(() => $editor.current?.onPaste((files) => {
        if (!composerDraft.forward) {
            uploadFiles(files);
        }
    }), [uploadFiles, composerDraft.forward]);
    useEffect(() => {
        $editor.current?.focus();
    }, []);
    useEffect(() => {
        if (screenRoute.kind !== 'ChannelRoute') {
            return;
        }
        return subscribeCharKeysHandler((event) => {
            event.preventDefault();
            event.stopPropagation();
            $editor.current?.focus();
            $editor.current?.insertAtSelection(event.key);
        });
    }, [screenRoute]);
    useEffect(() => $editor.current?.onFocusChange(setIsFocused), []);
    useEffect(() => $editor.current?.onMouseDown(), []);
    const saveDraftText = useCallback(() => {
        if (!$editor.current) {
            return;
        }
        dispatch({
            type: 'UserChangedChannelComposerDraft',
            kind: 'text',
            text: $editor.current.getText(),
            channelId,
            donutDelay: donutDelayOption,
            visibility: visibilityOption,
            date: dateOption && Math.floor(dateOption.getTime() / 1000),
            sendOptions: {
                selected: Array.from(sendOptions.selected),
                disabled: Array.from(sendOptions.disabled),
            },
        });
    }, [
        dispatch,
        channelId,
        donutDelayOption,
        visibilityOption,
        dateOption,
        sendOptions.selected,
        sendOptions.disabled,
    ]);
    const saveDraftTextRef = useRef(saveDraftText);
    saveDraftTextRef.current = saveDraftText;
    // Сохранение написанного текста при смене беседы
    useLayoutEffect(() => () => saveDraftTextRef.current(), [channelId]);
    // Сохранение написанного текста при перезагрузке страницы или переключении вкладки
    useLayoutEffect(() => {
        window.addEventListener('beforeunload', saveDraftText);
        window.addEventListener('blur', saveDraftText);
        return () => {
            window.removeEventListener('beforeunload', saveDraftText);
            window.removeEventListener('blur', saveDraftText);
        };
    }, [saveDraftText]);
    useEffect(() => () => {
        $editor.current = null;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const stickerEmojiMenuPopper = useMemo(() => (React.createElement(StickerEmojiMenuPopper, { contentClassName: "ChannelComposer__stickerEmojiMenuPopper", isOpen: isStickerEmojiMenuOpen, visibleTab: Tab.EMOJI, variant: StickerEmojiKeyboardVariant.ADAPTIVE, toggleIsOpen: toggleStickerEmojiMenuIsOpen, onEmojiInsert: handleEmojiInsert },
        React.createElement("button", { "aria-label": lang.use('me_composer_sticker_picker_aria_label'), className: "ChannelComposer__button ChannelComposer__button--emoji" },
            React.createElement("i", { className: "ChannelComposer__buttonIcon" },
                React.createElement(Icon24SmileOutline, null))))), [
        isStickerEmojiMenuOpen,
        toggleStickerEmojiMenuIsOpen,
        handleEmojiInsert,
        lang,
    ]);
    const isDefaultDonutDelay = donutDelayOption === -1;
    const canDrop = errorModal.errorText === undefined && !composerDraft.forward;
    const openErrorModalWithLangKey = useCallback((langKey) => {
        errorModal.open(lang.use(langKey));
    }, [errorModal, lang]);
    const { onOpenAudioPicker } = useVkcomMediaPickers(addAttaches, openErrorModalWithLangKey);
    return (React.createElement("div", { className: "ChannelComposer" },
        isPushHintAvailable && React.createElement(ChannelComposerPushHint, { channelId: channelId }),
        composerDraft.editing !== undefined && (React.createElement(ComposerEditingPost, { className: "Composer__editing", isCompactView: false, post: composerDraft.editing, onCancelEditing: onCancelEdit })),
        composerDraft.forward !== undefined && (React.createElement(ChannelComposerForward, { className: "Composer__reply", channelId: channelId, forward: composerDraft.forward })),
        React.createElement(DropArea, { disabled: !canDrop, onFilesAdd: uploadFiles }),
        React.createElement(ComposerAttaches, { className: "ChannelComposer__attaches", source: "channelComposer", attaches: attaches, optimistAttaches: uploaderState, onRemove: removeAttaches, setAttachments: addAttaches, rearrangeAttachments: rearrangeAttaches }),
        React.createElement("div", { className: "ChannelComposer__main" },
            React.createElement(OptionsListSelect, { hideOnClick: true, className: "ChannelComposer__attachesSelect", align: "left", position: "top", openType: "hover", options: React.createElement(React.Fragment, null, !composerDraft.forward && (React.createElement(React.Fragment, null,
                    React.createElement(ActionsMenuAction, { leftIcon: React.createElement(Icon20CameraOutline, null), title: lang.use('me_fc_add_photo'), onClick: () => handlePhotoVideoAttachClick('photo') }),
                    React.createElement(ActionsMenuAction, { leftIcon: React.createElement(Icon20VideoCircleOutline, null), title: lang.use('me_fc_add_video'), onClick: () => handlePhotoVideoAttachClick('video') }),
                    onOpenAudioPicker && (React.createElement(ActionsMenuAction, { onClick: onOpenAudioPicker, title: lang.use('me_fc_add_audio'), leftIcon: React.createElement(Icon20MusicOutline, null), type: "secondary" })),
                    React.createElement(ActionsMenuAction, { leftIcon: React.createElement(Icon20DocumentOutline, null), title: lang.use('me_fc_add_document'), onClick: filePickerModal.open }),
                    React.createElement(ActionsMenuAction, { leftIcon: React.createElement(Icon20PollOutline, null), title: lang.use('me_fc_add_poll'), onClick: () => navigate({ ...screenRoute, createPoll: true }) })))) },
                React.createElement("button", { "aria-label": lang.use('me_composer_file_picker_aria_label'), className: "ChannelComposer__button" },
                    React.createElement("i", { role: "img", className: "ChannelComposer__buttonIcon ChannelComposer__buttonIcon--settings" },
                        React.createElement(Icon24AddCircleOutline, null))),
                React.createElement("input", { ref: $fileInput, className: "ChannelComposer__fileInput", type: "file", multiple: true, onChange: handleFileInputChange })),
            React.createElement("div", { className: "ChannelComposer__inputContainer" },
                React.createElement("div", { className: "ChannelComposer__inputPanel" },
                    React.createElement(ComposerInput, { onCreate: createEditor, className: "ChannelComposer__inputWrapper", inputClassName: "ChannelComposer__input", placeholder: lang.use('me_channel_composer_placeholder') }))),
            React.createElement("div", { className: "ChannelComposer__actionsContainer" },
                stickerEmojiMenuPopper,
                React.createElement(OptionsListSelect, { className: "ChannelComposer__settingsSelect", align: "right", position: "top", openType: "hover", open: isSendOptionsOpen, hideOnClick: false, onOpen: handleOpenSendOptions, onClose: () => setIsSendOptionsOpen(false), options: React.createElement(React.Fragment, null,
                        ChannelComposerDraft.SEND_OPTIONS.filter(filterSendOptions).map((optionKey) => (React.createElement(OptionsListSelectItem, { key: optionKey, title: lang.use(`me_channel_composer_send_option_${optionKey}`), withCheckbox: true, isSelected: sendOptions.selected.has(optionKey), disabled: sendOptions.disabled.has(optionKey), onClick: () => handleSendOptionClick(optionKey) }))),
                        canShowDonsAction() && (React.createElement("div", { className: "ChannelComposer__donutsActions" }, React.createElement("div", { className: cx('ChannelComposer__postVisibilitySelector', {
                                'ChannelComposer__postVisibilitySelector--disabled': composerDraft.editing &&
                                    visibilityOption === 'donut',
                            }) },
                            React.createElement(OptionsListSelectItem, { title: vkm_donut_setting_onboarding &&
                                    vkcom_me?.channelsComposerDonsSettingOnboardingHighlighterRenderer
                                    ? vkcom_me.channelsComposerDonsSettingOnboardingHighlighterRenderer(lang.use('me_channel_composer_donut_checkbox_visibility_label'))
                                    : lang.use('me_channel_composer_donut_checkbox_visibility_label'), withCheckbox: true, isSelected: visibilityOption === 'donut', onClick: composerDraft.editing &&
                                    visibilityOption === 'donut'
                                    ? undefined
                                    : hanldePostVisibility }),
                            visibilityOption === 'donut' && (React.createElement(OptionsListSelect, { hideOnClick: true, align: "left", position: "top", openType: "click", className: "ChannelComposer__scrollableOptions", options: React.createElement(React.Fragment, null, Post.DONUT_DURATION.map((donutDelay) => (React.createElement(OptionsListSelectItem, { key: donutDelay, title: donutDelay === -1
                                        ? lang.use('me_channel_composer_donut_option_title_open_always')
                                        : lang.use('me_days', {
                                            num: donutDelay,
                                        }), isSelected: donutDelay === donutDelayOption, onClick: () => setDonutDelayOption(donutDelay) })))) },
                                React.createElement(OptionsListSelectTrigger, { style: { fontSize: '15px' }, selectedKey: isDefaultDonutDelay
                                        ? lang.use('me_channel_composer_donut_option_title_open_always')
                                        : lang.use('me_days', {
                                            num: donutDelayOption,
                                        }), colored: true, withIcon: true })))))),
                        React.createElement(ActionsMenuSeparator, null),
                        showPostponedAction && (React.createElement(ActionsMenuAction, { type: isPostponed ? 'primary' : 'secondary', title: React.createElement("div", { className: "ChannelComposer__postponedActionTitle" },
                                lang.use('me_posponed_publish_text'),
                                React.createElement("span", { className: "ChannelComposer__postponedActionTitleButton" }, isPostponed
                                    ? isSameYear(now, getPlannedDate())
                                        ? lang.use('me_date_pre_current_year', {
                                            now,
                                            shortMonths: true,
                                            date: +getPlannedDate(),
                                        })
                                        : lang.use('me_date_pre_free', {
                                            now,
                                            shortMonths: true,
                                            date: +getPlannedDate(),
                                        })
                                    : lang.use('me_posponed_date_now'))), onClick: handleCalendarOpen, rightIcon: isPostponed && (React.createElement(Icon20Cancel, { className: "ChannelComposer__postponedActionCloseIcon", width: 16, height: 16, onClick: (e) => {
                                    e.stopPropagation();
                                    resetDateOption();
                                } })), leftIcon: React.createElement(Icon28HistoryForwardOutline, { width: 20, height: 24 }) })),
                        showAdsMenuAction && (React.createElement(ActionsMenuAction, { type: composerDraft.ads.isAd ? 'primary' : 'secondary', leftIcon: composerDraft.ads.isAd ? (React.createElement(Icon20AdvertisingCheckOutline, null)) : (React.createElement(Icon20AdvertisingOutline, null)), title: lang.use(composerDraft.ads.isAd
                                ? 'me_channel_composer_change_ads'
                                : 'me_channel_composer_mark_as_ads'), onClick: () => {
                                setIsSendOptionsOpen(false);
                                navigate({
                                    kind: 'MiniAppModal',
                                    miniAppId: Attach.resolveMiniAppId(POST_ADS_MINIAPP_ID),
                                    hash: new URLSearchParams({
                                        ord_pred_id: composerDraft.ads.predId,
                                        is_ad: String(composerDraft.ads.isAd),
                                        erid: composerDraft.ads.erId,
                                    }).toString(),
                                });
                            } }))) }, canShowDonsAction() &&
                    vkm_donut_setting_onboarding &&
                    vkcom_me?.channelsComposerDonsTooltipOnboardingRenderer ? (vkcom_me.channelsComposerDonsTooltipOnboardingRenderer(() => setIsSendOptionsOpen(true), lang, React.createElement(SettingsButton, null))) : (React.createElement(SettingsButton, null))),
                React.createElement("button", { "aria-label": isPostponed
                        ? lang.use('me_composer_send_postponed_aria_label')
                        : lang.use('me_composer_send_aria_label'), className: cx('ChannelComposer__button', {
                        'ChannelComposer__button--submit': showSubmitIcon,
                        'ChannelComposer__button--submitActive': canSend,
                        'ChannelComposer__button--loading': showLoadingIcon,
                    }), disabled: !canSend, onClick: handleSendButtonClick },
                    React.createElement("i", { role: "img", className: "ChannelComposer__buttonIcon ChannelComposer__buttonIcon--submit" }, isPostponed ? React.createElement(Icon28SendClock, null) : React.createElement(Icon24Send, null)),
                    React.createElement("i", { role: "img", className: "ChannelComposer__buttonIcon ChannelComposer__buttonIcon--loading" },
                        React.createElement(Spinner, { size: "s" }))))),
        React.createElement(ErrorModal, { errorText: errorModal.errorText, onClose: errorModal.close }),
        screenRoute.createPoll && (React.createElement(PollCreateModal, { onClose: () => navigate({ ...screenRoute, createPoll: false }), onCreate: (poll) => addAttaches({ poll }), onError: openErrorModalWithLangKey, pollDraft: attaches.poll })),
        filePickerModal.isActive && (React.createElement(FilePicker, { onClose: filePickerModal.close, setAttachments: addAttaches, addFileAttachments: uploadFiles, selected: composerDraft.attaches.docs })),
        calendarModal.isActive && shouldOpenCalendarModal && (React.createElement(CalendarModalNew, { className: "ChannelComposer__calendar", enableTime: true, disablePast: true, withoutTimeButton: true, calcInitialDate: getPlannedDate, saveButtonText: isPostponedChannelRoute
                ? lang.use('me_calendar_modal_save_and_schedule')
                : undefined, onSave: isPostponedChannelRoute
                ? handlePostponedPostSend
                : handlePlanPostSend, onClose: calendarModal.close }))));
};
const COMPOSER_API_ERRORS = {
    214: {
        prefix: 'Access to adding post denied',
        default: 'me_channel_composer_error_failed_adding_post',
        errors: [
            [
                'you can only add (\\d+) posts a day',
                (parsed) => parsed[1] ? (React.createElement(FormattedLangKey, { langkey: 'me_channel_composer_error_daily_posts_limit', values: {
                        count: parsed[1],
                        bold: (text) => React.createElement("b", null, text),
                    } })) : undefined,
            ],
            [
                'cannot schedule more than %d posts',
                (parsed) => parsed[1] ? (React.createElement(FormattedLangKey, { langkey: 'me_channel_composer_error_schedule_limit', values: {
                        count: parsed[1],
                        bold: (text) => React.createElement("b", null, text),
                    } })) : undefined,
            ],
            [
                'can only schedule %d posts on a day',
                (parsed) => parsed[1] ? (React.createElement(FormattedLangKey, { langkey: 'me_channel_composer_error_daily_schedule_limit', values: {
                        count: parsed[1],
                        bold: (text) => React.createElement("b", null, text),
                    } })) : undefined,
            ],
            [
                'a post is already scheduled for this time',
                'me_channel_composer_error_already_planned_post',
            ],
            ['cannot postpone post', 'me_channel_composer_error_cannot_postpone'],
            ['access to the wall is closed', 'me_channel_composer_error_is_closed'],
        ],
    },
    219: {
        prefix: 'Advertisement post was recently added',
        default: 'me_channel_composer_error_no_more_posts_after_ads',
    },
    222: {
        prefix: 'Hyperlinks are forbidden',
        default: 'me_channel_composer_error_hyperlinks_forbidden',
    },
    224: {
        prefix: 'Too many ads posts',
        default: 'me_channel_composer_error_daily_ads_posts_limit',
    },
    100: {
        prefix: 'One of the parameters specified was missing or invalid',
        default: 'me_channel_composer_error_unknown',
        errors: [
            [
                'invalid publish_date param',
                'me_channel_composer_error_invalid_post_date',
            ],
        ],
    },
};
const getErrorText = (err, lang) => {
    if (typeof err.apiError.error_text === 'string') {
        return err.apiError.error_text;
    }
    for (const [errCode, sendErr] of Object.entries(COMPOSER_API_ERRORS)) {
        if (err.code.toString() !== errCode) {
            continue;
        }
        const [, , secondaryErr] = new RegExp(`^${sendErr.prefix}(: (.+))?$`).exec(err.message.split(new RegExp('\\(|\\)'))[1] || '') || [];
        if (!secondaryErr) {
            return lang.use(sendErr.default);
        }
        for (const [testKey, resultValue] of sendErr.errors || []) {
            const parsedKey = new RegExp(`^${testKey}$`).exec(secondaryErr);
            if (!parsedKey) {
                continue;
            }
            if (typeof resultValue === 'string') {
                return lang.use(resultValue);
            }
            const result = resultValue(parsedKey, lang);
            return result || lang.use('me_channel_composer_error_unknown');
        }
    }
    return lang.use('me_channel_composer_error_unknown');
};
const convertBoolOption = (value) => value !== undefined ? Number(value) && 1 : value;
function SettingsButton() {
    const { lang } = useBrowserEnv();
    return (React.createElement("button", { "aria-label": lang.use('me_channel_composer_settings_aria_label'), className: "ChannelComposer__button" },
        React.createElement("i", { role: "img", className: "ChannelComposer__buttonIcon ChannelComposer__buttonIcon--settings" },
            React.createElement(Icon24GearOutline, null))));
}
//# sourceMappingURL=ChannelComposer.js.map