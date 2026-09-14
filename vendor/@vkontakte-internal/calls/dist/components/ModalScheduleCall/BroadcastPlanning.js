import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":6}],"label":["global",{"className":1}]} */
import { useEffect, useRef } from 'react';
import { Spinner, Switch } from '@vkontakte-internal/vkcom-kit';
import { useLang } from '../../hooks/useLang';
import { classNames as cn } from '@vkontakte/vkjs';
import { BroadcastPlanningData } from './BroadcastPlanningData';
import { BroadcastPlanningError } from './BroadcastPlanningError';
import { getBroadcastError } from './helpers';
/**
 * Контейнер запланированной трансляции
 * Содержит отображение ошибки о невозможности создания трансляции (при ее наличии)
 * Свитч для отображения компонента BroadcastPlanningData с необходимыми полями для создания трансляции
 * Лоадер
 * */
export const BroadcastPlanning = ({ call, isError, translationTimeVariant, translationPrivacyView, translationPrivacyComment, translationPreview, translationCheckbox, translationDescription, setTranslationDescription, translationDateStartCtx, dateStartCtx, loading, hasData, openDatePickerByDefault, isSferum, enableBroadcastCommentsSetting, }) => {
    const container = useRef(null);
    const { getLang } = useLang();
    useEffect(() => {
        if (!call && translationCheckbox.checked && container.current) {
            container.current.scrollIntoView();
        }
    }, [translationCheckbox.checked, call]);
    const isShownError = !loading && isError;
    const isShownCreateSwitch = !isError || hasData;
    const isShownFields = !loading && hasData;
    return (_jsxs("div", { className: "ModalScheduleCall__broadcastPlanningContainer", ref: container, children: [_jsx("div", { className: cn('ModalScheduleCall__calendar__divider', 'ModalScheduleCall__calendar__divider--full-width') }), isShownError && (_jsx("div", { className: cn('ModalScheduleCall__broadcastPlanningErrorContainer', {
                    'ModalScheduleCall__broadcastPlanningErrorContainer--noData': !hasData,
                }), children: _jsx(BroadcastPlanningError, { errorType: getBroadcastError(hasData, call) }) })), _jsxs("div", { className: cn({
                    'ModalScheduleCall__broadcastPlanningContainer--disabled': isError && hasData,
                }), children: [isShownCreateSwitch && (_jsxs("label", { className: cn('ModalScheduleCall__calendar__row', 'ModalScheduleCall__calendar__row--2-cols', 'ModalScheduleCall__switch-panel'), children: [_jsxs("div", { children: [_jsx("div", { "data-testid": "calls_broadcast_label", children: getLang('calls_translation_planned') }), _jsx("div", { className: "ModalScheduleCall__text--muted ModalScheduleCall__setting-description", children: getLang('calls_translation_planned_desc') })] }), _jsx(Switch, { "data-testid": "calls_broadcast_switch", ...translationCheckbox, disabled: isError, checked: translationCheckbox.checked && !isError })] })), loading && (_jsx("div", { className: "ModalScheduleCall__broadcastPlanningContainerSpinner", children: _jsx(Spinner, {}) })), isShownFields && (_jsx(BroadcastPlanningData, { translationTimeVariant: translationTimeVariant, translationPrivacyView: translationPrivacyView, translationPrivacyComment: translationPrivacyComment, translationPreview: translationPreview, translationDescription: translationDescription, setTranslationDescription: setTranslationDescription, translationDateStartCtx: translationDateStartCtx, dateStartCtx: dateStartCtx, isError: isError, openDatePickerByDefault: openDatePickerByDefault, isSferum: isSferum, enableBroadcastCommentsSetting: enableBroadcastCommentsSetting }))] })] }));
};
//# sourceMappingURL=BroadcastPlanning.js.map