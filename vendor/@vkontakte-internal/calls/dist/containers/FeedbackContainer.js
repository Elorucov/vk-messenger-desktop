import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":3}],"IconButton":["@vkontakte-internal/vkcom-kit",{"className":1}],"section":["global",{"className":1}]} */
import { useState, } from 'react';
import { useTypedDispatch } from '../hooks/useTypedDispatch';
import { CallModal } from '../components/CallModal/CallModal';
import { E_ACTION } from '../constants';
import { CallsEventType, Mode, EMPTY_PEER_ID, isGroupCallByPeer, useCallsBridge, } from '@vkontakte-internal/calls-core';
import { FocusTrap, AppearanceProvider, Checkbox, IconButton, Textarea } from '@vkontakte-internal/vkcom-kit';
import { FeedbackScreen } from '../components/FeedbackScreen/FeedbackScreen';
import { StarOutline } from '../icons/StarOutline';
import { classNames as cx } from '@vkontakte/vkjs';
import { StarFilled } from '../icons/StarFilled';
import { useLang } from '../hooks/useLang';
import { useTypedSelector } from '../hooks/useTypedSelector';
import { getConfigDeviceId, getLastCallData } from '../selectors';
import { ClickHouseEventType, useSendStatsService } from '../stats/clickHouse';
var ScreenType;
(function (ScreenType) {
    ScreenType[ScreenType["DEFAULT"] = 0] = "DEFAULT";
    ScreenType[ScreenType["ADVANCE"] = 1] = "ADVANCE";
})(ScreenType || (ScreenType = {}));
export const FeedbackContainer = () => {
    const sendStats = useSendStatsService();
    const dispatch = useTypedDispatch();
    const bridge = useCallsBridge();
    const lastCallData = useTypedSelector(getLastCallData);
    const configDeviceId = useTypedSelector(getConfigDeviceId);
    const { getLang } = useLang();
    const [screenType, setScreenType] = useState(ScreenType.DEFAULT);
    const [sendButtonDisabled, setSendButtonDisabled] = useState(true);
    const [customFeedbackEnabled, setCustomFeedbackEnabled] = useState(false);
    const advanceFeedbackItemsMap = new Map([
        ['DID_NOT_HEAR_INTERLOCUTOR', getLang('calls_feedback_reason_did_not_hear_interlocutor')],
        ['DID_NOT_SEE_INTERLOCUTOR', getLang('calls_feedback_reason_did_not_see_interlocutor')],
        ['BAD_VIDEO_QUALITY', getLang('calls_feedback_reason_bad_video_quality')],
        ['VIDEO_FREEZES', getLang('calls_feedback_reason_video_freezes')],
        ['VERY_QUIET_SOUND', getLang('calls_feedback_reason_very_quiet_sound')],
        ['BAD_SOUND_QUALITY', getLang('calls_feedback_reason_bad_sound_quality')],
        ['SOUND_DID_NOT_MATCH_THE_VIDEO', getLang('calls_feedback_reason_sound_did_not_match_the_video')],
        [
            'FAILED_TO_TURN_ON_CAMERA_OR_MICROPHONE',
            getLang('calls_feedback_reason_failed_to_turn_on_camera_or_microphone'),
        ],
    ]);
    const [feedBackData, setFeedbackData] = useState({
        user_response: 0,
        feedback: [],
        custom_feedback: undefined,
    });
    const [visualFeedback, setVisualFeedback] = useState(0);
    const [feedbackItems] = useState(Array.from(advanceFeedbackItemsMap, ([key]) => {
        return {
            name: key,
            checked: false,
        };
    }));
    const skipFeedback = () => {
        dispatch({ type: E_ACTION.CHANGE_MODE, mode: Mode.READY });
    };
    const sendFeedback = () => {
        const peerId = (lastCallData ? lastCallData.peerId : EMPTY_PEER_ID) || EMPTY_PEER_ID;
        sendStats(ClickHouseEventType.USER_FEEDBACK_RECEIVED, {
            session_id: lastCallData ? lastCallData.callId : '',
            peer_id: peerId,
            device_id: configDeviceId,
            is_group_call: isGroupCallByPeer(peerId),
            user_response: feedBackData.user_response,
            feedback: feedBackData.feedback,
            custom_feedback: customFeedbackEnabled && feedBackData.custom_feedback ? feedBackData.custom_feedback : undefined,
            is_room: lastCallData?.isVoiceRoom,
        });
        dispatch({ type: E_ACTION.CHANGE_MODE, mode: Mode.READY });
        bridge.eventBus.emit(CallsEventType.SUCCESS_FEEDBACK);
    };
    const onMouseOver = (e) => {
        const target = e.target;
        const response = Number(target.getAttribute('data-response'));
        if (response) {
            setVisualFeedback(response);
        }
    };
    const onMouseOut = () => {
        setVisualFeedback(0);
    };
    const onStarClick = (e) => {
        const target = e.target;
        const response = target.getAttribute('data-response');
        if (!response) {
            return;
        }
        const responseValue = parseInt(response, 10);
        if (responseValue <= 3) {
            setScreenType(ScreenType.ADVANCE);
        }
        setFeedbackData({
            ...feedBackData,
            user_response: responseValue,
        });
        setSendButtonDisabled(false);
    };
    const onCheckboxChange = (event) => {
        const { name, checked } = event.target;
        feedbackItems.forEach((item) => {
            if (item.name === name) {
                item.checked = checked;
            }
        });
        setFeedbackData((prevState) => {
            return {
                ...prevState,
                feedback: feedbackItems.filter((item) => item.checked).map((item) => item.name),
            };
        });
    };
    const onCustomCheckboxChange = () => {
        setCustomFeedbackEnabled((customFeedbackEnabled) => !customFeedbackEnabled);
    };
    const onCustomFeedbackTextareaChange = (e) => {
        setFeedbackData({
            ...feedBackData,
            custom_feedback: e.currentTarget.value,
        });
    };
    const stars = () => {
        return (_jsx("div", { className: "FeedbackScreen__stars", children: [1, 2, 3, 4, 5].map((value) => {
                return (_jsxs(IconButton, { onClick: onStarClick, "data-response": value, className: cx('FeedbackScreen__star', {
                        'FeedbackScreen__star--active': value <= visualFeedback || value <= feedBackData.user_response,
                    }), label: `${getLang('calls_rate')} ${value}`, "aria-pressed": value === feedBackData.user_response, onMouseOver: onMouseOver, onMouseOut: onMouseOut, onFocus: onMouseOver, onBlur: onMouseOut, children: [_jsx(StarOutline, { className: "FeedbackScreen__starIcon FeedbackScreen__starIcon--outline" }), _jsx(StarFilled, { className: "FeedbackScreen__starIcon FeedbackScreen__starIcon--filled" })] }, value));
            }) }));
    };
    const voting = () => {
        return (_jsxs("div", { className: "FeedbackScreen__voting", children: [Array.from(advanceFeedbackItemsMap, ([key, value], index) => {
                    return (_jsx("div", { children: _jsx(Checkbox, { name: key, onChange: onCheckboxChange, "data-focus-first": index === 0, children: value }) }, key));
                }), _jsxs("div", { className: "FeedbackScreen__votingItem FeedbackScreen__votingItem--custom", children: [_jsx(Checkbox, { name: "CUSTOM_FEEDBACK", onChange: onCustomCheckboxChange, "aria-label": getLang('calls_feedback_custom_reason_placeholder') }), _jsx(Textarea, { placeholder: getLang('calls_feedback_custom_reason_placeholder'), grow: false, disabled: !customFeedbackEnabled, onChange: onCustomFeedbackTextareaChange })] })] }));
    };
    return (_jsx(CallModal, { onClose: skipFeedback, onBackdropClick: skipFeedback, children: _jsx(AppearanceProvider, { value: "dark", children: _jsx("section", { role: "dialog", "aria-label": screenType === ScreenType.DEFAULT
                    ? getLang('calls_feedback_default_title')
                    : getLang('calls_feedback_advance_title'), "aria-modal": "true", className: "Call", children: _jsx(FocusTrap, { hasFirstFocusableElement: true, children: _jsx(FeedbackScreen, { title: screenType === ScreenType.DEFAULT
                            ? getLang('calls_feedback_default_title')
                            : getLang('calls_feedback_advance_title'), sendButtonClick: sendFeedback, skipButtonClick: skipFeedback, sendButtonDisabled: sendButtonDisabled, children: screenType === ScreenType.DEFAULT ? stars() : voting() }) }) }) }) }));
};
//# sourceMappingURL=FeedbackContainer.js.map