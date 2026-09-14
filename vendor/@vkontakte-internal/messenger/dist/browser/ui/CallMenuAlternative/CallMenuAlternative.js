import React, { useCallback, useMemo } from 'react';
import * as Viewer from '../../../core/model/Viewer';
import { useBrowserEnv, useViewer } from '../../hooks/misc';
import { ActionsMenuAction, ActionsMenuSeparator, } from '../../ui/ActionsMenu/ActionsMenu';
import { 
// Некоторые нужные иконки имееются только в исполнении 24x24 - ужимаются до
// нужных на текущий момент 20x20 дальше по коду.
Icon24LinkedOutline, Icon24CalendarAddOutline, Icon20LogoVkCallsOutline, Icon20LinkCircleOutline, } from '@vkontakte/icons';
import './CallMenuAlternative.css';
import { getLogEventLabel } from '../../../data/utils/typeMessagingActionItem';
/**
 * Альтернативное меню звонка с кнопками "Создать" и "Запланировать".
 * Используется над списком бесед.
 */
export const CallMenuAlternative = ({ activeCall, }) => {
    const { lang, calls, router, stats } = useBrowserEnv();
    const viewer = useViewer();
    const isEdu = Viewer.isEdu(viewer.profileType);
    const handleActionClick = useCallback((action) => {
        if (!calls)
            return;
        if (action === 'open_app') {
            stats.logEvent({
                type: 'type_action',
                type_action: {
                    type: 'type_messaging_action_item',
                    type_messaging_action_item: {
                        action_type: 'BUTTON_CALL_APP',
                        label: getLogEventLabel(),
                    },
                },
            });
            if (!calls.env.canOpenDeeplinks)
                return;
            if (activeCall?.joinLink) {
                calls.joinCallViaApp(activeCall.joinLink, 'join');
            }
            else {
                calls.startCallViaApp('create');
            }
            return;
        }
        if (action === 'schedule') {
            calls.openHistory();
            stats.logEvent({
                type: 'type_action',
                type_action: {
                    type: 'type_messaging_action_item',
                    type_messaging_action_item: {
                        action_type: 'BUTTON_SCHEDULE_MEETING',
                        label: getLogEventLabel(),
                    },
                },
            });
            return;
        }
        stats.logEvent({
            type: 'type_action',
            type_action: {
                type: 'type_messaging_action_item',
                type_messaging_action_item: {
                    action_type: 'BUTTON_CREATE_CALL_LINK',
                    label: getLogEventLabel(),
                },
            },
        });
        if (activeCall?.joinLink) {
            calls.joinCall(activeCall.joinLink, 'join');
        }
        else {
            calls.startCall('create');
        }
    }, [calls, activeCall, stats]);
    const actionsList = useMemo(() => (React.createElement(React.Fragment, null,
        calls?.env.canCreateCall && (React.createElement(ActionsMenuAction, { title: lang.use('me_convo_action_call_create_link'), leftIcon: React.createElement(Icon24LinkedOutline, { width: 20, height: 20 }), onClick: () => handleActionClick('create'), type: "secondary" })),
        calls?.env.canScheduleCall && (React.createElement(ActionsMenuAction, { title: lang.use('me_convo_action_call_schedule_meeting'), leftIcon: React.createElement(Icon24CalendarAddOutline, { width: 20, height: 20 }), onClick: () => handleActionClick('schedule'), type: "secondary" })),
        calls?.env.canNavigateToSeparateSection && (React.createElement(ActionsMenuAction, { title: lang.use('me_convo_action_call_open'), leftIcon: React.createElement(Icon20LogoVkCallsOutline, null), type: "secondary", onClick: () => {
                stats.logEvent({
                    type: 'type_action',
                    type_action: {
                        type: 'type_messaging_action_item',
                        type_messaging_action_item: {
                            action_type: 'BUTTON_TO_CALLS_SECTION',
                            label: getLogEventLabel(),
                        },
                    },
                });
                router.push({ kind: 'VkProxyRoute', pathname: '/calls' });
            } })),
        calls?.env.canOpenDeeplinks && !isEdu && (React.createElement(React.Fragment, null,
            React.createElement(ActionsMenuSeparator, null),
            React.createElement(ActionsMenuAction, { title: lang.use('me_convo_action_call_app'), leftIcon: React.createElement(Icon20LinkCircleOutline, null), onClick: () => handleActionClick('open_app'), type: "secondary" }))))), [calls, isEdu, lang, handleActionClick, stats, router]);
    return actionsList;
};
//# sourceMappingURL=CallMenuAlternative.js.map