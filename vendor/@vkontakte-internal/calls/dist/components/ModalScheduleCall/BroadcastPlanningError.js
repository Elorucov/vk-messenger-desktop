import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":1}]} */
import { StatusBanner } from '@vkontakte-internal/vkcom-kit';
import { useLang } from '../../hooks/useLang';
import { ECreateBroadcastErrors } from './constants';
export const BroadcastPlanningError = ({ errorType }) => {
    const { getLang } = useLang();
    switch (errorType) {
        case ECreateBroadcastErrors.CREATE: {
            return _jsx(StatusBanner, { before: null, header: getLang('calls_translation_planned_unavailable_warning') });
        }
        case ECreateBroadcastErrors.CREATE_NO_DATA: {
            return (_jsx("div", { className: "ModalScheduleCall__createBroadcastError--noData", children: getLang('calls_translation_planned_unavailable_warning') }));
        }
        case ECreateBroadcastErrors.EDIT: {
            return (_jsx(StatusBanner, { before: null, header: getLang('calls_translation_planned_unavailable_warning_editable'), text: getLang('calls_translation_planned_unavailable_warning_editable_subhead'), mode: "negative" }));
        }
        default: {
            return null;
        }
    }
};
//# sourceMappingURL=BroadcastPlanningError.js.map