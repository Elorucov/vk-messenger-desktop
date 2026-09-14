import '../../ui/SettingsContent/SettingsContent.css';
import React, { useCallback, useEffect, useId, useMemo, useState, } from 'react';
import { ScrollbarProvider } from '@vkontakte-internal/scrollbar';
import { Icon12Chevron, Icon12Dropdown, Icon16Done, Icon24Back, Icon24CheckShieldOutline, Icon24ChevronCompactRight, Icon24DoorArrowRightOutline, Icon28BankOutline, Icon28CameraAddOutline, Icon28CheckCircleOn, } from '@vkontakte/icons';
import { Button, Header, PanelHeader, Placeholder, Separator, Spacing, Switch, Text, Title, useAdaptivityWithJSMediaQueries, } from '@vkontakte/vkui';
import { useBrowserEnv, useDispatch, useFeatureFlags, useOrganisers, useStoreState, useViewer, } from '../../hooks/misc';
import { ExternalLink, Link } from '../../ui/Link/Link';
import { FieldGroup, FieldGroupItem } from '../../ui/FieldGroup/FieldGroup';
import { AvatarSelector } from '../../ui/AvatarSelector/AvatarSelector';
import { ProfileInfoModal } from '../../ui/ProfileInfo/ProfileInfo';
import { useModal } from '../../hooks/useModal';
import { ModalInterface } from '../../ui/ModalInterface/ModalInterface';
import { FoldersSettings } from '../../ui/FoldersSettings/FoldersSettings';
import { SettingsSchedule } from '../../ui/SettingsSchedule/SettingsSchedule';
import { ActionsMenu, ActionsMenuAction, } from '../../ui/ActionsMenu/ActionsMenu';
import { SettingsContentAccountForm } from '../../ui/SettingsContentAccountForm/SettingsContentAccountForm';
import { exhaustivenessCheck, isDev } from '../../../core/utils/misc';
import * as Peer from '../../../core/model/Peer';
import * as Viewer from '../../../core/model/Viewer';
import * as Attach from '../../../core/model/Attach';
import { API_GET_MULTI_FIELDS, EDU_SYSTEM_INTEGRATION_MINI_APP_ID, ID_VK_COM_BASE, } from '../../../core/config/config';
import { fromApiViewerAccount, fromApiViewerProfileInfo, } from '../../../data/converter/ViewerConverter';
import { fromApiPrivacy, fromApiUser } from '../../../data/converter/PeerConverter';
import { Dropdown } from '../../ui/Dropdown/Dropdown';
import { BubblesThemeSwitcher } from '../../ui/BubblesThemeSwitcher/BubblesThemeSwitcher';
import { isMac } from '../../utils/misc';
import { useLayoutData } from '../../ui/LayoutDataProvider/LayoutDataProvider';
import { NotificationsGuide } from '../../ui/NotificationsGuide/NotificationsGuide';
import { useWithoutBubblesTheme } from '../../hooks/useWithoutBubblesTheme';
import { ThemeStyleControl } from '../../ui/ThemeStyleControl/ThemeStyleControl';
import { OrganizationCell } from '../../ui/OrganizationCell/OrganizationCell';
import { useRouter } from '../../ui/Router/Router';
import { InformationBanner } from '../../ui/InformationBanner/InformationBanner';
import { useStatsOnMount } from '../../hooks/useStatsOnMount';
import { OptimizedSpinner } from '../../ui/OptimizedSpinner/OptimizedSpinner';
import { useSnackbar } from '../../hooks/useSnackbar';
import cx from 'classnames';
import { useApiFetch, useApiFetchMany } from '../../hooks/useApiFetch';
import { VKCOMSwitchInterfaceSetting } from '../../ui/SettingsContent/VKCOMSwitchInterfaceSetting';
import { VKCOMSwitchLayoutSetting } from '../../ui/SettingsContent/VKCOMSwitchLayoutSetting';
export const WebVkMeSettingsContent = ({ route, showPanelHeader, onLogout, onNotificationPermissionChange, foldersView, notificationUnblockPics, }) => {
    const locks = useStoreState('locks');
    const { folders, recommendedFolders } = useOrganisers();
    const { lang } = useBrowserEnv();
    const featureFlags = useFeatureFlags();
    const { viewer, profileType } = useViewer();
    const isEdu = Viewer.isEdu(profileType);
    const { section } = route;
    const headerText = useMemo(() => {
        switch (section) {
            case 'account':
                return lang.use('me_account');
            case 'main':
            case 'start':
                return lang.use('me_settings_menu_main');
            case 'folders':
                return lang.use('me_settings_menu_folders');
            case 'notifications':
                return lang.use('me_settings_menu_notifications');
            case 'theme':
                return lang.use('me_settings_menu_theme');
            case 'experimental':
                return lang.use('me_settings_menu_experimental');
            case 'about':
                return lang.use('me_settings_menu_about');
            case 'edu':
                return lang.use('me_settings_menu_edu_organizations');
            case 'schedule':
                return lang.use('me_settings_menu_schedule');
            case 'achievements':
                return lang.use('me_settings_menu_achievements');
            case 'privacy':
                return lang.use('me_settings_menu_privacy');
            default:
                exhaustivenessCheck(section);
        }
    }, [section, lang]);
    const backTo = useMemo(() => {
        return { kind: 'SettingsRoute', section: 'start', back: route.back };
    }, [route]);
    const renderSection = () => {
        switch (section) {
            case 'account': {
                return React.createElement(SettingsAccount, { onLogout: onLogout });
            }
            case 'start':
            case 'main': {
                return React.createElement(SettingsMain, null);
            }
            case 'folders': {
                return (React.createElement(SettingsFolders, { folders: folders, recommendedFolders: recommendedFolders, locks: locks, foldersView: foldersView }));
            }
            case 'notifications': {
                return (React.createElement(SettingsNotifications, { folders: folders, notificationUnblockPics: notificationUnblockPics, onPermissionChange: onNotificationPermissionChange, hasUnreadCountControls: false, hasSoundNotificationsControl: true }));
            }
            case 'theme': {
                return (React.createElement(SettingsTheme, { themeControl: true, themeStylesControl: true }, isDev && React.createElement(VKCOMSwitchLayoutSetting, null)));
            }
            case 'experimental': {
                return React.createElement(SettingsExperimental, null);
            }
            case 'edu': {
                if (!isEdu) {
                    return null;
                }
                return React.createElement(SettingsEduOrganizations, null);
            }
            case 'schedule': {
                if (featureFlags.vkm_enable_schedule_edu &&
                    Peer.hasEduOrganizationalRoles(viewer)) {
                    return React.createElement(SettingsSchedule, null);
                }
                return null;
            }
            case 'privacy': {
                if (!isEdu) {
                    return null;
                }
                return React.createElement(SettingsPrivacy, null);
            }
            case 'achievements':
            case 'about': {
                return null;
            }
            default:
                exhaustivenessCheck(section);
        }
    };
    return (React.createElement(ScrollbarProvider, { overflowX: "hidden", className: "SettingsContent" },
        showPanelHeader && (React.createElement(PanelHeader, { fixed: false, delimiter: "none", className: "SettingsContent__panelHeader", before: React.createElement(Button, { mode: "tertiary", size: "l", before: React.createElement(Icon24Back, { fill: 'var(--vkui--color_text_secondary)' }), Component: Link, 
                // @ts-expect-error не кастятся пропсы Link
                to: backTo }) },
            React.createElement(Title, { level: "3", Component: "h3" }, headerText))),
        React.createElement("div", { className: cx({ SettingsContent__body: !showPanelHeader }) }, renderSection())));
};
export const SettingsMain = ({ children }) => {
    const { lang } = useBrowserEnv();
    const viewerData = useViewer();
    const { settings, accounts, viewer, profileType } = viewerData;
    const dispatch = useDispatch();
    const { isMobileLayout } = useLayoutData();
    const { hasPointer } = useAdaptivityWithJSMediaQueries();
    const isCtrlSubmitEnabled = Viewer.isCtrlSubmitEnabled(viewerData, isMobileLayout);
    const isEdu = Viewer.isEdu(profileType);
    const canSwitchEduAccount = accounts.length === 2 &&
        accounts.some((acc) => Viewer.isEdu(acc.profileType));
    const archiveId = useId();
    const setLanguage = async (languageId) => {
        dispatch({
            type: 'ViewerSetLanguage',
            languageId,
        });
    };
    return (React.createElement(React.Fragment, null,
        hasPointer && (React.createElement(FieldGroup, { title: lang.use('me_settings_input_mode') },
            React.createElement(FieldGroupItem, { after: React.createElement(SubmitOptionControl, { isCtrSubmitSelected: isCtrlSubmitEnabled, onChange: (isCtrSelected) => dispatch({
                        type: 'UserChangedSetting',
                        setting: 'ctrSubmitFromApi',
                        value: isCtrSelected,
                    }) }) }, lang.use('me_settings_message_submit')),
            React.createElement(Spacing, { size: 0 },
                React.createElement(Separator, null)),
            React.createElement(FieldGroupItem, { after: React.createElement(FastActionControl, { selectedValue: settings.fastActionsTriggerFromApi, onChange: (value) => dispatch({
                        type: 'UserChangedSetting',
                        setting: 'fastActionsTriggerFromApi',
                        value,
                    }) }) }, lang.use('me_settings_message_actions_control')))),
        React.createElement(FieldGroup, { title: lang.use('me_settings_archive') },
            React.createElement(FieldGroupItem, { subtitle: lang.use('me_settings_auto_unarchive_note'), after: React.createElement(Switch, { checked: settings.autoUnarchive, onChange: (e) => dispatch({
                        type: 'UserChangedSetting',
                        setting: 'autoUnarchive',
                        value: Boolean(e.target.checked),
                    }) }) }, lang.use('me_settings_auto_unarchive'))),
        canSwitchEduAccount && (React.createElement(FieldGroup, { title: lang.use('me_settings_other') },
            React.createElement(FieldGroupItem, { id: archiveId, subtitle: lang.use('me_settings_account_switch_button_hint'), after: React.createElement(Switch, { "aria-labelledby": archiveId, checked: settings.eduAccountSwitchBanner, onChange: (e) => dispatch({
                        type: 'UserChangedSetting',
                        setting: 'eduAccountSwitchBanner',
                        value: Boolean(e.target.checked),
                    }) }) }, lang.use('me_settings_account_switch_button')))),
        isEdu && (React.createElement(FieldGroup, { title: lang.use('me_settings_language_section') },
            React.createElement(FieldGroupItem, { after: React.createElement(LanguageOption, { currentLanguageId: viewer.languageId, onChange: setLanguage }) }, lang.use('me_settings_language')))),
        children));
};
export const SettingsNotifications = ({ folders, hasSoundNotificationsControl, hasUnreadCountControls, notificationUnblockPics, onPermissionChange, notificationsField, }) => {
    const { lang, browserNotifications, stats, vkcom_me, envFeatureFlags } = useBrowserEnv();
    const { settings } = useViewer();
    const dispatch = useDispatch();
    const featureFlags = useFeatureFlags();
    const soundNotificationsId = useId();
    const countNotMutedId = useId();
    const countGroupMessagesId = useId();
    const countChannelsId = useId();
    const messageNotificationsId = useId();
    const reactionNotificationsId = useId();
    const notificationGuideModal = useModal();
    const [permission, setPermission] = useState(() => browserNotifications?.getPermission() ?? 'unknown');
    const [isExternal, setExternal] = useState(() => Boolean(browserNotifications?.isExternal()));
    useEffect(() => {
        setPermission(browserNotifications?.getPermission() ?? 'unknown');
        browserNotifications?.onSystemSettingChange((value) => {
            setPermission(browserNotifications?.getPermission() ?? 'unknown');
            setExternal(Boolean(browserNotifications?.isExternal()));
            onPermissionChange?.();
            dispatch({
                type: 'UserChangedBrowserNotifications',
                value,
            });
        });
    }, [browserNotifications, dispatch, onPermissionChange]);
    const handleClick = useCallback(() => {
        switch (permission) {
            case 'default':
                browserNotifications?.onChange(true);
                return;
            case 'denied':
                notificationGuideModal.open();
                return;
            default:
                return;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [browserNotifications, notificationGuideModal.open, permission]);
    const channelsFolderName = useMemo(() => {
        return folders.find((folder) => folder.type === 'channels')?.name;
    }, [folders]);
    const managedGroupsFolderName = useMemo(() => {
        return folders.find((folder) => folder.type === 'managed_groups')?.name;
    }, [folders]);
    const countGroupDialogsControl = managedGroupsFolderName && featureFlags.vkm_count_group_dialog_setting;
    const countChannelsControl = !!channelsFolderName;
    const handleClickBrowserNotification = () => {
        vkcom_me?.openNotificationsSettings();
    };
    const handleChangeCountOnlyNotMuted = useCallback((e) => {
        dispatch({
            type: 'UserChangedSetting',
            setting: 'countOnlyNotMuted',
            value: featureFlags.vkm_new_notifications_display
                ? Boolean(e.target.checked)
                : !Boolean(e.target.checked),
        });
        stats.logEvent({
            type: 'type_click',
            type_click: {
                item: {
                    type: 'click_item',
                },
                type: 'type_im_counter_settings_click',
                type_im_counter_settings_click: {
                    event: 'enabled',
                    label: 'chats_counter',
                    label_type: featureFlags.vkm_new_notifications_display
                        ? Boolean(e.target.checked)
                            ? 'with_push'
                            : 'all'
                        : !Boolean(e.target.checked)
                            ? 'with_push'
                            : 'all',
                },
            },
        });
    }, [dispatch, featureFlags.vkm_new_notifications_display, stats]);
    const handleChangeCountGroupDialogs = useCallback((e) => {
        dispatch({
            type: 'UserChangedSetting',
            setting: 'countGroupDialogs',
            value: Boolean(e.target.checked),
        });
        stats.logEvent({
            type: 'type_click',
            type_click: {
                item: {
                    type: 'click_item',
                },
                type: 'type_im_counter_settings_click',
                type_im_counter_settings_click: {
                    event: Boolean(e.target.checked)
                        ? 'counter_enabled'
                        : 'counter_disabled',
                    label: 'communities_counter_manual',
                },
            },
        });
    }, [dispatch, stats]);
    const handleChangeCountChannels = useCallback((e) => {
        dispatch({
            type: 'UserChangedSetting',
            setting: 'countChannels',
            value: Boolean(e.target.checked),
        });
        stats.logEvent({
            type: 'type_click',
            type_click: {
                item: {
                    type: 'click_item',
                },
                type: 'type_im_counter_settings_click',
                type_im_counter_settings_click: {
                    event: Boolean(e.target.checked)
                        ? 'counter_enabled'
                        : 'counter_disabled',
                    label: 'channel_counter_manual',
                },
            },
        });
    }, [dispatch, stats]);
    const getNotificationsFieldTitle = () => {
        if (notificationsField?.title) {
            return notificationsField.title;
        }
        return featureFlags.vkm_new_notifications_display && isExternal
            ? lang.use('me_settings_browser_notifications_messages_calls_new')
            : lang.use('me_settings_browser_notifications_messages_calls');
    };
    const getNotificationsFieldSubTitle = () => {
        if (notificationsField?.subtitle) {
            return notificationsField.subtitle;
        }
        return featureFlags.vkm_new_notifications_display && isExternal
            ? lang.use('me_settings_browser_notifications_messages_calls_note_new')
            : lang.use('me_settings_browser_notifications_messages_calls_note');
    };
    const notificationsGroup = (React.createElement(React.Fragment, null,
        !isExternal && (permission === 'default' || permission === 'denied') && (React.createElement(InformationBanner, { title: lang.use('me_settings_notifications_banner_title'), subtitle: lang.use('me_settings_notifications_banner_subtitle'), type: permission === 'denied' ? 'danger' : 'primary', action: React.createElement(Button, { onClick: handleClick }, lang.use('me_settings_notifications_banner_action')) })),
        React.createElement(FieldGroup, { title: featureFlags.vkm_new_notifications_display
                ? lang.use('me_settings_application_new')
                : lang.use('me_settings_application') },
            hasSoundNotificationsControl && (React.createElement(FieldGroupItem, { id: soundNotificationsId, after: React.createElement(Switch, { checked: settings.soundNotifications, "aria-labelledby": soundNotificationsId, onChange: (e) => dispatch({
                        type: 'UserChangedSetting',
                        setting: 'soundNotifications',
                        value: Boolean(e.target.checked),
                    }) }) }, lang.use('me_settings_sound_notifications'))),
            browserNotifications && (React.createElement(React.Fragment, null,
                React.createElement(Spacing, { size: 0 },
                    React.createElement(Separator, null)),
                React.createElement(FieldGroupItem, { id: messageNotificationsId, onClick: featureFlags.vkm_new_notifications_display && isExternal
                        ? handleClickBrowserNotification
                        : undefined, subtitle: getNotificationsFieldSubTitle(), after: React.createElement(BrowserNotificationsControl, { isExternal: isExternal, permission: permission, browserNotifications: browserNotifications, ariaLabelledby: messageNotificationsId, disabled: permission === 'denied' }) }, getNotificationsFieldTitle()))),
            featureFlags.vkm_reactions && !isExternal && (React.createElement(React.Fragment, null,
                React.createElement(Spacing, { size: 0 },
                    React.createElement(Separator, null)),
                React.createElement(FieldGroupItem, { id: reactionNotificationsId, subtitle: lang.use('me_settings_reaction_notifications_note'), after: React.createElement(Switch, { checked: settings.push.messageReaction.isEnabled &&
                            Boolean(settings.browserNotifications), disabled: !settings.browserNotifications, "aria-labelledby": reactionNotificationsId, onChange: (e) => dispatch({
                            type: 'UserChangedPushSetting',
                            setting: 'messageReaction',
                            value: {
                                isEnabled: Boolean(e.target.checked),
                                withMessageText: true,
                            },
                        }) }) }, lang.use('me_settings_reaction_notifications'))))),
        notificationGuideModal.isActive && (React.createElement(NotificationsGuide, { onClose: notificationGuideModal.close, notificationUnblockPics: notificationUnblockPics }))));
    return (React.createElement(React.Fragment, null,
        !envFeatureFlags.isNotificationsUnavailable && notificationsGroup,
        hasUnreadCountControls && (React.createElement(FieldGroup, { title: lang.use('me_settings_count_unread') },
            React.createElement(FieldGroupItem, { id: countNotMutedId, subtitle: featureFlags.vkm_new_notifications_display &&
                    lang.use('me_settings_count_not_muted_subtitle'), after: React.createElement(Switch, { checked: featureFlags.vkm_new_notifications_display
                        ? settings.countOnlyNotMuted
                        : !settings.countOnlyNotMuted, "aria-labelledby": countNotMutedId, onChange: handleChangeCountOnlyNotMuted }) }, featureFlags.vkm_new_notifications_display
                ? lang.use('me_settings_count_not_muted_new')
                : lang.use('me_settings_count_not_muted')),
            (countGroupDialogsControl || countChannelsControl) && (React.createElement(React.Fragment, null,
                React.createElement(Spacing, { size: 4 },
                    React.createElement(Separator, null)),
                React.createElement(Header, { size: "s" }, lang.use('me_settings_count_unread_includes')))),
            countGroupDialogsControl && (React.createElement(FieldGroupItem, { id: countGroupMessagesId, after: React.createElement(Switch, { checked: settings.countGroupDialogs, "aria-labelledby": countGroupMessagesId, onChange: handleChangeCountGroupDialogs }) }, lang.use('me_settings_count_unread_folder', {
                values: { name: managedGroupsFolderName },
            }))),
            countChannelsControl && (React.createElement(FieldGroupItem, { id: countChannelsId, after: React.createElement(Switch, { checked: settings.countChannels, "aria-labelledby": countChannelsId, onChange: handleChangeCountChannels }) }, lang.use('me_settings_count_unread_folder', {
                values: { name: channelsFolderName },
            })))))));
};
export const SettingsFolders = ({ folders, recommendedFolders, locks, foldersView, }) => {
    return (React.createElement(FoldersSettings, { locks: locks, folders: folders, recommendedFolders: recommendedFolders, foldersView: foldersView }));
};
export const SettingsTheme = ({ themeControl, themeStylesControl, children }) => {
    const { lang, envFeatureFlags } = useBrowserEnv();
    const { settings, viewer } = useViewer();
    const dispatch = useDispatch();
    const featureFlags = useFeatureFlags();
    const { isMobileLayout, isTwoColumnLayout } = useLayoutData();
    const isWithoutBubblesTheme = useWithoutBubblesTheme();
    const bubblesThemeControl = !!featureFlags.vkm_bubble_theme_default_value && !isMobileLayout;
    const reactionAnimationsId = useId();
    const shouldShowThemeStylesSettings = envFeatureFlags.themeStyles && themeStylesControl && !isWithoutBubblesTheme;
    return (React.createElement(React.Fragment, null,
        children,
        bubblesThemeControl && (React.createElement(FieldGroup, { title: lang.use('me_settings_messages_theme_title') },
            React.createElement(BubblesThemeSwitcher, { activeThemeStyleId: settings.themeStyleId, onClick: (value) => {
                    if (value === 'enabled') {
                        dispatch({
                            type: 'UserChangedBubblesTheme',
                            value,
                            themeStyleId: settings.themeStyleId,
                        });
                        return;
                    }
                    if (value === 'disabled') {
                        dispatch({
                            type: 'UserChangedBubblesTheme',
                            value,
                        });
                        return;
                    }
                }, author: viewer }))),
        (themeControl || shouldShowThemeStylesSettings) && (React.createElement(FieldGroup, { title: lang.use('me_settings_theme_title') },
            themeControl && (React.createElement(FieldGroupItem, { after: React.createElement(ThemeControl, { theme: settings.theme, onChange: (value) => dispatch({
                        type: 'SettingThemeUpdated',
                        value,
                    }) }) }, lang.use('me_settings_theme'))),
            shouldShowThemeStylesSettings && (React.createElement(React.Fragment, null,
                React.createElement(ThemeStyleControl, { activeThemeStyleId: settings.themeStyleId, onChange: (value) => dispatch({
                        type: 'SettingsThemeStyleUpdated',
                        themeStyleId: value,
                    }) }),
                React.createElement(FieldGroupItem, { subtitle: lang.use('me_theme_style_enabled_settings_subtitle'), after: React.createElement(Switch, { checked: settings.showThemeStyles, onChange: (e) => dispatch({
                            type: 'UserChangedSetting',
                            setting: 'showThemeStyles',
                            value: Boolean(e.target.checked),
                        }) }) }, lang.use('me_theme_style_enabled_settings_title')))))),
        featureFlags.vkm_reactions && (React.createElement(FieldGroup, { title: lang.use('me_settings_message_reactions_title') },
            React.createElement(FieldGroupItem, { id: reactionAnimationsId, after: React.createElement(Switch, { checked: settings.messageReactionAnimation, "aria-labelledby": reactionAnimationsId, onChange: (e) => dispatch({
                        type: 'UserChangedSetting',
                        setting: 'messageReactionAnimation',
                        value: Boolean(e.target.checked),
                    }) }) }, lang.use('me_settings_message_reactions_animation')))),
        React.createElement(FieldGroup, { title: lang.use('me_settings_stickers_title') },
            React.createElement(FieldGroupItem, { subtitle: lang.use('me_settings_stickers_animation_subtitle'), after: React.createElement(Switch, { checked: settings.isStickersAnimationEnabled, onChange: (e) => {
                        dispatch({
                            type: 'ChangeStickersSettings',
                            setting: 'isStickersAnimationEnabled',
                            value: e.target.checked,
                        });
                    } }) }, lang.use('me_settings_stickers_animation'))),
        featureFlags.vkm_compact_mode_button_switch && isTwoColumnLayout && (React.createElement(FieldGroup, { title: lang.use('me_settings_convo_list') },
            React.createElement(FieldGroupItem, { after: React.createElement(Switch, { checked: settings.shouldShowCompactModeButton, onChange: (e) => dispatch({
                        type: 'UserChangedSetting',
                        setting: 'shouldShowCompactModeButton',
                        value: Boolean(e.target.checked),
                    }) }) }, lang.use('me_settings_show_compact_chat_mode_switch'))))));
};
export const SettingsAccount = ({ onLogout }) => {
    const profileInfoModal = useModal();
    const [isAvatarPhotoSaving, setIsAvatarPhotoSaving] = useState(false);
    const [isAvatarPhotoRemoving, setIsAvatarPhotoRemoving] = useState(false);
    const featureFlags = useFeatureFlags();
    const { lang, uploader } = useBrowserEnv();
    const apiFetch = useApiFetch();
    const apiFetchMany = useApiFetchMany();
    const dispatch = useDispatch();
    const { viewer, profileType, profileInfo: { phoneNumber, id, firstName, lastName, screenName, avatarPhoto, }, } = useViewer();
    const isEdu = Viewer.isEdu(profileType);
    const [newAvatarPhoto, setNewAvatarPhoto] = useState();
    const phone = useMemo(() => phoneNumber?.replace(/\*/g, '•'), [phoneNumber]);
    const photoId = useMemo(() => viewer.photoId && Number(viewer.photoId), [viewer.photoId]);
    const refreshProfile = useCallback(async () => {
        try {
            const [profileInfoResponse, usersGetResponse, responseMultiAccount] = await apiFetchMany([
                { method: 'account.getProfileInfo', params: {} },
                {
                    method: 'users.get',
                    params: {
                        user_ids: Peer.toRealId(id).toString(),
                        extended: 1,
                    },
                },
                {
                    method: 'account.getMulti',
                    params: {
                        fields: API_GET_MULTI_FIELDS.join(','),
                    },
                },
            ]);
            const profileInfo = fromApiViewerProfileInfo(profileInfoResponse);
            const peerFromApi = usersGetResponse[0];
            const { user = undefined } = peerFromApi ? fromApiUser(peerFromApi) : {};
            const accounts = responseMultiAccount.items.map(fromApiViewerAccount);
            dispatch({
                type: 'UserProfileInfo_Update',
                profileInfo,
                user,
                accounts,
            });
        }
        catch { }
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
    const saveAvatarPhoto = async () => {
        if (newAvatarPhoto?.kind !== 'preview' || !newAvatarPhoto.photo) {
            return;
        }
        setIsAvatarPhotoSaving(true);
        try {
            await new Promise((resolve, reject) => {
                uploader.uploadFiles([newAvatarPhoto.photo], { asOwnerPhoto: true }, { viewerId: id }, {
                    onUploadFinish: resolve,
                    onError: reject,
                });
            });
            await refreshProfile();
        }
        catch {
        }
        finally {
            setIsAvatarPhotoSaving(false);
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
    const handleOpenSecurity = () => {
        window.open(`${ID_VK_COM_BASE}/account/#/security?edu=1}`, '_blank');
    };
    // иногда изменения приходят из вне, например мы переходили в вкид или пришлось откатить изменения (апи отвалилось)
    useEffect(() => {
        setNewAvatarPhoto(avatarPhoto ? { kind: 'current' } : undefined);
    }, [avatarPhoto]);
    return (React.createElement(React.Fragment, null,
        isEdu ? (React.createElement("div", { className: "SettingsContent__avatarContainer" },
            React.createElement("div", { className: "SettingsContent__cover", style: {
                    backgroundImage: avatarPhoto?.baseUrl && photoId
                        ? `url(${avatarPhoto?.baseUrl})`
                        : undefined,
                } }),
            React.createElement("div", { className: "SettingsContent__avatar SettingsContent__avatar--floating" },
                React.createElement(AvatarSelector, { isLoading: isAvatarPhotoSaving || isAvatarPhotoRemoving, key: avatarPhoto?.baseUrl, size: 80, onSelection: handleAvatarSelect, onRemove: handleRemoveAvatar, onUpload: saveAvatarPhoto, peerId: id, isDisabled: isAvatarPhotoSaving || isAvatarPhotoRemoving, noImage: React.createElement(Icon28CameraAddOutline, null) })))) : (React.createElement("div", { className: "SettingsContent__avatar" },
            React.createElement(AvatarSelector, { isLoading: isAvatarPhotoSaving || isAvatarPhotoRemoving, key: avatarPhoto?.baseUrl, size: 80, onSelection: handleAvatarSelect, onRemove: handleRemoveAvatar, onUpload: saveAvatarPhoto, peerId: id, isDisabled: isAvatarPhotoSaving || isAvatarPhotoRemoving }))),
        isEdu && React.createElement(SettingsContentAccountForm, null),
        React.createElement(FieldGroup, null,
            isEdu ? (React.createElement(FieldGroupItem, { hasActive: true, hasHover: true, before: React.createElement(Icon24CheckShieldOutline, null), onClick: handleOpenSecurity }, lang.use('me_security_and_entry'))) : (React.createElement(FieldGroupItem, { subtitle: phone, after: React.createElement(Button, { Component: ExternalLink, href: `${ID_VK_COM_BASE}/account/#/personal`, target: "_blank", mode: "tertiary" }, lang.use('me_change_in_vkid')) },
                firstName,
                " ",
                lastName)),
            featureFlags.vkm_profile_info_screen_name ? (React.createElement(React.Fragment, null,
                React.createElement(Spacing, { size: 0 },
                    React.createElement(Separator, null)),
                React.createElement(FieldGroupItem, { subtitle: React.createElement("span", { className: "SettingsContent__accent" },
                        "@",
                        screenName), after: React.createElement(Button, { mode: "tertiary", onClick: profileInfoModal.open }, lang.use('me_edit')) }, lang.use('me_profile_info_shortname')))) : null),
        React.createElement(FieldGroup, null,
            React.createElement(FieldGroupItem, { hasActive: true, hasHover: true, before: React.createElement(Icon24DoorArrowRightOutline, { style: { color: 'var(--vkui--color_text_negative)' } }), onClick: onLogout, style: { color: 'var(--vkui--color_text_negative)' } }, isEdu
                ? lang.use('me_edu_account_logout')
                : lang.use('me_account_logout'))),
        profileInfoModal.isActive && (React.createElement(ModalInterface, { onClose: profileInfoModal.close, closeLabel: lang.use('me_close'), backLabel: lang.use('me_back'), title: lang.use('me_account_editing'), withCustomLayout: true },
            React.createElement(ProfileInfoModal, { isVKIDHidden: true, onBack: profileInfoModal.close })))));
};
export const SettingsEduOrganizations = () => {
    const { viewer } = useViewer();
    const { lang } = useBrowserEnv();
    const { navigate } = useRouter();
    const organizations = viewer.eduRoles?.organizations;
    const onNavigate = useCallback(() => {
        navigate({
            kind: 'MiniAppModal',
            miniAppId: Attach.resolveMiniAppId(EDU_SYSTEM_INTEGRATION_MINI_APP_ID),
        });
    }, [navigate]);
    useStatsOnMount({
        type: 'type_navgo',
        type_navgo: {
            screen: 'edu_my_schools_list',
        },
    });
    if (!organizations || organizations.length === 0) {
        return (React.createElement(FieldGroup, { title: lang.use('me_settings_edu_organizations_title') },
            React.createElement(Placeholder, { icon: React.createElement(Icon28BankOutline, { width: 56, height: 56 }), title: lang.use('me_settings_edu_organizations_empty_title'), action: React.createElement(Button, { size: "l", onClick: onNavigate }, lang.use('me_settings_edu_organizations_empty_action')) }, lang.use('me_settings_edu_organizations_empty_subtitle'))));
    }
    return (React.createElement(FieldGroup, { title: lang.use('me_settings_edu_organizations_title'), aside: React.createElement(Link, { to: {
                kind: 'MiniAppModal',
                miniAppId: Attach.resolveMiniAppId(EDU_SYSTEM_INTEGRATION_MINI_APP_ID),
            }, className: "SettingsContent__link" }, lang.use('me_settings_edu_organizations_add')) }, organizations.map((organization) => (React.createElement(OrganizationCell, { key: organization.id, organization: organization, skipCanNavigate: true })))));
};
export const SettingsPrivacy = () => {
    const { lang } = useBrowserEnv();
    const apiFetch = useApiFetch();
    const snackbar = useSnackbar();
    const [privacy, setPrivacy] = useState();
    const [isLoading, setLoading] = useState(true);
    const [isBirthdayVisible, setBirthdayVisible] = useState(false);
    async function loadPrivacy() {
        try {
            setLoading(true);
            const response = await apiFetch('account.getPrivacySettings', {});
            setPrivacy(fromApiPrivacy(response));
        }
        catch {
        }
        finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        loadPrivacy();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const save = useCallback(async (isBirthdayVisible) => {
        try {
            await apiFetch('account.setPrivacy', {
                key: 'bdate_visibility',
                category: isBirthdayVisible ? 'all' : 'nobody',
            });
            snackbar({
                before: React.createElement(Icon28CheckCircleOn, { fill: "var(--vkui--color_icon_accent)" }),
                message: lang.use('me_settings_privacy_saved_snack'),
            });
        }
        catch {
            setBirthdayVisible(!isBirthdayVisible);
            snackbar({
                before: (React.createElement(Icon28CheckCircleOn, { fill: "var(--vkui--color_text_negative)" })),
                message: lang.use('me_settings_privacy_save_error_snack'),
            });
        }
    }, [apiFetch, snackbar, lang, setBirthdayVisible]);
    useEffect(() => {
        if (!privacy) {
            return;
        }
        const setting = privacy.find((setting) => setting.id === 'bdate_visibility');
        if (!setting) {
            return;
        }
        const isVisible = setting.value.type === 'category' && setting.value.value === 'all';
        setBirthdayVisible(isVisible);
    }, [privacy, setBirthdayVisible]);
    if (isLoading) {
        return (React.createElement(FieldGroup, { title: lang.use('me_settings_privacy_caption') },
            React.createElement("div", { className: "SettingsPrivacy__notIdealState" },
                React.createElement(OptimizedSpinner, { size: "s" }))));
    }
    if (!isLoading && !privacy) {
        return (React.createElement(FieldGroup, { title: lang.use('me_settings_privacy_caption') },
            React.createElement("div", { className: "SettingsPrivacy__notIdealState" }, lang.use('me_settings_privacy_load_error'))));
    }
    const onBirthdayValueChange = (event) => {
        const isBirthdayVisible = event.target.checked;
        setBirthdayVisible(isBirthdayVisible);
        save(isBirthdayVisible);
    };
    return (React.createElement(FieldGroup, { title: lang.use('me_settings_privacy_caption') },
        React.createElement(FieldGroupItem, { subtitle: lang.use('me_settings_privacy_bdate_description'), after: React.createElement(Switch, { checked: isBirthdayVisible, onChange: onBirthdayValueChange }) }, lang.use('me_settings_privacy_bdate_name'))));
};
export const SettingsExperimental = () => {
    const { lang, calls } = useBrowserEnv();
    const { settings } = useViewer();
    const dispatch = useDispatch();
    const { isMobileLayout } = useLayoutData();
    const { vkm_performance_boost } = useFeatureFlags();
    const buttonValue = (() => {
        switch (settings.messageSelfMentionHighlighting) {
            case 'none':
                return lang.use('me_settings_mention_off');
            case 'primary':
                return lang.use('me_settings_mention_simple');
            case 'secondary':
                return lang.use('me_settings_mention_calm');
            default:
                exhaustivenessCheck(settings.messageSelfMentionHighlighting);
        }
    })();
    const changeMentionSetting = (value) => {
        dispatch({
            type: 'SettingExperimentalUpdated',
            messageMentionHighlighting: value,
        });
    };
    return (React.createElement(FieldGroup, null,
        React.createElement(FieldGroupItem, { after: React.createElement(Dropdown, { enableFocusTrap: true, openType: "click", hideOnClick: true, adaptive: true, content: React.createElement(ActionsMenu, null,
                    React.createElement(ActionsMenuAction, { onClick: () => changeMentionSetting('none'), title: lang.use('me_settings_mention_off'), rightIcon: React.createElement(Icon16Done, { style: {
                                visibility: settings.messageSelfMentionHighlighting === 'none'
                                    ? 'visible'
                                    : 'hidden',
                            } }), type: "primary" }),
                    React.createElement(ActionsMenuAction, { onClick: () => changeMentionSetting('primary'), title: lang.use('me_settings_mention_simple'), rightIcon: React.createElement(Icon16Done, { style: {
                                visibility: settings.messageSelfMentionHighlighting === 'primary'
                                    ? 'visible'
                                    : 'hidden',
                            } }), type: "primary" }),
                    React.createElement(ActionsMenuAction, { onClick: () => changeMentionSetting('secondary'), title: lang.use('me_settings_mention_calm'), rightIcon: React.createElement(Icon16Done, { style: {
                                visibility: settings.messageSelfMentionHighlighting ===
                                    'secondary'
                                    ? 'visible'
                                    : 'hidden',
                            } }), type: "primary" })), align: "right", position: "bottom" },
                React.createElement(Button, { mode: "tertiary", after: React.createElement(Icon12Dropdown, null) },
                    React.createElement(Text, { className: "SettingsContent__dropDownText" }, buttonValue))) }, lang.use('me_settings_message_mention_highlighting')),
        React.createElement(Spacing, { size: 0 },
            React.createElement(Separator, null)),
        React.createElement(FieldGroupItem, { after: React.createElement(Switch, { checked: settings.autoExtendReactionPicker, onChange: (e) => {
                    dispatch({
                        type: 'UserChangedSetting',
                        setting: 'autoExtendReactionPicker',
                        value: e.target.checked,
                    });
                } }) }, lang.use('me_settings_auto_expand_all_reactions')),
        vkm_performance_boost && isMobileLayout && (React.createElement(FieldGroupItem, { after: React.createElement(Switch, { checked: settings.performanceTweaksEnabled, onChange: (e) => {
                    dispatch({
                        type: 'UserChangedSetting',
                        setting: 'performanceTweaksEnabled',
                        value: e.target.checked,
                    });
                } }) }, lang.use('me_settings_enable_performance_tweaks'))),
        (!settings.callsEnabled || calls?.init) && (React.createElement(FieldGroupItem, { after: React.createElement(Switch, { checked: settings.callsEnabled, onChange: (e) => {
                    dispatch({
                        type: 'UserChangedSetting',
                        setting: 'callsEnabled',
                        value: e.target.checked,
                    });
                } }) }, lang.use('me_settings_calls'))),
        React.createElement(FieldGroupItem, { after: React.createElement(Switch, { checked: settings.videoMessageAutoplay, onChange: (e) => {
                    dispatch({
                        type: 'UserChangedSetting',
                        setting: 'videoMessageAutoplay',
                        value: e.target.checked,
                    });
                } }) }, lang.use('me_videomessages_autoplay'))));
};
export const LanguageOption = ({ onChange, currentLanguageId }) => {
    const { lang } = useBrowserEnv();
    const languages = useMemo(() => {
        const options = [];
        for (const [code, id] of Object.entries(Peer.LanguageId)) {
            if (!Peer.isLangCode(code) || typeof id !== 'number') {
                continue;
            }
            options.push({
                id: id,
                name: lang.use(Peer.resolveLangIdKeyToLang(code)),
            });
        }
        return options;
    }, [lang]);
    const currentLanguage = useMemo(() => languages.find((lang) => lang.id === currentLanguageId), [languages, currentLanguageId]);
    return (React.createElement(Dropdown, { enableFocusTrap: true, openType: "click", hideOnClick: true, content: React.createElement(ActionsMenu, null, languages.map((lang) => {
            return (React.createElement(ActionsMenuAction, { key: lang.id, onClick: () => {
                    if (lang.id === currentLanguage?.id) {
                        return;
                    }
                    onChange(lang.id);
                }, title: lang.name, rightIcon: React.createElement(Icon16Done, { style: {
                        visibility: lang.id === currentLanguageId ? 'visible' : 'hidden',
                    } }), type: "primary" }));
        })), align: "right", position: "bottom" },
        React.createElement(Button, { mode: "tertiary", after: React.createElement(Icon12Dropdown, null) },
            React.createElement(Text, { className: "SettingsContent__dropDownText" }, currentLanguage ? currentLanguage.name : lang.use('me_lang_unknown')))));
};
export const SubmitOptionControl = ({ isCtrSubmitSelected, onChange }) => {
    /* Настройка существует в виде флага "использовать Ctrl для отправки"
     * В интерфейсе предоставляем выпадашку с опциями для наглядности,
     * но на входе-выходе компонента в итоге булевое значение */
    const { lang } = useBrowserEnv();
    const text = 'Enter';
    const textWithModifier = isMac ? 'Cmd + Enter' : 'Ctrl + Enter';
    const buttonText = isCtrSubmitSelected ? textWithModifier : text;
    return (React.createElement(Dropdown, { enableFocusTrap: true, openType: "click", hideOnClick: true, content: React.createElement(ActionsMenu, null,
            React.createElement(ActionsMenuAction, { onClick: () => onChange(false), title: text, subtitle: lang.use('me_settings_message_submit_option_default_note'), rightIcon: React.createElement(Icon16Done, { style: {
                        visibility: !isCtrSubmitSelected ? 'visible' : 'hidden',
                    } }), type: "primary" }),
            React.createElement(ActionsMenuAction, { onClick: () => onChange(true), title: textWithModifier, subtitle: lang.use('me_settings_message_submit_option_ctr_note'), rightIcon: React.createElement(Icon16Done, { style: {
                        visibility: isCtrSubmitSelected ? 'visible' : 'hidden',
                    } }), type: "primary" })), align: "right", position: "bottom" },
        React.createElement(Button, { mode: "tertiary", after: React.createElement(Icon12Dropdown, null) },
            React.createElement(Text, { className: "SettingsContent__dropDownText" }, buttonText))));
};
export const FastActionControl = ({ selectedValue, onChange }) => {
    const { lang } = useBrowserEnv();
    const getLabel = (option) => {
        switch (option) {
            case 'hover': {
                return lang.use('me_settings_message_actions_control_button');
            }
            case 'rightClick': {
                return lang.use('me_settings_message_actions_control_context_menu');
            }
            case 'hoverAndRightClick': {
                return lang.use('me_settings_message_actions_control_both');
            }
            default:
                exhaustivenessCheck(option);
        }
    };
    return (React.createElement(Dropdown, { enableFocusTrap: true, openType: "click", hideOnClick: true, content: React.createElement(ActionsMenu, null,
            React.createElement(ActionsMenuAction, { onClick: () => onChange('hover'), title: getLabel('hover'), rightIcon: React.createElement(Icon16Done, { style: {
                        visibility: selectedValue === 'hover' ? 'visible' : 'hidden',
                    } }), type: "primary" }),
            React.createElement(ActionsMenuAction, { onClick: () => onChange('rightClick'), title: getLabel('rightClick'), rightIcon: React.createElement(Icon16Done, { style: {
                        visibility: selectedValue === 'rightClick' ? 'visible' : 'hidden',
                    } }), type: "primary" }),
            React.createElement(ActionsMenuAction, { onClick: () => onChange('hoverAndRightClick'), title: getLabel('hoverAndRightClick'), rightIcon: React.createElement(Icon16Done, { style: {
                        visibility: selectedValue === 'hoverAndRightClick'
                            ? 'visible'
                            : 'hidden',
                    } }), type: "primary" })), align: "right", position: "bottom" },
        React.createElement(Button, { mode: "tertiary", after: React.createElement(Icon12Dropdown, null) },
            React.createElement(Text, { className: "SettingsContent__dropDownText" }, getLabel(selectedValue)))));
};
const BrowserNotificationsControl = ({ browserNotifications, permission, isExternal, ariaLabelledby, disabled, }) => {
    const dispatch = useDispatch();
    const { settings } = useViewer();
    const featureFlags = useFeatureFlags();
    const { lang } = useBrowserEnv();
    if (featureFlags.vkm_new_notifications_display && isExternal) {
        return (React.createElement(Icon24ChevronCompactRight, { className: "SettingsNotifications__settingNotifyChevron" }));
    }
    if (isExternal && permission !== 'default') {
        return (React.createElement(Button, { mode: "tertiary", after: React.createElement(Icon12Chevron, null), onClick: browserNotifications.onExternal }, lang.use('me_settings_browser_notifications_external')));
    }
    return (React.createElement(Switch, { checked: Boolean(settings.browserNotifications), "aria-labelledby": ariaLabelledby, disabled: disabled, onChange: (e) => browserNotifications
            .onChange(Boolean(e.target.checked))
            .then((newState) => dispatch({
            type: 'UserChangedBrowserNotifications',
            value: newState,
        })) }));
};
const themes = ['system', 'light', 'dark'];
const ThemeControl = ({ theme, onChange }) => {
    const { lang } = useBrowserEnv();
    return (React.createElement(Dropdown, { enableFocusTrap: true, openType: "click", hideOnClick: true, content: React.createElement(ActionsMenu, null, themes.map((item) => (React.createElement(ActionsMenuAction, { key: item, onClick: () => onChange(item), title: lang.use(`me_settings_theme_${item}`), rightIcon: React.createElement(Icon16Done, { style: {
                    visibility: theme === item ? 'visible' : 'hidden',
                } }), type: "primary" })))), align: "right", position: "bottom" },
        React.createElement(Button, { mode: "tertiary", after: React.createElement(Icon12Dropdown, null) },
            React.createElement(Text, { className: "SettingsContent__dropDownText" }, lang.use(`me_settings_theme_${theme}`)))));
};
const notificationSettings = ['on', 'off', 'noSound'];
export const NotificationControl = ({ value, onChange }) => {
    const { lang } = useBrowserEnv();
    return (React.createElement(Dropdown, { enableFocusTrap: true, openType: "click", hideOnClick: true, content: React.createElement(ActionsMenu, null, notificationSettings.map((item) => (React.createElement(ActionsMenuAction, { key: item, onClick: () => onChange(item), title: lang.use(`me_settings_notifications_${item}`), rightIcon: React.createElement(Icon16Done, { style: {
                    visibility: value === item ? 'visible' : 'hidden',
                } }), type: "primary" })))), align: "right", position: "bottom" },
        React.createElement(Button, { mode: "tertiary", after: React.createElement(Icon12Dropdown, null) },
            React.createElement(Text, { className: "SettingsContent__dropDownText" }, lang.use(`me_settings_notifications_${value}`)))));
};
export const VKCOMSettingsContent = ({ activeSection, locks, folders, recommendedFolders, foldersView }) => {
    const { envFeatureFlags } = useBrowserEnv();
    const tab = useMemo(() => {
        // TODO: перевести секции на VKUI 5 (VKCOM kit)
        switch (activeSection) {
            case 'account': {
                return null;
            }
            case 'start':
            case 'main': {
                return (React.createElement(SettingsMain, null, !envFeatureFlags.isVKCOMLayoutModeChangeAvailable && (React.createElement(VKCOMSwitchInterfaceSetting, null))));
            }
            case 'folders': {
                return (React.createElement(SettingsFolders, { folders: folders, recommendedFolders: recommendedFolders, locks: locks, foldersView: foldersView }));
            }
            case 'notifications': {
                return (React.createElement(SettingsNotifications, { folders: folders, hasUnreadCountControls: true, hasSoundNotificationsControl: true }));
            }
            case 'theme': {
                return (React.createElement(SettingsTheme, { themeStylesControl: true }, envFeatureFlags.isVKCOMLayoutModeChangeAvailable && (React.createElement(VKCOMSwitchLayoutSetting, null))));
            }
            case 'experimental': {
                return React.createElement(SettingsExperimental, null);
            }
            case 'schedule':
            case 'edu':
            case 'achievements':
            case 'about':
            case 'privacy':
                return null;
            default:
                exhaustivenessCheck(activeSection);
        }
    }, [
        activeSection,
        folders,
        recommendedFolders,
        locks,
        foldersView,
        envFeatureFlags,
    ]);
    return (React.createElement("div", { className: "VKCOMSettingsContent SettingsContent" },
        React.createElement("div", null, tab)));
};
//# sourceMappingURL=SettingsContent.js.map