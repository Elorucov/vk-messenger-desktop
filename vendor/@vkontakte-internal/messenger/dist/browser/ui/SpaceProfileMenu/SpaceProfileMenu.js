import React, { useCallback, useMemo } from 'react';
import '../../ui/SpaceProfileMenu/SpaceProfileMenu.css';
import * as Space from '../../../core/model/Space';
import { useBrowserEnv, useDispatch } from '../../hooks/misc';
import { Icon20DoorArrowRightOutline, Icon20MessageAddOutline, Icon20More, Icon20NotificationOutline, Icon20NotificationSlashOutline, } from '@vkontakte/icons';
import { ActionsMenu, ActionsMenuAction, ActionsMenuDropdownAction, } from '../../ui/ActionsMenu/ActionsMenu';
import { Dropdown } from '../../ui/Dropdown/Dropdown';
import { ActionCell } from '../../ui/ActionCell/ActionCell';
import { Time } from '../../../core/utils/time';
import { useModal } from '../../hooks/useModal';
import { SpaceCustomNotificationSettings } from '../../ui/SpaceCustomNotificationSettings/SpaceCustomNotificationSettings';
export const SpaceProfileMenu = ({ space, modalGroupId, className, }) => {
    const dispatch = useDispatch();
    const { lang } = useBrowserEnv();
    const notificationModal = useModal(modalGroupId);
    const isEnabledNotifications = !Space.isMuted(space);
    const isSoundEnabled = space.viewerData.notificationSettings.useSound;
    const handleMuteChange = useCallback((setting) => {
        let muteTill;
        switch (setting) {
            case 'mute':
                muteTill = -1;
                break;
            case 'unmute':
                muteTill = 0;
                break;
            default:
                muteTill = Date.now() + setting;
        }
        dispatch({
            type: 'UserChangedSpaceMute',
            spaceId: space.id,
            muteTill,
        });
    }, [dispatch, space.id]);
    const handleInviteToSpace = useCallback(() => { }, []);
    const handleLeaveSpace = useCallback(() => {
        dispatch({
            type: 'UserLeftSpace',
            spaceId: space.id,
        });
    }, [dispatch, space.id]);
    /**
     * Набор всех возможных действий в меню
     */
    const actions = useMemo(() => ({
        // Открыть настройки уведомлений
        openNotificationsSettings: {
            id: 'notification_setting',
            icon: isEnabledNotifications ? (React.createElement(Icon20NotificationOutline, null)) : (React.createElement(Icon20NotificationSlashOutline, null)),
            name: isEnabledNotifications
                ? lang.use('me_notifications_enabled')
                : lang.use('me_notifications_disabled'),
            action: () => {
                if (isEnabledNotifications) {
                    return;
                }
                handleMuteChange('unmute');
            },
            children: isEnabledNotifications
                ? [
                    {
                        id: `notification_setting_hour`,
                        name: lang.use('me_notifications_mute_hours', { num: 1 }),
                        action: () => handleMuteChange(Time.Hour),
                    },
                    {
                        id: `notification_setting_8_hours`,
                        name: lang.use('me_notifications_mute_hours', { num: 8 }),
                        action: () => handleMuteChange(Time.Hour * 8),
                    },
                    {
                        id: `notification_setting_day`,
                        name: lang.use('me_notifications_mute_days', { num: 1 }),
                        action: () => handleMuteChange(Time.Day),
                    },
                    {
                        id: `notification_setting_week`,
                        name: lang.use('me_notifications_mute_weeks', { num: 1 }),
                        action: () => handleMuteChange(Time.Week),
                    },
                    {
                        id: `notification_setting_mute`,
                        name: lang.use('me_notifications_mute_forever'),
                        type: 'danger',
                        action: () => handleMuteChange('mute'),
                    },
                    {
                        id: `notification_setting_sound`,
                        name: isSoundEnabled
                            ? lang.use('me_notifications_sound_off')
                            : lang.use('me_notifications_sound_on'),
                        action: () => {
                            dispatch({
                                type: 'UserChangedSpaceMute',
                                spaceId: space.id,
                                useSound: !isSoundEnabled,
                            });
                        },
                    },
                    {
                        id: `notification_setting_configure`,
                        name: lang.use('me_notifications_configure'),
                        action: () => notificationModal.open(),
                    },
                ]
                : undefined,
        },
        // Пригласить
        inviteToSpace: {
            id: 'invite_to_space',
            icon: React.createElement(Icon20MessageAddOutline, null),
            name: lang.use('me_invite'),
            action: handleInviteToSpace,
        },
        // Покинуть пространство
        leaveSpace: {
            id: 'leave_space',
            icon: React.createElement(Icon20DoorArrowRightOutline, null),
            name: lang.use('me_spaces_join_button_leave_text'),
            action: handleLeaveSpace,
            type: 'danger',
        },
    }), [
        isEnabledNotifications,
        isSoundEnabled,
        dispatch,
        space.id,
        notificationModal,
        lang,
        handleInviteToSpace,
        handleMuteChange,
        handleLeaveSpace,
    ]);
    /**
     * Набор элементов меню в зависимости от условий
     */
    const items = useMemo(() => {
        const computedActions = [];
        /**
         * Пока просто пушим как заглушки, в будущем эти экшены будут условные
         */
        computedActions.push({
            item: actions.openNotificationsSettings,
            common: true,
        });
        computedActions.push({
            item: actions.inviteToSpace,
            common: true,
        });
        if (space.viewerData.isMember) {
            computedActions.push({
                item: actions.leaveSpace,
                common: true,
            });
        }
        /**
         * Выбираем элементы меню, которые должны быть показаны снаружи в форме кнопок, или внутри в форме меню
         * Для этого используем флаг на модели элементов. Отделять просто по индексу (slice'ом, например) нельзя
         * поскольку количество кнопок не статичное. Если было 3 кнопки, но одна недоступна, нужно вывести две.
         */
        return computedActions.reduce((items, action) => {
            action.common
                ? items.buttons.push(action.item)
                : items.menu.push(action.item);
            return items;
        }, { buttons: [], menu: [] });
    }, [actions, space.viewerData.isMember]);
    const renderPanelAction = (item) => {
        const action = (React.createElement(ActionCell, { key: item.id, icon: item.icon, className: "SpaceProfileMenu__action", onClick: item.action }, item.name));
        if (!item.children) {
            return action;
        }
        return (React.createElement(Dropdown, { key: item.id, openType: "click", hideOnClick: true, content: React.createElement(ActionsMenu, null, renderActionsMenu(item.children)), align: "right", position: "bottom", classNames: {
                wrapper: 'SpaceProfileMenu__menu',
                trigger: 'SpaceProfileMenu__trigger',
                contentWrapper: 'SpaceProfileMenu__menuContent',
            } }, action));
    };
    const renderActionsMenu = (items) => {
        return items.map((item) => {
            if (!item.children) {
                return (React.createElement(ActionsMenuAction, { leftIcon: item.icon, rightIcon: item.rightIcon, title: item.name, onClick: item.action, key: item.id, type: item.type, "aria-label": item.name }));
            }
            return (React.createElement(ActionsMenuDropdownAction, { title: item.name, icon: item.icon, key: item.id, "aria-label": item.name }, renderActionsMenu(item.children)));
        });
    };
    return (React.createElement("div", { className: className },
        React.createElement("div", { className: "SpaceProfileMenu__actions" },
            items.buttons.map(renderPanelAction),
            items.menu.length > 0 && (React.createElement(Dropdown, { openType: "click", hideOnClick: true, content: React.createElement(ActionsMenu, null, renderActionsMenu(items.menu)), align: "right", position: "bottom", classNames: {
                    wrapper: 'SpaceProfileMenu__menu',
                    trigger: 'SpaceProfileMenu__trigger',
                    contentWrapper: 'SpaceProfileMenu__menuContent',
                } },
                React.createElement(ActionCell, { icon: React.createElement(Icon20More, null), className: "SpaceProfileMenu__action" }, lang.use('me_convo_profile_actions_more'))))),
        notificationModal.isActive && (React.createElement(SpaceCustomNotificationSettings, { "area-labeledby": "notification_settings_configure", spaceId: space.id, settings: space.viewerData.notificationSettings, onClose: () => notificationModal.close() }))));
};
//# sourceMappingURL=SpaceProfileMenu.js.map