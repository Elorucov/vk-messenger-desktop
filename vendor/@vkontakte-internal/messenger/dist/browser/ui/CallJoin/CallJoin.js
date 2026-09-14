import './CallJoin.css';
import React, { useState, useEffect, useMemo } from 'react';
import cx from 'classnames';
import * as Peer from '../../../core/model/Peer';
import * as Viewer from '../../../core/model/Viewer';
import { useBrowserEnv, useViewer } from '../../hooks/misc';
import { OptimizedSpinner } from '../../ui/OptimizedSpinner/OptimizedSpinner';
import { NoResults } from '../../ui/NoResults/NoResults';
import { ModalWindow } from '../../ui/ModalWindow/ModalWindow';
import { Icon20LockOutline, Icon56ErrorOutline, Icon56PhoneOutline, } from '@vkontakte/icons';
import { Button, Input, FormLayoutGroup, Title, FormItem, } from '@vkontakte/vkui';
import { IApi } from '../../../data/env/IApi';
import { fromApiAnonym, fromApiGroup, fromApiUser, } from '../../../data/converter/PeerConverter';
import { CALL_JOIN_LINK_URL_BASE, ISOLATED_CALL_JOIN_LINK_URL_BASE, } from '../../../core/config/config';
import { IRouter } from '../../../data/env/IRouter';
import { useRouter } from '../../ui/Router/Router';
import { exhaustivenessCheck } from '../../../core/utils/misc';
import { UnifiedServiceModal } from '../../ui/UnifiedServiceModal/UnifiedServiceModal';
import { fromApiPicture } from '../../../data/converter/PictureConverter';
import { createSferumShortenedCallUrl, createShortenedCallUrl, } from '../../../core/utils/links';
import { useApiFetch } from '../../hooks/useApiFetch';
const CALLS_PASSWORD_REQUIRED_ERROR = 9015;
/**
 * Необходимо форсить стейт загрузки для кейса переключения аккаунта из конвы
 * так как делаем редирект на MainRoute и модалка присоединения открывается снова
 * редирект на MainRoute нужен, чтобы закрыть конву потому что после смены аккаунта откроется DELETED конва,
 * так как при смене аккаунта происходит location.reload состояние сброситься автоматически
 */
let isForceLoading = false;
export const CallJoin = ({ callId, shortId, onJoin, onSetAccount, registerAccount, }) => {
    const { calls, lang, router } = useBrowserEnv();
    const apiFetch = useApiFetch();
    const viewer = useViewer();
    const { screenRoute, replace } = useRouter();
    const [isLoading, setLoading] = useState(false);
    const [hasFailed, setFailed] = useState(false);
    const [errorCode, setErrorCode] = useState(null);
    const [isAccessDeniedEduCall, setAccessDeniedEduCall] = useState(false);
    const [password, setPassword] = useState('');
    const isEdu = Viewer.isEdu(viewer.profileType);
    const accountToSwitch = isEdu
        ? Viewer.mainAccount(viewer)
        : Viewer.eduAccount(viewer);
    const switchAccount = () => {
        if (!accountToSwitch) {
            if (isEdu) {
                const handleShortId = (callId) => {
                    const { url } = router.fromEntity({
                        kind: 'CallJoinShortenedProxyRoute',
                        callJoinId: callId,
                        password: screenRoute.p,
                    }, IRouter.Action.Push);
                    if (!url) {
                        return;
                    }
                    window.open(url, '_blank');
                };
                const handleHash = (hash) => {
                    const { url } = router.fromEntity({
                        kind: 'CallJoinProxyRoute',
                        callJoinHash: hash,
                    }, IRouter.Action.Push);
                    if (!url) {
                        return;
                    }
                    window.open(url, '_blank');
                };
                switch (screenRoute.kind) {
                    case 'CallJoinShortenedRoute':
                        if (screenRoute.callJoinId) {
                            handleShortId(screenRoute.callJoinId);
                        }
                        break;
                    case 'CallJoinRoute':
                        if (screenRoute.callJoinHash) {
                            handleHash(screenRoute.callJoinHash);
                        }
                        break;
                    case 'ConvoRoute':
                    case 'MainRoute':
                        if (screenRoute.callJoinId) {
                            handleShortId(screenRoute.callJoinId);
                        }
                        if (screenRoute.callJoinHash) {
                            handleHash(screenRoute.callJoinHash);
                        }
                        break;
                    case 'ChannelRoute':
                    case 'ChannelsFolderRoute':
                    case 'ChatJoinRoute':
                    case 'NotFoundRoute':
                    case 'SettingsRoute':
                    case 'SpaceRoute':
                    case 'SpaceRoomRoute':
                        return;
                    default:
                        exhaustivenessCheck(screenRoute);
                }
            }
            else {
                registerAccount('edu');
            }
            return;
        }
        switch (screenRoute.kind) {
            case 'ConvoRoute':
            case 'MainRoute':
                if (!screenRoute.callJoinHash && !screenRoute.callJoinId) {
                    return;
                }
                isForceLoading = true;
                replace({
                    kind: 'MainRoute',
                    callJoinHash: screenRoute.callJoinHash,
                    callJoinId: screenRoute.callJoinId,
                    p: screenRoute.p || password,
                });
                onSetAccount(accountToSwitch.id, false);
                break;
            default:
                onSetAccount(accountToSwitch.id, false);
        }
    };
    const fetchCall = async (callLink) => {
        try {
            setFailed(false);
            setAccessDeniedEduCall(false);
            return {
                result: true,
                call: fromApiCallPreview(await apiFetch('messages.getCallPreview', {
                    link: callLink,
                    extended: 1,
                })),
            };
        }
        catch (error) {
            setFailed(true);
            if (error instanceof IApi.RequestError) {
                setErrorCode(error.code);
                return {
                    result: false,
                    errorCode: error.code,
                };
            }
            return {
                result: false,
            };
        }
    };
    const getErrorDescription = (code) => {
        switch (code) {
            case 951:
                return lang.use('me_call_join_error_completed');
            case 954:
                return lang.use('me_call_join_error_invalid_link');
            case 961:
                return lang.use('me_call_join_error_outdated_link');
            case 963:
                return lang.use('me_call_join_error_permissions');
            default:
            case 952:
                return lang.use('me_call_join_error_unknown');
        }
    };
    const isUnknownError = (code) => {
        switch (code) {
            case 951:
            case 954:
            case 961:
            case 963:
                return false;
            default:
            case 952:
                return true;
        }
    };
    const link = useMemo(() => {
        /**
         * Ссылки на звонок обрабатываются в формате https://vk.com/call/join/<ID>, для изолированного режима
         * (в том числе - учебные аккаунты), формат ссылки https://web.vk.me/#/call/join/<ID>
         */
        let link = null;
        if (callId) {
            link = `${router.checkIsolation()
                ? ISOLATED_CALL_JOIN_LINK_URL_BASE
                : CALL_JOIN_LINK_URL_BASE}${callId}`;
        }
        if (shortId) {
            link = router.checkIsolation()
                ? createSferumShortenedCallUrl(shortId, screenRoute.p || password)
                : createShortenedCallUrl(shortId, screenRoute.p || password);
        }
        return link;
    }, [callId, shortId, screenRoute, router, password]);
    /**
     * Видимая ссылка в форме ввода пароля
     * Должна быть без пароля (ссылка выше, link, это ссылка чисто для getCallPreview, техническая)
     */
    const visibleShortLink = useMemo(() => {
        let link = '';
        if (shortId) {
            link = router.checkIsolation()
                ? createSferumShortenedCallUrl(shortId)
                : createShortenedCallUrl(shortId);
        }
        return link;
    }, [shortId, router]);
    const openCallJoinWindow = async () => {
        try {
            setLoading(true);
            if (!link) {
                return;
            }
            const response = await fetchCall(link);
            if (response.result) {
                const preview = response.call;
                if ((preview.isEdu && !isEdu) || (!preview.isEdu && isEdu)) {
                    setAccessDeniedEduCall(true);
                }
                else {
                    if (!preview.joinLink) {
                        throw new Error('Звонок не содержит ссылки для подключения');
                    }
                    await calls?.showJoinPopup(link, 'join_popup');
                    onJoin();
                }
            }
        }
        catch (error) {
            console.error(error);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        void openCallJoinWindow();
        // Хук должен вызваться только один раз при первом рендере
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [callId, shortId]);
    if (!callId && !shortId) {
        return null;
    }
    const onPasswordChange = (event) => {
        if (!(event.target instanceof HTMLInputElement)) {
            return;
        }
        setPassword(event.target.value);
    };
    const getCall = () => {
        openCallJoinWindow();
    };
    const render = () => {
        if (isLoading) {
            return React.createElement(OptimizedSpinner, null);
        }
        if (!hasFailed && !isAccessDeniedEduCall) {
            return null;
        }
        if (hasFailed) {
            if (errorCode === CALLS_PASSWORD_REQUIRED_ERROR) {
                return (React.createElement("div", { className: "CallJoin_passwordForm" },
                    React.createElement("div", { className: "CallJoin__passwordFormIcon" },
                        React.createElement(Icon56PhoneOutline, null)),
                    React.createElement("div", { className: "CallJoin__passwordFormName" },
                        React.createElement(Title, { level: "2", weight: "2", useAccentWeight: true }, lang.use('me_call_join_password_form_title'))),
                    React.createElement(FormLayoutGroup, { mode: "vertical", segmented: true, className: "CallJoin__passwordFormGroup" },
                        React.createElement(FormItem, null,
                            React.createElement(Input, { type: "text", value: visibleShortLink, disabled: true })),
                        React.createElement(FormItem, null,
                            React.createElement(Input, { type: "text", value: password, onChange: onPasswordChange, before: React.createElement(Icon20LockOutline, null), placeholder: lang.use('me_call_join_password_placeholder') }))),
                    React.createElement("div", { className: "CallJoin_passwordFormActions" },
                        React.createElement(Button, { stretched: true, disabled: !password, onClick: getCall, size: "l" }, lang.use('me_call_join_password_form_button_name')))));
            }
            return (React.createElement(NoResults, { icon: React.createElement(Icon56ErrorOutline, null) },
                React.createElement("div", null, getErrorDescription(errorCode)),
                isUnknownError(errorCode) && (React.createElement("div", { className: "CallJoin__noResultsAction" },
                    React.createElement(Button, { onClick: openCallJoinWindow }, lang.use('me_call_join_button_retry'))))));
        }
        return null;
    };
    if (isForceLoading) {
        return (React.createElement(MainModal, { onJoin: onJoin },
            React.createElement(OptimizedSpinner, null)));
    }
    if (isAccessDeniedEduCall) {
        const actionButton = (React.createElement(Button, { onClick: switchAccount, stretched: true, size: "l", className: cx('CallJoin__button', { 'CallJoin__button--edu': isEdu }) }, lang.use('me_proceed')));
        const icon = (React.createElement("div", { className: cx('CallJoin__icon', { 'CallJoin__icon--edu': isEdu }) },
            React.createElement(Icon56PhoneOutline, null)));
        return (React.createElement(UnifiedServiceModal, { handleModalClose: onJoin, title: lang.use(isEdu
                ? 'me_call_join_vkm_account_error_caption'
                : 'me_call_join_edu_account_error_caption'), subtitle: lang.use(isEdu
                ? 'me_call_join_vkm_account_error_description'
                : 'me_call_join_edu_account_error_description'), image: icon, footer: actionButton }));
    }
    return React.createElement(MainModal, { onJoin: onJoin }, render());
};
const MainModal = ({ onJoin, children, }) => {
    const { lang } = useBrowserEnv();
    return (React.createElement(ModalWindow, { onClose: onJoin, title: lang.use('me_call_join_modal_title'), withCustomLayout: true },
        React.createElement("div", { className: "CallJoin__container" }, children)));
};
export function fromApiCallPreview(response) {
    return {
        joinLink: response.join_link,
        secret: response.secret,
        isEdu: response.is_edu,
        call: {
            membersCount: response.preview?.members_count,
            title: response.preview?.title,
            photo: {
                photo: fromApiPicture({
                    baseUrl: response.preview?.photo?.photo_base,
                    photo50: response.preview?.photo?.photo_50,
                    photo100: response.preview?.photo?.photo_100,
                    photo200: response.preview?.photo?.photo_200,
                }),
                isDefaultPhoto: response.preview?.photo?.is_default_photo,
                isDefaultCallPhoto: response.preview?.photo?.is_default_call_photo,
            },
            canJoin: response.can_join,
            members: fromApiCallPreviewMembers({
                profiles: response.profiles,
                groups: response.groups,
                anonyms: response.anonyms,
            }),
        },
        room: {
            id: response.room?.room_id,
            name: response.room?.name,
            description: response.room?.description,
            status: response.room?.status,
            privacy: response.room?.privacy,
            createdOn: response.room?.created_time,
            joinLink: response.room?.join_link,
        },
    };
}
function fromApiCallPreviewMembers({ profiles, groups, anonyms, }) {
    return [
        ...(profiles?.map((profile) => {
            const user = fromApiUser(profile).user;
            return {
                id: user.id,
                name: Peer.name(user),
                photo50: user.photo?.photo50,
                photo: user.photo,
            };
        }) || []),
        ...(groups?.map((apiGroup) => {
            const group = fromApiGroup(apiGroup);
            return {
                id: group.id,
                name: Peer.name(group),
                photo50: group.photo?.photo50,
                photo: group.photo,
            };
        }) || []),
        ...(anonyms
            ?.map((apiAnonym) => {
            const anonym = fromApiAnonym(apiAnonym);
            if (!anonym) {
                return undefined;
            }
            return {
                id: anonym.id,
                name: anonym.name,
                photo50: anonym.photo?.photo50,
                photo: anonym.photo,
            };
        })
            .filter((anonym) => anonym !== undefined) || []),
    ];
}
//# sourceMappingURL=CallJoin.js.map