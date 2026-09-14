import React, { useCallback, useEffect, useMemo, useRef, useState, } from 'react';
import { useBrowserEnv, useDispatch, useFeatureFlags, useMiniAppConfiguration, useOwner, useViewer, } from '../../hooks/misc';
import { Button, Spinner } from '@vkontakte/vkui';
import { ModalView } from '../../ui/ModalView/ModalView';
import { ModalBackdrop } from '../../ui/ModalBackdrop/ModalBackdrop';
import '../../ui/MiniApp/MiniApps.css';
import { ModalPanel } from '../../ui/ModalPanel/ModalPanel';
import { ModalDialog } from '../../ui/ModalDialog/ModalDialog';
import { useRouter } from '../../ui/Router/Router';
import { Icon20GlobeCrossOutline, Icon24CancelOutline, Icon28WarningTriangleOutline, } from '@vkontakte/icons';
import { useModal, useSubModal } from '../../hooks/useModal';
import { createDeferredPromise, debounce, } from '../../../core/utils/misc';
import * as Attach from '../../../core/model/Attach';
import * as Peer from '../../../core/model/Peer';
import * as MiniApp from '../../../core/model/MiniApp';
import { IApi } from '../../../data/env/IApi';
import { ATTACH_PICKER_REFERER } from '../../ui/MiniAppPicker/MiniAppPicker';
import { MINI_APP_WIDGET_REFERER } from '../../hooks/useMiniAppWidgetActions';
import { MiniAppPickerConfirmModal } from '../../ui/MiniAppPickerConfirmModal/MiniAppPickerConfirmModal';
import { MiniAppPickerSendToChatsModal } from '../../ui/MiniAppPickerSendToChatsModal/MiniAppPickerSendToChatsModal';
import { isString, isUndefined, noop } from '@vkontakte/vkjs';
import { download, isObject, isValidJSON } from '../../utils/misc';
import { useSnackbar } from '../../hooks/useSnackbar';
import { ModalHeader } from '../../ui/ModalHeader/ModalHeader';
import { ModalBody } from '../../ui/ModalBody/ModalBody';
import { handleVKWebAppCustomMessage } from '../../utils/miniApps';
import { useApiFetch, useApiFetchForExternalLibs, } from '../../hooks/useApiFetch';
import { getOwnerGroupId } from '../../../data/store/State';
import { fromApiMessage } from '../../../data/converter/MessageConverter';
export const MiniAppsService = ({ miniAppId, miniAppsRenderer, isHidden }) => {
    const { router, navigate, modal, screenRoute, rightPanel } = useRouter();
    const { lang, vkDomain, logger } = useBrowserEnv();
    const apiFetch = useApiFetch();
    const apiFetchForExternalLibs = useApiFetchForExternalLibs();
    const viewer = useViewer();
    const dispatch = useDispatch();
    const snackbar = useSnackbar();
    const featureFlags = useFeatureFlags();
    const owner = useOwner();
    const [attachSendingError, setAttachSendingError] = useState(null);
    const [appId, setAppId] = useState();
    const [appTitle, setAppTitle] = useState();
    const [appUrl, setAppUrl] = useState();
    const [appIframeSize, setAppIframeSize] = useState();
    const [webview, setWebview] = useState();
    const [referer, setReferer] = useState('other');
    const [appIcons, setAppIcons] = useState(['']);
    const miniAppRequestDataModal = useModal();
    const [miniAppRequestData, setMiniAppRequestData] = useState();
    const [convoAttachDataModal, setConvoAttachDataModal] = useState();
    const convoAttachModal = useSubModal();
    const convoAttachToChatsModal = useSubModal();
    const initMiniAppConfiguration = useMiniAppConfiguration();
    const routeReferer = modal?.kind === 'MiniAppModal' && modal.referer;
    const routeWebviewUrl = modal?.kind === 'MiniAppModal' && modal.webviewUrl;
    const cmid = modal?.kind === 'MiniAppModal' && modal.cmid;
    const peerId = (screenRoute.kind === 'ConvoRoute' && screenRoute.peerId) ||
        (rightPanel?.kind === 'PeerPanel' && rightPanel.peerId);
    const initWebviewUrl = initMiniAppConfiguration?.webviewUrl;
    useEffect(() => {
        if (routeReferer || routeWebviewUrl || initWebviewUrl) {
            routeReferer &&
                (routeReferer === ATTACH_PICKER_REFERER ||
                    routeReferer === MINI_APP_WIDGET_REFERER) &&
                setReferer(routeReferer);
            if (featureFlags.vkm_webview_url) {
                initWebviewUrl && setWebview(initWebviewUrl);
            }
            else {
                routeWebviewUrl && setWebview(routeWebviewUrl);
            }
        }
    }, [
        initWebviewUrl,
        featureFlags.vkm_webview_url,
        routeReferer,
        routeWebviewUrl,
    ]);
    const miniAppGroupId = useMemo(() => {
        return (modal?.kind === 'MiniAppModal' && modal.groupPeerId) || undefined;
    }, [modal]);
    const [appStartTime, setAppStartTime] = useState(null);
    const handleClose = useCallback(() => {
        setAppId(undefined);
        setAppTitle(undefined);
        setAppUrl(undefined);
        setAppIframeSize(undefined);
        setAppIcons(['']);
        setAttachSendingError(null);
        setAppStartTime(null);
        dispatch({ type: 'MiniAppConfiguration_Reset' });
        router.pop();
    }, [dispatch, router]);
    const handleMiniAppError = useCallback((message) => {
        logger.error(message);
        if (!window.navigator.onLine) {
            snackbar({
                id: 'miniapp-error',
                message: lang.use('me_app_data_request_offline'),
                before: (React.createElement(Icon20GlobeCrossOutline, { width: 28, height: 28, fill: "var(--vkui--color_icon_negative)" })),
            });
        }
        else {
            snackbar({
                id: 'miniapp-error',
                message: lang.use('me_app_data_request_failed'),
                before: (React.createElement(Icon28WarningTriangleOutline, { fill: "var(--vkui--color_icon_negative)" })),
            });
        }
        handleClose();
    }, [handleClose, lang, logger, snackbar]);
    // Если нетворк упал, нам не нужно, чтобы водопадом закрылись все открытие модалки
    const handleMiniAppErrorDebounced = useMemo(() => debounce(handleMiniAppError, 300, true), [handleMiniAppError]);
    const confirmationPromiseRef = useRef(null);
    const confirmationFunctionsRef = useRef(undefined);
    const currentMiniAppId = useRef(miniAppId);
    currentMiniAppId.current = miniAppId;
    /**
     * Дополнительный обработчик хендлеров.
     * Как это работает:
     * 1. Миниапп вызывает какое-то событие
     * 2. Его ловит компонент MiniAppBase из @vk-ecosystem/mini-app
     * 3. Компонент хендлит событие
     * 4. В процессе обработки он вызывает this.controller.sendMessageToHost.
     * Этот метод делает одно действие - вызывает наш колбэк handleMessages,
     * ничего не ожидая в ответ
     */
    const handleMessages = useCallback((event) => {
        if (appId === undefined) {
            return;
        }
        // Обрабатываем закрытие приложения
        if (event.event === 'VKWebAppClose') {
            handleClose();
        }
        // Обрабатываем переход в другое приложение
        if (event.event === 'VKWebAppOpenApp') {
            navigate({
                kind: 'MiniAppModal',
                miniAppId: event.params.app_id,
            });
        }
    }, [appId, handleClose, navigate]);
    const handleDataRequest = useCallback((data) => {
        switch (data.type) {
            case 'VKWebAppAddToFavorites': {
                setMiniAppRequestData({
                    title: lang.use('me_app_data_request_add_to_favorite'),
                    message: lang.use('me_app_data_request_add_to_favorite_message'),
                    acceptButtonText: lang.use('me_add'),
                });
                break;
            }
            case 'VKWebAppAllowMessagesFromGroup': {
                const { group } = data.params;
                const modalText = lang.use('me_app_data_request_allow_community_messages_message', {
                    values: {
                        group,
                    },
                });
                setMiniAppRequestData({
                    title: lang.use('me_app_data_request_allow_community_messages'),
                    message: modalText,
                    acceptButtonText: lang.use('me_allow'),
                });
                break;
            }
            case 'VKWebAppAllowNotifications': {
                setMiniAppRequestData({
                    title: lang.use('me_app_data_request_allow_notifications'),
                    message: lang.use('me_app_data_request_allow_notifications_message'),
                    acceptButtonText: lang.use('me_allow'),
                });
                break;
            }
            // TODO возможность настраивать предоставляемые доступы.
            case 'VKWebAppGetAuthToken': {
                const { app, scope } = data.params;
                const modalText = lang.use('me_app_data_request_token_access_message', {
                    values: {
                        app: app,
                    },
                });
                const scopes = scope.split(',');
                const scopeTranslations = scope
                    ? scopes.map((scope) => lang.use(`vkapps_scope_${scope}`))
                    : [lang.use('vkapps_scope_general')];
                const modalCaption = [
                    lang.use('me_app_data_request_token_access_caption'), // Будут доступны:
                    ' ',
                    scopeTranslations.join(', ').toLowerCase(),
                ].join('');
                setMiniAppRequestData({
                    title: lang.use('me_app_data_request_token_access'),
                    message: modalText,
                    caption: modalCaption,
                    acceptButtonText: lang.use('me_allow'),
                });
                break;
            }
            case 'VKWebAppGetEmail': {
                setMiniAppRequestData({
                    title: lang.use('me_app_data_request_get_email'),
                    message: lang.use('me_app_data_request_get_email_message'),
                    acceptButtonText: lang.use('me_allow'),
                });
                break;
            }
            case 'VKWebAppGetGroupInfo': {
                const { group } = data.params;
                const modalText = lang.use('me_app_data_request_get_group_info_message', {
                    values: {
                        group,
                    },
                });
                setMiniAppRequestData({
                    title: lang.use('me_app_data_request_get_group_info'),
                    message: modalText,
                    acceptButtonText: lang.use('me_allow'),
                });
                break;
            }
            case 'VKWebAppGetPhoneNumber': {
                setMiniAppRequestData({
                    title: lang.use('me_app_data_request_get_phone_number'),
                    message: lang.use('me_app_data_request_get_phone_number_message'),
                    acceptButtonText: lang.use('me_allow'),
                });
                break;
            }
            case 'VKWebAppJoinGroup': {
                const { group } = data.params;
                const modalText = lang.use('me_app_data_request_join_group_message', {
                    values: {
                        group,
                    },
                });
                setMiniAppRequestData({
                    title: lang.use('me_app_data_request_join_group'),
                    message: modalText,
                    acceptButtonText: lang.use('me_app_data_request_join_group_button'),
                });
                break;
            }
            case 'VKWebAppLeaveGroup': {
                const { group } = data.params;
                const modalText = lang.use('me_app_data_request_leave_group_message', {
                    values: {
                        group,
                    },
                });
                setMiniAppRequestData({
                    title: lang.use('me_app_data_request_leave_group'),
                    message: modalText,
                    acceptButtonText: lang.use('me_app_data_request_leave_group_button'),
                });
                break;
            }
            default:
                return Promise.resolve(false);
        }
        confirmationPromiseRef.current = createDeferredPromise();
        miniAppRequestDataModal.open();
        return confirmationPromiseRef.current;
    }, [miniAppRequestDataModal, lang]);
    const handleModalRequest = useCallback((params) => {
        const { data, handlerName, actions } = params;
        const requestData = {
            type: handlerName,
            params: { ...data, app: data.appTitle },
        };
        handleDataRequest(requestData);
        if (actions) {
            const { onAccept, onDeny } = actions;
            const confirmActions = {
                onAccept,
                onDeny,
            };
            confirmationFunctionsRef.current = confirmActions;
        }
        return (data) => {
            const requestData = {
                type: data.handlerName,
                params: data.data,
            };
            handleDataRequest(requestData);
        };
    }, [handleDataRequest]);
    const customHandlers = useMemo(() => {
        if (!appId) {
            return;
        }
        const extras = {
            VKWebAppSetLocation: {
                handle: (params) => {
                    if (!isObject(params)) {
                        return Promise.resolve({
                            type: 'VKWebAppSetLocationFailed',
                            data: {
                                error_type: 'client_error',
                                error_data: {
                                    error_code: MiniApp.BridgeErrorCodes.MISSING_PARAMS,
                                    error_reason: 'Event data is not an object',
                                },
                            },
                        });
                    }
                    const location = params.location;
                    if (!isString(location)) {
                        return Promise.resolve({
                            type: 'VKWebAppSetLocationFailed',
                            data: {
                                error_type: 'client_error',
                                error_data: {
                                    error_code: MiniApp.BridgeErrorCodes.INVALID_PARAMS,
                                    error_reason: 'Received location is not a string',
                                },
                            },
                        });
                    }
                    const replace = !!params.replace_state;
                    try {
                        const url = new URL(window.location.href);
                        url.hash = location;
                        const targetUrl = url.toString();
                        if (replace) {
                            window.history.replaceState({}, '', targetUrl);
                        }
                        else {
                            window.history.pushState({}, '', targetUrl);
                        }
                    }
                    catch {
                        return Promise.resolve({
                            type: 'VKWebAppSetLocationResultFailed',
                            data: {
                                error_type: 'client_error',
                                error_data: {
                                    error_code: MiniApp.BridgeErrorCodes.UNKNOWN,
                                    error_reason: 'Failed to construct or replace URL in the browser',
                                },
                            },
                        });
                    }
                    return Promise.resolve({
                        type: 'VKWebAppSetLocationResult',
                        data: {
                            result: true,
                        },
                    });
                },
            },
            /**
             * Отправка кастомного события мини-аппов
             */
            VKWebAppSendCustomEvent: {
                handle: async (params) => {
                    if (!isObject(params)) {
                        return Promise.resolve({
                            type: 'VKWebAppSendCustomEventFailed',
                            data: {
                                error_type: 'client_error',
                                error_data: {
                                    error_code: MiniApp.BridgeErrorCodes.MISSING_PARAMS,
                                    error_reason: 'Event data is not an object',
                                },
                            },
                        });
                    }
                    const { type, event, screen, timezone, json } = params;
                    if (!isString(event)) {
                        return Promise.resolve({
                            type: 'VKWebAppSendCustomEventFailed',
                            data: {
                                error_type: 'client_error',
                                error_data: {
                                    error_code: MiniApp.BridgeErrorCodes.INVALID_PARAMS,
                                    error_reason: 'Event type is not a string',
                                },
                            },
                        });
                    }
                    if (!isUndefined(screen) && !isString(screen)) {
                        return Promise.resolve({
                            type: 'VKWebAppSendCustomEventFailed',
                            data: {
                                error_type: 'client_error',
                                error_data: {
                                    error_code: MiniApp.BridgeErrorCodes.INVALID_PARAMS,
                                    error_reason: 'Screen name is not a string',
                                },
                            },
                        });
                    }
                    if (!isUndefined(json) && (!isString(json) || !isValidJSON(json))) {
                        return Promise.resolve({
                            type: 'VKWebAppSendCustomEventFailed',
                            data: {
                                error_type: 'client_error',
                                error_data: {
                                    error_code: MiniApp.BridgeErrorCodes.INVALID_PARAMS,
                                    error_reason: 'JSON is not a valid string',
                                },
                            },
                        });
                    }
                    if (!isUndefined(timezone) && !isString(timezone)) {
                        return Promise.resolve({
                            type: 'VKWebAppSendCustomEventFailed',
                            data: {
                                error_type: 'client_error',
                                error_data: {
                                    error_code: MiniApp.BridgeErrorCodes.INVALID_PARAMS,
                                    error_reason: 'Timezone is not a valid string',
                                },
                            },
                        });
                    }
                    const eventType = isString(type) &&
                        ['type_navgo', 'type_view', 'type_click', 'type_action'].includes(type)
                        ? type
                        : 'type_action';
                    try {
                        /**
                         * Формат события взят из монорепы
                         * @see vkcom/static/js/modules/shared/apps_connect/handlers/VKWebAppSendCustomEvent.js
                         * @see https://dev.vk.com/ru/method/statEvents.addMiniApps
                         */
                        await apiFetch('statEvents.addMiniApps', {
                            events: JSON.stringify([
                                {
                                    user_id: Peer.toRealId(viewer.id),
                                    type: eventType,
                                    [eventType]: {
                                        type: 'type_mini_app_custom_event_item',
                                    },
                                    timezone,
                                    mini_app_id: appId,
                                    url: window.location.href,
                                    vk_platform: 'web_external',
                                    event,
                                    json,
                                    timestamp: Date.now(),
                                    screen,
                                },
                            ]),
                        });
                    }
                    catch {
                        return Promise.resolve({
                            type: 'VKWebAppSendCustomEventFailed',
                            data: {
                                error_type: 'client_error',
                                error_data: {
                                    error_code: MiniApp.BridgeErrorCodes.UNKNOWN,
                                    error_reason: 'Unexpected internal error',
                                },
                            },
                        });
                    }
                    return Promise.resolve({
                        type: 'VKWebAppSendCustomEventResult',
                        data: {
                            result: true,
                        },
                    });
                },
            },
            /**
             * Скачивание файла
             */
            VKWebAppDownloadFile: {
                handle: (params) => {
                    if (!isObject(params)) {
                        return Promise.resolve({
                            type: 'VKWebAppDownloadFileFailed',
                            data: {
                                error_type: 'client_error',
                                error_data: {
                                    error_code: MiniApp.BridgeErrorCodes.MISSING_PARAMS,
                                    error_reason: 'Event data is not an object',
                                },
                            },
                        });
                    }
                    const { url, filename } = params;
                    if (!isString(url)) {
                        return Promise.resolve({
                            type: 'VKWebAppDownloadFileFailed',
                            data: {
                                error_type: 'client_error',
                                error_data: {
                                    error_code: MiniApp.BridgeErrorCodes.INVALID_PARAMS,
                                    error_reason: 'Received URL is not a string',
                                },
                            },
                        });
                    }
                    if (!isString(filename)) {
                        return Promise.resolve({
                            type: 'VKWebAppDownloadFileFailed',
                            data: {
                                error_type: 'client_error',
                                error_data: {
                                    error_code: MiniApp.BridgeErrorCodes.INVALID_PARAMS,
                                    error_reason: 'Received filename is not a string',
                                },
                            },
                        });
                    }
                    try {
                        /**
                         * Скачиваем файл
                         *
                         * Миниаппы это не безопасное окружение, поэтому нельзя переходить по всем ссылкам которые нам могут прийти
                         *
                         * Решение в лоб (<a> + download / window.open) не подходят поскольку там нет проверки что мы скачиваем и
                         * вместо загрузки они откроют любые ссылки включая фишинговые страницы и страницы где могут украсть данные
                         *
                         * Поэтому скачиваем через Blob, чтобы исключить риски по безопасности. Что бы мы не получили, это будет
                         * скачано (что и ожидается), но не открыто в браузере. Плюс работаем только с безопасным окружением
                         * поскольку CORS не отключен и зарежет небезопасные запросы на внешние ресурсы.
                         */
                        fetch(url)
                            .then((response) => {
                            if (!response.ok) {
                                throw new Error('Failed to download the file');
                            }
                            return response.blob();
                        })
                            .then((blob) => {
                            download({ blob, filename });
                        })
                            .catch(noop);
                    }
                    catch {
                        return Promise.resolve({
                            type: 'VKWebAppDownloadFileFailed',
                            data: {
                                error_type: 'client_error',
                                error_data: {
                                    error_code: MiniApp.BridgeErrorCodes.UNKNOWN,
                                    error_reason: 'Unexpected internal error',
                                },
                            },
                        });
                    }
                    return Promise.resolve({
                        type: 'VKWebAppDownloadFileResult',
                        data: {
                            result: true,
                        },
                    });
                },
            },
        };
        return {
            /**
             * Подмешиваем отдельно поскольку мини-аппы сразу начнут использовать эти методы как только они станут доступны
             * Чтобы случайно не уронить N мини-аппов, катим новые методы бриджа через тоггл
             */
            ...extras,
            VKWebAppAddToChat: {
                handle: (params) => {
                    const { action_title, close_app, hash } = params;
                    if (!action_title) {
                        return Promise.resolve({
                            type: 'VKWebAppAddToChatFailed',
                            data: {
                                error_type: 'client_error',
                                error_data: {
                                    error_code: MiniApp.BridgeErrorCodes.MISSING_PARAMS,
                                    error_reason: `${MiniApp.BridgeErrorReasons.MISSING_PARAMS}: "action_title"`,
                                },
                            },
                        });
                    }
                    if (typeof action_title !== 'string' ||
                        (close_app !== undefined && typeof close_app !== 'boolean') ||
                        (hash !== undefined && typeof hash !== 'string')) {
                        return Promise.resolve({
                            type: 'VKWebAppAddToChatFailed',
                            data: {
                                error_type: 'client_error',
                                error_data: {
                                    error_code: MiniApp.BridgeErrorCodes.INVALID_PARAMS,
                                    error_reason: MiniApp.BridgeErrorReasons.INVALID_PARAMS,
                                },
                            },
                        });
                    }
                    if (!peerId) {
                        return Promise.resolve({
                            type: 'VKWebAppAddToChatFailed',
                            data: {
                                error_type: 'client_error',
                                error_data: {
                                    error_code: MiniApp.BridgeErrorCodes.UNKNOWN,
                                    error_reason: `No found peer id`,
                                },
                            },
                        });
                    }
                    return new Promise((resolve) => {
                        setConvoAttachDataModal({
                            peerId,
                            title: action_title,
                            hash,
                            closeOnSuccess: close_app,
                            multichat: referer === MINI_APP_WIDGET_REFERER,
                            submit: () => {
                                resolve({
                                    type: 'VKWebAppAddToChatResult',
                                    data: {
                                        result: true,
                                    },
                                });
                            },
                            cancel: (errorType, error) => {
                                resolve({
                                    type: 'VKWebAppAddToChatFailed',
                                    data: {
                                        error_type: errorType,
                                        error_data: error,
                                    },
                                });
                            },
                        });
                        convoAttachModal.open();
                    });
                },
            },
            VKWebAppCreateHash: {
                handle: (params) => {
                    const request_id = typeof params.payload === 'number' ||
                        typeof params.payload === 'string'
                        ? params.payload
                        : undefined;
                    return apiFetch('apps.getSecretHash', { app_id: appId, request_id })
                        .then(({ sign, ts, request_id: payload, edu_sign }) => {
                        return {
                            type: 'VKWebAppCreateHashResult',
                            data: {
                                sign,
                                ts,
                                edu_sign,
                                payload,
                                request_id: params.request_id,
                            },
                        };
                    })
                        .catch((error) => {
                        return {
                            type: 'VKWebAppCreateHashFailed',
                            data: {
                                error_type: 'api_error',
                                error_data: error,
                            },
                        };
                    });
                },
            },
            VKWebAppGetLaunchParams: {
                handle: (params) => {
                    return apiFetch('apps.getAppLaunchParams', {
                        mini_app_id: appId,
                        referer: 'other',
                        ...(miniAppGroupId && {
                            group_id: Peer.toRealId(miniAppGroupId),
                        }),
                    })
                        .then((data) => {
                        return {
                            type: 'VKWebAppGetLaunchParamsResult',
                            data: { ...data, request_id: params.request_id },
                        };
                    })
                        .catch((error) => {
                        return {
                            type: 'VKWebAppGetLaunchParamsFailed',
                            data: {
                                error_type: 'api_error',
                                error_data: error,
                            },
                        };
                    });
                },
            },
            VKWebAppCustomMessage: {
                handle: (params) => {
                    return handleVKWebAppCustomMessage(params, router, dispatch);
                },
            },
        };
    }, [
        apiFetch,
        appId,
        miniAppGroupId,
        convoAttachModal,
        peerId,
        router,
        referer,
        viewer.id,
        dispatch,
    ]);
    // Аналог метода requestApiMethod из
    // https://gitlab.mvk.com/vk-ecosystem/shared/components/-/blob/master/src/entries/MiniAppBase/MiniAppBase.tsx
    const requestApiMethod = useCallback((method, params, overrideApiConfig) => {
        const access_token = overrideApiConfig?.accessToken;
        const v = overrideApiConfig?.version;
        const overrideParams = {
            ...params,
            ...(access_token && { access_token }),
            ...(v && { v }),
        };
        return apiFetchForExternalLibs(method, overrideApiConfig ? overrideParams : params)
            .then((response) => ({ response }))
            .catch((error) => {
            if (error instanceof IApi.RequestError) {
                return Promise.reject(error.apiError);
            }
            // Либа не ожидает ошибок execute, так как не вызывает их.
            // Для минимальной совместимости вернем первую ошибку execute
            if (error instanceof IApi.ExecuteErrors) {
                return Promise.reject(error.list[0].apiError);
            }
            return Promise.reject(error);
        });
    }, [apiFetchForExternalLibs]);
    useEffect(() => {
        if (!miniAppId) {
            return;
        }
        let appsUrl = `https://${vkDomain}/app${miniAppId}`;
        if (miniAppGroupId) {
            appsUrl += `_${miniAppGroupId}`;
        }
        const startTime = Date.now();
        Promise.allSettled([
            apiFetch('apps.get', {
                app_id: miniAppId,
                extended: 0,
                // Чтобы правильно передать миниаппам miniAppGroupId нам нужно отдать им оригинальный url аттача миниаппа.
                // Так как у нас всё типизировано и каждый роут - это объект, то здесь собираем url из объекта снова в строку
                url: appsUrl,
            }),
            ...(featureFlags.vkm_webview_url && !initWebviewUrl && peerId && cmid
                ? [
                    apiFetch('messages.getById', {
                        cmids: String(cmid),
                        extended: 0,
                        group_id: getOwnerGroupId(owner.id),
                        peer_id: peerId,
                    }),
                ]
                : []),
        ])
            .then(([appsResponse, messageResponse]) => {
            if (appsResponse.status === 'rejected') {
                throw new Error(appsResponse.reason);
            }
            if (messageResponse?.status === 'fulfilled') {
                const [item] = messageResponse.value.items;
                const message = item && fromApiMessage(featureFlags, item).message;
                if (message?.kind === 'Normal') {
                    const { miniAppWidgets = [] } = message.attaches;
                    const attach = miniAppWidgets.find((item) => item.app.id === miniAppId);
                    if (attach?.app.webviewUrl) {
                        setWebview(attach.app.webviewUrl);
                    }
                }
            }
            return appsResponse.value;
        })
            .then((res) => {
            const app = res.items[0];
            if (!app) {
                throw new Error('No app info');
            }
            const { id, webview_url, title, iframe_settings, icon_75 = '', icon_150 = '', icon_278 = '', } = app;
            // так как запрос асинхронный, то прежде чем сохранить полученные данные следует проверить: актуален ли полученный ответ
            if (currentMiniAppId.current === id) {
                setAppId(id);
                setAppTitle(title);
                setAppUrl(webview_url);
                setAppIframeSize(iframe_settings);
                setAppIcons([icon_75, icon_150, icon_278]);
                setAttachSendingError(null);
                setAppStartTime(startTime);
            }
        })
            .catch((err) => handleMiniAppErrorDebounced(err.message));
        return () => {
            setAppId(undefined);
            setAppTitle(undefined);
            setAppUrl(undefined);
            setAppIframeSize(undefined);
            setAppIcons(['']);
            setAttachSendingError(null);
            setAppStartTime(null);
        };
    }, [
        apiFetch,
        cmid,
        featureFlags,
        initWebviewUrl,
        miniAppGroupId,
        miniAppId,
        owner.id,
        peerId,
        vkDomain,
        handleMiniAppErrorDebounced,
    ]);
    const handleResizeWindow = useCallback((width, height) => {
        setAppIframeSize((prev) => ({
            width: Number(width),
            height: height === undefined && prev ? prev.height : Number(height),
        }));
    }, []);
    if (!miniAppId) {
        return null;
    }
    if (appId && appTitle && appUrl && appIcons && appStartTime) {
        return (React.createElement(React.Fragment, null,
            React.createElement(ModalView, { onEscape: handleClose, isHidden: isHidden },
                React.createElement(ModalBackdrop, { onClick: handleClose, isBodyScrollDisabled: true },
                    React.createElement(ModalPanel, { className: "MEMiniApps", size: appIframeSize },
                        React.createElement("div", { className: "MEMiniApps__container" }, miniAppsRenderer({
                            id: appId,
                            title: appTitle,
                            url: modal?.kind === 'MiniAppModal' &&
                                (referer === ATTACH_PICKER_REFERER ||
                                    referer === MINI_APP_WIDGET_REFERER) &&
                                webview
                                ? webview
                                : appUrl,
                            onError: handleMiniAppErrorDebounced,
                            onMessage: handleMessages,
                            onModalRequest: handleModalRequest,
                            requestApiMethod,
                            onResizeWindow: handleResizeWindow,
                            handlers: customHandlers,
                            ...(modal?.kind === 'MiniAppModal' &&
                                modal.hash && { hash: modal.hash }),
                            performance: {
                                startTime: appStartTime,
                                isDirect: false,
                            },
                        })),
                        React.createElement("button", { "aria-label": lang.use('me_close'), onClick: handleClose, className: "MEMiniApps__close" },
                            React.createElement(Icon24CancelOutline, null))))),
            miniAppRequestDataModal.isActive &&
                miniAppRequestData &&
                confirmationPromiseRef.current && (React.createElement(MiniAppConfirmationModal, { onClose: miniAppRequestDataModal.close, onResolve: confirmationPromiseRef.current.resolve, confirmActions: confirmationFunctionsRef.current, requestData: miniAppRequestData })),
            convoAttachModal.isActive && convoAttachDataModal && (React.createElement(MiniAppPickerConfirmModal, { app: {
                    id: Attach.resolveMiniAppId(appId),
                    title: appTitle,
                    icon75: appIcons[0],
                    icon150: appIcons[1],
                    webviewUrl: webview || appUrl,
                }, pickerPayload: {
                    actionTitle: convoAttachDataModal.title,
                    actionHash: convoAttachDataModal.hash,
                }, onClose: convoAttachModal.close, onCancel: convoAttachDataModal.cancel, onRepeat: convoAttachModal.open, onSuccess: convoAttachDataModal.multichat
                    ? convoAttachToChatsModal.open
                    : convoAttachDataModal.submit, closePicker: handleClose, peerId: convoAttachDataModal.peerId, closeOnSuccess: convoAttachDataModal.closeOnSuccess, apiError: attachSendingError, setApiError: setAttachSendingError, multichat: convoAttachDataModal.multichat, fromApp: true })),
            convoAttachToChatsModal.isActive && convoAttachDataModal && (React.createElement(MiniAppPickerSendToChatsModal, { app: {
                    id: Attach.resolveMiniAppId(appId),
                    title: appTitle,
                    icon75: appIcons[0],
                    icon150: appIcons[1],
                    webviewUrl: webview || appUrl,
                }, pickerPayload: {
                    actionTitle: convoAttachDataModal.title,
                    actionHash: convoAttachDataModal.hash,
                }, onClose: convoAttachToChatsModal.close, onSuccess: convoAttachDataModal.submit, onCancel: convoAttachDataModal.cancel, apiError: attachSendingError, setApiError: setAttachSendingError }))));
    }
    if (appId) {
        return (React.createElement(ModalView, { contextClass: "MEConfig" },
            React.createElement(ModalBackdrop, { onClick: handleClose },
                React.createElement(ModalPanel, { className: "MiniApp__errorModal" },
                    React.createElement(ModalHeader, { closeLabel: lang.use('me_close'), onClose: handleClose, title: lang.use('me_miniapp_error_title') }),
                    React.createElement(ModalBody, null, lang.use('me_miniapp_error_description'))))));
    }
    else {
        return (React.createElement(ModalView, { onEscape: handleClose, isHidden: isHidden },
            React.createElement(ModalBackdrop, { onClick: handleClose, isBodyScrollDisabled: true },
                React.createElement(Spinner, { size: "xl" }))));
    }
};
const MiniAppConfirmationModal = ({ onClose, onResolve, confirmActions, requestData }) => {
    const { lang } = useBrowserEnv();
    const { title, message, caption, acceptButtonText } = requestData;
    const handleButtonClick = (result) => {
        if (confirmActions) {
            result ? confirmActions.onAccept?.() : confirmActions.onDeny?.();
        }
        else {
            onResolve(result);
        }
        onClose();
    };
    return (React.createElement(ModalDialog, { onClose: () => handleButtonClick(false), closeLabel: lang.use('me_close'), title: title, content: React.createElement(React.Fragment, null,
            message,
            caption && (React.createElement(React.Fragment, null,
                React.createElement("br", null),
                React.createElement("br", null),
                caption))), buttons: [
            React.createElement(Button, { mode: "tertiary", key: "cancel", onClick: () => handleButtonClick(false) }, lang.use('me_cancel')),
            React.createElement(Button, { mode: "primary", key: "close", onClick: () => handleButtonClick(true) }, acceptButtonText),
        ] }));
};
//# sourceMappingURL=MiniApp.js.map