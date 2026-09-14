import { Button, DateInput, FormItem, LocaleProvider, Select, Separator, SimpleCell, Switch, } from '@vkontakte/vkui';
import '../../ui/CustomNotificationSettings/CustomNotificationSettings.css';
import React, { useId, useState } from 'react';
import { ModalInterface } from '../../ui/ModalInterface/ModalInterface';
import { useBrowserEnv } from '../../hooks/misc';
import { Time } from '../../../core/utils/time';
export const CustomNotificationSettings = ({ initialState, onSave, onClose }) => {
    const { lang } = useBrowserEnv();
    const [state, setState] = useState(initialState);
    const selectHtmlId = useId();
    return (React.createElement(ModalInterface, { title: lang.use('me_notifications_modal_title'), onClose: onClose, closeLabel: lang.use('me_close'), backLabel: lang.use('me_back'), contextClass: "MEConfig", withCustomLayout: true, buttons: React.createElement(React.Fragment, null,
            React.createElement(Button, { size: "m", mode: "secondary", onClick: onClose }, lang.use('me_cancel')),
            React.createElement(Button, { size: "m", mode: "primary", onClick: () => onSave(state) }, lang.use('me_save'))) },
        React.createElement("div", { className: "CustomNotificationSettings" },
            React.createElement(SimpleCell, { Component: "label", after: React.createElement(Switch, { checked: state.useSound, onChange: () => setState((prev) => ({ ...prev, useSound: !prev.useSound })) }) }, lang.use('me_notifications_modal_sound_label')),
            React.createElement(Separator, null),
            React.createElement(FormItem, { top: lang.use('me_notifications_modal_mute_period_label'), htmlFor: selectHtmlId },
                React.createElement(Select, { id: selectHtmlId, placeholder: lang.use('me_notifications_mute_placeholder'), value: state.mute?.period, options: [
                        {
                            label: lang.use('me_notifications_mute_hours_short', {
                                num: 1,
                            }),
                            value: '1hour',
                        },
                        {
                            label: lang.use('me_notifications_mute_hours_short', {
                                num: 8,
                            }),
                            value: '8hours',
                        },
                        {
                            label: lang.use('me_notifications_mute_days_short', {
                                num: 1,
                            }),
                            value: '1day',
                        },
                        {
                            label: lang.use('me_notifications_mute_weeks_short', {
                                num: 1,
                            }),
                            value: '1week',
                        },
                        {
                            label: lang.use('me_notifications_mute_forever_short'),
                            value: 'forever',
                        },
                        {
                            label: lang.use('me_notifications_mute_custom'),
                            value: 'custom',
                        },
                    ], onChange: (e) => {
                        switch (e.target.value) {
                            case '1hour':
                            case '8hours':
                            case '1day':
                            case '1week':
                            case 'forever':
                                return setState({
                                    ...state,
                                    mute: {
                                        period: e.target.value,
                                    },
                                });
                            case 'custom':
                                return setState({
                                    ...state,
                                    mute: {
                                        period: 'custom',
                                        until: new Date(Date.now() + Time.Hour),
                                    },
                                });
                            default:
                                throw new Error('Неизвестная опция');
                        }
                    } })),
            state.mute?.period === 'custom' && (React.createElement(FormItem, { top: lang.use('me_notifications_modal_mute_custom_label'), topComponent: "h5" },
                React.createElement(LocaleProvider, { value: lang.locale },
                    React.createElement(DateInput, { enableTime: true, disablePast: true, showNeighboringMonth: true, value: state.mute.until, onChange: (until) => {
                            if (!until) {
                                return;
                            }
                            setState({
                                ...state,
                                mute: {
                                    period: 'custom',
                                    until: until,
                                },
                            });
                        } })))))));
};
//# sourceMappingURL=CustomNotificationSettings.js.map