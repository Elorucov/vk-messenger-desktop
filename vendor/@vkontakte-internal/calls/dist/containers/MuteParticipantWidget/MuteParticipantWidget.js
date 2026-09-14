import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { observer } from 'mobx-react-lite';
import { createWidget } from '@vkontakte-internal/di';
import { useCallback, useEffect, useState } from 'react';
import { MuteState } from '@vkontakte/calls-sdk';
import { MuteControlModal } from '../../components/MuteControlModal/MuteControlModal';
import { isParticipantAnonymOrContact, isParticipantGroup } from '../../helpers/participant';
import { getGroupById, loadUsers } from '../../services/backend';
import { Button } from '@vkontakte-internal/vkcom-kit';
import { MuteParticipantMode, peerIdToVkId } from '@vkontakte-internal/calls-core';
import { useCloseModal } from '../../hooks/useCloseModal';
import { Provider, useModel } from './MuteParticipantModel';
const MuteParticipantView = observer(function MuteParticipantView() {
    const { externalId, getLang, getMuteState, isVoiceRoom, mode, onClose, participants, roomId, toggleLoader, } = useModel();
    const meParticipant = externalId && participants[externalId.id];
    const { isMediaAllowed, isPermanentAvailable, isSingle, mute } = getMuteState();
    const closeModal = useCloseModal(onClose);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState(/* аноним */ meParticipant?.name ?? '');
    const { onMuteTitle, title } = (() => {
        /** текст кнопки разового отключения медиа */
        let t = getLang('calls_mute_participant_dialog_action_v2');
        /** текст заголовка окна */
        let ti = '';
        switch (mode) {
            case MuteParticipantMode.SINGLE_AUDIO:
                // обновляем текст кнопки
                t = isMediaAllowed
                    ? getLang('calls_mute_participant_dialog_action_v2') // Отключить один раз
                    : getLang('calls_mic_turn_on'); // Включить микрофон
                // Заголовок модального окна => Включить микрофоны
                ti = (isMediaAllowed
                    ? getLang('calls_mute_participant_dialog_title_audio')
                    : getLang('calls_unmute_participant_dialog_title_audio_v2')).replace('{name}', name);
                break;
            case MuteParticipantMode.SINGLE_SCREEN_SHARING:
                t = getLang('calls_mute_participant_dialog_action_v2'); // Отключить один раз
                // Отключить показ экрана {name}
                ti = getLang('calls_mute_participant_dialog_title_only_screen_share').replace('{name}', name);
                break;
            case MuteParticipantMode.SINGLE_VIDEO:
                // обновляем текст кнопки
                t = isMediaAllowed
                    ? getLang('calls_mute_participant_dialog_action_v2') // Отключить один раз
                    : getLang('calls_enable_video'); // Включить видео
                // Заголовок модального окна
                ti = (isMediaAllowed
                    ? getLang('calls_mute_participant_dialog_title_only_video')
                    : getLang('calls_unmute_participant_dialog_title_only_video_v2')).replace('{name}', name);
                break;
            case MuteParticipantMode.ALL_AUDIO:
                // заголовок => Включить микрофоны
                if (!isPermanentAvailable) {
                    t = getLang('calls_mute_participant_dialog_action_mics');
                }
                ti = isPermanentAvailable
                    ? getLang('calls_mute_all_participants_audio_title')
                    : getLang('calls_unmute_all_participants_audio_title');
                break;
            case MuteParticipantMode.ALL_VIDEO:
                // заголовок => Включить камеры
                if (!isPermanentAvailable) {
                    t = getLang('calls_unmute_cameras');
                }
                ti = isPermanentAvailable
                    ? getLang('calls_mute_all_participants_cameras')
                    : getLang('calls_unmute_all_participants_cameras');
                break;
        }
        return {
            onMuteTitle: t,
            title: ti,
        };
    })();
    useEffect(() => {
        const meParticipant = externalId && participants[externalId.id];
        if (isSingle && !isParticipantAnonymOrContact(meParticipant?.peerId || 0)) {
            toggleLoader(true);
            new Promise((resolve, reject) => {
                const groupId = meParticipant && isParticipantGroup(meParticipant.peerId)
                    ? -peerIdToVkId(meParticipant.peerId)
                    : undefined;
                if (groupId) {
                    getGroupById(groupId)
                        .then(({ groups }) => {
                        resolve(groups && groups.length > 0 ? groups[0]?.name || '' : '');
                    })
                        .catch(reject);
                }
                else {
                    loadUsers({
                        user_ids: meParticipant?.peerId,
                        name_case: 'Dat',
                    })
                        .then(([user]) => {
                        resolve(user?.first_name || '');
                    })
                        .catch(reject);
                }
            })
                .then((name) => {
                setName(name);
                setLoading(false);
                toggleLoader(false);
            })
                .catch(console.log);
        }
        else {
            setLoading(false);
        }
    }, [externalId, mode]);
    const muteParticipantsPermanent = useCallback(() => {
        if (isSingle && externalId) {
            mute({ isPermanent: true, participantExternalId: externalId, roomId }).finally(closeModal);
        }
        else {
            mute({ isPermanent: true, participantExternalId: null, roomId }).finally(closeModal);
        }
    }, [mute, externalId, isSingle, roomId]);
    const muteParticipants = useCallback(() => {
        const skipStatsSending = !isPermanentAvailable ? [MuteState.MUTE] : undefined;
        if (isSingle && externalId) {
            mute({ participantExternalId: externalId, roomId, skipStatsSending }).finally(closeModal);
        }
        else {
            mute({ participantExternalId: null, roomId, skipStatsSending }).finally(closeModal);
        }
    }, [mute, externalId, isSingle, roomId]);
    if (isSingle && loading) {
        return _jsx(_Fragment, {});
    }
    return (_jsx(MuteControlModal, { title: title, onClose: closeModal, actionButtons: _jsxs(_Fragment, { children: [isPermanentAvailable && !isVoiceRoom && (_jsx(Button, { size: "m", onClick: muteParticipantsPermanent, mode: "secondary", children: getLang('calls_mute_participant_permanent_dialog_action') }, "mute_permanent")), _jsx(Button, { size: "m", "data-focus-first": true, onClick: muteParticipants, children: onMuteTitle }, "mute")] }) }));
});
export const MuteParticipantWidget = createWidget(Provider, MuteParticipantView);
//# sourceMappingURL=MuteParticipantWidget.js.map