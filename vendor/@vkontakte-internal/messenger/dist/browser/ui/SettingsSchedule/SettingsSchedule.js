import React, { useEffect } from 'react';
import { FieldGroup } from '../../ui/FieldGroup/FieldGroup';
import { InformationBanner } from '../../ui/InformationBanner/InformationBanner';
import { ScheduleAboutModal } from '../../ui/ScheduleAboutModal/ScheduleAboutModal';
import { useBrowserEnv } from '../../hooks/misc';
import { Button, Checkbox, CustomSelect, FormStatus } from '@vkontakte/vkui';
import { Icon20NotificationSlashOutline } from '@vkontakte/icons';
import { useModal } from '../../hooks/useModal';
import { useSchedule } from '../../ui/SettingsSchedule/useSchedule';
import '../../ui/SettingsSchedule/SettingsSchedule.css';
export const SettingsSchedule = () => {
    const { lang, stats, router } = useBrowserEnv();
    const scheduleAboutModal = useModal();
    const daysTitle = [
        lang.use('me_settings_schedule_monday'),
        lang.use('me_settings_schedule_tuesday'),
        lang.use('me_settings_schedule_wednesday'),
        lang.use('me_settings_schedule_thursday'),
        lang.use('me_settings_schedule_friday'),
        lang.use('me_settings_schedule_saturday'),
        lang.use('me_settings_schedule_sunday'),
    ];
    const { schedule, invalidDays, loading, dirty, options, enableDay, changeTime, saveSchedule, } = useSchedule();
    useEffect(() => {
        return () => {
            stats.logEvent({
                type: 'type_navgo',
                type_navgo: {
                    subtype: 'back',
                    screen: 'im_settings_do_not_disturb',
                    screen_to: router.screenRoute.kind === 'SettingsRoute' ? 'im_settings' : 'im',
                },
            });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return (React.createElement(React.Fragment, null,
        React.createElement(InformationBanner, { type: "primary", title: lang.use('me_settings_schedule_banner_title'), subtitle: lang.use('me_settings_schedule_banner_subtitle'), icon: React.createElement(Icon20NotificationSlashOutline, null), action: React.createElement(Button, { onClick: scheduleAboutModal.open }, lang.use('me_settings_schedule_banner_action')) }),
        React.createElement(FieldGroup, { title: lang.use('me_settings_menu_schedule') },
            React.createElement("div", { className: "SettingsSchedule__container" },
                invalidDays.length > 0 ? (React.createElement(FormStatus, { mode: "error" }, lang.use('me_settings_schedule_error_message'))) : null,
                schedule.map((item, day) => {
                    return (React.createElement("div", { key: day, className: "SettingsSchedule__setting" },
                        React.createElement("div", null,
                            React.createElement(Checkbox, { className: "SettingsSchedule__checkbox", checked: item.enabled, onChange: enableDay(day), hasActive: false, hasHover: false }, daysTitle[day])),
                        item.enabled && (React.createElement("div", { className: "SettingsSchedule__interval" },
                            React.createElement("div", { className: "SettingsSchedule__select" },
                                React.createElement(CustomSelect, { searchable: true, options: options, status: invalidDays.includes(day) ? 'error' : 'default', value: item.start, onChange: changeTime(day, 'start') })),
                            "\u2013",
                            React.createElement("div", { className: "SettingsSchedule__select" },
                                React.createElement(CustomSelect, { searchable: true, options: options, status: invalidDays.includes(day) ? 'error' : 'default', value: item.finish, onChange: changeTime(day, 'finish') }))))));
                })),
            React.createElement("div", { className: "SettingsSchedule__footer" },
                React.createElement(Button, { disabled: !dirty || Boolean(invalidDays.length), loading: loading, onClick: saveSchedule }, lang.use('me_save')))),
        scheduleAboutModal.isActive && (React.createElement(ScheduleAboutModal, { onClose: scheduleAboutModal.close }))));
};
//# sourceMappingURL=SettingsSchedule.js.map