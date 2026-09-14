import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"span":["global",{"className":2}],"div":["global",{"className":4}]} */
import { useCallback } from 'react';
import { SimpleCell, Chip, Input, Switch } from '@vkontakte-internal/vkcom-kit';
import { classNames } from '@vkontakte/vkjs';
import { TIMER_INPUT_TYPE } from '@vkontakte-internal/calls-core';
import { useLang } from '../../../../../hooks/useLang';
import styles from './RoomTimerInput.module.css';
const labels = [5, 10, 20, 30, 60];
export const RoomTimerInput = ({ isTimerEnabled, onTimerSwitch, onTimerInput, currentTimer, isCreateModal = false, }) => {
    const { getLang, langReplace } = useLang();
    const handleCurrentTimerChange = useCallback((value, inputType) => {
        const int = parseInt(value);
        if (isNaN(int) || int <= 0) {
            return onTimerInput('', TIMER_INPUT_TYPE.MANUAL);
        }
        if (Number(value) <= 999) {
            onTimerInput(int, inputType);
        }
    }, []);
    const subtitle = (_jsx("span", { className: styles.subtitle, children: isCreateModal
            ? getLang('calls_room_create_modal_timer_description')
            : getLang('calls_room_control_timer_description') }));
    return (_jsxs("div", { className: classNames(styles.root, !isCreateModal && styles.dropdown), children: [_jsx(SimpleCell, { hasActive: false, hasHover: false, Component: "label", "data-testid": "calls_rooms_control_time_restrict", after: _jsx(Switch, { "data-testid": "calls_rooms_control_time_restrict_switch", checked: isTimerEnabled, onChange: onTimerSwitch, id: "RoomControlModal__item-timer" }), subtitle: subtitle, children: getLang('calls_room_control_restrict_work_time') }), _jsx("div", { className: styles.controls, children: isTimerEnabled && (_jsxs(_Fragment, { children: [_jsx("div", { className: styles.input, children: _jsx(Input, { onInput: (event) => handleCurrentTimerChange(event.currentTarget.value, TIMER_INPUT_TYPE.MANUAL), value: currentTimer, placeholder: getLang('calls_room_control_timer_input_placeholder'), type: "number", after: !!currentTimer && _jsx("span", { className: styles.after, children: getLang('calls_min_short') }), "data-testid": "calls_rooms_control_time_restrict_custom" }) }), _jsx("div", { className: styles.timerPresets, children: labels.map((label) => {
                                return (_jsx(Chip, { removable: false, value: label, "data-testid": `calls_rooms_control_time_restrict_label_${label}`, onClick: () => handleCurrentTimerChange(label.toString(), TIMER_INPUT_TYPE.PRESET), children: langReplace(getLang('calls_min', label), { time: label.toString() }) }, label));
                            }) })] })) })] }));
};
//# sourceMappingURL=RoomTimerInput.js.map