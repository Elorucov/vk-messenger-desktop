import { jsx as _jsx } from "react/jsx-runtime";
import { createRoot } from 'react-dom/client';
import { noop } from '@vkontakte/vkjs';
import { AppWidget } from './containers/App';
import { JoinScreenContainer } from './features/joinScreen/JoinScreenContainer';
import { setAnonymousAccessToken, setApiWrappers } from './helpers/apiGetter';
import { CallsSdkService } from './services/sdk';
import * as OKCallsSDK from '@vkontakte/calls-sdk';
import { CallsSdkProvider } from './providers/CallsSdkProvider';
import { LangContext } from './helpers/LangContext';
import { setStatlogEventsHandler } from './stats/statlogs_stats';
import { WaitingContainer } from './containers/WaitingContainer';
import { createStore } from 'redux';
import { getInitialState, getInitialVideoResolution } from './reducers/initialState';
import { callsReducer } from './reducers/reducer';
import { Provider } from 'react-redux';
import { E_ACTION } from './constants';
import { CallsEventType, Config, EVideoOptionType, HistoryScreenSections, ModalType, Mode, NavigationContext, peerIdToVkId, UIMode, VideoResolutionTypes, VideoSuspendMode, vkIdToPeerId, VkmeContext, CallsBridgeProvider, } from '@vkontakte-internal/calls-core';
import { createFriendsCache, normalizeUser } from './helpers/user';
import { createInvokeErrorWrapper } from './helpers/error';
import { GlobalStore } from './reducers/globalStore';
import { handleCollapseCall } from './containers/CallWidget';
import { videoOptionsStorage } from './helpers/localStorage';
import { fetchUserSettings } from './services/userSettings';
import { handlePromiseError } from './helpers/logger';
import { isParticipantAnonym } from './helpers/participant';
import { MyTrackerContext } from './helpers/MyTrackerContext';
import { callStats } from './stats/clickHouse';
import { createMediaFocusChannel } from './services/mediaFocusChannel';
import { CallsConfigProvider } from './services/config';
import { setHasInCallChat, toggleModal } from './actions';
import { CallsDIProvider } from './providers/CallsDIProvider';
import { toggleInCallChat } from './actions/inCallChat';
import { bridgeEventBus } from './services/eventBus';
import { getWarningBrowserInfo } from './helpers/browser';
import { JoinCallByLinkContainer } from './containers/JoinCallByLinkContainer';
import { ensureCallsDIContainer } from './di';
import { InternalBridgeWrapper, blockAllBridgeMethods } from './services/bridge';
import { RoomsService } from './features/rooms';
import { CallsQueueProcessor } from './services/queue';
import { CallService } from './services/call';
export { baseUserFields, userFields, groupFields } from './services/backend';
/**
 * Название кастомного события которое запускают каждый раз когда приходит событие из очереди звонков
 */
const EVENT_NAME = 'callsQueueEvent';
export function init({ actionStatCollector, saveStatlogEvents, langUtils, navigateToConvo, navigateToProfile, apiWrapperWithAuth, apiWrapper, callSounds, streamUrlExtractor, myTrackerUtils: defaultMyTrackerUtils, notifierGetter, isVkme = false, VKComKitModal, miniAppsBridge, dependencies, }) {
    const config = new Config();
    config.vkme = isVkme;
    setApiWrappers(apiWrapperWithAuth, apiWrapper);
    const navigationContextValue = {
        navigateToConvo,
        navigateToProfile,
    };
    let myTrackerUtils = defaultMyTrackerUtils;
    let callsDIContainer;
    return {
        initialized: false,
        // @ts-expect-error TS0000: Wrong types
        initializing: false,
        VKComKitModal,
        notifierGetter,
        leaveCall: noop,
        leaveRoom: noop,
        get isInActiveCall() {
            const callService = callsDIContainer?.resolve(CallService);
            if (callService) {
                return callService.isInActiveCall;
            }
            return false;
        },
        set isInActiveCall(value) {
            const callService = callsDIContainer?.resolve(CallService);
            if (callService) {
                callService.isInActiveCall = value;
            }
        },
        async init({ callPreview, callsCredentials, apiBaseUrl, sdkToken, tabIsMaster, onBeforeCallStart, onAfterCallFinish, onError, toggles = {}, friends, isFriend, getFriends, myTrackerUtils: customMyTrackerUtils, isIncomingModalHidden, anonymousApiToken, }) {
            if (this.initialized) {
                return this.initializing;
            }
            if (!callsCredentials?.me) {
                console.log('Calls were not initialized as there are no callsCredentials.me');
                return false;
            }
            this.initialized = true;
            this.isFriend = isFriend;
            this.isIncomingModalHidden = isIncomingModalHidden;
            this.getFriends = getFriends;
            if (customMyTrackerUtils) {
                myTrackerUtils = customMyTrackerUtils;
            }
            if (anonymousApiToken) {
                setAnonymousAccessToken(anonymousApiToken);
            }
            config.merge(toggles);
            createMediaFocusChannel();
            if (!OKCallsSDK.browser.isBrowserSupported()) {
                const invokeBadBrowserError = () => {
                    const msg = langUtils.getLang('calls_unsupported_browser_error');
                    if (onError) {
                        onError({ msg });
                    }
                    this.eventBus.emit(CallsEventType.ERROR, { error: new Error(msg) });
                    console.error(msg);
                    return Promise.resolve(undefined);
                };
                this.call = invokeBadBrowserError;
                this.startGroupCall = invokeBadBrowserError;
                this.startCall = invokeBadBrowserError;
                this.acceptCall = invokeBadBrowserError;
                this.joinCallByLink = invokeBadBrowserError;
                this.showJoinPopup = invokeBadBrowserError;
                this.showCallByNamePopup = invokeBadBrowserError;
                this.showCreateCallByLinkPopup = invokeBadBrowserError;
                this.showJoinCallByLinkPopup = invokeBadBrowserError;
                this.showShareQrCodePopup = invokeBadBrowserError;
                this.showPlanCalendarEventPopup = invokeBadBrowserError;
                return;
            }
            const tabIsMasterCheck = tabIsMaster || (() => true);
            const resolution = getInitialVideoResolution(config.enableHDVideo);
            const noiseCancellation = videoOptionsStorage.queryOption(EVideoOptionType.NOISE_CANCELLATION_MODE);
            /* сохраняем ссылку для доступа в других частях приложения */
            GlobalStore.setCallsStore(createStore(
            // @ts-expect-error TS2345: Argument of type '(state: State, action: IActions) => State' is not assignable to parameter of type
            callsReducer, getInitialState({
                currentUser: callsCredentials.me,
                callConversation: callPreview,
                options: {
                    isDev: !!callsCredentials.is_dev,
                    anonymSecret: callsCredentials.secret,
                    config,
                    localVideoResolution: config.fullHD
                        ? resolution
                        : resolution === VideoResolutionTypes.HD
                            ? VideoResolutionTypes.HD
                            : VideoResolutionTypes.SD,
                    friends: friends || [],
                    friendsCache: createFriendsCache(friends || []),
                    ipSettingEnabled: callsCredentials.ip_setting_enabled,
                    privacySettings: callsCredentials.privacySettings,
                    noiseCancellation,
                    videoSuspendMode: videoOptionsStorage.queryOption(EVideoOptionType.VIDEO_SUSPEND_MODE) ?? VideoSuspendMode.AUTO,
                },
            }), window.__REDUX_DEVTOOLS_EXTENSION__?.({
                name: 'VkCallsMain',
            })));
            const store = GlobalStore.getCallsStore();
            this.store = store;
            callsDIContainer = ensureCallsDIContainer(dependencies, {
                SDK: OKCallsSDK,
                bridge: this,
                config,
                credentials: {
                    token: sdkToken,
                    ...callsCredentials,
                },
                apiBaseUrl,
                langUtils,
                miniAppsBridge,
                nav: {
                    navigateToConvo,
                    navigateToProfile,
                },
                store,
            });
            const roomsService = callsDIContainer.resolve(RoomsService);
            this.collapseCall = () => {
                OKCallsSDK.debugMessage(OKCallsSDK.DebugMessageType.WARN, {
                    message: '[external] bridge.collapseCall called',
                });
                const state = store.getState();
                handleCollapseCall({
                    uiMode: state.uiMode,
                    bridge: this,
                });
            };
            this.restoreCall = () => {
                store.dispatch({
                    type: E_ACTION.CHANGE_UI_MODE,
                    mode: UIMode.DEFAULT,
                });
                this.eventBus.emit(CallsEventType.LAYOUT_NORMAL);
            };
            this.fullscreenCall = () => {
                store.dispatch({
                    type: E_ACTION.CHANGE_UI_MODE,
                    mode: UIMode.FULLSCREEN,
                });
                this.eventBus.emit(CallsEventType.LAYOUT_FULLSCREEN);
            };
            this.showStartCallModal = ({ vkId, joinLink, entryPoint, startCallModalOptions = {} }) => {
                if (!this.isInActiveCall) {
                    store.dispatch({
                        type: E_ACTION.CHANGE_MODE,
                        mode: Mode.START,
                        peerId: vkId ? vkIdToPeerId(vkId) : undefined,
                        joinLink,
                        entryPoint: entryPoint ? { source: entryPoint } : undefined,
                        startCallModalOptions,
                    });
                }
            };
            this.joinOrStartCallModal = (vkId, joinLink, entryPoint) => {
                this.joinCallByLink({ joinLink, isWithVideo: false, entryPoint }).catch(noop);
            };
            this.updateChatCounter = (chatId, counter, firstUnreadMsgId) => {
                const { roomId, roomChatIds } = roomsService;
                const state = store.getState();
                const peerId = roomId ? roomChatIds[roomId] : peerIdToVkId(state.peer);
                if (peerId === chatId) {
                    store.dispatch({
                        type: E_ACTION.SET_UNREAD_COUNT,
                        chatUnreadCount: counter,
                        chatUpToMsgId: counter === 0 ? null : firstUnreadMsgId,
                    });
                }
            };
            this.setRenderChat = (renderChat) => {
                this.renderChat = renderChat;
                store.dispatch(setHasInCallChat(true));
            };
            this.clearRenderChat = () => {
                this.renderChat = undefined;
                store.dispatch(setHasInCallChat(false));
                // Закрываем чат, если он был открыт
                const state = store.getState();
                if (state.inCallChatOpened) {
                    store.dispatch(toggleInCallChat());
                }
            };
            /**
             * хелпер для передачи отредактированного запланированного
             * звонка в workflow основного приложения
             */
            this.setPlannedCalendarEvent = (editedEvent) => {
                // показываем модальное окно шары планирования
                store.dispatch(toggleModal(ModalType.SHARE_PLANNED_CALL, { calendarEvent: editedEvent }));
            };
            // TODO: перенести модалку ModalPlanCalendarEventContainer в calls-history
            this.setEditCalendarEvent = async (event) => {
                store.dispatch(toggleModal(ModalType.EDIT_CALENDAR_EVENT, event));
            };
            if (saveStatlogEvents) {
                setStatlogEventsHandler(saveStatlogEvents);
            }
            if (actionStatCollector) {
                callStats.setActionStatCollector(actionStatCollector);
            }
            const appRoot = createRoot(getReactRoot('calls'));
            appRoot.render(_jsx(Provider, { store: store, children: _jsx(NavigationContext.Provider, { value: navigationContextValue, children: _jsx(LangContext.Provider, { value: langUtils, children: _jsx(CallsConfigProvider, { value: config, children: _jsx(MyTrackerContext.Provider, { value: myTrackerUtils, children: _jsx(WaitingContainer, {}) }) }) }) }) }));
            const isAnonym = isParticipantAnonym(callsCredentials.me.id);
            let userSettingsPromise;
            if (!isAnonym) {
                userSettingsPromise = fetchUserSettings(toggles);
            }
            try {
                let resolve = () => { };
                // eslint-disable-next-line @vkontakte-internal/vkcom-plugins/async-mix-syntax
                this.initializing = new Promise((r) => {
                    resolve = r;
                });
                this.authorized = false;
                this.authorizedGroupId = 0;
                this.debugMessage = OKCallsSDK.debugMessage;
                const warningConfig = getWarningBrowserInfo(config.browserWarnings);
                if (warningConfig?.block) {
                    blockAllBridgeMethods(this, store.dispatch);
                }
                if (!warningConfig?.block) {
                    callsDIContainer.resolve(InternalBridgeWrapper).createMethods();
                }
                // инициализация sdk и авторизация нужны до вызова других методов типа джойна
                await callsDIContainer.resolve(CallsSdkService).init();
                if (!!userSettingsPromise) {
                    await userSettingsPromise;
                }
                this.handleQueueEvent = callsDIContainer.resolve(CallsQueueProcessor).handleQueueEvent;
                appRoot.render(_jsx(CallsDIProvider, { instance: callsDIContainer, children: _jsx(Provider, { store: store, children: _jsx(NavigationContext.Provider, { value: navigationContextValue, children: _jsx(LangContext.Provider, { value: langUtils, children: _jsx(CallsConfigProvider, { value: config, children: _jsx(MyTrackerContext.Provider, { value: myTrackerUtils, children: _jsx(VkmeContext.Provider, { value: {
                                                isVkme,
                                                startedSection: HistoryScreenSections.ALL,
                                            }, children: _jsx(AppWidget, { getCallsBridge: () => this, tabIsMaster: tabIsMasterCheck, onBeforeCallStart: onBeforeCallStart, onAfterCallFinish: onAfterCallFinish, callSounds: callSounds, streamUrlExtractor: streamUrlExtractor }) }) }) }) }) }) }) }));
                resolve();
            }
            catch (err) {
                const msg = err ? err.message || err.msg : 'sdk did not send the reasons for the error';
                const code = err ? err.error : '';
                if (![401].includes(code)) {
                    this.eventBus.emit(CallsEventType.ERROR, {
                        error: new Error(`Could not init calls. ${msg}: ${code}`),
                    });
                }
                console.error('Could not init calls', err?.error, err);
                handlePromiseError(err);
            }
        },
        /**
         * See call of sCall_previewJs in www/call.php
         */
        // @ts-expect-error TS2322:  Type {...} is not assignable to type ...
        showJoinScreen(params, containerId, entryPoint, onError, withPopup = false, joinScreenSkipped = false, anonymousCreateBridge) {
            const invokeError = createInvokeErrorWrapper(bridgeEventBus, onError, this.debug);
            if (!OKCallsSDK.browser.isBrowserSupported()) {
                return invokeError(langUtils.getLang('calls_unsupported_browser_error'));
            }
            setStatlogEventsHandler(saveStatlogEvents);
            callStats.setActionStatCollector(actionStatCollector);
            const { callsEnableAnonymPhoto, callParticipantMe, deviceId = '' } = params;
            config.merge({
                anonymPhoto: callsEnableAnonymPhoto,
            });
            const joinCallContainer = document.querySelector(containerId);
            if (!joinCallContainer) {
                throw new Error(`Calls: showJoinScreen: DOM container ${containerId} not found`);
            }
            // У анонимов peerId отрицательный
            const peerId = vkIdToPeerId(callParticipantMe.id);
            const store = createStore(() => ({
                me: peerId,
                participants: {
                    [peerId]: normalizeUser(callParticipantMe),
                },
                callByName: {
                    callId: params.callId,
                },
                config: {
                    deviceId,
                },
            }), {}, window.__REDUX_DEVTOOLS_EXTENSION__?.({
                name: 'VkCallsJoinScreen',
            }));
            const root = createRoot(joinCallContainer);
            const unmount = withPopup ? () => root.unmount() : undefined;
            root.render(_jsx(Provider, { store: store, children: _jsx(NavigationContext.Provider, { value: navigationContextValue, children: _jsx(LangContext.Provider, { value: langUtils, children: _jsx(CallsBridgeProvider, { bridge: this, children: _jsx(CallsConfigProvider, { value: config, children: _jsx(MyTrackerContext.Provider, { value: myTrackerUtils, children: _jsx(CallsSdkProvider, { SDK: OKCallsSDK, children: _jsx(VkmeContext.Provider, { value: {
                                                isVkme,
                                            }, children: _jsx(JoinScreenContainer, { ...params, withPopup: withPopup, entryPoint: entryPoint, onError: invokeError, onClose: unmount, anonymousCreateBridge: anonymousCreateBridge, skipJoinCallPrompt: joinScreenSkipped }) }) }) }) }) }) }) }) }));
            return () => root.unmount();
        },
        showJoinCallByLinkPopup(initialJoinLink, onJoin, onManualClose) {
            const root = createRoot(getReactRoot('calls_join_call_by_link'));
            const handleClose = (manualClose) => {
                root.unmount();
                manualClose && onManualClose?.();
            };
            root.render(_jsx(LangContext.Provider, { value: langUtils, children: _jsx(CallsBridgeProvider, { bridge: this, children: _jsx(CallsConfigProvider, { value: config, children: _jsx(JoinCallByLinkContainer, { initialJoinLink: initialJoinLink, onJoin: onJoin, onClose: handleClose }) }) }) }));
        },
        setDebug(value) {
            OKCallsSDK.debug(value);
        },
        dispatchQueueEvent(event) {
            document.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: event }));
        },
        subscribeOnQueue(callback) {
            const cb = (event) => callback(event.detail);
            // @ts-expect-error TS2769: No overload matches this call.
            document.addEventListener(EVENT_NAME, cb);
            // @ts-expect-error TS2769: No overload matches this call.
            return () => document.removeEventListener(EVENT_NAME, cb);
        },
        eventBus: bridgeEventBus,
        log(level, ...args) {
            let type;
            switch (level) {
                case 'log':
                    type = OKCallsSDK.DebugMessageType.LOG;
                    break;
                case 'error':
                    type = OKCallsSDK.DebugMessageType.ERROR;
                    break;
                case 'warn':
                    type = OKCallsSDK.DebugMessageType.WARN;
                    break;
                case 'debug':
                    type = OKCallsSDK.DebugMessageType.DEBUG;
                    break;
            }
            OKCallsSDK.debugMessage(type, ...args);
        },
    };
}
function getReactRoot(id) {
    const el = document.getElementById(id);
    if (el) {
        return el;
    }
    const container = document.createElement('section');
    container.setAttribute('id', id);
    document.body.appendChild(container);
    return container;
}
//# sourceMappingURL=index.js.map