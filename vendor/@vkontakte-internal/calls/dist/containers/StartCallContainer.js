import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { isUndefined, localStorage, noop } from '@vkontakte/vkjs';
import { E_ACTION, LOCALSTORAGE_IS_CALLS_APP_DOWNLOADED, LOCALSTORAGE_IS_MESSENGER_APP_DOWNLOADED, } from '../constants';
import { CallStatSource, Mode, peerIdToVkId, useVkmeContext, download, OS, EMailRuGoals, EOS, mailRuCounter, Platform, } from '@vkontakte-internal/calls-core';
import { openDesktopDeepLink } from '../services/deepLinking';
import { generateJoinCallsDeepLink, generateStartCallsDeepLink } from '../helpers/deepLink';
import { CallModal } from '../components/CallModal/CallModal';
import { useTypedDispatch } from '../hooks/useTypedDispatch';
import { getPlatformUrl, setDownloadedFlag } from '../helpers/fileDownload';
import { AppDownload } from '../components/StartCallModal/AppDownload';
import { AppOpen } from '../components/StartCallModal/AppOpen';
import { EAppContent } from '../components/StartCallModal/constants';
import { useTypedSelector } from '../hooks/useTypedSelector';
import { handlePromiseError } from '../helpers/logger';
import { useSkipJoinCallPrompt } from '../hooks/useSkipJoinCallPrompt';
import { Ranges } from '@vkontakte-internal/vk-utils';
import { AppRootProvider } from '@vkontakte-internal/vkcom-kit';
import { useConfig } from '../services/config';
import { setShowLoader } from '../actions';
import { getEntryPoint, getIsLoaderVisible, getJoinLink, getMyId, getPeerId, getStartCallModalOptions, } from '../selectors';
export function StartCallContainer({ onClose, onDownload, preventShowOpenModal, isAnonym, fireOpenDeeplink = true, }) {
    const dispatch = useTypedDispatch();
    const startCallModalOptions = useTypedSelector(getStartCallModalOptions);
    const peerId = useTypedSelector(getPeerId);
    const entryPoint = useTypedSelector(getEntryPoint);
    const { enableSkipJoinScreenFeature, sferum } = useConfig();
    const joinLink = useTypedSelector(getJoinLink);
    const isLoaderVisible = useTypedSelector(getIsLoaderVisible);
    const myId = useTypedSelector(getMyId);
    const { isVkme } = useVkmeContext();
    const isSferumContext = sferum || (isVkme && isAnonym);
    const isCallActiveP2P = !joinLink && peerId && entryPoint?.source === CallStatSource.HISTORY;
    const isCallMadeFromP2PList = entryPoint?.source === CallStatSource.HISTORY_FRIENDS_LIST;
    const isCallP2PMadeFromHistoryScreen = isCallActiveP2P || isCallMadeFromP2PList;
    const isHideCheckbox = !!startCallModalOptions?.isDisableStartCallModalCheckbox ||
        !enableSkipJoinScreenFeature ||
        !isCallP2PMadeFromHistoryScreen;
    const isStartNewCall = !joinLink;
    const [isAlreadyDownloaded, setIsAlreadyDownloaded] = useState(() => localStorage.getItem(isSferumContext ? LOCALSTORAGE_IS_MESSENGER_APP_DOWNLOADED : LOCALSTORAGE_IS_CALLS_APP_DOWNLOADED) !== null);
    const dataRef = useRef(getPlatformUrl(isSferumContext));
    const toggleSpinner = (open) => {
        dispatch(setShowLoader(open));
    };
    const openDesktopApp = (auto = false) => {
        if (isAnonym && joinLink) {
            return openDesktopDeepLink(generateJoinCallsDeepLink({
                joinLink: joinLink,
                vkJoinLink: joinLink,
                sferum: isSferumContext,
                entryPoint: entryPoint?.source,
                mode: auto ? 'auto' : 'manual',
            }));
        }
        if (joinLink || startCallModalOptions?.joinDeepLink) {
            return openDesktopDeepLink(startCallModalOptions?.joinDeepLink ??
                generateJoinCallsDeepLink({
                    joinLink: joinLink || '',
                    userId: myId,
                    sferum: isSferumContext,
                    entryPoint: entryPoint?.source,
                    mode: auto ? 'auto' : 'manual',
                }));
        }
        else {
            return openDesktopDeepLink(generateStartCallsDeepLink({
                peerId,
                userId: myId,
                entryPoint: entryPoint?.source,
                mode: auto ? 'auto' : 'manual',
            }));
        }
    };
    const initDownload = (url = dataRef.current?.url, filename = dataRef.current?.filename) => {
        onDownload && onDownload();
        if (isUndefined(url) || isUndefined(filename)) {
            return;
        }
        logMailRuCounterDownloadApp();
        setDownloadedFlag(isSferumContext);
        download(url, filename);
        toggleSpinner(true);
        setTimeout(() => {
            setIsAlreadyDownloaded(true);
            toggleSpinner(false);
        }, 3000);
    };
    useEffect(() => {
        fireOpenDeeplink &&
            openDesktopApp()
                .catch(handlePromiseError)
                .finally(() => toggleSpinner(false));
    }, [isAlreadyDownloaded]);
    const close = () => {
        onClose ? onClose() : dispatch({ type: E_ACTION.CHANGE_MODE, mode: Mode.READY });
    };
    const joinInBrowser = () => {
        const opponentVkId = peerIdToVkId(peerId);
        if (!window.Calls) {
            return;
        }
        if (joinLink) {
            const entryPointOnJoinLink = entryPoint?.source ?? CallStatSource.CONVO_JOIN_SNIPPET;
            window.Calls.joinCallByLink({
                joinLink,
                isWithVideo: false,
                entryPoint: entryPointOnJoinLink,
            }).catch(noop);
            return;
        }
        // @TODO: проверить корректность энтрипоинта, так как текущий предполагался для конретного места использования
        const entrypoint = entryPoint?.source ?? CallStatSource.CONVO_LIST;
        if (!opponentVkId) {
            window.Calls.startCall(false, entrypoint);
            return;
        }
        const isGroupCall = Ranges.isChatOrChannelPeer(opponentVkId);
        if (isGroupCall) {
            window.Calls.startGroupCall(opponentVkId, undefined, null, false, entrypoint);
        }
        else {
            window.Calls.call({ vkId: opponentVkId, entryPoint: entrypoint });
        }
    };
    const skipJoinCallPrompt = useSkipJoinCallPrompt();
    const screen = (() => {
        if (isLoaderVisible)
            return EAppContent.Loading;
        if (isAlreadyDownloaded && !preventShowOpenModal)
            return EAppContent.Open;
        return EAppContent.Download;
    })();
    return (_jsx(AppRootProvider, { children: _jsxs(CallModal, { onClose: close, onBackdropClick: close, className: "StartCallModalModalBox", children: [screen === EAppContent.Download && (_jsx(AppDownload, { onClose: close, isSkipJoinPage: skipJoinCallPrompt.on, onSkipJoinPage: skipJoinCallPrompt.toggle, onDownloadApp: initDownload, isHideCheckbox: isHideCheckbox, isAnonym: isAnonym })), screen === EAppContent.Open && (_jsx(AppOpen, { onClose: close, isSkipJoinPage: skipJoinCallPrompt.on, onSkipJoinPage: skipJoinCallPrompt.toggle, onJoinCall: joinInBrowser, onOpenApp: () => openDesktopApp(), isStartNewCall: isStartNewCall, isHideCheckbox: isHideCheckbox }))] }) }));
}
function logMailRuCounterDownloadApp() {
    let os;
    if (Platform.OS === OS.WINDOWS) {
        os = EOS.Windows;
    }
    else if (Platform.OS === OS.MAC) {
        os = EOS.Mac;
    }
    else if (Platform.OS === OS.LINUX) {
        os = EOS.Linux;
    }
    mailRuCounter.push(EMailRuGoals.DownloadAppVkCommon, { os });
}
//# sourceMappingURL=StartCallContainer.js.map