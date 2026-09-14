import React, { memo, useRef } from 'react';
import { Icon20BombOutline, Icon20MuteOutline, Icon20RecentOutline, Icon24BlockOutline, Icon24CheckCircleOutline, Icon24DeleteOutline, Icon24Send, Icon24VoiceOutline, Icon28SendClock, } from '@vkontakte/icons';
import cx from 'classnames';
import { useBrowserEnv, useDispatch } from '../../hooks/misc';
import { useLayoutData } from '../../ui/LayoutDataProvider/LayoutDataProvider';
import { OnboardingMarkedTooltip, useAdaptivityWithJSMediaQueries, } from '@vkontakte-internal/vkcom-kit';
import { COMPOSER_TOOLTIP_OPEN_DELAY, } from '../../ui/ConvoComposer/ConvoComposer';
import { Dropdown } from '../../ui/Dropdown/Dropdown';
import { OnboardingWrapper } from '../../ui/OnboardingWrapper/OnboardingWrapper';
import { OnboardingTooltip } from '../../ui/OnboardingTooltip/OnboardingTooltip';
import { Tooltip } from '../../ui/Tooltip/Tooltip';
import { Spinner } from '@vkontakte/vkui';
import { ActionsMenu, ActionsMenuAction, ActionsMenuDropdownAction, } from '../../ui/ActionsMenu/ActionsMenu';
export const SendButton = memo(function SendButton({ isPostponed, isSendingPostponedMessagesOnboardingVisible, isPostponedMessagesAvailable, triggerMessageSend, canSendExpiringMessage, sendPostponedMessage, showSubmitIcon, showOnboarding, showDisabledSubmitIcon, canRecord, hasEditing, isDraftEmpty, isConvoOwner, hasUploads, isOutOfLimit, submitComposerDraft, isSendOptionsOnboardingVisible, }) {
    const { hasPointer } = useAdaptivityWithJSMediaQueries();
    const dispatch = useDispatch();
    const { lang } = useBrowserEnv();
    const { isMobileLayout } = useLayoutData();
    const [className, ariaLabel] = (() => {
        if (showSubmitIcon) {
            // Отправить сообщение
            return [
                cx('ConvoComposer__button', 'ConvoComposer__sendButton--submit'),
                lang.use(isPostponed
                    ? 'me_composer_send_postponed_aria_label'
                    : 'me_composer_send_aria_label'),
            ];
        }
        else if (showDisabledSubmitIcon) {
            // Отправка сообщения невозможна
            return [
                cx('ConvoComposer__button', 'ConvoComposer__sendButton--submitDisabled'),
                lang.use('me_composer_send_disabled_aria_label'),
            ];
        }
        else if (canRecord) {
            // Начать запись голосового сообщения
            return [
                cx('ConvoComposer__button', 'ConvoComposer__sendButton--mic'),
                lang.use('me_composer_start_recording_aria_label'),
            ];
        }
        else if (hasEditing && isDraftEmpty) {
            // Удалить / Удалить для всех
            return [
                cx('ConvoComposer__button', 'ConvoComposer__sendButton--delete'),
                lang.use(isConvoOwner
                    ? 'me_message_action_delete'
                    : 'me_composer_delete_for_all_button_tooltip'),
            ];
        }
        else if (hasEditing && !hasUploads && !isOutOfLimit && !isDraftEmpty) {
            // Завершить редактирование
            return [
                cx('ConvoComposer__button', 'ConvoComposer__sendButton--edit'),
                lang.use('me_composer_submit_edited_aria_label'),
            ];
        }
        else if (hasUploads) {
            // Происходит обработка сообщения
            return [
                cx('ConvoComposer__button', 'ConvoComposer__sendButton--loading'),
                lang.use('me_composer_loading_aria_label'),
            ];
        }
        else if (hasEditing && !hasUploads && isOutOfLimit) {
            // Достигнут лимит содержимого
            return [
                cx('ConvoComposer__button', 'ConvoComposer__sendButton--limit'),
                lang.use('me_composer_limit_aria_label'),
            ];
        }
        else {
            return [];
        }
    })();
    const $submitBtnRef = useRef(null);
    const submitIcon = React.createElement(SubmitIcon, { isPostponed: isPostponed });
    const onCloseOnboardingTooltip = () => {
        dispatch({
            type: 'UserSeenHelpHint',
            hintId: 'im:web_send_options',
        });
    };
    const handleCloseSendingPostponedMessagesOnboardingTooltip = () => {
        dispatch({
            type: 'UserSeenHelpHint',
            hintId: 'im:sending_postponed_messages',
        });
    };
    const sendSilentMessage = () => {
        triggerMessageSend({ silent: true });
    };
    const sendExpiringMessage = (expiresIn) => {
        triggerMessageSend({ expiresIn });
    };
    return (React.createElement(Dropdown, { content: React.createElement(ComposerSendOptionsMenu, { isPostponedAvailable: isPostponedMessagesAvailable, sendExpiringMessage: sendExpiringMessage, canSendExpiringMessage: canSendExpiringMessage, sendSilentMessage: sendSilentMessage, sendPostponedMessage: sendPostponedMessage }), canOpen: showSubmitIcon && !isPostponed, adaptation: "horizontal", align: "right", position: "top", adaptive: true, ...(!hasPointer
            ? {
                openType: 'longtouch',
            }
            : {
                openType: 'hover',
                delay: 500,
            }), hideOnClick: true },
        React.createElement(OnboardingWrapper, { type: "tooltip", shown: showOnboarding, mode: "1", appearance: "lime", tilt: "left", tipPosition: "top-left", size: 48, content: lang.use(isMobileLayout
                ? 'me_onboarding_message_send_variants_touch'
                : 'me_onboarding_message_send_variants_click'), campaignName: "me_mvk:message_send_variants", screen: "mvk_convo", enableQuarantine: true },
            React.createElement("button", { ref: $submitBtnRef, className: className, "aria-label": ariaLabel, disabled: hasUploads, onClick: () => submitComposerDraft(), 
                // Превентим фокусирование с поля ввода на кнопку
                onMouseDown: (e) => e.preventDefault() },
                isSendingPostponedMessagesOnboardingVisible ? (React.createElement(OnboardingMarkedTooltip, { shown: isSendingPostponedMessagesOnboardingVisible, tipPosition: "top-left", content: lang.use('me_sending_postponed_messages_onboarding'), onClose: handleCloseSendingPostponedMessagesOnboardingTooltip, onClick: handleCloseSendingPostponedMessagesOnboardingTooltip, onMarkerClick: handleCloseSendingPostponedMessagesOnboardingTooltip, size: 56, tilt: "right" }, submitIcon)) : (submitIcon),
                React.createElement(OnboardingTooltip, { isOpen: isSendOptionsOnboardingVisible, text: lang.use('me_composer_choose_send_options_tooltip'), arrowOffset: { x: -3 }, onClose: onCloseOnboardingTooltip, closeOnHoverTarget: $submitBtnRef, closeTimeout: 10000 }),
                React.createElement(SendButtonIcons, { isConvoOwner: isConvoOwner, hasUploads: hasUploads })))));
});
const SubmitIcon = ({ isPostponed, getRootRef }) => {
    return (React.createElement("i", { role: "img", className: "ConvoComposer__buttonIcon ConvoComposer__buttonIcon--submit", ref: getRootRef }, isPostponed ? (React.createElement(Icon28SendClock, { width: 24, height: 24 })) : (React.createElement(Icon24Send, null))));
};
const SendButtonIcons = ({ isConvoOwner, hasUploads, }) => {
    const { lang } = useBrowserEnv();
    return (React.createElement(React.Fragment, null,
        React.createElement(Tooltip, { content: lang.use('me_composer_start_recording_aria_label'), align: "center", position: "top", delay: COMPOSER_TOOLTIP_OPEN_DELAY },
            React.createElement("i", { role: "img", className: "ConvoComposer__buttonIcon ConvoComposer__buttonIcon--mic" },
                React.createElement(Icon24VoiceOutline, null))),
        React.createElement(Tooltip, { content: lang.use(isConvoOwner
                ? 'me_message_action_delete'
                : 'me_composer_delete_for_all_button_tooltip'), align: "center", position: "top" },
            React.createElement("i", { role: "img", className: "ConvoComposer__buttonIcon ConvoComposer__buttonIcon--delete" },
                React.createElement(Icon24DeleteOutline, null))),
        React.createElement("i", { role: "img", className: "ConvoComposer__buttonIcon ConvoComposer__buttonIcon--edit" },
            React.createElement(Icon24CheckCircleOutline, null)),
        React.createElement("i", { role: "img", className: "ConvoComposer__buttonIcon ConvoComposer__buttonIcon--loading" }, hasUploads && React.createElement(Spinner, { size: "s" })),
        React.createElement("i", { role: "img", className: "ConvoComposer__buttonIcon ConvoComposer__buttonIcon--limit" },
            React.createElement(Icon24BlockOutline, null))));
};
const ComposerSendOptionsMenu = ({ canSendExpiringMessage, isPostponedAvailable, sendExpiringMessage, sendSilentMessage, sendPostponedMessage, }) => {
    const { lang } = useBrowserEnv();
    const { isMobileLayout } = useLayoutData();
    const { hasPointer } = useAdaptivityWithJSMediaQueries();
    return (React.createElement(ActionsMenu
    // Превентим фокусирование с поля ввода на меню
    , { 
        // Превентим фокусирование с поля ввода на меню
        onMouseDown: (e) => e.preventDefault() },
        isPostponedAvailable && (React.createElement(ActionsMenuAction, { onClick: sendPostponedMessage, title: lang.use('me_composer_menu_postponed_message'), leftIcon: React.createElement(Icon20RecentOutline, null) })),
        React.createElement(ActionsMenuDropdownAction, { title: lang.use('me_composer_menu_expiring_message'), icon: React.createElement(Icon20BombOutline, null), disabled: !canSendExpiringMessage, openType: !hasPointer ? 'click' : 'hover', position: isMobileLayout ? 'top' : 'right', align: isMobileLayout ? 'right' : 'top' },
            React.createElement(ActionsMenuAction, { onClick: () => sendExpiringMessage(15), title: lang.use('me_seconds', { num: 15 }) }),
            React.createElement(ActionsMenuAction, { onClick: () => sendExpiringMessage(60), title: lang.use('me_minutes', { num: 1 }) }),
            React.createElement(ActionsMenuAction, { onClick: () => sendExpiringMessage(300), title: lang.use('me_minutes', { num: 5 }) }),
            React.createElement(ActionsMenuAction, { onClick: () => sendExpiringMessage(3600), title: lang.use('me_hours', { num: 1 }) }),
            React.createElement(ActionsMenuAction, { onClick: () => sendExpiringMessage(86400), title: lang.use('me_hours', { num: 24 }) })),
        React.createElement(ActionsMenuAction, { onClick: sendSilentMessage, title: lang.use('me_composer_menu_silent_message'), leftIcon: React.createElement(Icon20MuteOutline, null) })));
};
//# sourceMappingURL=SendButton.js.map