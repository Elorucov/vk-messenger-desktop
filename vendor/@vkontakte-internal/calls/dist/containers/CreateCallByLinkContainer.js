import { jsx as _jsx } from "react/jsx-runtime";
import { useCallback, useEffect, useState } from 'react';
import { useTypedDispatch } from '../hooks/useTypedDispatch';
import { E_ACTION } from '../constants';
import { CallStatSource, Mode, peerIdToVkId, useCallsBridge, } from '@vkontakte-internal/calls-core';
import { CreateCallByLinkModal } from '../components/CreateCallByLinkModal/CreateCallByLinkModal';
import { getCallSettings, getGroupsForCall, updateCallSettings } from '../services/backend';
import { ConversationOption, MediaOption, MuteState } from '@vkontakte/calls-sdk';
import { useLang } from '../hooks/useLang';
import { useTypedSelector } from '../hooks/useTypedSelector';
import { useFormCheckboxesValues } from '../hooks/useFormCheckboxesValues';
import { handlePromiseError } from '../helpers/logger';
import { useSendStatsService, ClickHouseEventType } from '../stats/clickHouse';
import { createParticipantSelector, getEntryPoint, getMyId } from '../selectors';
import { useConfig } from '../services/config';
import { setShowChatHistory } from '../actions/actions';
export const CreateCallByLinkContainer = () => {
    const entryPoint = useTypedSelector(getEntryPoint);
    const { sferum: isSferum, enableChatHistoryToggle, enableChatHistoryToggleEdu } = useConfig();
    const bridge = useCallsBridge();
    const isWatchTogetherEnabled = !isSferum;
    const dispatch = useTypedDispatch();
    const { getLang } = useLang();
    const sendStats = useSendStatsService();
    const myPeerId = useTypedSelector(getMyId);
    const me = useTypedSelector(createParticipantSelector(myPeerId));
    const myVkId = peerIdToVkId(myPeerId);
    const [selectedOwnerId, setSelectedOwnerId] = useState(myVkId);
    const [ownerOptions, setOwnerOptions] = useState([
        { value: myVkId, label: me?.name ?? '' },
    ]);
    const waitingHall = useFormCheckboxesValues({ initialValue: false });
    const allowAnon = useFormCheckboxesValues({ initialValue: !isSferum });
    const allowWatchTogether = useFormCheckboxesValues({ initialValue: true });
    const allowReactions = useFormCheckboxesValues({ initialValue: !isSferum });
    const allowScreensharing = useFormCheckboxesValues({
        initialValue: !isSferum,
    });
    const allowChatHistory = useFormCheckboxesValues({ initialValue: isSferum });
    const [selectedMicrophoneOption, setSelectedMicrophoneOption] = useState(isSferum ? MuteState.MUTE : MuteState.UNMUTE);
    const [selectedCameraOption, setSelectedCameraOption] = useState(MuteState.UNMUTE);
    useEffect(() => {
        getGroupsForCall()
            .then((response) => {
            const options = [...ownerOptions];
            if (response.count > 0) {
                response.items.forEach((item) => {
                    options.push({ value: -item.id, label: item.name || '' });
                });
                setOwnerOptions(options);
            }
        })
            .catch(handlePromiseError);
    }, []);
    const onGroupSelectChange = useCallback((option) => {
        setSelectedOwnerId(Number(option.value));
    }, []);
    const onClose = useCallback(() => {
        dispatch({ type: E_ACTION.CHANGE_MODE, mode: Mode.READY });
    }, []);
    const onStartCall = useCallback(() => {
        const conversationOptions = {
            [ConversationOption.FEEDBACK]: allowReactions.checked,
        };
        if (!allowAnon.checked) {
            conversationOptions[ConversationOption.REQUIRE_AUTH_TO_JOIN] = true;
        }
        if (waitingHall.checked) {
            conversationOptions[ConversationOption.WAITING_HALL] = true;
        }
        const mediaOptions = {};
        if (!allowScreensharing.checked) {
            mediaOptions[MediaOption.SCREEN_SHARING] = MuteState.MUTE_PERMANENT;
        }
        if (selectedMicrophoneOption !== MuteState.UNMUTE) {
            mediaOptions[MediaOption.AUDIO] = selectedMicrophoneOption;
        }
        if (selectedCameraOption !== MuteState.UNMUTE) {
            mediaOptions[MediaOption.VIDEO] = selectedCameraOption;
        }
        const conversationFeatures = {
            onlyAdminCanRecordAndTranslation: isSferum,
        };
        bridge
            .startCall(false, entryPoint?.source ?? CallStatSource.HISTORY_CREATE, false, selectedOwnerId > 0 ? 0 : selectedOwnerId, { conversationOptions, createLink: true, mediaOptions, conversationFeatures }, !allowWatchTogether.checked)
            .then((conversationData) => {
            const callId = conversationData?.id;
            if (callId && !allowReactions.checked) {
                sendStats(ClickHouseEventType.REACTION_DISABLED, { session_id: callId });
            }
            if (callId &&
                (isSferum ? enableChatHistoryToggleEdu : enableChatHistoryToggle) &&
                allowChatHistory.checked !== isSferum) {
                sendStats(ClickHouseEventType.CALL_CHAT_HISTORY_TOGGLED, {
                    session_id: callId,
                    event_param: allowChatHistory.checked ? 1 : 0,
                    reason: 'create',
                });
                updateCallSettings(allowChatHistory.checked, callId).then(() => {
                    getCallSettings({ call_id: callId })
                        .then((response) => {
                        dispatch(setShowChatHistory(response.show_chat_history));
                    })
                        .catch(handlePromiseError);
                });
            }
        });
    }, [
        allowReactions.checked,
        selectedOwnerId,
        waitingHall.checked,
        allowAnon.checked,
        selectedMicrophoneOption,
        selectedCameraOption,
        allowScreensharing.checked,
        allowWatchTogether.checked,
        sendStats,
        allowChatHistory.checked,
    ]);
    const microphoneOptions = [
        {
            value: MuteState.UNMUTE,
            // Доступны при входе и во время звонка
            label: getLang('calls_create_call_by_link_phone_option_allow_always'),
        },
        {
            value: MuteState.MUTE,
            // Отключены только при входе
            label: getLang('calls_create_call_by_link_phone_option_disallow_entrance'),
        },
        {
            value: MuteState.MUTE_PERMANENT,
            // Полностью недоступны
            label: getLang('calls_create_call_by_link_phone_option_disallow_always'),
        },
    ];
    const checkSelectedValueAndReturnMappedState = (value) => {
        let state = MuteState.UNMUTE;
        if (value == MuteState.MUTE) {
            state = MuteState.MUTE;
        }
        else if (value == MuteState.MUTE_PERMANENT) {
            state = MuteState.MUTE_PERMANENT;
        }
        return state;
    };
    const onMicrophoneSelectChange = useCallback((value) => {
        setSelectedMicrophoneOption(checkSelectedValueAndReturnMappedState(String(value.value)));
    }, []);
    const onCameraSelectChange = useCallback((value) => {
        setSelectedCameraOption(checkSelectedValueAndReturnMappedState(String(value.value)));
    }, []);
    return (_jsx(CreateCallByLinkModal, { onClose: onClose, onStartCall: onStartCall, ownerOptions: ownerOptions, selectedOwnerId: selectedOwnerId, waitingHall: waitingHall, allowAnon: allowAnon, allowWatchTogether: allowWatchTogether, allowReactions: allowReactions, allowScreensharing: allowScreensharing, allowChatHistory: allowChatHistory, onGroupSelectChange: onGroupSelectChange, mediaOptions: microphoneOptions, onMicrophoneSelectChange: onMicrophoneSelectChange, onCameraSelectChange: onCameraSelectChange, selectedMicrophoneOption: selectedMicrophoneOption, selectedCameraOption: selectedCameraOption, isWatchTogetherEnabled: isWatchTogetherEnabled, isChatHistoryToggleEnabled: isSferum ? enableChatHistoryToggleEdu : enableChatHistoryToggle }));
};
//# sourceMappingURL=CreateCallByLinkContainer.js.map