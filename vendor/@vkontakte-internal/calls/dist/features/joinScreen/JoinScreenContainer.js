import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { JoinScreenAnonym } from './components/JoinScreenAnonym/JoinScreenAnonym';
import { getJoinCallLabel, getTextForApiErrorByCode, normalizeProfiles, vou } from '../../helpers/helpers';
import { callsEditParticipantName, isAPIErrorWithType, loadUsers, userFields } from '../../services/backend';
import { decode } from '../../utils/textUtils';
import { useChangeNameOptions } from '../../hooks/useChangeNameOptions';
import { AppRootProvider, Checkbox } from '@vkontakte-internal/vkcom-kit';
import { handlePromiseError } from '../../helpers/logger';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { localStorage } from '@vkontakte/vkjs';
import { getCallByName, getMode, getMyId, getParticipants, getPeerId } from '../../selectors';
import { JoinScreenView } from './components/JoinScreenView/JoinScreenView';
import { JoinScreenPreview, } from './components/JoinScreenPreview/JoinScreenPreview';
import { StartCallContainer } from '../../containers/StartCallContainer';
import { handleDeepLinkSuccess, openDesktopDeepLink } from '../../services/deepLinking';
import { generateJoinCallsDeepLink, generateStartCallsDeepLink } from '../../helpers/deepLink';
import { decodeHTMLEntities } from '@vkontakte-internal/vkjs/lib/emoji/HTMLEntities';
import { getCallStartErrorText } from '../../services/sdk';
import { useLang } from '../../hooks/useLang';
import { useAnonymousBridgeInit } from '../../services/anonymInit';
import { CallStatSource, ClickHouseEventType, useSendStatsService } from '../../stats/clickHouse';
import { useConfig } from '../../services/config';
import { E_ACTION, useTypedDispatch } from '../../hooks/useTypedDispatch';
import { getLSSkipJoinCallPromptWithBackend, useSkipJoinCallPrompt } from '../../hooks/useSkipJoinCallPrompt';
import { CallByNameContainer } from '../../containers/CallByNameContainer/CallByNameContainer';
import { CallsAppId, Mode, vkIdToPeerId, useVkmeContext, useCallsBridge, } from '@vkontakte-internal/calls-core';
import { CallByNameProfileType, LOCALSTORAGE_IS_CALLS_APP_DOWNLOADED, LOCALSTORAGE_IS_MESSENGER_APP_DOWNLOADED, NAME_REGEX, } from '../../constants';
export const JoinScreenContainer = ({ isAnonym, joinLink, vkJoinLink, title, membersCount, withPopup, onClose, entryPoint, callId, onError, anonymousCreateBridge, skipJoinCallPrompt, }) => {
    const langUtils = useLang();
    const { getLang, langNumeric } = langUtils;
    const bridge = useCallsBridge();
    const isAnonymInited = useTypedSelector((state) => Boolean(state.anonymSecret));
    const dispatch = useTypedDispatch();
    /**
     * При первой инициализации мы получаем статус через метод showJoinScreen, при последующих вызывается метод showJoinPopup
     * Это значит что проп не пришел и нужно ориентироваться уже на другие косвенные признаки что аноним инициализирован
     */
    const isAnonymous = isAnonym ?? isAnonymInited;
    const [previewMediaSettings, setPreviewMediaSettings] = useState({
        isCamEnabled: false,
        isMicEnabled: false,
    });
    const sendStats = useSendStatsService();
    const { sferum, appId, enableSkipDesktopAppModal } = useConfig();
    const participants = useTypedSelector(getParticipants);
    const me = useTypedSelector(getMyId);
    const callByName = useTypedSelector(getCallByName);
    const myId = useTypedSelector(getMyId);
    const peerId = useTypedSelector(getPeerId);
    const mode = useTypedSelector(getMode);
    const [showStartCallModal, setShowStartCallModal] = useState(false);
    const [fireStartCallModalDeeplink, setFireStartCallModalDeeplink] = useState(false);
    const openStartCallModal = () => {
        dispatch({
            type: E_ACTION.SET_JOIN_LINK,
            joinLink,
        });
        setShowStartCallModal(true);
    };
    const participantMe = participants[me];
    const [userSettings, setUserSettings] = useState();
    const hideProfileTypeChoice = CallStatSource.STANDALONE === entryPoint;
    const hideJoinScreenPromptCheckbox = [CallsAppId.DESKTOP_MESSENGER].includes(appId) || hideProfileTypeChoice;
    const [loading, setLoading] = useState(false);
    const [mediaLoading, setMediaLoading] = useState(false);
    const setLoadingFalse = () => setLoading(false);
    const { startInit, isInitialized } = useAnonymousBridgeInit(anonymousCreateBridge);
    const [name, setName] = useState(participantMe.firstName);
    const nameInputDisabled = Boolean(isInitialized ?? isAnonymInited);
    const isValueIncorrect = !NAME_REGEX.test(name?.replace(/\s/gm, ''));
    const onChangeName = useCallback((e) => {
        setName(e.target.value);
    }, []);
    const { nameOptions, changeNameOptions } = useChangeNameOptions(participantMe);
    const [areDevicesDisabled, setAreDevicesDisabled] = useState(false);
    const disableDevices = () => {
        setAreDevicesDisabled(true);
        setShowStartCallModal(false);
    };
    const unlockEnableDevices = () => {
        setAreDevicesDisabled(false);
    };
    const onJoinHandler = async (isWithVideo, isWithAudio = false) => {
        setLoading(true);
        disableDevices();
        if (loading) {
            return;
        }
        if (isAnonymous && !isAnonymInited) {
            try {
                await startInit(vkJoinLink, isAnonymous ? name : nameOptions.name || '');
                await bridge.joinCallByLink({
                    joinLink,
                    isWithVideo,
                    isWithAudio,
                    entryPoint,
                    vkJoinLink,
                });
            }
            catch (err) {
                let errorText;
                if (typeof err === 'string') {
                    errorText = err;
                }
                else if (isAPIErrorWithType(err)) {
                    errorText = getTextForApiErrorByCode(err?.error.error_code, true, getLang);
                }
                else {
                    errorText = getCallStartErrorText(err, true, getLang) || getLang('calls_unknown_error');
                }
                if (onError) {
                    onError(errorText);
                }
            }
            finally {
                setLoadingFalse();
            }
        }
        else {
            const isGroup = nameOptions.type === CallByNameProfileType.GROUP;
            onClose?.();
            const params = {
                call_id: callByName?.callId || '',
                name: nameOptions.name || '',
            };
            const userName = decode(`${participantMe.firstName} ${participantMe.lastName}`);
            if (userName !== nameOptions.name && !isGroup) {
                try {
                    await callsEditParticipantName(params);
                    sendStats(ClickHouseEventType.NAME_CHANGED_BY_USER, {
                        session_id: callId,
                    });
                    changeNameOptions(null);
                }
                catch (err) {
                    handlePromiseError(err);
                }
            }
            try {
                await bridge.joinCallByLink({
                    joinLink,
                    isWithVideo,
                    isWithAudio,
                    entryPoint,
                    groupId: isGroup ? nameOptions.id : undefined,
                    vkJoinLink,
                });
                disableDevices();
            }
            catch (err) {
            }
            finally {
                setLoadingFalse();
            }
        }
    };
    const onCloseHandler = useCallback(() => {
        sendStats(ClickHouseEventType.CALL_PREVIEW_MODAL_CLOSED, {
            session_id: callId,
        });
        if (onClose) {
            onClose();
        }
    }, [onClose, sendStats]);
    const onCallByNameClick = () => {
        setLoading(true);
        try {
            bridge
                .showCallByNamePopup(null, entryPoint, joinLink, {
                withPopup,
                callId,
            })
                .finally(setLoadingFalse);
        }
        catch (e) {
            setLoadingFalse();
        }
    };
    // TODO [react@>=19.0.0]: Заменить дженерик `T | undefined` на `T`
    const fireStartCallModalDeeplinkTimeout = useRef(undefined);
    const { isVkme } = useVkmeContext();
    const isSferumContext = sferum || (isVkme && isAnonym);
    const openDesktopApp = (lightStart, auto = false) => {
        let deepLink;
        if (isAnonym) {
            deepLink = generateJoinCallsDeepLink({
                vkJoinLink: joinLink || '',
                joinLink: joinLink || '',
                sferum: isSferumContext,
                entryPoint: entryPoint,
                mode: auto ? 'auto' : 'manual',
            });
        }
        else if (joinLink) {
            deepLink = generateJoinCallsDeepLink({
                joinLink: joinLink || '',
                userId: myId,
                sferum: isSferumContext,
                entryPoint,
                mode: auto ? 'auto' : 'manual',
            });
        }
        else {
            deepLink = generateStartCallsDeepLink({
                peerId,
                userId: myId,
                entryPoint,
                mode: auto ? 'auto' : 'manual',
            });
        }
        openDesktopDeepLink(deepLink)
            .then(() => handleDeepLinkSuccess(sferum))
            .catch(() => {
            if (!lightStart && !areDevicesDisabled && !bridge.isInActiveCall) {
                window.clearTimeout(fireStartCallModalDeeplinkTimeout.current);
                setFireStartCallModalDeeplink(false);
                // this prevents opening deepLink from StartCallContainer initially.
                // After timeout, set to true - it can be opened after download from user click starts
                fireStartCallModalDeeplinkTimeout.current = window.setTimeout(() => setFireStartCallModalDeeplink(true), 3000);
                openStartCallModal();
            }
        });
    };
    const { on: isSkipJoinCallPromptOn, toggle: toggleJoinCallPrompt, silentToggle: silentToggleJoinCallPrompt, } = useSkipJoinCallPrompt();
    useEffect(() => {
        !isAnonym &&
            window.vk?.id &&
            loadUsers({ fields: userFields, user_ids: vkIdToPeerId(window.vk.id) }).then((data) => {
                const [user] = normalizeProfiles(data);
                setUserSettings(user);
            });
        if (!hideJoinScreenPromptCheckbox && (isVkme || !isAnonym)) {
            getLSSkipJoinCallPromptWithBackend({ skipJoinScreen: skipJoinCallPrompt }).then(({ value: isSkipJoinCallPrompt, isNewClientValue }) => {
                if (isNewClientValue && isSkipJoinCallPromptOn !== isSkipJoinCallPrompt) {
                    silentToggleJoinCallPrompt();
                }
                if (!isSkipJoinCallPrompt) {
                    setTimeout(() => openDesktopApp(!sferum && enableSkipDesktopAppModal, true), 10);
                }
            });
        }
    }, []);
    const onCallViaNativeAppClick = () => {
        if (bridge.isInActiveCall) {
            return;
        }
        else if (areDevicesDisabled) {
            unlockEnableDevices();
        }
        sendStats(ClickHouseEventType.CALL_PREVIEW_DESKTOP_APP_JOIN_CLICK, {
            session_id: callId,
        });
        if (localStorage.getItem(sferum ? LOCALSTORAGE_IS_MESSENGER_APP_DOWNLOADED : LOCALSTORAGE_IS_CALLS_APP_DOWNLOADED) !== null) {
            openDesktopApp(false);
        }
        else {
            openDesktopApp(true);
            openStartCallModal();
        }
    };
    let profileType;
    switch (nameOptions?.type) {
        // На бэке не поддержано пока, а вручную в каждом методе переписывать access_token пока долго
        // case CallByNameProfileType.ANONYM:
        //   profileType = getLang('calls_anonymous'); // Аноним
        //   break;
        case CallByNameProfileType.GROUP:
            profileType = getLang('calls_your_group'); // Ваше сообщество
            break;
        case CallByNameProfileType.PROFILE:
            profileType = getLang('calls_your_profile'); // Ваш профиль
            break;
    }
    // сохраняем информацию о выбранных настройках медиа в контейнере
    const onPreviewMediaSettingsChange = (newSettings) => {
        setPreviewMediaSettings(newSettings);
    };
    const skipJoinCallPromptCheckbox = useMemo(() => (_jsx(Checkbox, { checked: isSkipJoinCallPromptOn, onChange: () => {
            sendStats(ClickHouseEventType.CALL_PREVIEW_SKIP_JOIN_SCREEN_CLICK, {
                session_id: callId,
            });
            toggleJoinCallPrompt();
        }, stretched: true, children: getLang('calls_join_screen_always_open_in_browser') })), [isSkipJoinCallPromptOn, toggleJoinCallPrompt]);
    const profile = vou(!isAnonymous, {
        profileName: nameOptions?.name || userSettings?.name,
        profileType,
        photo: nameOptions?.photo || userSettings?.photo,
        type: nameOptions?.type,
    });
    const previewProps = {
        profile,
        isAnonym: isAnonymous,
        onPreviewMediaSettingsChange,
        onCallByNameClick,
        insidePopup: withPopup,
        resetDisableDevices: unlockEnableDevices,
        disableDevices: areDevicesDisabled,
        isSferum: sferum,
        initialDevices: previewMediaSettings,
        callId,
        mediaLoading,
        setMediaLoading,
    };
    const joinScreenPreview = _jsx(JoinScreenPreview, { ...previewProps });
    const commonScreenProps = {
        title: decodeHTMLEntities(title || ''),
        label: getJoinCallLabel(getLang, langNumeric, membersCount),
        onJoinHandler: () => {
            return onJoinHandler(previewMediaSettings.isCamEnabled, previewMediaSettings.isMicEnabled);
        },
        onCallViaNativeAppClick,
        callViaNativeAppTitle: getLang('calls_join_in_app'),
        preview: joinScreenPreview,
        loading,
        joinText: getLang('calls_join'),
        isSferum: sferum,
        withPopup,
        onCloseHandler,
        hideJoinScreenPromptCheckbox,
        skipJoinCallPromptCheckbox,
        callId,
        mediaLoading,
    };
    const joinScreenAnonymProps = {
        isButtonDisabled: isValueIncorrect,
        onChangeName,
        name,
        inputDisabled: nameInputDisabled,
        namePlaceholder: getLang('calls_join_screen_input_name_placeholder'),
        isValueIncorrect,
        ...commonScreenProps,
    };
    return (_jsxs(AppRootProvider, { disablePortal: true, children: [isAnonymous && _jsx(JoinScreenAnonym, { ...joinScreenAnonymProps }), !isAnonymous && _jsx(JoinScreenView, { ...commonScreenProps }), showStartCallModal && (_jsx(StartCallContainer, { onClose: () => setShowStartCallModal(false), onDownload: () => sendStats(ClickHouseEventType.CALL_PREVIEW_DOWNLOAD_APP_CLICK, {
                    session_id: callId,
                }), preventShowOpenModal: true, isAnonym: isAnonym, fireOpenDeeplink: fireStartCallModalDeeplink })), mode === Mode.CALL_BY && _jsx(CallByNameContainer, {})] }));
};
//# sourceMappingURL=JoinScreenContainer.js.map