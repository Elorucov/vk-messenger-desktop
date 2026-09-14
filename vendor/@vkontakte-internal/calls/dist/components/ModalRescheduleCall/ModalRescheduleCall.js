import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":13}],"label":["global",{"className":1}]} */
import { useEffect } from 'react';
import { CallsModal } from '../../components/CallsModal';
import { useLang } from '../../hooks/useLang';
import { BroadcastPlanning, DatePicker, DatePickerRruleEnd, EMediaPermission, mapRecurrenceRule, modifyParamsWithBroadcast, useBroadcastPlanning, useDateTimeValues, useRepeatCallOptions, useRRuleEndValue, useOptions, useSelectTimezonesScrollOnOpen, useTimezones, useUserOptions, } from '../ModalScheduleCall';
import { classNames as cn } from '@vkontakte/vkjs';
import { useFormCheckboxesValues } from '../../hooks/useFormCheckboxesValues';
import { useFormSelectValue } from '../../hooks/useFormSelectValue';
import { CallChip } from '../CallChip/CallChip';
import { ERepeatCallVariant, ECalendar, ETranslationPlannedTimeVariant, useVkmeContext, } from '@vkontakte-internal/calls-core';
import { Button, CustomSelect, Switch } from '@vkontakte-internal/vkcom-kit';
import { SelectLikeDropdown } from '../SelectLikeDropdown/SelectLikeDropdown';
export const ModalRescheduleCall = ({ onClose, onSubmit, call, loading, userSelectOptions, myUserId, isSferum = false, toggles, }) => {
    const { getLang } = useLang();
    const { isVkme } = useVkmeContext();
    const { durationOptions, calendarOptions } = useOptions(!isSferum);
    useSelectTimezonesScrollOnOpen({
        selector: 'ModalScheduleCall__select--timezone',
    });
    /** нужны для workflow модалок, которые идут следом */
    const userOptions = useUserOptions({ options: userSelectOptions, myUserId });
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
    const { translationPreview, translationCheckbox, translationDescription, setTranslationDescription, translationTimeVariant, translationPrivacyView, translationPrivacyComment, isBroadcastLoading, startTimeUnix, hasData: hasBroadcastData, openDatePicker, } = broadcast;
    /** дата и время начала и окончания звонка */
    const datetime = useDateTimeValues({ call });
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
    /** таймзона */
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
        initialValue: mapRecurrenceRule(call?.schedule?.recurrence_rule),
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
    const handleOnSubmit = () => {
        /** имя пользователя */
        const displayName = userOptions.select.value !== myUserId ? userOptions.displayName : undefined;
        const params = {
            groupId: call.caller_id,
            // rest
            name: call.name,
            muteAudio: call.mute_audio || EMediaPermission.Allowed,
            muteVideo: call.mute_video || EMediaPermission.Allowed,
            muteScreensharing: call.mute_screen_sharing || EMediaPermission.Allowed,
            onlyAuthUsers: call.only_auth_users ? 1 : 0,
            duration: datetime.durationMs,
            start: datetime.startTimeMs,
            waitingHall: call.waiting_hall ? 1 : 0,
            calendar: calendar.value,
            displayName,
            timezone: timezones.value,
            rrule: repeatCall.value,
            skipNotification: isNotification.checked ? 0 : 1,
            feedback: call.feedback ? 1 : 0,
            onlyAdminCanShareMovie: call.only_admin_can_share_movie ? 1 : 0,
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
        if (repeatCall.value !== ERepeatCallVariant.Never) {
            if (rruleEndCtx.value) {
                params.recurrenceUntilTime = rruleEndCtx.value.valueOf();
            }
        }
        onSubmit(params, broadcastParams);
    };
    const rootScrollSelector = '.CallsModalRescheduleCall';
    const minEndDate = new Date(datetime.dateStartCtx.date).setHours(datetime.dateStartCtx.time.hours, datetime.dateStartCtx.time.minutes);
    return (_jsx(CallsModal, { className: "ModalScheduleCall", title: getLang('calls_reschedule_title'), onClose: onClose, hasScroll: !isVkme, dataTestId: "calls_reschedule_call_modal_root", actionButtons: _jsxs(_Fragment, { children: [_jsx(Button, { "data-testid": "calls_reschedule_call_modal_footer_button_cancel", size: "m", mode: "tertiary", onClick: onClose, disabled: !!loading || isBroadcastLoading, children: getLang('calls_cancel') }), _jsx(Button, { "data-testid": "calls_reschedule_call_modal_footer_button_submit", size: "m", mode: "primary", onClick: handleOnSubmit, disabled: !!loading || isBroadcastLoading, children: getLang('calls_reschedule_btn') })] }), disableBodyScroll: true, children: _jsxs("div", { className: "ModalScheduleCall__calendar", children: [_jsx("div", { "data-testid": "calls_reschedule_call_modal_disclamer", className: "CallsModalRescheduleCall__disclaimer", children: getLang('calls_reschedule_disclaimer') }), _jsx("div", { className: cn('ModalScheduleCall__calendar__divider', 'ModalScheduleCall__calendar__divider--full-width') }), _jsxs("div", { className: cn('ModalScheduleCall__calendar__row', 'ModalScheduleCall__calendar__row--2-cols'), children: [_jsx("span", { "data-testid": "calls_reschedule_call_modal_start_time_label", children: getLang('calls_start_time') }), _jsx("span", { "data-testid": "calls_reschedule_call_modal_start_time_picker", children: _jsx(DatePicker, { ...datetime.dateStartCtx, minDate: datetime.dateStartCtx.date, maxDate: datetime.dateEndCtx.date, disableTimeSelect: datetime.isAllDay }) })] }), _jsx("div", { className: cn('ModalScheduleCall__calendar__row', 'ModalScheduleCall__calendar__row--duration'), children: durationOptions.map((option) => (_jsx(CallChip, { "data-testid": `calls_reschedule_call_modal_duration_${option.value}`, value: option, onClick: datetime.handleChangeDuration, selected: datetime.duration === option.value, children: option.label }, option.value))) }), _jsxs("div", { className: cn('ModalScheduleCall__calendar__row', 'ModalScheduleCall__calendar__row--2-cols'), children: [_jsx("span", { "data-testid": "calls_reschedule_call_modal_finish_time_label", children: getLang('calls_end') }), _jsx("span", { "data-testid": "calls_reschedule_call_modal_finish_time_picker", children: _jsx(DatePicker, { ...datetime.dateEndCtx, minDate: datetime.dateStartCtx.date, maxDate: datetime.dateEndCtx.date, disabled: datetime.isAllDay }) })] }), _jsxs("div", { className: cn('ModalScheduleCall__calendar__row', 'ModalScheduleCall__calendar__row--2-cols', 'ModalScheduleCall__timezone'), children: [_jsx("span", { "data-testid": "calls_reschedule_call_modal_timezone_label", children: getLang('calls_timezone') }), _jsx(CustomSelect, { "data-testid": "calls_reschedule_call_modal_timezone_select", align: "right", selectType: "accent", options: timezones.options, value: timezones.value, onChange: (_, newValue) => {
                                if (newValue !== null)
                                    timezones.onChange({ value: newValue });
                            }, searchable: true })] }), _jsx("div", { className: cn('ModalScheduleCall__calendar__divider', 'ModalScheduleCall__calendar__divider--full-width') }), _jsxs("div", { className: cn('ModalScheduleCall__calendar__row', 'ModalScheduleCall__calendar__row--2-cols', 'ModalScheduleCall__calls-repeat'), children: [_jsx("div", { "data-testid": "calls_reschedule_call_modal_repeat_label", children: getLang('calls_repeat') }), _jsx(SelectLikeDropdown, { "data-testid": "calls_reschedule_call_modal_repeat_select", selectedId: repeatCall.value, options: repeatCall.options, onChange: repeatCall.onChange })] }), repeatCall.value !== ERepeatCallVariant.Never && (_jsxs("div", { className: cn('ModalScheduleCall__calendar__row', 'ModalScheduleCall__calendar__row--2-cols'), children: [_jsx("span", { "data-testid": "calls_reschedule_call_modal_end_repeat_label", children: getLang('calls_end_of_rrule') }), _jsxs("div", { className: "ModalScheduleCall__select-primary__wrap", children: [_jsx(DatePickerRruleEnd, { date: rruleEndCtx.date, time: rruleEndCtx.time, handleChangeDatePicker: rruleEndCtx.handleChangeDatePicker, placeholder: rruleEndCtx.placeholder, refDropdownTrigger: rruleEndCtx.refDropdownTrigger, minDate: new Date(minEndDate), rootScrollSelector: rootScrollSelector }), _jsx(SelectLikeDropdown, { "data-testid": "calls_reschedule_call_modal_end_repeat_select", selectedId: rruleEndCtx.selectProps.value, options: rruleEndCtx.selectProps.options, onChange: rruleEndCtx.selectProps.onChange })] })] })), _jsxs("div", { className: cn('ModalScheduleCall__calendar__row', 'ModalScheduleCall__calendar__row--2-cols'), children: [_jsx("span", { "data-testid": "calls_reschedule_call_modal_add_to_calendar_label", children: getLang('calls_add_to_calendar') }), _jsx(SelectLikeDropdown, { "data-testid": "calls_reschedule_call_modal_end_repeat_select", selectedId: calendar.value, options: calendar.options, onChange: calendar.onChange })] }), _jsxs("label", { className: cn('ModalScheduleCall__calendar__row', 'ModalScheduleCall__calendar__row--2-cols', 'ModalScheduleCall__switch-panel'), children: [_jsxs("div", { children: [_jsx("div", { "data-testid": "calls_reschedule_call_modal_remind_label", children: getLang('calls_remind') }), _jsx("div", { className: "ModalScheduleCall__text--muted ModalScheduleCall__setting-description", children: getLang('calls_remind_desc') })] }), _jsx(Switch, { "data-testid": "calls_reschedule_call_modal_remind_select", ...isNotification })] }), _jsx(BroadcastPlanning, { call: call, isError: repeatCall.value !== ERepeatCallVariant.Never, translationTimeVariant: translationTimeVariant, translationPrivacyView: translationPrivacyView, translationPrivacyComment: translationPrivacyComment, translationPreview: translationPreview, translationCheckbox: translationCheckbox, translationDescription: translationDescription, setTranslationDescription: setTranslationDescription, translationDateStartCtx: datetime.translationDateStartCtx, dateStartCtx: datetime.dateStartCtx, loading: isBroadcastLoading, hasData: hasBroadcastData, openDatePickerByDefault: openDatePicker, isSferum: isSferum, enableBroadcastCommentsSetting: toggles.enableBroadcastCommentsSetting })] }) }));
};
//# sourceMappingURL=ModalRescheduleCall.js.map