import { jsx as _jsx } from "react/jsx-runtime";
import { debugMessage, DebugMessageType, MediaOption, MuteState, ParticipantStatus, UserRole, } from '@vkontakte/calls-sdk';
import { canMuteParticipants, canPinParticipants, createSdkParticipantState, getIsHandRaised, getParticipantExternalId, isParticipantAnonym, isParticipantContact, isParticipantGroup, } from '../helpers/participant';
import { E_ACTION } from '../constants';
import { handlePromiseError } from '../helpers/logger';
import { setLocalHandState, toggleChildModal, toggleModal } from '../actions';
import { KickParticipantType, modalHasType, ModalType, MuteParticipantMode, RenamedUserType, UIMode, isAdmin, isCreator, isSameExternalId, externalIdToString, isArraysEqual, isGroupCallByPeerAndMe, peerIdToVkId, isEmptyPeerId, getUserName, ENavigateToConvoDirection, } from '@vkontakte-internal/calls-core';
import { getApiWrapper } from '../helpers/apiGetter';
import { ClickHouseEventType, sendStats } from '../stats/clickHouse';
import { Icon16Chevron, Icon20ArrowUpRectangle, Icon20ArrowUpRectangleOutline, Icon20Camera, Icon20HandOutline, Icon20LogoVkVideo, Icon20LogoVkVideoOutline, Icon20MegaphoneOutline, Icon20MessageOutline, Icon20PinDotOutline, Icon20PinSlashOutline, Icon20SlidersOutline, Icon20UserOutline, Icon20UserPenOutline, Icon20Users3Outline, Icon20UserSlashOutline, Icon20UserSquareOutline, Icon20UserStarBadgeOutline, Icon20UserStarBadgeSlashOutline, Icon20VideocamOutline, Icon20VideocamSlashOutline, Icon20Voice, Icon20VoiceOutline, Icon20VoiceSlashOutline, Icon24ChevronCompactRight, } from '@vkontakte/icons';
import { getColorClass } from '@vkontakte-internal/vkcom-kit';
const colorClassNegative = getColorClass('color_icon_negative');
/** ключ - vk id */
const actionsCache = {};
export const getParticipantActions = ({ adminPinnedParticipant, callId, canBeAdmin, canEnableMediaRequest, chatPeerId, config, device, dispatch, forEachDeviceByParticipant, getLang, getMuteParticipantIndicators, groupId, isShareMovieEnabled, isVkme = false, localDevice, muteDevice, myExternalId, myPeerId, myRoomId, navigateToConvo, navigateToProfile, onCollapse, onlyAdminCanShareMovie, onWatchTogetherMute, openedModal, participant, SDK, setAdminPinnedParticipant, clearAdminPinnedParticipant, }) => {
    const { debugCallsToContacts, enableNewViewOfMuteActions, enableNewViewOfMuteActionsSferum, sferum: isSferum, } = config;
    /** ключ в хеш-таблице `actionsCache` */
    const cacheKey = device ? externalIdToString(device.externalId) : participant.peerId;
    const externalId = getParticipantExternalId(participant);
    const isMeParticipant = groupId
        ? // если определена группа - то сравниваем по ней
            peerIdToVkId(participant.peerId) === groupId
        : // если нет, то по peerId
            participant.peerId === myPeerId;
    const isMeDevice = device ? isSameExternalId(device.externalId, myExternalId) : isMeParticipant;
    const isWaitingStatus = device?.status === ParticipantStatus.WAITING;
    const isGroupCall = isGroupCallByPeerAndMe(chatPeerId, myPeerId);
    const isAuthedByGroup = !!groupId;
    const hasNewViewOfMuteActions = isSferum ? enableNewViewOfMuteActionsSferum : enableNewViewOfMuteActions;
    let actions = [];
    // Проверяем разрешения по участнику
    const isGroupParticipant = isParticipantGroup(participant.peerId);
    const isAnonym = isParticipantAnonym(participant.peerId);
    const isContact = isParticipantContact(participant.peerId);
    const isParticipantCreator = isCreator(participant);
    const isParticipantAdmin = isAdmin(participant);
    const isParticipantSuperUser = isParticipantAdmin || isParticipantCreator;
    const participnatPinnedByAdmin = isParticipantPinnedByAdmin(adminPinnedParticipant, device || participant);
    // ================================
    // Проверяем разрешения по себе
    const isMeAnonym = isParticipantAnonym(myPeerId);
    const isMeCanMuteParticipants = canMuteParticipants(localDevice);
    const isMeCreator = isCreator(localDevice);
    const isMeAdmin = isAdmin(localDevice);
    const isMeSuperUser = isMeAdmin || isMeCreator;
    // ================================
    const getModalAction = openedModal ? toggleChildModal : toggleModal;
    const isChatEnabled = !isMeDevice &&
        !isAnonym &&
        !isContact &&
        !isMeAnonym &&
        navigateToConvo !== undefined &&
        !isAuthedByGroup;
    const goToChatAction = {
        text: isGroupParticipant
            ? getLang('calls_go_to_chat_with_community')
            : getLang('calls_go_to_chat_with_participant'),
        before: hasNewViewOfMuteActions ? _jsx(Icon20MessageOutline, {}) : undefined,
        onClick: () => {
            const peerId = getPeerId(participant, device);
            if (!peerId || isEmptyPeerId(peerId)) {
                debugMessage(DebugMessageType.ERROR, {
                    text: '[getPeerId] returned id: 0',
                    peerId,
                });
                return;
            }
            const navDirection = navigateToConvo(peerIdToVkId(peerId));
            if (navDirection === ENavigateToConvoDirection.FastChat) {
                return;
            }
            if (isVkme && modalHasType(openedModal, ModalType.MANAGEMENT)) {
                dispatch(toggleModal());
            }
            dispatch({
                type: E_ACTION.CHANGE_UI_MODE,
                mode: UIMode.COLLAPSED,
            });
            onCollapse?.();
        },
        dataTestId: 'calls_participant_actions_chat',
    };
    const isMeCanPutHandDown = (isMeParticipant || isMeSuperUser) && getIsHandRaised(device);
    const createPutHandDownAction = () => ({
        text: getLang('calls_put_hand_down'),
        before: hasNewViewOfMuteActions ? _jsx(Icon20HandOutline, {}) : undefined,
        onClick: () => {
            const sendUserHandLoweredStats = () => {
                if (hasNewViewOfMuteActions) {
                    sendStats(ClickHouseEventType.USER_HAND_LOWERED);
                }
            };
            if (isMeParticipant) {
                SDK.changeParticipantState(createSdkParticipantState(localDevice.statusData, { hand: false })).then(() => {
                    dispatch(setLocalHandState(localDevice.statusData, false));
                    sendUserHandLoweredStats();
                });
            }
            else if (device?.externalId) {
                SDK.changeParticipantState(createSdkParticipantState(device.statusData, { hand: false }), device.externalId).then(sendUserHandLoweredStats);
            }
        },
        dataTestId: 'calls_participant_actions_lower_down',
    });
    // Опции для групового звонка
    if (isGroupCall) {
        const isCanGoToProfile = !isMeDevice && !isAnonym && !isContact && navigateToProfile !== undefined;
        const isMeCanPinParticipants = canPinParticipants(localDevice) && !isMeAnonym && !isWaitingStatus;
        const hasPermissionToToggleAdminRole = canAssignAdmins(localDevice) && !isMeAnonym && !isWaitingStatus;
        const canLoseAdminRole = hasPermissionToToggleAdminRole && !isMeParticipant && isParticipantAdmin && externalId;
        const isHaveMutePermission = !isMeDevice && isMeCanMuteParticipants && device?.externalId && !isMeAnonym && !isWaitingStatus;
        const isCanKickParticipant = !isMeParticipant && isMeSuperUser && !isParticipantCreator && !isMeAnonym;
        const isCanChangeName = !isContact &&
            !isSferum &&
            (((isMeSuperUser || isMeParticipant) && !isGroupParticipant) || (isMeParticipant && isMeAnonym));
        const isFirstSection = isCanGoToProfile;
        const isSecondSection = hasNewViewOfMuteActions
            ? isMeCanPutHandDown || isMeCanPinParticipants || canEnableMediaRequest
            : isMeCanPutHandDown || isMeCanPinParticipants || isChatEnabled || canBeAdmin || canLoseAdminRole;
        const isThirdSection = (!hasNewViewOfMuteActions && canEnableMediaRequest) || isHaveMutePermission;
        const isFourthSection = hasNewViewOfMuteActions
            ? canBeAdmin || canLoseAdminRole || isCanChangeName
            : isCanKickParticipant || isCanChangeName;
        const isFiveSection = hasNewViewOfMuteActions && isCanKickParticipant;
        let adminAccessAction;
        // ==================
        // Первая секция
        // ==================
        // Перейти в сообщество | Имя участника
        if (isCanGoToProfile) {
            if (hasNewViewOfMuteActions) {
                const profileActions = [];
                profileActions.push({
                    before: _jsx(Icon20UserSquareOutline, {}),
                    deps: [isGroupParticipant, participant.name, openedModal],
                    onClick: (event) => {
                        navigateToProfile(event, participant.link, peerIdToVkId(participant.peerId));
                        if (modalHasType(openedModal, ModalType.MANAGEMENT)) {
                            dispatch(toggleModal());
                        }
                    },
                    text: isGroupParticipant ? getLang('calls_go_to_community') : getLang('calls_go_to_profile'),
                    titleClassName: 'CallsActionsGoToProfileTitle',
                });
                profileActions.push({ separator: true });
                profileActions.push(goToChatAction);
                if (isSecondSection || isThirdSection || isFourthSection || isFiveSection) {
                    actions.push({
                        after: _jsx(Icon24ChevronCompactRight, { className: getColorClass('color_icon_medium') }),
                        before: isGroupParticipant ? _jsx(Icon20Users3Outline, {}) : _jsx(Icon20UserOutline, {}),
                        deps: profileActions
                            .map((action) => action.deps)
                            .reduce((allDeps, dep) => allDeps.concat(dep), []),
                        items: profileActions,
                        text: getUserName(participant),
                        dataTestId: 'calls_participant_actions_profile',
                    });
                }
                else {
                    Array.prototype.push.apply(actions, profileActions);
                }
            }
            else {
                actions.push({
                    after: _jsx(Icon16Chevron, {}),
                    deps: [isGroupParticipant, participant.name, openedModal],
                    onClick: (event) => {
                        navigateToProfile(event, participant.link, peerIdToVkId(participant.peerId));
                        if (modalHasType(openedModal, ModalType.MANAGEMENT)) {
                            dispatch(toggleModal());
                        }
                    },
                    text: isGroupParticipant ? getLang('calls_go_to_community') : participant.name,
                    titleClassName: 'CallsActionsGoToProfileTitle',
                    dataTestId: 'calls_participant_actions_profile',
                });
            }
        }
        if (isFirstSection && isSecondSection) {
            actions.push({ separator: true });
        }
        // ==================
        // Вторая секция
        // ==================
        // Опустить руку
        if (isMeCanPutHandDown) {
            actions.push(createPutHandDownAction());
        }
        // Закрепить | открепить видео для всех
        if (isMeCanPinParticipants) {
            const pinDevice = (d) => {
                SDK.pinParticipant(d.externalId, false, myRoomId)
                    .then(() => {
                    setAdminPinnedParticipant(d.externalId);
                    dispatch({
                        type: E_ACTION.TOGGLE_ORATOR_MODE,
                        isOratorMode: true,
                    });
                    sendStats(ClickHouseEventType.ADMIN_PIN);
                })
                    .catch(handlePromiseError);
            };
            const unpinDevice = (d) => {
                SDK.pinParticipant(d.externalId, true, myRoomId)
                    .then(() => {
                    clearAdminPinnedParticipant();
                    sendStats(ClickHouseEventType.ADMIN_UNPIN);
                })
                    .catch(handlePromiseError);
            };
            const text = participnatPinnedByAdmin
                ? getLang('calls_participant_menu_pin_cancel')
                : getLang('calls_participant_menu_pin');
            const dataTestId = participnatPinnedByAdmin
                ? 'calls_participant_actions_unpin'
                : 'calls_participant_actions_pin';
            const before = participnatPinnedByAdmin ? _jsx(Icon20PinSlashOutline, {}) : _jsx(Icon20PinDotOutline, {});
            const onClick = () => {
                if (participnatPinnedByAdmin) {
                    if (device) {
                        unpinDevice(device);
                    }
                    else {
                        forEachDeviceByParticipant(participant.peerId, unpinDevice);
                    }
                }
                else {
                    if (device) {
                        pinDevice(device);
                    }
                    else {
                        forEachDeviceByParticipant(participant.peerId, pinDevice);
                    }
                }
            };
            actions.push({
                text,
                before: hasNewViewOfMuteActions ? before : undefined,
                onClick,
                deps: [myRoomId, participnatPinnedByAdmin],
                dataTestId: dataTestId,
            });
        }
        // Написать сообществу | написать лично
        if (!hasNewViewOfMuteActions && isChatEnabled) {
            actions.push(goToChatAction);
        }
        // Назначить | разжаловать администратора
        if (canBeAdmin || canLoseAdminRole) {
            // Назначить администратором
            if (canBeAdmin) {
                adminAccessAction = {
                    text: getLang('calls_participant_menu_assign_admin_role'),
                    before: hasNewViewOfMuteActions ? _jsx(Icon20UserStarBadgeOutline, {}) : undefined,
                    onClick: () => {
                        dispatch(getModalAction(ModalType.ADMIN_ASSIGNMENT, {
                            peerId: participant.peerId,
                        }));
                    },
                    deps: [isParticipantSuperUser, getModalAction],
                    dataTestId: 'calls_participant_actions_add_role',
                };
                // Разжаловать администратора
            }
            else if (canLoseAdminRole) {
                adminAccessAction = {
                    text: getLang('calls_participant_menu_revoke_admin_role'),
                    before: hasNewViewOfMuteActions ? _jsx(Icon20UserStarBadgeSlashOutline, {}) : undefined,
                    onClick: () => {
                        SDK.grantRoles(externalId, [UserRole.ADMIN], true)
                            .then(() => {
                            dispatch({
                                type: E_ACTION.CHANGE_PARTICIPANT_ROLES,
                                participantId: participant.peerId,
                                data: (participant.roles || []).filter((role) => role !== UserRole.ADMIN),
                            });
                            sendStats(ClickHouseEventType.RETRIEVE_ADMIN);
                        })
                            .catch(console.log);
                    },
                    deps: [isParticipantAdmin],
                    dataTestId: 'calls_participant_actions_remove_role',
                };
            }
            if (!hasNewViewOfMuteActions && adminAccessAction) {
                actions.push(adminAccessAction);
            }
        }
        if (!hasNewViewOfMuteActions && (isFirstSection || isSecondSection) && isThirdSection) {
            // ==================
            // Третья секция
            // ==================
            actions.push({ separator: true });
        }
        const muteActions = [];
        // Попросить включить камеру или микрофон
        if (canEnableMediaRequest) {
            actions.push({
                text: getLang('calls_personal_request_for_enable_mic_or_camera'),
                before: hasNewViewOfMuteActions ? _jsx(Icon20MegaphoneOutline, {}) : undefined,
                onClick: () => {
                    const enableMedia = (d) => {
                        const requestedMedia = [MediaOption.AUDIO, MediaOption.VIDEO];
                        SDK.muteParticipant({
                            externalId: d.externalId,
                            muteStates: {},
                            requestedMedia: requestedMedia,
                            roomId: d.roomId,
                        })
                            .then(() => sendStats(ClickHouseEventType.ASK_USER_TO_UNMUTE))
                            .catch(handlePromiseError);
                    };
                    if (device) {
                        enableMedia(device);
                    }
                    else {
                        forEachDeviceByParticipant(participant.peerId, enableMedia);
                    }
                },
                dataTestId: 'calls_participant_actions_request_media',
            });
        }
        if (hasNewViewOfMuteActions && (isFirstSection || isSecondSection) && isThirdSection) {
            // ==================
            // Третья секция
            // ==================
            actions.push({ separator: true });
        }
        // Мьют камеры | микрофона | СП
        if (isHaveMutePermission) {
            const deviceExternalId = device?.externalId;
            const audioIndicators = getMuteParticipantIndicators(MuteParticipantMode.SINGLE_AUDIO);
            const videoIndicators = getMuteParticipantIndicators(MuteParticipantMode.SINGLE_VIDEO);
            const screenSharingIndicators = getMuteParticipantIndicators(MuteParticipantMode.SINGLE_SCREEN_SHARING);
            if (!hasNewViewOfMuteActions || !isParticipantSuperUser) {
                // Мирофон
                muteActions.push({
                    text: hasNewViewOfMuteActions
                        ? getLang('calls_participant_menu_toggle_access_microphone')
                        : getLang('calls_participant_menu_mute_audio'),
                    before: hasNewViewOfMuteActions ? (_jsx(Icon20VoiceOutline, { className: !audioIndicators.isMediaAllowed ? colorClassNegative : undefined })) : (_jsx(Icon20Voice, {})),
                    onClick: () => {
                        if (hasNewViewOfMuteActions) {
                            void muteDevice({
                                isAudio: audioIndicators.isAudio,
                                isCurrentlyOn: audioIndicators.isCurrentlyOn,
                                isMediaAllowed: audioIndicators.isMediaAllowed,
                                isPermanent: audioIndicators.isMediaAllowed,
                                participantExternalId: deviceExternalId,
                                roomId: myRoomId,
                                skipStatsSending: [MuteState.MUTE],
                            });
                        }
                        else {
                            dispatch(getModalAction(ModalType.MUTE_PARTICIPANT, {
                                externalId: deviceExternalId,
                                mode: MuteParticipantMode.SINGLE_AUDIO,
                            }));
                        }
                    },
                    isEnabled: audioIndicators.isMediaAllowed,
                    notKeepOpen: !hasNewViewOfMuteActions,
                    deps: [audioIndicators.isMediaAllowed, getModalAction],
                    dataTestId: 'calls_participant_actions_turn_off_mic',
                });
                // Видео
                muteActions.push({
                    text: hasNewViewOfMuteActions
                        ? getLang('calls_participant_menu_toggle_access_camera')
                        : getLang('calls_settings_camera'),
                    before: hasNewViewOfMuteActions ? (_jsx(Icon20VideocamOutline, { className: !videoIndicators.isMediaAllowed ? colorClassNegative : undefined })) : (_jsx(Icon20Camera, {})),
                    onClick: () => {
                        if (hasNewViewOfMuteActions) {
                            void muteDevice({
                                isCurrentlyOn: videoIndicators.isCurrentlyOn,
                                isMediaAllowed: videoIndicators.isMediaAllowed,
                                isPermanent: videoIndicators.isMediaAllowed,
                                isVideo: videoIndicators.isVideo,
                                participantExternalId: deviceExternalId,
                                roomId: myRoomId,
                                skipStatsSending: [MuteState.MUTE],
                            });
                        }
                        else {
                            dispatch(getModalAction(ModalType.MUTE_PARTICIPANT, {
                                externalId: deviceExternalId,
                                mode: MuteParticipantMode.SINGLE_VIDEO,
                            }));
                        }
                    },
                    isEnabled: videoIndicators.isMediaAllowed,
                    notKeepOpen: !hasNewViewOfMuteActions,
                    deps: [videoIndicators.isMediaAllowed, getModalAction],
                    dataTestId: 'calls_participant_actions_turn_off_video',
                });
                // Показ экрана
                muteActions.push({
                    text: hasNewViewOfMuteActions
                        ? getLang('calls_participant_menu_toggle_access_screen_sharing')
                        : getLang('calls_screen_sharing'),
                    before: hasNewViewOfMuteActions ? (_jsx(Icon20ArrowUpRectangleOutline, { className: !screenSharingIndicators.isMediaAllowed ? colorClassNegative : undefined })) : (_jsx(Icon20ArrowUpRectangle, {})),
                    onClick: () => {
                        if (isParticipantSuperUser && isMeSuperUser) {
                            dispatch(getModalAction(ModalType.MUTE_PARTICIPANT, {
                                externalId: deviceExternalId,
                                mode: MuteParticipantMode.SINGLE_SCREEN_SHARING,
                            }));
                        }
                        else {
                            void muteDevice({
                                isCurrentlyOn: screenSharingIndicators.isCurrentlyOn,
                                isMediaAllowed: screenSharingIndicators.isMediaAllowed,
                                isPermanent: screenSharingIndicators.isMediaAllowed,
                                isScreenSharing: screenSharingIndicators.isScreenSharing,
                                participantExternalId: deviceExternalId,
                                roomId: device?.roomId,
                                skipStatsSending: [MuteState.MUTE],
                            });
                        }
                    },
                    isEnabled: screenSharingIndicators.isMediaAllowed,
                    notKeepOpen: isParticipantSuperUser && isMeSuperUser,
                    deps: [
                        screenSharingIndicators.isMediaAllowed,
                        device?.roomId,
                        isParticipantSuperUser,
                        isMeSuperUser,
                    ],
                    dataTestId: 'calls_participant_actions_turn_off_sharing',
                });
                // Совместный просмотр
                if (!onlyAdminCanShareMovie && !isSferum && !isParticipantSuperUser && !isAnonym && !isContact) {
                    muteActions.push({
                        text: hasNewViewOfMuteActions
                            ? getLang('calls_participant_menu_toggle_access_watch_together')
                            : getLang('calls_participant_menu_mute_watch_together'),
                        before: hasNewViewOfMuteActions ? (_jsx(Icon20LogoVkVideoOutline, { className: !isShareMovieEnabled ? colorClassNegative : undefined })) : (_jsx(Icon20LogoVkVideo, {})),
                        onClick: () => {
                            if (device) {
                                onWatchTogetherMute(device);
                            }
                        },
                        isEnabled: isShareMovieEnabled,
                        deps: [isShareMovieEnabled],
                        dataTestId: 'calls_participant_actions_turn_off_watch_together',
                    });
                }
            }
            if (hasNewViewOfMuteActions) {
                // Разовое отключение микрофона
                actions.push({
                    text: getLang('calls_participant_management_mute_microphone'),
                    before: _jsx(Icon20VoiceSlashOutline, {}),
                    disabled: !audioIndicators.isCurrentlyOn || !audioIndicators.isMediaAllowed,
                    onClick: () => muteDevice({
                        isAudio: audioIndicators.isAudio,
                        isCurrentlyOn: audioIndicators.isCurrentlyOn,
                        isMediaAllowed: audioIndicators.isMediaAllowed,
                        participantExternalId: deviceExternalId,
                        roomId: myRoomId,
                    }),
                    deps: [audioIndicators.isCurrentlyOn, audioIndicators.isMediaAllowed],
                    dataTestId: 'calls_participant_actions_off_mic',
                });
                // Разовое отключение видео
                actions.push({
                    text: getLang('calls_participant_management_mute_camera'),
                    before: _jsx(Icon20VideocamSlashOutline, {}),
                    disabled: !videoIndicators.isCurrentlyOn || !videoIndicators.isMediaAllowed,
                    onClick: () => muteDevice({
                        isCurrentlyOn: videoIndicators.isCurrentlyOn,
                        isMediaAllowed: videoIndicators.isMediaAllowed,
                        isVideo: videoIndicators.isVideo,
                        participantExternalId: deviceExternalId,
                        roomId: myRoomId,
                    }),
                    deps: [videoIndicators.isCurrentlyOn, videoIndicators.isMediaAllowed],
                    dataTestId: 'calls_participant_actions_off_video',
                });
                // Остановка показ экрана
                actions.push({
                    text: getLang('calls_participant_management_stop_screen_sharing'),
                    before: _jsx(Icon20ArrowUpRectangleOutline, {}),
                    disabled: !screenSharingIndicators.isCurrentlyOn || !screenSharingIndicators.isMediaAllowed,
                    onClick: () => muteDevice({
                        isCurrentlyOn: screenSharingIndicators.isCurrentlyOn,
                        isMediaAllowed: screenSharingIndicators.isMediaAllowed,
                        isScreenSharing: screenSharingIndicators.isScreenSharing,
                        participantExternalId: deviceExternalId,
                        roomId: myRoomId,
                    }),
                    deps: [screenSharingIndicators.isCurrentlyOn, screenSharingIndicators.isMediaAllowed],
                    dataTestId: 'calls_participant_actions_off_sharing',
                });
            }
        }
        if (muteActions.length > 0) {
            actions.push({
                after: hasNewViewOfMuteActions ? (_jsx(Icon24ChevronCompactRight, { className: getColorClass('color_icon_medium') })) : undefined,
                items: muteActions,
                text: hasNewViewOfMuteActions
                    ? getLang('calls_participant_menu_participant_possibilities')
                    : getLang('calls_participant_menu_participant_access'),
                before: hasNewViewOfMuteActions ? _jsx(Icon20SlidersOutline, {}) : undefined,
                deps: muteActions
                    .map((muteAction) => muteAction.deps)
                    .reduce((allDeps, dep) => allDeps.concat(dep), []),
                dataTestId: 'calls_participant_actions_access',
            });
        }
        if ((isFirstSection || isSecondSection || isThirdSection) && isFourthSection) {
            // ==================
            // Четвертая  секция
            // ==================
            actions.push({ separator: true });
        }
        // Назначить | разжаловать администратора
        if (hasNewViewOfMuteActions && adminAccessAction) {
            actions.push(adminAccessAction);
        }
        // Переименовать пользователя или себя
        if (isCanChangeName) {
            if (isMeParticipant) {
                // Переименовать себя
                actions.push({
                    // Изменить имя
                    text: getLang('calls_change_name'),
                    before: hasNewViewOfMuteActions ? _jsx(Icon20UserPenOutline, {}) : undefined,
                    onClick: () => {
                        dispatch(getModalAction(ModalType.CHANGE_NAME, {
                            peerId: participant.peerId,
                            renamedUserType: RenamedUserType.SELF,
                        }));
                    },
                    deps: [getModalAction],
                    dataTestId: 'calls_participant_actions_rename_me',
                });
            }
            else {
                // Переименовать пользователя
                actions.push({
                    // Переименовать
                    text: getLang('calls_rename'),
                    before: hasNewViewOfMuteActions ? _jsx(Icon20UserPenOutline, {}) : undefined,
                    onClick: () => {
                        dispatch(getModalAction(ModalType.CHANGE_NAME, {
                            peerId: participant.peerId,
                            renamedUserType: isParticipantAnonym(participant.peerId)
                                ? RenamedUserType.ANONYM
                                : RenamedUserType.USER,
                        }));
                    },
                    deps: [getModalAction],
                    dataTestId: 'calls_participant_actions_rename_user',
                });
            }
        }
        if ((isFirstSection || isSecondSection || isThirdSection || isFourthSection) && isFiveSection) {
            // ==================
            // Пятая  секция
            // ==================
            actions.push({ separator: true });
        }
        // исключить из звонка
        if (isCanKickParticipant) {
            actions.push({
                negative: !hasNewViewOfMuteActions,
                text: getLang('calls_participant_menu_kick'),
                before: hasNewViewOfMuteActions ? _jsx(Icon20UserSlashOutline, {}) : undefined,
                onClick: () => {
                    dispatch(getModalAction(ModalType.KICK_PARTICIPANT, {
                        peerId: participant.peerId,
                        kickType: KickParticipantType.CALL,
                    }));
                },
                deps: [getModalAction],
                dataTestId: 'calls_participant_actions_kick',
            });
        }
    }
    // Опции для OneToOne звонка
    if (!isGroupCall) {
        // Опустить руку
        if (isMeCanPutHandDown) {
            actions.push(createPutHandDownAction());
        }
        // Написать сообществу | написать лично
        if (isChatEnabled) {
            actions.push(goToChatAction);
        }
        // Отключить микрофон
        if (!isMeDevice && !isMeAnonym && isMeCanMuteParticipants && !isWaitingStatus) {
            actions.push({
                text: getLang('calls_participant_menu_mute'),
                before: hasNewViewOfMuteActions ? _jsx(Icon20VoiceOutline, {}) : undefined,
                deps: [device?.mediaSettings.isAudioEnabled],
                disabled: hasNewViewOfMuteActions && device && !device.mediaSettings.isAudioEnabled,
                onClick: () => {
                    const singleMuteDevice = (d) => muteDevice({
                        isAudio: true,
                        participantExternalId: d.externalId,
                    });
                    if (device) {
                        void singleMuteDevice(device);
                    }
                    else {
                        forEachDeviceByParticipant(participant.peerId, singleMuteDevice);
                    }
                },
                dataTestId: 'calls_participant_actions_off_mic',
            });
        }
    }
    // TODO CALL-21471 REMOVE TEMPORARY CONTACTS
    if (debugCallsToContacts && isMeParticipant && isContact) {
        actions.push({
            text: 'Deanonimize me',
            onClick: () => {
                callId &&
                    getApiWrapper()()('calls.unmask', {
                        call_id: callId,
                    });
            },
            deps: [callId],
        });
    }
    if (actionsCache[cacheKey]) {
        let equal = actions.length === actionsCache[cacheKey].length;
        if (equal) {
            for (let i = 0; i < actions.length; i++) {
                if (!isArraysEqual(actions[i].deps, actionsCache[cacheKey][i].deps)) {
                    equal = false;
                    break;
                }
            }
        }
        if (equal) {
            actions = actionsCache[cacheKey];
        }
        else {
            actionsCache[cacheKey] = actions;
        }
    }
    else {
        actionsCache[cacheKey] = actions;
    }
    return actions;
};
/** пытается получить `peerId` из под участника или девайса (или вернет `null`) */
function getPeerId(participant, device) {
    if (participant.peerId) {
        return participant.peerId;
    }
    if (!device?.externalId.id) {
        return null;
    }
    return device.externalId.id;
}
/**
 * Проверяет, является ли участник принудительно запиненным от имени администратора.
 */
function isParticipantPinnedByAdmin(adminPinnedParticipant, participant) {
    if ('externalId' in participant) {
        return isSameExternalId(adminPinnedParticipant, participant.externalId);
    }
    else {
        if (adminPinnedParticipant === null || !participant.peerId) {
            return false;
        }
        return adminPinnedParticipant.id === participant.peerId.toString();
    }
}
/**
 * Проверяет, может ли пользователь назначать администраторов звонка
 */
function canAssignAdmins(participant) {
    if (!participant.roles) {
        return false;
    }
    return isCreator(participant) || isAdmin(participant);
}
//# sourceMappingURL=participantActions.js.map