import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { CallsModal } from '../../components/CallsModal';
import { useLocale } from '@vkontakte-internal/calls-core';
import { dateMonthFormat, timeFormat } from '../../helpers/scheduledCallRow/utils';
import { useLang } from '../../hooks/useLang';
import { shorten } from '../../helpers/helpers';
import { Button } from '@vkontakte-internal/vkcom-kit';
export const ModalDeleteCall = ({ onClose, call, onSubmit, onReschedule, loading, }) => {
    const { getLang } = useLang();
    const { locale } = useLocale();
    const callDate = new Date((call.schedule?.time || 0) * 1000);
    return (_jsx(CallsModal, { className: "CallsModalDeleteCall", onClose: onClose, title: getLang('calls_delete_call'), actionButtons: _jsxs(_Fragment, { children: [_jsx(Button, { size: "m", mode: "secondary", onClick: onReschedule, "data-focus-first": true, children: getLang('calls_reschedule_to_other_time') }), _jsx(Button, { size: "m", mode: "primary", onClick: onSubmit, disabled: !!loading, children: getLang('calls_delete') })] }), children: getLang('calls_delete_call_desc')
            .replace('{name}', shorten(call.name || '', 30))
            .replace('{time}', timeFormat.format(callDate))
            .replace('{datemonth}', dateMonthFormat(callDate, locale)) }));
};
//# sourceMappingURL=ModalDeleteCall.js.map