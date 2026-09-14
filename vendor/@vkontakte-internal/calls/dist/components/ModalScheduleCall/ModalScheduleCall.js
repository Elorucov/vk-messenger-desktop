import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/* lock-restricted-props: {"span":["global",{"className":2}],"div":["global",{"className":21}],"label":["global",{"className":6}]} */
import { useLang } from '../../hooks/useLang';
import { CallsModal } from '../../components/CallsModal';
import { useFormInputValue } from '../../hooks/useFormInputValue';
import { useFormCheckboxesValues } from '../../hooks/useFormCheckboxesValues';
import { useFormSelectValue } from '../../hooks/useFormSelectValue';
import { classNames as cn } from '@vkontakte/vkjs';
import { DialogConfirmClose } from '../DialogConfirmClose/DialogConfirmClose';
import { CallChip } from '../CallChip/CallChip';
import { ERepeatCallVariant, ECalendar, ETranslationPlannedTimeVariant, useVkmeContext, } from '@vkontakte-internal/calls-core';
import { EMediaPermission } from './constants';
import { useRepeatCallOptions } from './useRepeatCallOptions';
import { useTimezones } from './useTimezones';
import { useUserOptions } from './useUserOptions';
import { useOptions } from './useOptions';
import { useSelectTimezonesScrollOnOpen } from './useSelectTimezonesScrollOnOpen';
import { mapRecurrenceRule, modifyParamsWithBroadcast, setDateToTimezoneOffset } from './utils';
import { useDateTimeValues } from './useDateTimeValues';
import { DatePicker } from './DatePicker';
import { useRRuleEndValue } from './useRRuleEndValue';
import { DatePickerRruleEnd } from './DatePickerRruleEnd';
import { useBroadcastPlanning } from './useBroadcastPlanning';
import { BroadcastPlanning } from './BroadcastPlanning';
import { useEffect } from 'react';
import { usePromiseError } from '../../hooks/usePromiseError';
import { isLocationCallsStandalone } from '../../helpers/url';
import { Button, FormItem, IconButton, Avatar, ButtonGroup, Input, SimpleCell, Div, Switch, EllipsisText, Tooltip, CustomSelect, Flex, } from '@vkontakte-internal/vkcom-kit';
import { Icon16Clear } from '@vkontakte/icons';
import { useDialogController } from '../../hooks/useDialogController';
import { SelectLikeDropdown } from '../SelectLikeDropdown/SelectLikeDropdown';
const MAX_TITLE_LENGTH = 100;
/** модальное окно планирования и редактирования звонка */
export const ModalScheduleCall = ({ onClose, headerTitle, onSubmit, userSelectOptions, myUserId, loading, call, isSferum = false, toggles, }) => {
    const { handleError } = usePromiseError();
    const { getLang, langNumeric } = useLang();
    const { calendarOptions, durationOptions, mediaOptions } = useOptions(!isSferum);
    const { handleCloseDialog, handleOpenDialog, isOpened } = useDialogController();
    useSelectTimezonesScrollOnOpen({
        selector: 'ModalScheduleCall__select--timezone',
    });
    const { isVkme } = useVkmeContext();
    const isWatchTogetherEnabled = !isSferum;
    const { enableChatHistoryToggle, enableChatHistoryToggleEdu } = toggles;
    /** название встречи */
    const title = useFormInputValue({
        initialValue: () => {
            return call?.name || getLang('calls_default_meeting_name');
        },
    });
    /**
     * от какого юзера делаем встречу. по-умолчанию, от своего.
     * также можно передать массив с вариантами "создателей".
     *
     * в случае редактирования, эта опция в состоянии disabled
     */
    const userOptions = useUserOptions({
        options: userSelectOptions,
        myUserId,
        forceShow: !!(call && userSelectOptions?.length),
    });
    const isGroupOwner = userOptions.select.value !== myUserId;
    const broadcast = useBroadcastPlanning({
        call,
        isGroupOwner,
        userId: userOptions.select.value,
        config: {
            ...toggles,
            sferum: isSferum,
        },
    });
    const { translationPreview, translationCheckbox, translationDescription, setTranslationDescription, translationTimeVariant, translationPrivacyView, translationPrivacyComment, isBroadcastLoading, startTimeUnix, hasData: hasBroadcastData, openDatePicker, deleteBroadcast, broadcastId, } = broadcast;
    const onCancel = () => {
        const promise = !call && broadcastId ? deleteBroadcast : () => Promise.resolve();
        promise().then(onClose).catch(handleError);
    };
    /** дата и время начала и окончания звонка */
    const datetime = useDateTimeValues({ call, translationTimeVariant: translationTimeVariant.value });
    // Костыль т.к. даты мы храним в useReducer и начальное значение прокидывается в init.
    // Трансляция запрашивается асинхронно и к моменту ответа даты уже заинициализированны
    useEffect(() => {
        if (startTimeUnix) {
            datetime.translationDateStartCtx.forceSetTime(startTimeUnix);
            if (startTimeUnix === datetime.startTimeMs) {
                translationTimeVariant.setValue(ETranslationPlannedTimeVariant.EqualToCallTime);
            }
        }
    }, [startTimeUnix]);
    /** временная зона */
    const timezones = useTimezones({
        startDate: datetime.dateStartCtx.date,
        startTime: datetime.dateStartCtx.time,
    });
    /** Конец повтора */
    const rruleEndCtx = useRRuleEndValue({
        recurrenceUntilTime: call?.schedule.recurrence_until_time,
        ...datetime.rruleEndCtx,
    });
    /** по какой схеме повторять встречу */
    const repeatCall = useRepeatCallOptions({
        date: datetime.dateStartCtx.date,
        initialValue: mapRecurrenceRule(call?.schedule.recurrence_rule),
    });
    /**
     * в какой календарь будем шарить информацию о встрече
     * (Google, Outlook и тп)
     */
    const calendar = useFormSelectValue({
        options: calendarOptions,
        initialValue: ECalendar.Other,
    });
    /** напомнить (прислать уведомление (нотификацию) о звонке) */
    const isNotification = useFormCheckboxesValues({
        initialValue: call ? !call.skip_notification : false,
    });
    /** включить зал ожидания */
    const isWaitinghall = useFormCheckboxesValues({
        initialValue: !!call?.waiting_hall,
    });
    /** включить совместный просмотр */
    const watchTogether = useFormCheckboxesValues({
        initialValue: !call?.only_admin_can_share_movie,
    });
    /** разрешать анонимам подключаться к звонку */
    const isAnonym = useFormCheckboxesValues({
        initialValue: call ? !call.only_auth_users : !isSferum,
    });
    /** включить реакции в звонке */
    const isReactions = useFormCheckboxesValues({
        initialValue: () => (call ? !!call.feedback : !isSferum),
    });
    const isScreensharing = useFormCheckboxesValues({
        initialValue: call ? call.mute_screen_sharing === EMediaPermission.Allowed : !isSferum,
    });
    const showChatHistory = useFormCheckboxesValues({
        initialValue: call ? call.show_chat_history : isSferum,
    });
    /** настройки пермишенов по аудио */
    const micPermission = useFormSelectValue({
        options: mediaOptions,
        initialValue: () => {
            const initialValue = isSferum ? EMediaPermission.DisabledOnEnter : EMediaPermission.Allowed;
            return call?.mute_audio || initialValue;
        },
    });
    /** настройки пермишенов по видео */
    const videoPermission = useFormSelectValue({
        options: mediaOptions,
        initialValue: () => {
            return call?.mute_video || EMediaPermission.Allowed;
        },
    });
    const handleOnSubmit = () => {
        /** имя пользователя */
        const displayName = isGroupOwner ? userOptions.displayName : undefined;
        const params = {
            name: title.value.trim().slice(0, MAX_TITLE_LENGTH) || getLang('calls_default_meeting_name'),
            muteAudio: micPermission.value,
            muteVideo: videoPermission.value,
            onlyAuthUsers: !isAnonym.checked ? 1 : 0,
            duration: datetime.durationMs,
            start: datetime.startTimeMs,
            waitingHall: isWaitinghall.checked ? 1 : 0,
            calendar: calendar.value,
            displayName,
            timezone: timezones.value,
            rrule: repeatCall.value,
            skipNotification: isNotification.checked ? 0 : 1,
            feedback: isReactions.checked ? 1 : 0,
            onlyAdminCanShareMovie: watchTogether.checked ? 0 : 1,
            onlyAdminCanRecord: isSferum ? 1 : 0,
            muteScreensharing: isScreensharing.checked ? EMediaPermission.Allowed : EMediaPermission.Disabled,
            showChatHistory: showChatHistory.checked ? 1 : 0,
        };
        const broadcastParams = modifyParamsWithBroadcast({
            broadcast,
            submitParams: params,
            call,
            startTime: datetime.translationStartTimeMs,
        });
        if (call?.schedule.marker_time) {
            params.markerTime = call.schedule.marker_time;
        }
        if (isGroupOwner) {
            params.groupId = userOptions.select.value;
        }
        if (repeatCall.value !== ERepeatCallVariant.Never) {
            if (rruleEndCtx.value) {
                params.recurrenceUntilTime = rruleEndCtx.value.valueOf();
            }
        }
        onSubmit(params, broadcastParams);
    };
    // в веб мессенджер нам не подходит легаси модалка, поэтому hasScroll должен быть false
    const hasScroll = !isVkme;
    const minEndDate = new Date(datetime.dateStartCtx.date).setHours(datetime.dateStartCtx.time.hours, datetime.dateStartCtx.time.minutes);
    const titleLengthError = title.value.length > MAX_TITLE_LENGTH;
    return (_jsxs(_Fragment, { children: [isOpened && (_jsx(DialogConfirmClose, { description: getLang('calls_confirm_exit_description'), onClose: handleCloseDialog, onSubmit: onCancel })), _jsx(CallsModal, { className: cn('ModalScheduleCall', {
                    /** @see https://jira.mvk.com/browse/CALL-9054 */
                    'ModalScheduleCall--custom-h': !call && (userSelectOptions?.length || 0) > 1,
                }), title: headerTitle, onClose: handleOpenDialog, disableBodyScroll: true, hasScroll: hasScroll, dataTestId: "calls_schedule_call_modal_root", actionButtons: _jsxs(_Fragment, { children: [_jsx("span", { "data-testid": "calls_schedule_call_modal_footer_link_will_be_copied", className: "ModalScheduleCall__text--muted", children: getLang('calls_will_copy_to_clipboard') }), _jsx("div", { children: _jsxs(ButtonGroup, { children: [_jsx(Button, { "data-testid": "calls_schedule_call_modal_footer_button_cancel", size: "m", onClick: handleOpenDialog, mode: "tertiary", children: getLang('calls_cancel') }), _jsx(Button, { "data-testid": "calls_schedule_call_modal_footer_button_submit", size: "m", mode: "primary", onClick: handleOnSubmit, disabled: loading || isBroadcastLoading || titleLengthError, children: !call
                                            ? /* Запланировать */
                                                getLang('calls_landing_standalone_schedule_call')
                                            : /* Сохранить */
                                                getLang('calls_save') })] }) })] }), children: _jsxs("div", { className: "ModalScheduleCall__calendar", children: [!!userOptions.isShow && (_jsxs(_Fragment, { children: [_jsxs("div", { className: cn('ModalScheduleCall__calendar__row--user-select', 'ModalScheduleCall__calendar__row--3-cols'), children: [_jsx("div", { children: _jsx(Avatar, { size: 36, src: userOptions.avatarUrl, alt: "user-avatar" }) }), _jsx(Tooltip, { placement: "left", text: _jsx("span", { className: "ModalScheduleCall__name-tooltip", children: userOptions.displayName }), children: _jsx(EllipsisText, { "data-testid": "calls_schedule_call_modal_user_label", children: userOptions.displayName }) }), _jsx(SelectLikeDropdown, { "data-testid": "calls_schedule_call_modal_user_select", selectedId: userOptions.select.value, options: userOptions.select.options, disabled: !!call, onChange: userOptions.select.onChange, "data-focus-first": userOptions.select.options.length > 1 })] }), _jsx("div", { className: cn('ModalScheduleCall__calendar__divider', 'ModalScheduleCall__calendar__divider--full-width') })] })), _jsxs("div", { className: cn('ModalScheduleCall__calendar__row', 'ModalScheduleCall__calendar__row--2-cols', 'ModalScheduleCall__calendar__row--title'), children: [_jsx("span", { "data-testid": "calls_schedule_call_modal_title_label", children: getLang('calls_title') }), _jsx("div", { className: "ModalScheduleCall__calendar__title", children: _jsx(FormItem, { noPadding: true, status: titleLengthError ? 'error' : 'default', bottom: titleLengthError
                                            ? langNumeric(MAX_TITLE_LENGTH, 'calls_validation_length', getLang('calls_validation_length', 'raw')).replace('{number}', `${MAX_TITLE_LENGTH}`)
                                            : undefined, children: _jsx(Input, { "data-testid": "calls_schedule_call_modal_title_input", value: title.value, after: _jsx(IconButton, { hoverMode: "opacity", label: getLang('calls_clear_field'), onClick: title.clearValue, children: _jsx(Icon16Clear, {}) }), onChange: title.onChange }) }) })] }), _jsxs("div", { className: cn('ModalScheduleCall__calendar__row', 'ModalScheduleCall__calendar__row--2-cols'), children: [_jsx("span", { "data-testid": "calls_schedule_call_modal_start_time_label", children: getLang('calls_start_time') }), _jsx("span", { "data-testid": "calls_schedule_call_modal_start_time_picker", children: _jsx(DatePicker, { ...datetime.dateStartCtx, disableTimeSelect: datetime.isAllDay, minDate: setDateToTimezoneOffset(new Date(), timezones.value), maxDate: undefined }) })] }), _jsx("div", { className: cn('ModalScheduleCall__calendar__row', 'ModalScheduleCall__calendar__row--duration'), children: durationOptions.map((option) => (_jsx(CallChip, { value: option, onClick: datetime.handleChangeDuration, selected: datetime.duration === option.value, "data-testid": `calls_schedule_call_modal_duration_${option.value}`, children: option.label }, option.value))) }), _jsxs("div", { className: cn('ModalScheduleCall__calendar__row', 'ModalScheduleCall__calendar__row--2-cols'), children: [_jsx("span", { "data-testid": "calls_schedule_call_modal_finish_time_label", children: getLang('calls_end') }), _jsx("span", { "data-testid": "calls_schedule_call_modal_finish_time_picker", children: _jsx(DatePicker, { ...datetime.dateEndCtx, minDate: new Date(minEndDate), maxDate: undefined, disabled: datetime.isAllDay }) })] }), _jsxs("div", { className: cn('ModalScheduleCall__calendar__row', 'ModalScheduleCall__calendar__row--2-cols', 'ModalScheduleCall__timezone'), children: [_jsx(Flex.Item, { flexBasis: 100, children: _jsx("span", { "data-testid": "calls_schedule_call_modal_timezone_label", children: getLang('calls_timezone') }) }), _jsx(CustomSelect, { "data-testid": "calls_schedule_call_modal_timezone_select", align: "right", selectType: "accent", options: timezones.options, value: timezones.value, onChange: (_, newValue) => {
                                        if (newValue !== null)
                                            timezones.onChange({ value: newValue });
                                    }, searchable: true })] }), _jsxs("div", { className: cn('ModalScheduleCall__calendar__row', 'ModalScheduleCall__calendar__row--2-cols', 'ModalScheduleCall__calls-repeat'), children: [_jsx("div", { "data-testid": "calls_schedule_call_modal_repeat_label", children: getLang('calls_repeat') }), _jsx(SelectLikeDropdown, { "data-testid": "calls_schedule_call_modal_repeat_select", selectedId: repeatCall.value, options: repeatCall.options, onChange: repeatCall.onChange })] }), repeatCall.value !== ERepeatCallVariant.Never && (_jsxs("div", { className: cn('ModalScheduleCall__calendar__row', 'ModalScheduleCall__calendar__row--2-cols'), children: [_jsx("span", { "data-testid": "calls_schedule_call_modal_end_repeat_label", children: getLang('calls_end_of_rrule') }), _jsxs("div", { className: "ModalScheduleCall__select-primary__wrap", children: [_jsx(DatePickerRruleEnd, { date: rruleEndCtx.date, time: rruleEndCtx.time, handleChangeDatePicker: rruleEndCtx.handleChangeDatePicker, placeholder: rruleEndCtx.placeholder, refDropdownTrigger: rruleEndCtx.refDropdownTrigger, minDate: datetime.dateEndCtx.date }), _jsx(SelectLikeDropdown, { "data-testid": "calls_schedule_call_modal_end_repeat_select", selectedId: rruleEndCtx.selectProps.value, options: rruleEndCtx.selectProps.options, onChange: rruleEndCtx.selectProps.onChange })] })] })), _jsxs("div", { className: cn('ModalScheduleCall__calendar__row', 'ModalScheduleCall__calendar__row--2-cols'), children: [_jsx("span", { "data-testid": "calls_schedule_call_modal_add_to_calendar_label", children: getLang('calls_add_to_calendar') }), _jsx(SelectLikeDropdown, { "data-testid": "calls_schedule_call_modal_add_to_calendar_select", selectedId: calendar.value, options: calendar.options, onChange: calendar.onChange })] }), _jsxs("label", { className: cn('ModalScheduleCall__calendar__row', 'ModalScheduleCall__calendar__row--2-cols', 'ModalScheduleCall__switch-panel'), children: [_jsxs("div", { children: [_jsx("div", { "data-testid": "calls_schedule_call_modal_remind_label", children: getLang('calls_remind') }), _jsx("div", { className: "ModalScheduleCall__text--muted ModalScheduleCall__setting-description", children: getLang('calls_remind_desc') })] }), _jsx(Switch, { "data-testid": "calls_schedule_call_modal_remind_switch", ...isNotification })] }), !isLocationCallsStandalone() && (_jsx(BroadcastPlanning, { call: call, isError: repeatCall.value !== ERepeatCallVariant.Never, translationTimeVariant: translationTimeVariant, translationPrivacyView: translationPrivacyView, translationPrivacyComment: translationPrivacyComment, translationPreview: translationPreview, translationCheckbox: translationCheckbox, translationDescription: translationDescription, setTranslationDescription: setTranslationDescription, translationDateStartCtx: datetime.translationDateStartCtx, dateStartCtx: datetime.dateStartCtx, loading: isBroadcastLoading, hasData: hasBroadcastData, openDatePickerByDefault: openDatePicker, isSferum: isSferum, enableBroadcastCommentsSetting: toggles.enableBroadcastCommentsSetting })), _jsx("div", { className: cn('ModalScheduleCall__calendar__divider', 'ModalScheduleCall__calendar__divider--full-width') }), _jsxs("label", { className: cn('ModalScheduleCall__calendar__row', 'ModalScheduleCall__calendar__row--2-cols', 'ModalScheduleCall__switch-panel'), children: [_jsxs("div", { children: [_jsx("div", { "data-testid": "calls_schedule_call_modal_waiting_hall_label", children: getLang('calls_waiting_hall') }), _jsx("div", { className: "ModalScheduleCall__text--muted ModalScheduleCall__setting-description", children: getLang('calls_menu_waiting_hall_description') })] }), _jsx(Switch, { "data-testid": "calls_schedule_call_modal_waiting_hall_switch", ...isWaitinghall })] }), _jsxs("label", { className: cn('ModalScheduleCall__calendar__row', 'ModalScheduleCall__calendar__row--2-cols', 'ModalScheduleCall__switch-panel'), children: [_jsxs("div", { children: [_jsx("div", { "data-testid": "calls_schedule_call_modal_anon_label", children: getLang('calls_create_call_by_link_anon') }), _jsx("div", { className: "ModalScheduleCall__text--muted ModalScheduleCall__setting-description", children: getLang('calls_enable_join_without_profile') })] }), _jsx(Switch, { "data-testid": "calls_schedule_call_modal_anon_switch", ...isAnonym })] }), (isSferum ? enableChatHistoryToggleEdu : enableChatHistoryToggle) && !isGroupOwner && (_jsx(Div, { mode: "vertical", spacing: 12, paddingTop: 0, paddingBottom: 0, children: _jsx(SimpleCell, { after: _jsx(Switch, { "data-testid": "calls_schedule_call_modal_chat_history_switch", ...showChatHistory }), subtitle: getLang('calls_show_chat_history_description'), children: getLang('calls_show_chat_history') }) })), _jsxs("div", { className: cn('ModalScheduleCall__calendar__row', 'ModalScheduleCall__calendar__row--2-cols'), children: [_jsx("div", { "data-testid": "calls_schedule_call_modal_mic_label", children: getLang('calls_microphones') }), _jsx(SelectLikeDropdown, { "data-testid": "calls_schedule_call_modal_mic_select", selectedId: micPermission.value, options: micPermission.options, onChange: micPermission.onChange })] }), _jsxs("div", { className: cn('ModalScheduleCall__calendar__row', 'ModalScheduleCall__calendar__row--2-cols'), children: [_jsx("div", { "data-testid": "calls_schedule_call_modal_cameras_label", children: getLang('calls_cameras') }), _jsx(SelectLikeDropdown, { "data-testid": "calls_schedule_call_modal_cameras_select", selectedId: videoPermission.value, options: videoPermission.options, onChange: videoPermission.onChange })] }), _jsxs("label", { className: cn('ModalScheduleCall__calendar__row', 'ModalScheduleCall__calendar__row--2-cols', 'ModalScheduleCall__switch-panel'), children: [_jsx("div", { "data-testid": "calls_schedule_call_modal_screen_sharing_label", children: getLang('calls_screen_sharing') }), _jsx(Switch, { "data-testid": "calls_schedule_call_modal_screen_sharing_switch", ...isScreensharing })] }), _jsxs("label", { className: cn('ModalScheduleCall__calendar__row', 'ModalScheduleCall__calendar__row--2-cols', 'ModalScheduleCall__switch-panel'), children: [_jsxs("div", { children: [_jsx("div", { "data-testid": "calls_schedule_call_modal_reactions_label", children: getLang('calls_reactions') }), _jsx("div", { className: "ModalScheduleCall__text--muted ModalScheduleCall__setting-description", children: getLang('calls_reactions_desc') })] }), _jsx(Switch, { "data-testid": "calls_schedule_call_modal_reactions_switch", ...isReactions })] }), isWatchTogetherEnabled && (_jsxs("label", { className: cn('ModalScheduleCall__calendar__row', 'ModalScheduleCall__calendar__row--2-cols', 'ModalScheduleCall__switch-panel'), children: [_jsxs("div", { children: [_jsx("div", { "data-testid": "calls_schedule_call_modal_movie_sharing_label", children: getLang('calls_watch_together_movie_settings') }), _jsx("div", { className: "ModalScheduleCall__text--muted ModalScheduleCall__setting-description", children: getLang('calls_watch_together_movie_settings_description') })] }), _jsx(Switch, { "data-testid": "calls_schedule_call_modal_movie_sharing_switch", ...watchTogether })] }))] }) })] }));
};
//# sourceMappingURL=ModalScheduleCall.js.map