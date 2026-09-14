import { Calendar as VKUICalendar, Button, } from '@vkontakte/vkui';
import { useBrowserEnv } from '../../hooks/misc';
import '../../ui/CalendarModal/CalendarModal.css';
import React, { memo, useId, useState } from 'react';
import { ModalBackdrop } from '../../ui/ModalBackdrop/ModalBackdrop';
import { ModalView } from '../../ui/ModalView/ModalView';
import cx from 'classnames';
import { ModalPanel } from '../../ui/ModalPanel/ModalPanel';
import { useLayoutData } from '../../ui/LayoutDataProvider/LayoutDataProvider';
import { ModalHeader } from '../../ui/ModalHeader/ModalHeader';
import { ModalFooter } from '../../ui/ModalFooter/ModalFooter';
import './CalendarModalNew.css';
export const CalendarModalNew = memo(({ className, enableTime, calcInitialDate, saveButtonText, onReset, onClose, onSave, withoutTimeButton, onChange, disableSave, ...attributes }) => {
    const { lang } = useBrowserEnv();
    const { isMobileLayout } = useLayoutData();
    const [selectedDate, setSelectedDate] = useState(calcInitialDate(Date.now()));
    const modalTitleId = useId();
    const handleChange = (date) => {
        if (!date) {
            return;
        }
        setSelectedDate(date);
        if (onChange) {
            onChange(date);
        }
    };
    return (React.createElement(ModalView, { onEscape: onClose, contextClass: "MEConfig" },
        React.createElement(ModalBackdrop, { onClick: onClose },
            React.createElement(ModalPanel, { className: className, ariaLabelledby: modalTitleId },
                React.createElement("div", { className: cx('CalendarModalNew__wrapper', {
                        'CalendarModalNew__wrapper--mobile': isMobileLayout,
                    }) },
                    React.createElement(ModalHeader, { className: "CalendarModalNew__header", closeLabel: lang.use('me_close'), onClose: onClose, title: lang.use('me_postponed_calendar_header_title'), titleId: modalTitleId }),
                    React.createElement(VKUICalendar, { ...attributes, className: cx('CalendarModalNew', {
                            'CalendarModalNew--enableTime': enableTime,
                            'CalendarModalNew--withoutTimeButton': withoutTimeButton,
                        }), value: selectedDate, onChange: handleChange, showNeighboringMonth: true, enableTime: true, onDoneButtonClick: () => onReset?.(selectedDate), doneButtonText: lang.use('me_calendar_modal_reset'), size: "m" }),
                    React.createElement(ModalFooter, { buttons: React.createElement(React.Fragment, null,
                            React.createElement(Button, { size: "m", mode: "secondary", onClick: onClose }, lang.use('me_calendar_modal_close')),
                            React.createElement(Button, { disabled: !selectedDate || disableSave, size: "m", mode: "primary", onClick: () => onSave?.(selectedDate) }, saveButtonText ?? lang.use('me_calendar_modal_save'))) }))))));
});
//# sourceMappingURL=CalendarModalNew.js.map