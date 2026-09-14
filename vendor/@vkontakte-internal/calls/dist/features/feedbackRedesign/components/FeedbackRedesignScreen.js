import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":9}],"Icon28Favorite":["@vkontakte/icons",{"className":1}],"Icon28FavoriteOutline":["@vkontakte/icons",{"className":1}]} */
import { useMemo, useRef, useState } from 'react';
import { classNames } from '@vkontakte/vkjs';
import { Button, Checkbox, ModalBody, ModalBox, ModalTextLayout, Separator, Spacing, Textarea, Tooltip, Flex, ModalDismissButton, Tappable, } from '@vkontakte-internal/vkcom-kit';
import { Icon16HelpOutline, Icon28Favorite, Icon28FavoriteOutline } from '@vkontakte/icons';
import { handlePromiseError } from '../../../helpers/logger';
import { useLang } from '../../../hooks/useLang';
import { FEEDBACK_REASONS } from '../types';
import styles from './FeedbackRedesignScreen.module.css';
import { useConfig } from '../../../services/config';
import { FocusTrap } from '../../../components/FocusTrap/FocusTrap';
const LOW_USER_RESPONSE = 3;
const getAdvancedFeedbackReasons = (getLang) => {
    return new Map([
        [
            FEEDBACK_REASONS['DID_NOT_HEAR_INTERLOCUTOR'],
            getLang('calls_feedback_reason_did_not_hear_interlocutor'),
        ],
        [FEEDBACK_REASONS['DID_NOT_SEE_INTERLOCUTOR'], getLang('calls_feedback_reason_did_not_see_interlocutor')],
        [FEEDBACK_REASONS['BAD_VIDEO_QUALITY'], getLang('calls_feedback_reason_bad_video_quality')],
        [FEEDBACK_REASONS['VIDEO_FREEZES'], getLang('calls_feedback_reason_video_freezes')],
        [FEEDBACK_REASONS['VERY_QUIET_SOUND'], getLang('calls_feedback_reason_very_quiet_sound')],
        [FEEDBACK_REASONS['BAD_SOUND_QUALITY'], getLang('calls_feedback_reason_bad_sound_quality')],
        [
            FEEDBACK_REASONS['SOUND_DID_NOT_MATCH_THE_VIDEO'],
            getLang('calls_feedback_reason_sound_did_not_match_the_video'),
        ],
        [
            FEEDBACK_REASONS['FAILED_TO_TURN_ON_CAMERA_OR_MICROPHONE'],
            getLang('calls_feedback_reason_failed_to_turn_on_camera_or_microphone'),
        ],
    ]);
};
export const FeedbackRedesignScreen = ({ handleClose, handleSubmit, loading, }) => {
    const { getLang } = useLang();
    const { enableUploadDebugLogs } = useConfig();
    const advanceFeedbackItemsMap = useMemo(() => getAdvancedFeedbackReasons(getLang), []);
    const [userResponse, setUserResponse] = useState({
        chosenValue: 0,
        hoveredValue: 0,
    });
    const [feedbackItems, setFeedbackItems] = useState(Array.from(advanceFeedbackItemsMap, ([key]) => {
        return {
            key,
            checked: false,
        };
    }).concat({
        key: FEEDBACK_REASONS['OTHER'],
        checked: false,
    }));
    const customFeedbackRef = useRef(null);
    const [customFeedback, setCustomFeedback] = useState('');
    const isLowRating = userResponse.chosenValue && userResponse.chosenValue <= LOW_USER_RESPONSE;
    const title = isLowRating
        ? getLang('calls_feedback_advance_title')
        : getLang('calls_feedback_default_title');
    const getFeedbackItem = (itemKey) => {
        const items = feedbackItems;
        const id = items.findIndex(({ key }) => key === itemKey);
        if (id === -1) {
            throw new Error(`Can't find feedback item with key: ${itemKey}`);
        }
        return [id, items[id]];
    };
    const toggleFeedbackItem = (itemKey, checked) => {
        const items = [...feedbackItems];
        const [id] = getFeedbackItem(itemKey);
        items[id] = {
            key: items[id].key,
            checked: checked ?? !items[id].checked,
        };
        setFeedbackItems(items);
        return items[id].checked;
    };
    const onStarAction = (chosenValue, hoveredValue = 0) => {
        if (chosenValue) {
            if (chosenValue > LOW_USER_RESPONSE &&
                userResponse.chosenValue &&
                userResponse.chosenValue <= LOW_USER_RESPONSE) {
                setFeedbackItems((prev) => prev.map(({ key }) => ({ key, checked: false })));
                setCustomFeedback('');
            }
            setUserResponse({
                chosenValue,
                hoveredValue,
            });
        }
        else if (hoveredValue) {
            setUserResponse({
                ...userResponse,
                hoveredValue,
            });
        }
        else if (!hoveredValue && !hoveredValue) {
            setUserResponse({
                chosenValue: userResponse.chosenValue,
                hoveredValue,
            });
        }
    };
    const onFeedbackItemClick = (itemKey) => {
        try {
            const isChecked = toggleFeedbackItem(itemKey);
            if (itemKey === FEEDBACK_REASONS['OTHER']) {
                setTimeout(() => {
                    isChecked ? customFeedbackRef.current?.focus() : customFeedbackRef.current?.blur();
                });
            }
        }
        catch (e) {
            handlePromiseError(e);
        }
    };
    const onCustomFeedbackChange = (e) => {
        const itemKey = FEEDBACK_REASONS['OTHER'];
        const customFeedback = e.target.value;
        const [, item] = getFeedbackItem(itemKey);
        if (item.checked !== Boolean(itemKey)) {
            toggleFeedbackItem(itemKey);
        }
        setCustomFeedback(customFeedback);
    };
    const [allowedToSendLogs, setAllowedToSendLogs] = useState(true);
    const isFeedbackAdvanceShown = Boolean(userResponse.chosenValue && userResponse.chosenValue <= LOW_USER_RESPONSE);
    const onSubmitClick = () => {
        if (!userResponse.chosenValue) {
            handleClose();
            return;
        }
        const [, { checked: isCustomFeedbackChecked }] = getFeedbackItem(FEEDBACK_REASONS['OTHER']);
        handleSubmit({
            userResponse: userResponse.chosenValue,
            feedback: isLowRating
                ? feedbackItems.filter(({ checked }) => checked).map(({ key }) => key)
                : undefined,
            customFeedback: isLowRating && isCustomFeedbackChecked ? customFeedback : undefined,
            uploadLogs: enableUploadDebugLogs && isFeedbackAdvanceShown && allowedToSendLogs,
        });
    };
    const activeUserResponse = userResponse.hoveredValue ? userResponse.hoveredValue : userResponse.chosenValue;
    const defaultJustifyForButton = isFeedbackAdvanceShown ? 'end' : 'center';
    const withLogsJustifyForButton = isFeedbackAdvanceShown ? 'space-between' : 'center';
    const justifyForButton = enableUploadDebugLogs ? withLogsJustifyForButton : defaultJustifyForButton;
    return (_jsx("div", { className: styles.wrapper, children: _jsxs(ModalBox, { children: [_jsx(ModalDismissButton, { "data-testid": "calls_feedback_modal_close", onClick: handleClose, children: getLang('calls_close') }), _jsx("div", { className: styles.body, children: _jsxs(ModalBody, { insetLevel: 1, children: [_jsx("div", { className: styles.title, children: _jsx(ModalTextLayout, { children: title }) }), _jsxs(FocusTrap, { isAlertDialog: true, hasFirstFocusableElement: true, children: [_jsx("div", { className: styles.starsWrapper, children: [1, 2, 3, 4, 5].map((value) => {
                                            const active = activeUserResponse && value <= activeUserResponse;
                                            return (_jsx(Tappable, { hasActive: false, hasHover: false, "aria-label": `${getLang('calls_rate')} ${value}`, "data-testid": `calls_feedback_star_rate_${value}`, "aria-pressed": value === activeUserResponse, onClick: () => onStarAction(value), onMouseOver: () => onStarAction(undefined, value), onMouseOut: () => onStarAction(), onFocus: () => onStarAction(undefined, value), onBlur: () => onStarAction(), children: _jsx("div", { className: classNames(styles.starItemWrapper, active && styles.active), children: active ? (_jsx(Icon28Favorite, { className: styles.starIcon })) : (_jsx(Icon28FavoriteOutline, { className: styles.starIcon })) }) }, value));
                                        }) }), _jsx(Spacing, { size: 20 }), isFeedbackAdvanceShown && (_jsxs("div", { className: styles.feedbackItemsWrapper, children: [feedbackItems.map(({ key, checked }) => key === FEEDBACK_REASONS['OTHER'] ? (_jsxs("div", { className: styles.feedbackItemOtherWrapper, children: [_jsx(Checkbox, { "data-testid": "calls_feedback_reason_other", checked: checked, onClick: () => onFeedbackItemClick(key) }), _jsx("div", { className: styles.feedbackItemOtherText, children: _jsx(Textarea, { "data-testid": "calls_feedback_reason_other_textarea", getRef: (textarea) => (customFeedbackRef.current = textarea), placeholder: getLang('calls_feedback_custom_reason_placeholder'), value: checked ? customFeedback : '', grow: false, onChange: onCustomFeedbackChange }) })] }, key)) : (_jsx(Checkbox, { "data-testid": `calls_feedback_reason_${key.toLowerCase()}`, checked: checked, onClick: () => onFeedbackItemClick(key), children: advanceFeedbackItemsMap.get(key) }, key))), _jsx(Spacing, { size: 30, children: _jsx(Separator, {}) })] })), _jsx("div", { className: classNames(isFeedbackAdvanceShown && styles.footerPadding), children: _jsxs(Flex, { justify: justifyForButton, children: [enableUploadDebugLogs && isFeedbackAdvanceShown && (_jsx(Checkbox, { checked: allowedToSendLogs, onClick: () => setAllowedToSendLogs(!allowedToSendLogs), titleAfter: _jsx(Tooltip, { placement: "bottom", text: getLang('calls_upload_debug_logs_description'), children: _jsx(Icon16HelpOutline, {}) }), children: getLang('calls_upload_debug_logs_title') })), _jsx(Button, { "data-focus-first": true, "data-testid": "calls_feedback_send", appearance: "accent", size: "m", onClick: () => onSubmitClick(), loading: loading, children: getLang('calls_feedback_send') })] }) })] })] }) })] }) }));
};
//# sourceMappingURL=FeedbackRedesignScreen.js.map