import { __decorate, __metadata } from "tslib";
import { createProvider, scope } from '@vkontakte-internal/di';
import { makeAutoObservable } from 'mobx';
import { LangUtils } from '../../services/Lang';
import { CallsConfigService } from '../../services/config';
import { CallsSdkService } from '../../services/sdk';
import { StateBridge } from '../../utils/stateBridge';
import { VmojiCharacterIdLoadingStatus, VmojiService } from '../../services/vmoji';
import { SubtitlesService } from '../../services/subtitles';
import { OnboardingService } from '../../services/onboarding';
import { StreamActionSettingsService } from '../../services/streamActionSettings';
import { AsrService } from '../../services/asr';
import { LayoutService } from '../../services/layout';
import { PermissionsService } from '../../services/permissions';
import { PictureInPictureService } from '../../features/simplePiP/models/PictureInPictureService';
import { VideoSuspendService } from '../../services/videoSuspend';
import { videoOptionsStorage } from '../../helpers/localStorage';
import { CallStatMuteType, ClickHouseEventType, EVideoOptionType, isGroupCall, ModalType, MuteParticipantMode, participantIsAdmin, RenamedUserType, } from '@vkontakte-internal/calls-core';
import { isSupported as isVideoVirtualBackgroundSupported } from '@vkontakte/calls-video-effects';
import { isBrowserSupported as isVideoVmojiSupported } from '@vkontakte/calls-vmoji';
import { canMuteParticipants, isParticipantAnonymOrContact, isParticipantContact, isParticipantGroup, } from '../../helpers/participant';
import { getCallDataShowChatHistory, getIsMeAdmin, getIsMeCommunity } from '../../selectors';
import { debugMessage, DebugMessageType, MediaOption, MuteState, ParticipantStatus, UserRole, } from '@vkontakte/calls-sdk';
import { isAuthedByGroupId, isRequireAuthToJoin, isWaitingHallEnabled } from '../../helpers/call';
import { isEmpty, objectSome } from '../../helpers/helpers';
import { callsSetUserSettings, updateCallSettings } from '../../services/backend';
import { handlePromiseError } from '../../helpers/logger';
import { checkPermissions } from '../../permissions';
import { setAnonymousJoin, setShowChatHistory, setWaitingHallEnabled } from '../../actions/actions';
import { isFeedbackOptionEnabled } from '../../helpers/feedback';
import { getMiniappVmojiEditLink } from '../../helpers/url';
import { RoomsService } from '../rooms';
import { ClickHouseService } from '../../services/shared/ClickHouseService';
import { ModalService } from '../../services/modal';
import { WatchTogetherService } from '../watchTogether/services/WatchTogetherService';
/**
 * Класс отвечает за список настроек звонка
 * и за его отображение
 */
let CallSettingsDropdownModel = class CallSettingsDropdownModel {
    constructor(langUtils, configService, sdkService, stateBridge, vmojiService, subtitlesService, onboardingService, streamActionSettingsService, asrService, layoutService, pipService, videoSuspendService, permissionsService, roomsService, clickHouseService, modalService, watchTogetherService) {
        this.langUtils = langUtils;
        this.configService = configService;
        this.sdkService = sdkService;
        this.stateBridge = stateBridge;
        this.vmojiService = vmojiService;
        this.subtitlesService = subtitlesService;
        this.onboardingService = onboardingService;
        this.streamActionSettingsService = streamActionSettingsService;
        this.asrService = asrService;
        this.layoutService = layoutService;
        this.pipService = pipService;
        this.videoSuspendService = videoSuspendService;
        this.permissionsService = permissionsService;
        this.roomsService = roomsService;
        this.clickHouseService = clickHouseService;
        this.modalService = modalService;
        this.watchTogetherService = watchTogetherService;
        /** Открыт ли dropdown настроек */
        this._isOpen = false;
        this._joinInBrowser = !!videoOptionsStorage.queryOption(EVideoOptionType.IS_SKIP_JOIN_CALL_PROMPT);
        this.joinInBrowser = () => {
            return this._joinInBrowser;
        };
        /** Управление открытием dropdown'а */
        this.toggleCallSettingsDropdown = (arg) => {
            if (arg === true) {
                // В Сафари onShownChange для дропдауна срабатывает перед вызовом коллбэка onClick
                return;
            }
            else if (arg === false) {
                this.setIsOpen(false);
            }
            else {
                this.setIsOpen(!this._isOpen);
            }
        };
        /** Открываем модалку контроля/создания комнат */
        this.onRoomControl = () => {
            this.modalService.openModal(isEmpty(this.roomsService.rooms) ? ModalType.ROOM_CONTROL_CREATE : ModalType.ROOM_CONTROL);
        };
        /** Открываем модалку настройки виртуального фона */
        this.onToggleVirtualBackground = () => {
            this.modalService.openModal(ModalType.VIRUTAL_BACKGROUND);
        };
        /** Открываем модалку смены своего имени */
        this.onChangeName = () => {
            this.modalService.openModal(ModalType.CHANGE_NAME, {
                peerId: this.stateBridge.me,
                renamedUserType: RenamedUserType.SELF,
            });
            this.setIsOpen(false);
        };
        this.toggleJoinInBrowser = () => {
            const nextState = !this.joinInBrowser();
            videoOptionsStorage.saveOption(EVideoOptionType.IS_SKIP_JOIN_CALL_PROMPT, nextState);
            this.setJoinInBrowser(nextState);
            callsSetUserSettings({ skip_join_screen: nextState ? 1 : 0 }).catch(handlePromiseError);
        };
        /** Открываем модалку настройки видео и аудио*/
        this.onOpenSettings = async () => {
            try {
                await checkPermissions(this.sdk, [MediaOption.AUDIO, MediaOption.VIDEO]);
                this.modalService.openModal(ModalType.SETTINGS);
                this.setIsOpen(false);
            }
            catch (error) {
                this.sdk.debugMessage(DebugMessageType.ERROR, { error });
            }
        };
        this.onOpenVmojiModal = () => {
            this.onboardingService.closeOnboardingBannerIfVmojiOpen(this.vmojiService.isCapture);
            this.modalService.openModal(ModalType.VMOJI);
            this.clickHouseService.sendStats(ClickHouseEventType.CALL_VMOJI_CLICK);
        };
        /** Отправим запрос на unmute */
        this.onUnmuteRequest = async () => {
            try {
                await this.sdk.muteParticipant({
                    muteStates: {},
                    requestedMedia: [MediaOption.AUDIO, MediaOption.VIDEO],
                    roomId: this.roomsService.roomId,
                });
                this.clickHouseService.sendStats(ClickHouseEventType.ASK_ALL_TO_UNMUTE);
            }
            catch (error) {
                handlePromiseError(error);
            }
        };
        /** Покажем модалку отключения/включения микрофонов */
        this.onMuteAllAudio = () => {
            this.modalService.openModal(ModalType.MUTE_PARTICIPANT, {
                mode: MuteParticipantMode.ALL_AUDIO,
            });
            // Dropdown второго уровня сам не закроется
            this.setIsOpen(false);
        };
        /** Покажем модалку отключения/включения камер */
        this.onMuteAllVideo = () => {
            this.modalService.openModal(ModalType.MUTE_PARTICIPANT, {
                mode: MuteParticipantMode.ALL_VIDEO,
            });
            // Dropdown второго уровня сам не закроется
            this.setIsOpen(false);
        };
        /** Переключение наличия зала ожидания */
        this.toggleWaitingHall = () => {
            setWaitingHallEnabled(!this.isWaitingHallEnabled);
            this.clickHouseService.sendStats(!this.isWaitingHallEnabled
                ? ClickHouseEventType.WAITING_ROOM_ENABLED
                : ClickHouseEventType.WAITING_ROOM_DISABLED);
        };
        /** Переключение доступности анонимного входа */
        this.toggleAnonJoin = () => {
            setAnonymousJoin(!this.isNeedAutoToJoin);
        };
        this.toggleShowChatHistory = () => {
            const callId = this.stateBridge.callData?.callId;
            updateCallSettings(!this.showChatHistory, callId || '').then(() => {
                this.stateBridge.dispatch(setShowChatHistory(!this.showChatHistory));
                this.clickHouseService.sendStats(ClickHouseEventType.CALL_CHAT_HISTORY_TOGGLED, {
                    session_id: callId,
                    event_param: !this.showChatHistory ? 1 : 0,
                    reason: 'call_menu',
                });
            });
        };
        /** Переключение доступности реакций */
        this.onToggleReactions = async () => {
            const next = !isFeedbackOptionEnabled(this.stateBridge.conversationOptions);
            try {
                await this.sdk.changeConversationOptions({ FEEDBACK: next });
                this.clickHouseService.sendStats(next ? ClickHouseEventType.REACTION_ENABLED : ClickHouseEventType.REACTION_DISABLED);
            }
            catch (error) {
                console.log(error);
            }
        };
        this.onMuteWatchTogetherParticipants = () => {
            const onlyAdminCanShareMovie = this.stateBridge.onlyAdminCanShareMovie;
            const roles = onlyAdminCanShareMovie ? [] : [UserRole.ADMIN, UserRole.CREATOR];
            this.sdk
                .enableFeatureForRoles("MOVIE_SHARE" /* ConversationFeature.MOVIE_SHARE */, roles)
                .then(() => {
                this.onMoviePause();
                if (!onlyAdminCanShareMovie) {
                    this.clickHouseService.sendStats(ClickHouseEventType.ALL_WATCH_TOGETHER_DISABLED, {
                        mute_permanent: CallStatMuteType.PERMANENT,
                    });
                }
            })
                .catch(handlePromiseError);
        };
        /** Переключаем субтитры */
        this.onEnableSubtitles = () => {
            this.onboardingService.closeOnboardingBannerIfASROpen(this.vmojiService.isCapture);
            !this.isSubtitlesEnabled && this.subtitlesService.toggleSubtitles('settings');
        };
        /** Переключаем субтитры */
        this.onDisableSubtitles = () => {
            this.onboardingService.closeOnboardingBannerIfASROpen(this.vmojiService.isCapture);
            this.isSubtitlesEnabled && this.subtitlesService.toggleSubtitles('settings');
        };
        /** Переключение доступности шаринга экрана */
        this.onToggleScreenSharing = () => {
            this.permissionsService.muteDevice({
                isCurrentlyOn: !this.isScreenSharingEnabled,
                isPermanent: this.isScreenSharingEnabled,
                isScreenSharing: true,
                participantExternalId: null,
                roomId: this.roomsService.roomId,
            });
        };
        /** Переключение доступности записать и транслировать звонок */
        this.onToggleRecordAndTranslationCall = async () => {
            try {
                const { onlyAdminCanRecordAndTranslation } = this.stateBridge.callFeatures;
                const roles = onlyAdminCanRecordAndTranslation ? [] : [UserRole.ADMIN, UserRole.CREATOR];
                await this.sdk.enableFeatureForRoles("RECORD" /* ConversationFeature.RECORD */, roles);
            }
            catch (e) {
                handlePromiseError(e);
            }
        };
        this.getSubtitle = (action) => {
            if (action.subtitle) {
                return action.subtitle;
            }
            if (!action.isAlternativeSwitch || typeof action.isEnabled === 'undefined') {
                return;
            }
            if (!this.hasNewViewOfMuteActions) {
                return action.isEnabled
                    ? this.langUtils.getLang('calls_mute_state_available') // Доступны
                    : this.langUtils.getLang('calls_mute_state_not_available'); // Недоступны
            }
            return action.isEnabled
                ? this.langUtils.getLang('calls_settings_dropdown_access_toggle_available') // Доступно
                : this.langUtils.getLang('calls_settings_dropdown_access_toggle_unavailable'); // Недоступно
        };
        makeAutoObservable(this);
    }
    get isOpen() {
        return this._isOpen;
    }
    setIsOpen(value) {
        this._isOpen = value;
    }
    setJoinInBrowser(value) {
        this._joinInBrowser = value;
    }
    get sdk() {
        return this.sdkService.getSdk();
    }
    get isVirtualBackgroundSupported() {
        return isVideoVirtualBackgroundSupported();
    }
    get isVmojiSupported() {
        const { enableVmoji, sferum } = this.configService.getConfig();
        return (isVideoVmojiSupported() &&
            Boolean(enableVmoji) &&
            !sferum &&
            !isParticipantAnonymOrContact(this.stateBridge.me) &&
            !getIsMeCommunity(this.stateBridge));
    }
    get isMeAdmin() {
        return getIsMeAdmin(this.stateBridge);
    }
    get separator() {
        return {
            isSeparator: true,
        };
    }
    get isScreenSharingEnabled() {
        const permissions = this.stateBridge.permissions;
        return permissions.SCREEN_SHARING !== MuteState.MUTE_PERMANENT;
    }
    get isSubtitlesEnabled() {
        return this.subtitlesService.isEnabled;
    }
    get isAuthedByGroup() {
        return isAuthedByGroupId(this.stateBridge.groupId);
    }
    get isNeedAutoToJoin() {
        return isRequireAuthToJoin(this.stateBridge);
    }
    /** Влючена ли настройка зала ожидания для звонка */
    get isWaitingHallEnabled() {
        return isWaitingHallEnabled(this.stateBridge);
    }
    /** Находимся ли мы в текущий момент в зале ожидания */
    get isWaitingHall() {
        return this.stateBridge.localDevice.status === ParticipantStatus.WAITING_HALL;
    }
    get isSferum() {
        return this.configService.getConfig().sferum;
    }
    get hasNewViewOfMuteActions() {
        return this.isSferum || this.configService.getConfig().enableNewViewOfMuteActions;
    }
    get isCanChangeName() {
        const isMeContact = isParticipantContact(this.stateBridge.me);
        const participant = this.stateBridge.participants[this.stateBridge.me];
        const isGroupParticipant = isParticipantGroup(participant.peerId);
        return !this.isSferum && !isMeContact && !isGroupParticipant;
    }
    get isCallHaveOtherParticipants() {
        const { devices, externalId, me } = this.stateBridge;
        const myId = externalId?.id || me.toString();
        return objectSome(devices, (device) => {
            return device.externalId.id !== myId;
        });
    }
    get isGroupCall() {
        const { me, peer, callData } = this.stateBridge;
        return isGroupCall(me, peer, callData?.topology);
    }
    get showChatHistory() {
        return getCallDataShowChatHistory({
            callData: this.stateBridge.callData,
            config: { sferum: this.isSferum },
        });
    }
    get sharedMovieParticipant() {
        const participants = this.stateBridge.participants;
        if (!this.watchTogetherService.owner) {
            return null;
        }
        return participants[this.watchTogetherService.owner.id];
    }
    handleMoviePause(movieId) {
        return this.sdk
            .updateMovie({
            movieId,
            pause: true,
        })
            .catch((error) => {
            debugMessage(DebugMessageType.ERROR, error);
        });
    }
    onMoviePause() {
        const onlyAdminCanShareMovie = this.stateBridge.onlyAdminCanShareMovie;
        const movieInfo = this.watchTogetherService.movieInfo;
        const needPause = movieInfo?.movieId &&
            !onlyAdminCanShareMovie &&
            this.sharedMovieParticipant &&
            !participantIsAdmin(this.sharedMovieParticipant);
        if (needPause) {
            this.handleMoviePause(movieInfo.movieId);
        }
    }
    /**
     * Собираем меню настроек
     * методы для добавления пунктов
     */
    /** Запись звонка */
    get recording() {
        const recordActionSettings = this.streamActionSettingsService.getRecordSettings();
        if (!recordActionSettings || this.isWaitingHall) {
            return [];
        }
        return [
            {
                text: recordActionSettings.canBeStopped
                    ? this.langUtils.getLang('calls_record_stop_confirmation')
                    : this.langUtils.getLang('calls_record_start'),
                key: 'recording',
                onClick: recordActionSettings.onToggle,
                isDisabled: recordActionSettings.isDisabled,
            },
        ];
    }
    /** Эфир звонка */
    get translation() {
        const translationActionSettings = this.streamActionSettingsService.getTranslationSettings();
        if (!translationActionSettings || this.isWaitingHall) {
            return [];
        }
        return [
            {
                text: this.langUtils.getLang('calls_call_menu_start_translation'),
                key: 'translation',
                onClick: translationActionSettings.onOpen,
                isDisabled: translationActionSettings.isDisabled,
            },
        ];
    }
    /** Сессионные залы */
    get roomControl() {
        if (!this.isMeAdmin) {
            return [];
        }
        return [
            {
                text: this.langUtils.getLang('calls_room_control'),
                key: 'roomControl',
                onClick: this.onRoomControl,
            },
        ];
    }
    /** Расшифровка звонка */
    get asr() {
        if (!this.asrService.isMeCanManageAsr || this.isWaitingHall) {
            return [];
        }
        return [this.asrService.asrAction];
    }
    /** Субтитры */
    get subtitles() {
        if (!this.subtitlesService.isSubtitlesFeatureEnabled || this.isWaitingHall) {
            return [];
        }
        return [
            {
                text: this.langUtils.getLang('calls_call_menu_enable_subtitles'),
                key: 'subtitles',
                afterLinkText: this.isSubtitlesEnabled
                    ? this.langUtils.getLang('calls_plural_enabled')
                    : this.langUtils.getLang('calls_plural_disabled'),
                placement: 'bottom',
                trigger: 'click',
                isKeepOpen: true,
                customOffset: {
                    vertical: -40,
                    horizontal: 30,
                },
                subActions: [
                    {
                        // Включены
                        text: this.langUtils.getLang('calls_plural_enabled'),
                        key: 'subtitlesOn',
                        onClick: this.onEnableSubtitles,
                        isSelected: this.isSubtitlesEnabled,
                    },
                    {
                        // Выключены
                        text: this.langUtils.getLang('calls_plural_disabled'),
                        key: 'subtitlesOff',
                        onClick: this.onDisableSubtitles,
                        isSelected: !this.isSubtitlesEnabled,
                    },
                ],
            },
        ];
    }
    /** Виртуальный фон */
    get virtualBackground() {
        if (!this.isVirtualBackgroundSupported) {
            return [];
        }
        return [
            {
                text: this.langUtils.getLang('calls_virtual_background'),
                key: ModalType.VIRUTAL_BACKGROUND,
                onClick: this.onToggleVirtualBackground,
            },
        ];
    }
    /** Управление vmoji */
    get vmoji() {
        if (!this.isVmojiSupported || this.isWaitingHall) {
            return [];
        }
        const { isCapture, isPreviewGenerated, myAnimatedAvatarUrl } = this.vmojiService;
        const isVmojiEnabled = isCapture && isPreviewGenerated;
        const onToggleVmoji = () => {
            this.vmojiService.toggleMyVmoji();
            // Dropdown второго уровня сам не закроется
            this.setIsOpen(false);
        };
        const action = {
            text: this.langUtils.getLang('calls_vmoji'),
            key: ModalType.VMOJI,
            isKeepOpen: !!myAnimatedAvatarUrl,
        };
        if (myAnimatedAvatarUrl && isPreviewGenerated) {
            action.subActions = [
                {
                    text: this.langUtils.getLang('calls_enabled'),
                    key: 'vmojiEnable',
                    onClick: onToggleVmoji,
                    isSelected: isVmojiEnabled,
                },
                {
                    text: this.langUtils.getLang('calls_disabled'),
                    key: 'vmojiDisable',
                    onClick: onToggleVmoji,
                    isSelected: !isVmojiEnabled,
                },
                {
                    isSeparator: true,
                },
            ];
            const vmojiActionEdit = {
                text: this.langUtils.getLang('calls_vmoji_settings_edit'),
                key: 'vmojiEdit',
            };
            if (this.vmojiService.loadingStatus === VmojiCharacterIdLoadingStatus.SUCCESS) {
                vmojiActionEdit.onClick = () => {
                    this.vmojiService.startEditCharacter();
                    this.layoutService.collapseCall();
                };
            }
            else {
                vmojiActionEdit.href = getMiniappVmojiEditLink();
                vmojiActionEdit.target = '_blank';
                vmojiActionEdit.rel = 'noopener';
            }
            action.subActions.push(vmojiActionEdit);
        }
        else {
            action.onClick = this.onOpenVmojiModal;
        }
        return [action];
    }
    /** Настройки */
    get settings() {
        const settingsAction = {
            text: this.langUtils.getLang('calls_settings'),
            key: 'settings',
            subMenuWidth: 275,
            isKeepOpen: true,
            subActions: [
                {
                    // Настройки видео и аудио
                    text: this.langUtils.getLang('calls_call_menu_settings'),
                    key: 'audioAndVideoSettings',
                    onClick: this.onOpenSettings,
                },
            ],
        };
        if (this.isCanChangeName && this.isGroupCall && !this.isWaitingHall) {
            settingsAction.subActions?.unshift({
                // Изменить имя в звонке
                text: this.langUtils.getLang('calls_change_name_in_call'),
                key: 'changeName',
                onClick: this.onChangeName,
            });
        }
        const settingsActionToggles = [];
        if (this.videoSuspendService.isFeatureSupported) {
            settingsActionToggles.push({
                text: this.langUtils.getLang('calls_show_others_video'),
                key: 'enableVideoSuspendPrompt',
                onClick: this.videoSuspendService.toggle,
                isEnabled: !this.videoSuspendService.isAlwaysSuspended,
            });
            if (this.videoSuspendService.isAutoModeAvailable) {
                // auto mode is available only for SERVER topology
                settingsActionToggles.push({
                    text: this.langUtils.getLang('calls_consider_network_status'),
                    key: 'enableVideoSuspendAutoModePrompt',
                    onClick: this.videoSuspendService.toggleAutoMode,
                    isEnabled: this.videoSuspendService.isAutoModeEnabled,
                    isDisabled: this.videoSuspendService.isAlwaysSuspended,
                    subtitle: this.langUtils.getLang('calls_consider_network_status_hint'),
                });
            }
        }
        if (this.configService.getConfig().enableSkipJoinScreenFeature && !this.isSferum) {
            settingsActionToggles.push({
                // Всегда открывать звонок в браузере
                text: this.langUtils.getLang('calls_always_open_in_browser'),
                key: 'skipJoinCallPrompt',
                onClick: this.toggleJoinInBrowser,
                isEnabled: this.joinInBrowser(),
            });
        }
        if (this.pipService.isFeatureEnabled && this.pipService.isSupportApi) {
            settingsActionToggles.push({
                text: this.langUtils.getLang('calls_simple_pip_enabled'),
                key: 'simplePiPEnabled',
                onClick: () => this.pipService.toggleByUser(!this.pipService.isEnabledByUser),
                isEnabled: this.pipService.isEnabledByUser,
            });
        }
        if (settingsActionToggles.length) {
            settingsAction.subActions?.push({
                isSeparator: true,
            }, ...settingsActionToggles);
        }
        return settingsAction;
    }
    /** Только тот, у кого есть права менять настройки должен видеть эти пункты */
    get participantsAccesses() {
        const isMeCanMuteParticipants = canMuteParticipants(this.stateBridge.localDevice);
        const permissions = this.stateBridge.permissions;
        const onlyAdminCanShareMovie = this.stateBridge.onlyAdminCanShareMovie;
        const { enableChatHistoryToggleEdu, enableChatHistoryToggle } = this.configService.getConfig();
        const { onlyAdminCanRecordAndTranslation } = this.stateBridge.callFeatures;
        if (!isMeCanMuteParticipants || !this.isGroupCall) {
            return [];
        }
        const actions = [this.separator];
        const subActionsMicAndCam = [
            {
                // Микрофоны
                text: this.hasNewViewOfMuteActions
                    ? this.langUtils.getLang('calls_settings_menu_toggle_access_microphone')
                    : this.langUtils.getLang('calls_call_menu_mute_audio_all_v2'),
                key: 'muteAllAudio',
                onClick: this.onMuteAllAudio,
                isEnabled: permissions.AUDIO !== MuteState.MUTE_PERMANENT,
                isAlternativeSwitch: true,
            },
            {
                // Камеры
                text: this.hasNewViewOfMuteActions
                    ? this.langUtils.getLang('calls_settings_menu_toggle_access_camera')
                    : this.langUtils.getLang('calls_cameras'),
                key: 'muteAllVideo',
                onClick: this.onMuteAllVideo,
                isEnabled: permissions.VIDEO !== MuteState.MUTE_PERMANENT,
                isAlternativeSwitch: true,
            },
        ];
        /** Доступы участников */
        const participantsAccesses = {
            text: this.hasNewViewOfMuteActions
                ? this.langUtils.getLang('calls_settings_menu_participants_possibilities')
                : this.langUtils.getLang('calls_participants_access'),
            key: 'participantsAccesses',
            subMenuWidth: 315,
            isKeepOpen: true,
            placement: 'left-end',
            customOffset: {
                vertical: -1,
                horizontal: 9,
            },
            subActions: [
                ...(this.hasNewViewOfMuteActions
                    ? [
                        {
                            // Особенности входа в звонок
                            text: this.langUtils.getLang('calls_settings_menu_participants_features_title'),
                            type: 'header',
                            key: 'featuresTitle',
                        },
                    ]
                    : [...subActionsMicAndCam, this.separator]),
                {
                    // Зал ожидания
                    text: this.langUtils.getLang('calls_waiting_hall'),
                    key: 'waitingHall',
                    subtitle: this.langUtils.getLang('calls_menu_waiting_hall_description'),
                    isEnabled: this.isWaitingHallEnabled,
                    onClick: this.toggleWaitingHall,
                },
                {
                    // Анонимный вход
                    text: this.langUtils.getLang('calls_create_call_by_link_anon'),
                    key: 'anonEnter',
                    subtitle: this.hasNewViewOfMuteActions
                        ? this.langUtils.getLang('calls_settings_menu_anonymous_join_description')
                        : this.langUtils.getLang('calls_enable_join_without_profile'),
                    isEnabled: !this.isNeedAutoToJoin,
                    onClick: this.toggleAnonJoin,
                },
                ...(!this.isAuthedByGroup &&
                    this.isMeAdmin &&
                    (this.isSferum ? enableChatHistoryToggleEdu : enableChatHistoryToggle)
                    ? [
                        {
                            // Показывать последние 250 сообщений в чате
                            text: this.langUtils.getLang('calls_enable_last_chat_messages'),
                            key: 'last_chat_messages',
                            isEnabled: this.showChatHistory,
                            onClick: this.toggleShowChatHistory,
                        },
                    ]
                    : []),
                this.separator,
                {
                    // Отключите, чтобы запретить участникам пользоваться этими функциями
                    text: this.hasNewViewOfMuteActions
                        ? this.langUtils.getLang('calls_settings_menu_participants_possibilities_title')
                        : this.langUtils.getLang('calls_disable_to_prevent_using'),
                    type: 'header',
                    key: 'muteTitle',
                },
                ...(this.hasNewViewOfMuteActions ? subActionsMicAndCam : []),
                {
                    // Показ экрана
                    text: this.hasNewViewOfMuteActions
                        ? this.langUtils.getLang('calls_settings_menu_toggle_access_screen_sharing')
                        : this.langUtils.getLang('calls_screen_sharing'),
                    key: 'muteAllScreenSharing',
                    onClick: this.onToggleScreenSharing,
                    isEnabled: this.isScreenSharingEnabled,
                },
                {
                    // Запись и прямой эфир
                    text: this.hasNewViewOfMuteActions
                        ? this.langUtils.getLang('calls_settings_menu_toggle_access_record_and_translation')
                        : this.langUtils.getLang('calls_call_record_and_translation'),
                    key: 'muteAllCallRecordAndTranslation',
                    onClick: this.onToggleRecordAndTranslationCall,
                    isEnabled: !onlyAdminCanRecordAndTranslation,
                },
            ],
        };
        /** Реакции */
        participantsAccesses.subActions.push({
            key: 'feedback',
            text: this.hasNewViewOfMuteActions
                ? this.langUtils.getLang('calls_settings_menu_toggle_access_reactions')
                : this.langUtils.getLang('calls_reactions'),
            onClick: this.onToggleReactions,
            isEnabled: isFeedbackOptionEnabled(this.stateBridge.conversationOptions),
        });
        /** Смотреть VK Видео вместе (isWatchTogetherEnabled if is not sferum) */
        if (!this.isSferum) {
            participantsAccesses.subActions.push({
                text: this.hasNewViewOfMuteActions
                    ? this.langUtils.getLang('calls_settings_menu_toggle_access_watch_together')
                    : this.langUtils.getLang('calls_watch_movie_together'),
                key: 'muteAllWatchTogether',
                onClick: this.onMuteWatchTogetherParticipants,
                isEnabled: !onlyAdminCanShareMovie,
            });
        }
        actions.push(participantsAccesses);
        /** Попросить всех включить камеру или микрофон */
        if (this.isCallHaveOtherParticipants) {
            actions.push({
                text: this.langUtils.getLang('calls_request_for_enable_mic_or_camera'),
                key: 'unmuteRequest',
                onClick: this.onUnmuteRequest,
            });
        }
        return actions;
    }
    // debugLog должен быть последним в списке
    /** Скачать логи для отладки */
    get debugLog() {
        const debugPersistentLog = this.configService.getConfig().debugPersistentLog;
        if (!debugPersistentLog) {
            return [];
        }
        return [
            this.separator,
            {
                // text: this.langUtils.getLang('calls_call_menu_debug'),
                text: this.langUtils.getLang('calls_call_menu_debug'),
                key: 'debugLog',
                onClick: () => {
                    window.__VKCallsSDKLogs__();
                },
                isDisabled: false,
            },
        ];
    }
    get actions() {
        const actions = [
            ...this.recording,
            ...this.translation,
            ...this.roomControl,
            ...this.asr,
            ...this.subtitles,
        ];
        if (actions.length > 0) {
            actions.push(this.separator);
        }
        actions.push(...this.virtualBackground, ...this.vmoji, this.settings, ...this.participantsAccesses, ...this.debugLog);
        return actions;
    }
    get isCallSettingsDropdownShown() {
        return this.isOpen;
    }
};
CallSettingsDropdownModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [LangUtils,
        CallsConfigService,
        CallsSdkService,
        StateBridge,
        VmojiService,
        SubtitlesService,
        OnboardingService,
        StreamActionSettingsService,
        AsrService,
        LayoutService,
        PictureInPictureService,
        VideoSuspendService,
        PermissionsService,
        RoomsService,
        ClickHouseService,
        ModalService,
        WatchTogetherService])
], CallSettingsDropdownModel);
export const { useModel: useCallSettingsDropdownModel, Provider: CallSettingsDropdownModelProvider } = createProvider(CallSettingsDropdownModel);
//# sourceMappingURL=CallSettingsDropdownModel.js.map