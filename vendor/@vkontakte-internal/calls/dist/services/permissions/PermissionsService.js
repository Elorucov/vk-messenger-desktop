import { __decorate, __metadata } from "tslib";
import { scope } from '@vkontakte-internal/di';
import { DebugMessageType, MediaOption, MuteState, UserRole, } from '@vkontakte/calls-sdk';
import { E_ACTION } from '../../constants';
import { CallStatMuteType, modalHasType, ModalType, MuteParticipantMode, NotificationType, UnmuteModalRequestType, participantIsAdmin, isSameExternalId, externalIdToString, anyMatchInArray, isBoolean, objectSome, calcFlagsArray, createFlags, is, isEmpty, peerIdToVkId, getDecreasedPermissionsOnce, getMuteState, isMediaAllowed, mapMuteStatesToParticipantPermissions, mapSdkMuteStatesArgs, MO_2_PP, EMuteEventType, EPermissionsOnceAction, } from '@vkontakte-internal/calls-core';
import { isEqual, isUndefined } from '@vkontakte/vkjs';
import { setLocalDevice, toggleModal } from '../../actions';
import { RoomsService } from '../../features/rooms/services/RoomsService';
import { getPreviousAvailableStreamMode, isStreamModeAvailable } from '../../helpers/participant';
import { handlePromiseError } from '../../helpers/logger';
import { ClickHouseEventType, sendStats } from '../../stats/clickHouse';
import { StateBridge } from '../../utils/stateBridge';
import { CallsSdkService } from '../sdk';
import { DevicesService } from '../devices/DevicesService';
/**
 * класс для обработки `muteStates` звонка
 *
 * @task https://jira.mvk.com/browse/CALL-6047
 *
 * привет, друзья!
 *
 * нужно понимать, что бекенд по этой фиче, мягко говоря, не однозначный,
 * поэтому ряд состояний при изменении, клиенту сообщен не будет! соответвенно,
 * какие-то из состояний участников нужно обновлять руками.
 *
 * имейте это ввиду, если будете искать баги
 *
 * ниже приведу ряд примером о том, как нужно интерпретировать нотификации
 * (полный набор аргументов можно посмотреть в документации сингалинга или в функции `mapSdkMuteStatesArgs`)
 *
 * `(*)` помечу те поля, по которым изменения могут происходить на сервере **без** нотификации клиенту
 *
 * - `userId` - --если это поле есть, то нотификация персональная, для этого юзера--;
 *           в SDK: userId - Пользователь, для которого изменились разрешения или `null` для текущего пользователя
 * - `adminId` - автор нотификации, те тот, что инициировал эти изменения;
 * - `muteAll` - значит, что нотификация общая для звонка, а не персональная;
 * - `stateUpdated` - говорит о том, что в состоянии произошли какие то изменения;
 * - `mediaOptions` - это массив тех медиа (VIDEO|AUDIO...) по которым произошли изменения. на этот
 * флаг нужно смотреть в совокупности с другими;
 * - `muteStates (*)` - это состояние конкретных медиа, например `AUDIO: MUTE_PERMANENT`, говорит о том,
 * что на аудио наложен пермамьют. Однако, если в `mediaOptions` нет `AUDIO`, значит изменения
 * коснулись какой то другой медиа группы. Тут нужно быть особенно внимательным, тк бекенд будет
 * обновлять это поле в ряде случаев **без** уведомления клиента. Например, при введении\снятии
 * глобальных пермамьютов;
 * - `unmute` и `unmuteOptions (*)` - до конца не понятно, зачем нужен `unmute`, а вот в `unmuteOptions`
 * будет перечень `MediaOption` по которым есть разовая возможность включения. По идее, эта нотификация
 * может прийти пользователю после перезахода в звонок, те тут останутся "сохраненная" информация о
 * разовых разьмьютах. В течение звонка, разовые мьюты будут прихожить через `requestedMedia`. Так же
 * тут могут приходить оставшиеся не использованные "разовые включения", по мере их использования, но
 * приходить они будут не сами по себе, а наряду с другими нотификациями;
 * - `requestedMedia` - это медиа, по которым приходит просьба на размьют. через неё выдаются разовые
 * пермиссии на влючение медиа в течение активного звонка (напомню, что при перезаходе, разовые
 * пермиссии придут юзеру, скорее, в `unmuteOptions`);
 *
 * нужно понимать, что поля будут приходить всегда вместе, однако, в каждой нотификации будет задана
 * только 1 логическая цепочка. как именно определять, что хочет сказать та или иная нотификация - проще
 * всего по коду, вот 4 глобальные точки входа для нотификаций:
 * - `updateCallMuteState` - обновляет состояние звонка;
 * - `updatePersonalMuteState` - обновляет моё персональное состояние;
 * - `updateExternalMuteState` - обновляет состояние какого то `device` в списке девайсов;
 * - `attractAttentionIfNeeded` - привлекает персональное внимание;
 * - `updatePersonalPermissionsOnce` - обновляет состояние персональных разовых пермиссий;
 */
let PermissionsService = class PermissionsService {
    constructor(roomsService, sdkService, stateBridge, devicesService) {
        this.roomsService = roomsService;
        this.sdkService = sdkService;
        this.stateBridge = stateBridge;
        this.devicesService = devicesService;
        this.handleSdkLocalStreamUpdate = (mediaSettings) => {
            this.decreasePermissionsOnce(mediaSettings);
        };
        this.handleSdkVmojiOrScreenStream = (_, mediaSettings) => {
            this.decreasePermissionsOnce(mediaSettings);
        };
        this.handleSdkFeaturesPerRoleChanged = (featuresPerRole) => {
            const { localDevice } = this.stateBridge;
            this.setGlobalMovieSharePermission(featuresPerRole, !participantIsAdmin(localDevice) && this.isMediaAllowed('movieSharing', localDevice));
            void this.setGlobalCallFeatureRecordAndTranslationPermission(featuresPerRole);
        };
        this.handleSdkMuteStates = (...args) => {
            const muteStatesParams = mapSdkMuteStatesArgs.apply(null, args);
            this.sdkService.getSdk().debugMessage(DebugMessageType.WARN, 'onMuteStates', muteStatesParams);
            // Если прилетела информация по мьютам в зале, в котором мы не находимся
            if (!this.roomsService.equalsToMyRoom(muteStatesParams.roomId)) {
                return;
            }
            this.updateCallMuteState(muteStatesParams);
            this.updatePersonalMuteState(muteStatesParams);
            this.updatePersonalPermissionsOnce(muteStatesParams);
            this.updateExternalMuteState(muteStatesParams);
            this.attractAttentionIfNeeded(muteStatesParams);
        };
        this.handleSdkRoomParticipantsUpdated = (update) => {
            if (update.addedParticipants && !isEmpty(update.addedParticipants)) {
                const { externalId } = this.stateBridge;
                const updatedMe = update.addedParticipants.filter((participant) => isSameExternalId(participant.uid, externalId))?.[0];
                const isMyRoom = this.roomsService.equalsToMyRoom(update.roomId);
                // update localDevice on switching between rooms
                if (updatedMe && isMyRoom) {
                    this.updatePersonalMuteState({
                        muteStates: updatedMe.muteStates,
                        unmuteOptions: updatedMe.unmuteOptions,
                        mediaOptions: [
                            MediaOption.VIDEO,
                            MediaOption.SCREEN_SHARING,
                            MediaOption.AUDIO,
                            MediaOption.MOVIE_SHARING,
                        ],
                        muteAll: false,
                        unmute: false,
                        userId: null,
                        adminId: null,
                        stateUpdated: true,
                        requestedMedia: undefined,
                        roomId: update.roomId,
                    });
                }
            }
        };
        // см. коммент в колбэке onLocalStreamUpdate sdk
        this.sdkService.subscribe('onLocalStreamUpdate', this.handleSdkLocalStreamUpdate);
        this.sdkService.subscribe('onScreenStream', this.handleSdkVmojiOrScreenStream);
        this.sdkService.subscribe('onVmojiStream', this.handleSdkVmojiOrScreenStream);
        this.sdkService.subscribe('onFeaturesPerRoleChanged', this.handleSdkFeaturesPerRoleChanged);
        this.sdkService.subscribe('onRoomParticipantsUpdated', this.handleSdkRoomParticipantsUpdated);
        this.sdkService.subscribe('onMuteStates', this.handleSdkMuteStates);
    }
    /** обрабатывает изменения пермиссий звонка */
    updateCallMuteState(p) {
        const { dispatch, localDevice, permissions } = this.stateBridge;
        if (
        // при входе в звонок может прилететь кеш из sdk
        isBoolean(p.stateUpdated) &&
            !p.stateUpdated) {
            // state not updated - skip
            return;
        }
        if (!p.muteAll) {
            // state updated for me, handle later
            return;
        }
        // update call permissions state
        dispatch({
            type: E_ACTION.SET_CALL_PERMISSIONS,
            data: p.muteStates,
        });
        const isNotAdmin = !participantIsAdmin(localDevice);
        // Если не админ, вызовем нотификацию об обновление разрешений звонка
        if (isNotAdmin) {
            let audioFeedback = EMuteEventType.None;
            let videoFeedback = EMuteEventType.None;
            let screenSharingFeedback = EMuteEventType.None;
            if (p.mediaOptions.includes(MediaOption.AUDIO)) {
                const current = permissions[MediaOption.AUDIO];
                const updated = p.muteStates[MediaOption.AUDIO] || MuteState.UNMUTE;
                if (current !== MuteState.MUTE_PERMANENT && updated === MuteState.MUTE_PERMANENT) {
                    audioFeedback = EMuteEventType.MutedPermanent;
                }
                else if (current === MuteState.MUTE_PERMANENT && updated !== MuteState.MUTE_PERMANENT) {
                    audioFeedback = EMuteEventType.UnmutedWithoutAttraction;
                }
            }
            if (p.mediaOptions.includes(MediaOption.VIDEO)) {
                const current = permissions[MediaOption.VIDEO];
                const updated = p.muteStates[MediaOption.VIDEO] || MuteState.UNMUTE;
                if (current !== MuteState.MUTE_PERMANENT && updated === MuteState.MUTE_PERMANENT) {
                    videoFeedback = EMuteEventType.MutedPermanent;
                }
                else if (current === MuteState.MUTE_PERMANENT && updated !== MuteState.MUTE_PERMANENT) {
                    videoFeedback = EMuteEventType.UnmutedWithoutAttraction;
                }
            }
            if (p.mediaOptions.includes(MediaOption.SCREEN_SHARING)) {
                const current = permissions[MediaOption.SCREEN_SHARING];
                const updated = p.muteStates[MediaOption.SCREEN_SHARING] || MuteState.UNMUTE;
                if (current !== MuteState.MUTE_PERMANENT && updated === MuteState.MUTE_PERMANENT) {
                    screenSharingFeedback = EMuteEventType.MutedPermanent;
                }
                else if (current === MuteState.MUTE_PERMANENT && updated !== MuteState.MUTE_PERMANENT) {
                    screenSharingFeedback = EMuteEventType.UnmutedWithoutAttraction;
                }
            }
            // calc notifications state
            const eventOptions = [];
            let feedback = EMuteEventType.None;
            if (audioFeedback !== EMuteEventType.None) {
                eventOptions.push(MediaOption.AUDIO);
                feedback = audioFeedback;
            }
            else if (videoFeedback !== EMuteEventType.None) {
                eventOptions.push(MediaOption.VIDEO);
                feedback = videoFeedback;
            }
            else if (screenSharingFeedback !== EMuteEventType.None) {
                eventOptions.push(MediaOption.SCREEN_SHARING);
                feedback = screenSharingFeedback;
            }
            if (feedback === EMuteEventType.MutedPermanent) {
                this._notificationCommonMuted(eventOptions);
            }
            else {
                this._notificationCommonUnmuted(eventOptions);
            }
        }
        // если получили глобальное обновление состояния, которое влияет на локальные
        const isReceivedPermanentUpdate = p.mediaOptions.some((mediaOption) => {
            const prev = permissions[mediaOption];
            const next = p.muteStates[mediaOption];
            return ((prev === MuteState.MUTE_PERMANENT && next === MuteState.MUTE) ||
                ((!prev || prev === MuteState.MUTE) && next === MuteState.MUTE_PERMANENT));
        });
        // обновляем локальный мьют
        if (isReceivedPermanentUpdate) {
            // 1. скидываем разовые выдачи
            this._updatePermissionsOnce(p.mediaOptions, EPermissionsOnceAction.Clear);
            // 2. сбрасываем локальные пермиссии
            const nextLocalPermissions = p.mediaOptions.reduce((acc, mediaOption) => ((acc[MO_2_PP[mediaOption]] = MuteState.UNMUTE), acc), { ...localDevice.permissions });
            dispatch(setLocalDevice({ permissions: nextLocalPermissions }));
        }
        if (isNotAdmin) {
            // если мы не администратор - то обновлять информацию не нужно
            return;
        }
        if (isReceivedPermanentUpdate) {
            // переполучаем текущий чанк
            this.devicesService.getParticipantsMuteStates();
        }
    }
    /** обрабатывает изменения персональных пермиссий */
    updatePersonalMuteState(p) {
        if (p.userId !== null || p.muteAll) {
            // notification is not for me, skipping
            return;
        }
        const { dispatch, externalId, localDevice } = this.stateBridge;
        if (p.adminId && isSameExternalId(p.adminId, externalId)) {
            // command sender is me, skipping
            return;
        }
        if (!p.stateUpdated) {
            // state not updated, skipping
            return;
        }
        if (!p.muteAll && !!p.requestedMedia) {
            // personal mute state not updated if personal attention attracted, skipping
            return;
        }
        let audioFeedback = EMuteEventType.None;
        let videoFeedback = EMuteEventType.None;
        let movieSharingFeedback = EMuteEventType.None;
        let screenSharingFeedback = EMuteEventType.None;
        const permissions = { ...localDevice.permissions };
        if (p.mediaOptions.includes(MediaOption.AUDIO)) {
            const current = permissions.audio;
            const updated = p.muteStates[MediaOption.AUDIO] || MuteState.UNMUTE;
            if (current !== MuteState.MUTE_PERMANENT && updated === MuteState.MUTE_PERMANENT) {
                audioFeedback = EMuteEventType.MutedPermanent;
            }
            else if (current === MuteState.MUTE_PERMANENT && updated !== MuteState.MUTE_PERMANENT) {
                audioFeedback = EMuteEventType.UnmutedWithoutAttraction;
            }
            else if (updated === MuteState.MUTE) {
                // мьюты могут прилетать друг за другом,
                // поэтому не проверяем предыдущее значение
                audioFeedback = EMuteEventType.Muted;
            }
            permissions.audio = updated;
        }
        if (p.mediaOptions.includes(MediaOption.VIDEO)) {
            const current = permissions.video;
            const updated = p.muteStates[MediaOption.VIDEO] || MuteState.UNMUTE;
            if (current !== MuteState.MUTE_PERMANENT && updated === MuteState.MUTE_PERMANENT) {
                videoFeedback = EMuteEventType.MutedPermanent;
            }
            else if (current === MuteState.MUTE_PERMANENT && updated !== MuteState.MUTE_PERMANENT) {
                videoFeedback = EMuteEventType.UnmutedWithoutAttraction;
            }
            else if (updated === MuteState.MUTE) {
                // мьюты могут прилетать друг за другом,
                // поэтому не проверяем предыдущее значение
                videoFeedback = EMuteEventType.Muted;
            }
            permissions.video = updated;
        }
        if (p.mediaOptions.includes(MediaOption.SCREEN_SHARING)) {
            const current = permissions.screenSharing;
            const updated = p.muteStates[MediaOption.SCREEN_SHARING] || MuteState.UNMUTE;
            if (current !== MuteState.MUTE_PERMANENT && updated === MuteState.MUTE_PERMANENT) {
                screenSharingFeedback = EMuteEventType.MutedPermanent;
            }
            else if (current === MuteState.MUTE_PERMANENT && updated !== MuteState.MUTE_PERMANENT) {
                screenSharingFeedback = EMuteEventType.UnmutedWithoutAttraction;
            }
            else if (updated === MuteState.MUTE) {
                // мьюты могут прилетать друг за другом,
                // поэтому не проверяем предыдущее значение
                screenSharingFeedback = EMuteEventType.Muted;
            }
            permissions.screenSharing = updated;
        }
        if (p.mediaOptions.includes(MediaOption.MOVIE_SHARING)) {
            const current = permissions.movieSharing;
            const updated = p.muteStates[MediaOption.MOVIE_SHARING] || MuteState.UNMUTE;
            if (current !== MuteState.MUTE_PERMANENT && updated === MuteState.MUTE_PERMANENT) {
                movieSharingFeedback = EMuteEventType.MutedPermanent;
            }
            else if (current === MuteState.MUTE_PERMANENT && updated !== MuteState.MUTE_PERMANENT) {
                movieSharingFeedback = EMuteEventType.UnmutedWithoutAttraction;
            }
            permissions.movieSharing = updated;
        }
        // calc notifications state
        const eventOptions = [];
        let feedback = EMuteEventType.None;
        if (p.mediaOptions.length) {
            if (audioFeedback !== EMuteEventType.None && videoFeedback !== EMuteEventType.None) {
                eventOptions.push(MediaOption.AUDIO, MediaOption.VIDEO);
                feedback = audioFeedback;
                if (audioFeedback !== videoFeedback) {
                    this.sdkService.getSdk().debugMessage(DebugMessageType.ERROR, {
                        error: `unexpected mute feedbacks pair audio=${audioFeedback} video=${videoFeedback}`,
                    });
                }
            }
            else if (videoFeedback !== EMuteEventType.None) {
                eventOptions.push(MediaOption.VIDEO);
                feedback = videoFeedback;
            }
            else if (screenSharingFeedback !== EMuteEventType.None) {
                eventOptions.push(MediaOption.SCREEN_SHARING);
                feedback = screenSharingFeedback;
            }
            else if (audioFeedback !== EMuteEventType.None) {
                eventOptions.push(MediaOption.AUDIO);
                feedback = audioFeedback;
            }
            else if (movieSharingFeedback !== EMuteEventType.None) {
                eventOptions.push(MediaOption.MOVIE_SHARING);
                feedback = movieSharingFeedback;
            }
        }
        // do notifications
        if (feedback !== EMuteEventType.None && eventOptions.length) {
            this._handleFeedbackEvent({
                didReceiveEvent: feedback,
                forMedia: eventOptions,
            });
        }
        // update personal permissions state
        if (!isEqual(permissions, localDevice.permissions)) {
            dispatch(setLocalDevice({ permissions }));
        }
    }
    /** обрабатывает изменения чужих пермиссий */
    updateExternalMuteState(p) {
        const { devices, externalId } = this.stateBridge;
        if (!p.userId || isSameExternalId(p.userId, externalId)) {
            // notification is not external, skipping
            return;
        }
        if (!p.stateUpdated) {
            // state not updated, skipping
            return;
        }
        const deviceId = externalIdToString(p.userId);
        const nextState = {
            externalId: p.userId,
        };
        // обновление permissions участника
        const prev = devices[deviceId]?.permissions;
        nextState.permissions = mapMuteStatesToParticipantPermissions(p.muteStates, p.mediaOptions, prev);
        // обновление permissionsOnce участника
        if (p.unmuteOptions.length) {
            nextState.permissionsOnce = new Set(p.unmuteOptions);
        }
        else if (objectSome(p.muteStates, (ms) => ms === MuteState.MUTE_PERMANENT)) {
            nextState.permissionsOnce = undefined;
        }
        this.devicesService.throttleAccumulateDispatchParticipant(p.userId, nextState);
    }
    /** обрабатываем персональные разовые пермиссии */
    updatePersonalPermissionsOnce(p) {
        const { externalId } = this.stateBridge;
        /** @todo при входе в звонок может прилететь кеш из `SDK`, поэтому форсируем `true` */
        const stateUpdated = isBoolean(p.stateUpdated) ? p.stateUpdated : true;
        if (p.userId && !isSameExternalId(p.userId, externalId)) {
            // notification is not for me, skipping
            return;
        }
        if (p.adminId && isSameExternalId(p.adminId, externalId)) {
            // command sender is me, skipping
            return;
        }
        if (p.requestedMedia?.length) {
            // attention attracted, skipping
            return;
        }
        if (!(stateUpdated && p.unmuteOptions.length)) {
            return;
        }
        this._handleFeedbackEvent({
            didReceiveEvent: EMuteEventType.CanTurnOnOnceWithoutAttraction,
            forMedia: [...p.unmuteOptions],
        });
    }
    /** обрабатывает привлечение внимания */
    attractAttentionIfNeeded(p) {
        const { externalId, localDevice, permissions } = this.stateBridge;
        if (p.userId && !isSameExternalId(p.userId, externalId)) {
            // notification is not for me, skipping
            return;
        }
        if (p.adminId && isSameExternalId(p.adminId, externalId)) {
            // command sender is me, skipping
            return;
        }
        if (!p.requestedMedia || !p.requestedMedia.length) {
            // attention not attracted, skipping
            return;
        }
        let audioFeedback = EMuteEventType.None;
        let videoFeedback = EMuteEventType.None;
        if (p.requestedMedia.includes(MediaOption.AUDIO)) {
            if (p.muteAll && localDevice.permissions.audio === MuteState.MUTE_PERMANENT) {
                // has personal audio mute, skipping
            }
            else if (!localDevice.mediaSettings.isAudioEnabled) {
                if (permissions[MediaOption.AUDIO] === MuteState.MUTE_PERMANENT ||
                    localDevice.permissions.audio === MuteState.MUTE_PERMANENT) {
                    audioFeedback = EMuteEventType.CanTurnOnOnce;
                }
                else {
                    audioFeedback = EMuteEventType.UnmutedWithAttraction;
                }
            }
        }
        if (p.requestedMedia.includes(MediaOption.VIDEO)) {
            if (p.muteAll && localDevice.permissions.video === MuteState.MUTE_PERMANENT) {
                // has personal video mute, skipping
            }
            else if (!localDevice.mediaSettings.isVideoEnabled) {
                if (permissions[MediaOption.VIDEO] === MuteState.MUTE_PERMANENT ||
                    localDevice.permissions.video === MuteState.MUTE_PERMANENT) {
                    videoFeedback = EMuteEventType.CanTurnOnOnce;
                }
                else {
                    videoFeedback = EMuteEventType.UnmutedWithAttraction;
                }
            }
        }
        if (audioFeedback !== EMuteEventType.None && videoFeedback !== EMuteEventType.None) {
            let feedback = EMuteEventType.None;
            if (audioFeedback != videoFeedback) {
                feedback = EMuteEventType.CanTurnOnOnce;
            }
            else {
                feedback = audioFeedback;
            }
            this._handleFeedbackEvent({
                didReceiveEvent: feedback,
                forMedia: [MediaOption.AUDIO, MediaOption.VIDEO],
            });
        }
        else if (audioFeedback !== EMuteEventType.None) {
            this._handleFeedbackEvent({
                didReceiveEvent: audioFeedback,
                forMedia: [MediaOption.AUDIO],
            });
        }
        else if (videoFeedback !== EMuteEventType.None) {
            this._handleFeedbackEvent({
                didReceiveEvent: videoFeedback,
                forMedia: [MediaOption.VIDEO],
            });
        }
    }
    getMuteController(mode, externalId) {
        const indicators = this.getIndicators(mode, externalId);
        const { isAudio, isCurrentlyOn, isMediaAllowed, isScreenSharing, isVideo } = indicators;
        return {
            ...indicators,
            mute: (muteConfiguration) => this.muteDevice({
                ...muteConfiguration,
                isAudio,
                isCurrentlyOn,
                isMediaAllowed,
                isScreenSharing,
                isVideo,
            }),
        };
    }
    getDevice(externalId) {
        if (!externalId) {
            return undefined;
        }
        const { devices, externalId: myExternalId, localDevice } = this.stateBridge;
        if (!isSameExternalId(externalId, myExternalId)) {
            return devices[externalIdToString(externalId)];
        }
        return localDevice;
    }
    getIndicators(mode, externalId) {
        const { externalId: myExternalId, localDevice, participants, permissions } = this.stateBridge;
        const device = this.getDevice(externalId);
        const participant = externalId && participants[externalId.id];
        const isMe = isSameExternalId(externalId, myExternalId);
        const deviceWithRoles = isMe ? localDevice : participant;
        const isAudio = [MuteParticipantMode.SINGLE_AUDIO, MuteParticipantMode.ALL_AUDIO].includes(mode);
        const isVideo = [MuteParticipantMode.SINGLE_VIDEO, MuteParticipantMode.ALL_VIDEO].includes(mode);
        const isScreenSharing = [MuteParticipantMode.SINGLE_SCREEN_SHARING].includes(mode);
        const isSingle = [
            MuteParticipantMode.SINGLE_AUDIO,
            MuteParticipantMode.SINGLE_VIDEO,
            MuteParticipantMode.SINGLE_SCREEN_SHARING,
        ].includes(mode);
        let isCurrentlyOn = false;
        let isMediaAllowed = false;
        let isPermanentAvailable = false;
        switch (mode) {
            case MuteParticipantMode.SINGLE_AUDIO:
                isMediaAllowed = this.isMediaAllowed('audio', device, true);
                isPermanentAvailable = isMediaAllowed && !participantIsAdmin(deviceWithRoles);
                isCurrentlyOn = !!device?.mediaSettings.isAudioEnabled;
                break;
            case MuteParticipantMode.SINGLE_SCREEN_SHARING:
                isMediaAllowed = this.isMediaAllowed('screenSharing', device);
                isPermanentAvailable = isMediaAllowed && !participantIsAdmin(deviceWithRoles);
                isCurrentlyOn = !!device?.mediaSettings.isScreenSharingEnabled;
                break;
            case MuteParticipantMode.SINGLE_VIDEO:
                isMediaAllowed = this.isMediaAllowed('video', device, true);
                isPermanentAvailable = isMediaAllowed && !participantIsAdmin(deviceWithRoles);
                isCurrentlyOn = !!device?.mediaSettings.isVideoEnabled;
                break;
            case MuteParticipantMode.ALL_AUDIO:
                isPermanentAvailable = permissions[MediaOption.AUDIO] !== MuteState.MUTE_PERMANENT;
                break;
            case MuteParticipantMode.ALL_VIDEO:
                isPermanentAvailable = permissions[MediaOption.VIDEO] !== MuteState.MUTE_PERMANENT;
                break;
        }
        return {
            isAudio,
            isCurrentlyOn,
            isMediaAllowed,
            isPermanentAvailable,
            isScreenSharing,
            isSingle,
            isVideo,
        };
    }
    muteDevice({ additionalStatsData, isAudio, isVideo, isScreenSharing, isPermanent, participantExternalId, isCurrentlyOn, isMediaAllowed, roomId = null, skipStatsSending = [], }) {
        const muteState = getMuteState({ isPermanent, isCurrentlyOn, isMediaAllowed });
        const muteStates = {};
        const clickHouseEventTypes = [];
        const isSingle = !!participantExternalId;
        const skipStatStateList = [MuteState.UNMUTE, ...skipStatsSending];
        if (isAudio) {
            clickHouseEventTypes.push(isSingle ? ClickHouseEventType.USER_MICS_DISABLED : ClickHouseEventType.ALL_MICS_DISABLED);
            muteStates[MediaOption.AUDIO] = muteState;
        }
        if (isVideo) {
            clickHouseEventTypes.push(isSingle ? ClickHouseEventType.USER_VIDEO_DISABLED : ClickHouseEventType.ALL_VIDEO_DISABLED);
            muteStates[MediaOption.VIDEO] = muteState;
        }
        if (isScreenSharing) {
            clickHouseEventTypes.push(isSingle
                ? ClickHouseEventType.USER_SCREEN_SHARING_DISABLED
                : ClickHouseEventType.ALL_SCREEN_SHARING_DISABLED);
            muteStates[MediaOption.SCREEN_SHARING] = muteState;
        }
        if (!Object.keys(muteStates).length) {
            return Promise.reject(new Error('Media options are missing'));
        }
        return this.sdkService
            .getSdk()
            .muteParticipant({
            externalId: participantExternalId || null,
            muteStates,
            roomId,
        })
            .then(() => {
            if (clickHouseEventTypes.length && !skipStatStateList.includes(muteState)) {
                const mutePermanent = isPermanent ? CallStatMuteType.PERMANENT : CallStatMuteType.ONCE;
                clickHouseEventTypes.forEach((type) => sendStats(type, { ...additionalStatsData, mute_permanent: mutePermanent }));
            }
        })
            .catch(handlePromiseError);
    }
    muteWatchTogetherParticipant(device) {
        const isMovieSharingAllowed = this.isMediaAllowed('movieSharing', device);
        this.sdkService
            .getSdk()
            .muteParticipant({
            externalId: device.externalId,
            muteStates: {
                [MediaOption.MOVIE_SHARING]: isMovieSharingAllowed ? MuteState.MUTE_PERMANENT : MuteState.UNMUTE,
            },
            roomId: device.roomId,
        })
            .then(() => {
            if (isMovieSharingAllowed) {
                sendStats(ClickHouseEventType.USER_WATCH_TOGETHER_DISABLED, {
                    mute_permanent: CallStatMuteType.PERMANENT,
                });
            }
        })
            .catch(handlePromiseError);
    }
    /** показываем нотификации для пользователя */
    _handleFeedbackEvent({ didReceiveEvent, forMedia }) {
        switch (didReceiveEvent) {
            case EMuteEventType.CanTurnOnOnce: {
                this._updatePermissionsOnce(forMedia, EPermissionsOnceAction.Increase);
                this._openUnmuteRequestPopup(forMedia);
                break;
            }
            case EMuteEventType.CanTurnOnOnceWithoutAttraction: {
                this._updatePermissionsOnce(forMedia, EPermissionsOnceAction.Reset);
                break;
            }
            case EMuteEventType.UnmutedWithAttraction: {
                this._openUnmuteRequestPopup(forMedia);
                break;
            }
            case EMuteEventType.Muted: {
                this._notificationMuted(forMedia);
                break;
            }
            case EMuteEventType.MutedPermanent: {
                this._closeUnmuteRequestPopupIfOpened();
                this._updatePermissionsOnce(forMedia, EPermissionsOnceAction.Clear);
                this._notificationMutedPermanent(forMedia);
                break;
            }
            case EMuteEventType.UnmutedWithoutAttraction: {
                this._notificationUnmuted(forMedia);
                break;
            }
        }
    }
    /** показать нотификацию отключения пермамьюта по выбранному медиа */
    _notificationUnmuted(forMedia) {
        let type = null;
        if (anyMatchInArray(forMedia, [MediaOption.AUDIO, MediaOption.VIDEO, MediaOption.SCREEN_SHARING])) {
            // audio + video + screenshare
            type = NotificationType.ADMIN_UNMUTE_PERMANENT;
        }
        else if (forMedia.includes(MediaOption.AUDIO)) {
            // audio
            type = NotificationType.ADMIN_UNMUTE_PERMANENT_AUDIO;
        }
        else if (forMedia.includes(MediaOption.VIDEO)) {
            // video
            type = NotificationType.ADMIN_UNMUTE_PERMANENT_VIDEO;
        }
        else if (forMedia.includes(MediaOption.VIDEO) && forMedia.includes(MediaOption.MOVIE_SHARING)) {
            // video + screenshare
            type = NotificationType.ADMIN_UNMUTE_PERMANENT_VIDEO_AND_SCREENSHARING;
        }
        else if (forMedia.includes(MediaOption.MOVIE_SHARING)) {
            // movie
            type = NotificationType.ADMIN_UNMUTE_PERMANENT_WATCH_TOGETHER;
        }
        else if (forMedia.includes(MediaOption.SCREEN_SHARING)) {
            // screenshare
            type = NotificationType.ADMIN_UNMUTE_PERMANENT_SCREENSHARING;
        }
        this._showNotification(type);
    }
    /** показать нотификацию отключения пермамьюта по выбранному медиа глобально в звонке */
    _notificationCommonUnmuted(forMedia) {
        let type = null;
        if (forMedia.includes(MediaOption.AUDIO)) {
            type = NotificationType.ADMIN_UNMUTE_PERMANENT_AUDIO;
        }
        else if (forMedia.includes(MediaOption.VIDEO)) {
            type = NotificationType.ADMIN_UNMUTE_PERMANENT_VIDEO;
        }
        else if (forMedia.includes(MediaOption.SCREEN_SHARING)) {
            type = NotificationType.ADMIN_UNMUTE_PERMANENT_SCREENSHARING;
        }
        this._showNotification(type, true);
    }
    /** показать нотификацию мьюта по выбранному медиа */
    _notificationMuted(forMedia) {
        let type = null;
        if (anyMatchInArray(forMedia, [MediaOption.AUDIO, MediaOption.VIDEO, MediaOption.SCREEN_SHARING])) {
            // audio + video + screenshare
            type = NotificationType.ADMIN_MUTE;
        }
        else if (forMedia.includes(MediaOption.AUDIO)) {
            // audio
            type = NotificationType.ADMIN_MUTE_AUDIO;
        }
        else if (forMedia.includes(MediaOption.VIDEO) && forMedia.includes(MediaOption.SCREEN_SHARING)) {
            // video + screenshare
            type = NotificationType.ADMIN_MUTE_VIDEO_AND_SCREENSHARING;
        }
        else if (forMedia.includes(MediaOption.VIDEO)) {
            // video
            type = NotificationType.ADMIN_MUTE_VIDEO;
        }
        else if (forMedia.includes(MediaOption.SCREEN_SHARING)) {
            // screenshare
            type = NotificationType.ADMIN_MUTE_SCREENSHARING;
        }
        this._showNotification(type);
    }
    /** показать нотификацию мьюта по выбранному медиа при изменении глобальных настроек */
    _notificationCommonMuted(forMedia) {
        let type = null;
        if (forMedia.includes(MediaOption.AUDIO)) {
            type = NotificationType.ADMIN_MUTE_AUDIO_COMMON;
        }
        else if (forMedia.includes(MediaOption.VIDEO)) {
            type = NotificationType.ADMIN_MUTE_VIDEO_COMMON;
        }
        else if (forMedia.includes(MediaOption.SCREEN_SHARING)) {
            type = NotificationType.ADMIN_MUTE_SCREENSHARING_COMMON;
        }
        this._showNotification(type, true);
    }
    /** показать нотификацию пермамьюта по выбранному медиа */
    _notificationMutedPermanent(forMedia) {
        let type = null;
        if (anyMatchInArray(forMedia, [MediaOption.AUDIO, MediaOption.VIDEO, MediaOption.SCREEN_SHARING])) {
            // audio + video + screenshare
            type = NotificationType.ADMIN_MUTE_PERMANENT;
        }
        else if (forMedia.includes(MediaOption.AUDIO)) {
            // audio
            type = NotificationType.ADMIN_MUTE_PERMANENT_AUDIO;
        }
        else if (forMedia.includes(MediaOption.VIDEO) && forMedia.includes(MediaOption.SCREEN_SHARING)) {
            // video + screenshare
            type = NotificationType.ADMIN_MUTE_PERMANENT_VIDEO_AND_SCREENSHARING;
        }
        else if (forMedia.includes(MediaOption.VIDEO)) {
            // video
            type = NotificationType.ADMIN_MUTE_PERMANENT_VIDEO;
        }
        else if (forMedia.includes(MediaOption.MOVIE_SHARING)) {
            // movie
            type = NotificationType.ADMIN_MUTE_PERMANENT_WATCH_TOGETHER;
        }
        else if (forMedia.includes(MediaOption.SCREEN_SHARING)) {
            // screenshare
            type = NotificationType.ADMIN_MUTE_PERMANENT_SCREENSHARING;
        }
        this._showNotification(type);
    }
    /** показать нотификацию типа `NotificationType` */
    _showNotification(type, hidden = false) {
        if (!type) {
            return;
        }
        const { dispatch, notification } = this.stateBridge;
        const ts = notification?.ts;
        // ts проставляется при нотификации смены ролей и чтобы
        // не перетирать её инфой о мьюте, выжидаем, минимум, 1 секунду
        if (!isUndefined(ts) && Date.now() - ts < 1000) {
            return;
        }
        dispatch({
            type: E_ACTION.CALL_NOTIFICATION,
            notification: { type, hidden },
        });
    }
    /** показывает диалог с просьбой включить аудио\видео */
    _openUnmuteRequestPopup(forMedia) {
        const { dispatch } = this.stateBridge;
        const mediaFlags = createFlags(Object.values(MediaOption));
        const flags = calcFlagsArray(mediaFlags, forMedia);
        let requestType;
        if (is(flags, mediaFlags.AUDIO | mediaFlags.VIDEO)) {
            requestType = UnmuteModalRequestType.BOTH;
        }
        else if (is(flags, mediaFlags.VIDEO)) {
            requestType = UnmuteModalRequestType.VIDEO;
        }
        else if (is(flags, mediaFlags.AUDIO)) {
            requestType = UnmuteModalRequestType.AUDIO;
        }
        if (requestType !== undefined) {
            dispatch(toggleModal(ModalType.UNMUTE, { requestType }));
        }
    }
    /** скрывает модалку с просьбой включить микрофон \ видео */
    _closeUnmuteRequestPopupIfOpened() {
        const { dispatch, modal } = this.stateBridge;
        if (modalHasType(modal, ModalType.UNMUTE)) {
            dispatch(toggleModal());
        }
    }
    /** обновляет `permissionsOnce` текущего пользователя */
    _updatePermissionsOnce(forMedia, action) {
        const { dispatch, localDevice } = this.stateBridge;
        const permissionsOnce = new Set(localDevice.permissionsOnce);
        switch (action) {
            case EPermissionsOnceAction.Increase: {
                forMedia.forEach((media) => permissionsOnce.add(media));
                break;
            }
            case EPermissionsOnceAction.Clear: {
                forMedia.forEach((media) => permissionsOnce.delete(media));
                break;
            }
            case EPermissionsOnceAction.Reset: {
                permissionsOnce.clear();
                forMedia.forEach((media) => permissionsOnce.add(media));
                break;
            }
        }
        dispatch(setLocalDevice({ permissionsOnce }));
    }
    /**
     * проверяет, можно ли включить медиа устройство
     */
    isMediaAllowed(key, device, ignorePermissionsOnce) {
        if (!device) {
            return false;
        }
        const { me, participants, permissions } = this.stateBridge;
        return isMediaAllowed(key, { device, me, participants, permissions }, ignorePermissionsOnce);
    }
    /**
     * @action
     * Важно! Декремент пермиссий происходит только в момент отключения медиа.
     * Было включено -> Выключили -> Декремент. Иначе кнопки управления медиа
     * задизейблятся во включенном состоянии.
     */
    decreasePermissionsOnce(mediaSettings) {
        const { dispatch, localDevice } = this.stateBridge;
        const myCurrentSettings = localDevice.mediaSettings;
        const permissionsOnce = getDecreasedPermissionsOnce(myCurrentSettings, mediaSettings, localDevice.permissionsOnce);
        const streamMode = localDevice.streamMode && isStreamModeAvailable(localDevice.streamMode, localDevice, mediaSettings)
            ? localDevice.streamMode
            : getPreviousAvailableStreamMode({ ...localDevice, mediaSettings });
        dispatch(setLocalDevice({ mediaSettings, permissionsOnce, streamMode }));
    }
    setGlobalMovieSharePermission(featuresPerRole, isNeedNotification) {
        const { dispatch, onlyAdminCanShareMovie: onlyAdminCanShareMovieCurrent } = this.stateBridge;
        const onlyAdminCanShareMovie = anyMatchInArray(featuresPerRole["MOVIE_SHARE" /* ConversationFeature.MOVIE_SHARE */], [
            UserRole.ADMIN,
            UserRole.CREATOR,
        ]);
        if (isNeedNotification && onlyAdminCanShareMovieCurrent !== onlyAdminCanShareMovie) {
            dispatch({
                type: E_ACTION.CALL_NOTIFICATION,
                notification: {
                    type: onlyAdminCanShareMovie
                        ? NotificationType.ADMIN_MUTE_PERMANENT_WATCH_TOGETHER
                        : NotificationType.ADMIN_UNMUTE_PERMANENT_WATCH_TOGETHER,
                },
            });
        }
        dispatch({
            type: E_ACTION.SET_GLOBAL_MOVIE_SHARE_PERMISSION,
            data: onlyAdminCanShareMovie,
        });
    }
    async setGlobalCallFeatureRecordAndTranslationPermission(featuresPerRole) {
        const { dispatch, localDevice, me, translation } = this.stateBridge;
        const onlyAdminCanRecordAndTranslation = anyMatchInArray(featuresPerRole["RECORD" /* ConversationFeature.RECORD */], [
            UserRole.ADMIN,
            UserRole.CREATOR,
        ]);
        const translationOwnerExternalId = translation.ownerId;
        const isMeOwner = peerIdToVkId(me) === translationOwnerExternalId;
        try {
            if (onlyAdminCanRecordAndTranslation && isMeOwner && !participantIsAdmin(localDevice)) {
                await this.sdkService.getSdk().stopStream(this.roomsService.roomId);
            }
        }
        catch (e) {
            handlePromiseError(e);
        }
        dispatch({
            type: E_ACTION.SET_GLOBAL_CALL_FEATURES,
            key: 'onlyAdminCanRecordAndTranslation',
            data: onlyAdminCanRecordAndTranslation,
        });
    }
};
PermissionsService = __decorate([
    scope.container(),
    __metadata("design:paramtypes", [RoomsService,
        CallsSdkService,
        StateBridge,
        DevicesService])
], PermissionsService);
export { PermissionsService };
//# sourceMappingURL=PermissionsService.js.map