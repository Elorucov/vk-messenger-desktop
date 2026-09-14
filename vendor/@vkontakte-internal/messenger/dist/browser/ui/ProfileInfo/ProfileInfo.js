import { Icon24ChevronCompactRight } from '@vkontakte/icons';
import { Button, FormItem, Input, Spinner } from '@vkontakte/vkui';
import { useBrowserEnv, useDispatch, useFeatureFlags, useViewer, } from '../../hooks/misc';
import cx from 'classnames';
import React, { useCallback, useEffect, useMemo, useRef, useState, } from 'react';
import '../../ui/ProfileInfo/ProfileInfo.css';
import { debounce, noop } from '../../../core/utils/misc';
import * as Peer from '../../../core/model/Peer';
import { fromApiViewerProfileInfo } from '../../../data/converter/ViewerConverter';
import { fromApiUser } from '../../../data/converter/PeerConverter';
import { API_ERROR_AUTH_VALIDATION } from '@vkontakte-internal/api-schema-typescript';
import { AvatarSelector } from '../../ui/AvatarSelector/AvatarSelector';
import { ID_VK_COM_BASE } from '../../../core/config/config';
import { IApi } from '../../../data/env/IApi';
import { ExternalLink } from '../../ui/Link/Link';
import { copyTextToClipboard } from '@vkontakte/vkjs';
import { useApiFetch, useApiFetchMany } from '../../hooks/useApiFetch';
export const ProfileInfoModal = ({ onBack, isVKIDHidden = false, }) => {
    const { viewer, profileInfo: { phoneNumber, id, avatarPhoto, screenName: initialScreenName = '', firstName, lastName, }, } = useViewer();
    const MAX_SCREEN_NAME_LENGTH = 25;
    const featureFlags = useFeatureFlags();
    const { lang, uploader } = useBrowserEnv();
    const apiFetch = useApiFetch();
    const apiFetchMany = useApiFetchMany();
    const [changeScreenNameErr, setChangeScreenNameErr] = useState();
    const [newScreenNameAvailable, setNewScreenNameAvailable] = useState(false);
    const [screenName, setScreenName] = useState(initialScreenName);
    const [isCheckingScreenName, setIsCheckingScreenName] = useState(false);
    const [isAvatarPhotoRemoving, setIsAvatarPhotoRemoving] = useState(false);
    const [isProfileInfoRefreshing, setIsProfileInfoRefreshing] = useState(false);
    const [isProfileInfoSaving, setIsProfileInfoSaving] = useState(false);
    const [isAvatarPhotoSaving, setIsAvatarPhotoSaving] = useState(false);
    const [isProfileSettingsSaving, setProfileSettingsSaving] = useState(false);
    const [newAvatarPhoto, setNewAvatarPhoto] = useState();
    const photoId = useMemo(() => viewer.photoId && Number(viewer.photoId), [viewer.photoId]);
    const phone = useMemo(() => phoneNumber?.replace(/\*/g, '·'), [phoneNumber]);
    const dispatch = useDispatch();
    const refreshProfile = useCallback(async () => {
        setIsProfileInfoRefreshing(true);
        try {
            const [profileInfoResponse, usersGetResponse] = await apiFetchMany([
                { method: 'account.getProfileInfo', params: {} },
                {
                    method: 'users.get',
                    params: {
                        user_ids: Peer.toRealId(id).toString(),
                        extended: 1,
                    },
                },
            ]);
            const profileInfo = fromApiViewerProfileInfo(profileInfoResponse);
            const peerFromApi = usersGetResponse[0];
            const { user = undefined } = peerFromApi ? fromApiUser(peerFromApi) : {};
            dispatch({
                type: 'UserProfileInfo_Update',
                profileInfo,
                user,
            });
        }
        catch {
        }
        finally {
            setIsProfileInfoRefreshing(false);
        }
    }, [id, dispatch, apiFetchMany]);
    const removeAvatarPhoto = async () => {
        setIsAvatarPhotoRemoving(true);
        try {
            await apiFetch('photos.delete', {
                photo_id: Number(photoId),
                owner_id: id,
            });
            await refreshProfile();
        }
        catch {
        }
        finally {
            setIsAvatarPhotoRemoving(false);
        }
    };
    const saveProfileInfo = async () => {
        setIsProfileInfoSaving(true);
        try {
            await apiFetch('account.saveProfileInfo', {
                screen_name: screenName,
            });
            return true;
        }
        catch (err) {
            // нужно уйти на другую страничку и пройти валидацию
            if (err instanceof IApi.RequestError) {
                if (err.code === API_ERROR_AUTH_VALIDATION &&
                    typeof err.apiError?.redirect_uri === 'string') {
                    window.open(err.apiError.redirect_uri);
                }
            }
            return false;
        }
        finally {
            setIsProfileInfoSaving(false);
        }
    };
    const saveAvatarPhoto = async (file) => {
        setIsAvatarPhotoSaving(true);
        try {
            await new Promise((resolve, reject) => {
                uploader.uploadFiles([file], { asOwnerPhoto: true }, { viewerId: id }, {
                    onUploadFinish: resolve,
                    onError: reject,
                });
            });
            return true;
        }
        catch {
            return false;
        }
        finally {
            setIsAvatarPhotoSaving(false);
        }
    };
    // иногда изменения приходят из вне, например мы переходили в вкид или пришлось откатить изменения (апи отвалилось)
    useEffect(() => {
        setNewAvatarPhoto(avatarPhoto ? { kind: 'current' } : undefined);
    }, [avatarPhoto]);
    useEffect(() => {
        setScreenName(initialScreenName || '');
    }, [initialScreenName]);
    const isSaveButtonActive = (newAvatarPhoto?.kind !== 'current' || screenName !== initialScreenName) && // пользователь изменил фотку или короткое имя
        !changeScreenNameErr && // при проверке короткого имени нет ошибок
        !isCheckingScreenName && // нет текущего запроса на проверку короткого имени
        !isAvatarPhotoRemoving && // нет текущего запроса на удаление фото
        !isProfileInfoRefreshing && // нет текущего запроса на обновление данных профайла
        !isProfileInfoSaving && // нет текущего запроса на сохранение данных в account.saveProfileInfo
        !isAvatarPhotoSaving; // нет текущего запроса на сохранение аватарки пользователя
    const currentScreenName = useRef(screenName);
    currentScreenName.current = screenName;
    const checkScreenName = useMemo(() => debounce((screenName) => {
        apiFetch('utils.checkScreenName', { screen_name: screenName })
            .then((res) => {
            if (currentScreenName.current === screenName) {
                if (res.status === 0) {
                    setNewScreenNameAvailable(false);
                    setChangeScreenNameErr(res.reason);
                }
                else if (res.status === 1) {
                    setNewScreenNameAvailable(true);
                    setChangeScreenNameErr(undefined);
                }
            }
        })
            .catch(noop)
            .finally(() => {
            if (currentScreenName.current === screenName) {
                setIsCheckingScreenName(false);
            }
        });
    }, 500, false), [apiFetch]);
    const handleScreenNameChange = (e) => {
        const { value } = e.target;
        setNewScreenNameAvailable(false);
        setChangeScreenNameErr(undefined);
        setIsCheckingScreenName(false);
        setScreenName(value);
        if (value === initialScreenName) {
            return;
        }
        setIsCheckingScreenName(true);
        checkScreenName(value);
    };
    useEffect(() => {
        const handleVisibilityChangeEvent = () => {
            if (!document.hidden) {
                void refreshProfile();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChangeEvent);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChangeEvent);
    }, [dispatch, id, refreshProfile]);
    const handleSave = async () => {
        /**
         * мы не можем здесь использовать execute
         * так как если ошибка происходит в методе 'account.saveProfileInfo'
         * то возвращается только error_code = 17
         * а это значит что нужно сделать редирект для прохождения валидации
         * но поле redirect_uri не приходит
         * Поэтому используем отдельный вызов апи 'account.saveProfileInfo'
         */
        if (!isSaveButtonActive) {
            return;
        }
        setProfileSettingsSaving(true);
        const avatarChanges = newAvatarPhoto?.kind === 'preview' && newAvatarPhoto.photo;
        const screenNameChanges = screenName !== initialScreenName;
        const [profileInfoChanged, avatarPhotoChanged] = await Promise.all([
            screenNameChanges && saveProfileInfo(),
            avatarChanges && saveAvatarPhoto(newAvatarPhoto.photo),
        ]);
        if (profileInfoChanged || avatarPhotoChanged) {
            await refreshProfile();
            setProfileSettingsSaving(false);
            onBack();
        }
        else {
            setProfileSettingsSaving(false);
        }
    };
    const handleAvatarSelect = async (avatar) => {
        setNewAvatarPhoto({ kind: 'preview', photo: avatar });
    };
    const handleRemoveAvatar = () => {
        if (newAvatarPhoto?.kind === 'current' && photoId) {
            void removeAvatarPhoto();
        }
        else if (newAvatarPhoto?.kind === 'preview') {
            setNewAvatarPhoto(avatarPhoto ? { kind: 'current' } : undefined);
        }
    };
    const screenNameStatus = useMemo(() => {
        if (changeScreenNameErr) {
            return 'error';
        }
        if (newScreenNameAvailable) {
            return 'valid';
        }
        return 'default';
    }, [changeScreenNameErr, newScreenNameAvailable]);
    const screenNameBottomInfo = useMemo(() => {
        switch (screenNameStatus) {
            case 'error':
                return changeScreenNameErr;
            case 'valid':
                return lang.use('me_profile_info_shortname_avaliable');
            default:
                return '';
        }
    }, [changeScreenNameErr, lang, screenNameStatus]);
    return (React.createElement(React.Fragment, null,
        React.createElement("form", { className: "MEApp__settings ProfileInfo__container", onSubmitCapture: (e) => {
                // Не даем странице перегружаться.
                e.preventDefault();
                handleSave();
            } },
            isVKIDHidden ? null : (React.createElement("div", { className: cx('ProfileInfo__VKID', !featureFlags.vkm_profile_info_screen_name &&
                    'ProfileInfo__VKID--noScreenName') },
                React.createElement("div", { className: "ProfileInfo__VKIDAvatar" },
                    React.createElement(AvatarSelector, { isLoading: isAvatarPhotoRemoving, key: avatarPhoto?.baseUrl, size: 64, onSelection: handleAvatarSelect, onRemove: handleRemoveAvatar, peerId: viewer.id, isDisabled: isAvatarPhotoRemoving })),
                React.createElement(ExternalLink, { href: `${ID_VK_COM_BASE}/account/#/personal`, className: "ProfileInfo__VKIDDetailsCard" },
                    React.createElement("p", { className: "ProfileInfo__name" },
                        firstName,
                        " ",
                        lastName),
                    React.createElement("p", { className: "ProfileInfo__phoneNumber" }, phone),
                    React.createElement("p", { className: "ProfileInfo__VKIDSettings" }, lang.use('me_vkid_settings')),
                    React.createElement(Icon24ChevronCompactRight, { className: "ProfileInfo__chevron" })))),
            featureFlags.vkm_profile_info_screen_name && (React.createElement(React.Fragment, null,
                React.createElement(FormItem, { className: "ProfileInfo__shortNameBox", top: React.createElement(FormItem.Top, null,
                        React.createElement(FormItem.TopLabel, { Component: "h5" },
                            React.createElement("div", { className: "ProfileInfo__screenNameInputTop" },
                                React.createElement("span", null, lang.use('me_profile_info_shortname')),
                                React.createElement("span", null,
                                    screenName.length,
                                    " / ",
                                    MAX_SCREEN_NAME_LENGTH)))), noPadding: true, status: screenNameStatus, bottom: screenNameBottomInfo },
                    React.createElement(Input, { after: isCheckingScreenName && React.createElement(Spinner, { size: "s" }), value: screenName, maxLength: MAX_SCREEN_NAME_LENGTH, onChange: handleScreenNameChange })),
                React.createElement("div", { className: "ProfileInfo__screenNameDescription" },
                    React.createElement("p", null,
                        lang.use('me_profile_info_shortname_description'),
                        ' ',
                        initialScreenName || newScreenNameAvailable ? (React.createElement(React.Fragment, null,
                            lang.use('me_profile_info_your_shortname'),
                            ' ',
                            newScreenNameAvailable ? (React.createElement("span", { className: "ProfileInfo__avaliableScreenName" },
                                "@",
                                screenName)) : (React.createElement("span", { onClick: () => copyTextToClipboard(`@${initialScreenName}`), className: "ProfileInfo__screenName" },
                                "@",
                                initialScreenName)))) : null),
                    React.createElement("p", { className: "ProfileInfo__screenNameValidationInfo" },
                        lang.use('me_profile_info_shortname_validation_rules'),
                        ' ',
                        React.createElement("span", { className: "ProfileInfo__a-z0-9" }, "a-z"),
                        ",",
                        ' ',
                        lang.use('me_profile_info_shortname_validation_rules_digits'),
                        ' ',
                        React.createElement("span", { className: "ProfileInfo__a-z0-9" }, "0-9"),
                        ' ',
                        lang.use('me_profile_info_shortname_validation_rules_point'),
                        ".",
                        ' ',
                        lang.use('me_profile_info_shortname_validation_rules_min_length')))))),
        React.createElement("footer", { className: "ChatSettings__footer" },
            React.createElement(Button, { disabled: !isSaveButtonActive, loading: isProfileSettingsSaving, onClick: handleSave }, lang.use('me_save')))));
};
//# sourceMappingURL=ProfileInfo.js.map