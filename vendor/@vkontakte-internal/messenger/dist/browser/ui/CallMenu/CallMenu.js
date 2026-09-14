import React, { useCallback, useMemo } from 'react';
import * as Viewer from '../../../core/model/Viewer';
import { useBrowserEnv, useViewer } from '../../hooks/misc';
import { ActionsMenu, ActionsMenuAction, } from '../../ui/ActionsMenu/ActionsMenu';
import { Icon20PhoneOutline, Icon20VideocamOutline, Icon20LinkCircleOutline, } from '@vkontakte/icons';
import './CallMenu.css';
import { getLogEventLabel } from '../../../data/utils/typeMessagingActionItem';
export const CallMenu = ({ peerId, activeCall, callEntrypoint, ...props }) => {
    const { lang, calls, stats } = useBrowserEnv();
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
                        action_type: 'BUTTON_CALL_APP_2',
                        label: getLogEventLabel(),
                    },
                },
            });
            if (!calls.env.canOpenDeeplinks)
                return;
            if (activeCall?.joinLink) {
                calls.joinCallViaApp(activeCall.joinLink, 'join');
                return;
            }
            if (peerId) {
                calls.callPeerViaApp(peerId, callEntrypoint);
            }
            else {
                calls.startCallViaApp(callEntrypoint);
            }
            return;
        }
        const isWithVideo = action === 'videocall';
        if (isWithVideo) {
            stats.logEvent({
                type: 'type_action',
                type_action: {
                    type: 'type_messaging_action_item',
                    type_messaging_action_item: {
                        action_type: 'BUTTON_VIDEO_CALL',
                        label: getLogEventLabel(),
                    },
                },
            });
        }
        else {
            stats.logEvent({
                type: 'type_action',
                type_action: {
                    type: 'type_messaging_action_item',
                    type_messaging_action_item: {
                        action_type: 'BUTTON_AUDIO_CALL',
                        label: getLogEventLabel(),
                    },
                },
            });
        }
        if (activeCall?.joinLink) {
            calls.joinCall(activeCall.joinLink, 'join', isWithVideo);
            return;
        }
        if (peerId) {
            calls.callPeer(peerId, callEntrypoint, isWithVideo);
        }
        else {
            calls.startCall(callEntrypoint, isWithVideo);
        }
    }, [activeCall, peerId, calls, callEntrypoint, stats]);
    const actionsList = useMemo(() => (React.createElement(React.Fragment, null,
        (peerId || calls?.env.canCreateCall) && (React.createElement(ActionsMenuAction, { title: lang.use('me_convo_action_audiocall'), leftIcon: React.createElement(Icon20PhoneOutline, null), onClick: () => handleActionClick('audiocall'), type: "secondary" })),
        calls?.env.canVideoCall && (React.createElement(ActionsMenuAction, { title: lang.use('me_convo_action_videocall'), leftIcon: React.createElement(Icon20VideocamOutline, null), onClick: () => handleActionClick('videocall'), type: "secondary" })),
        calls?.env.canOpenDeeplinks && !isEdu && (React.createElement(ActionsMenuAction, { title: lang.use('me_convo_action_call_app'), leftIcon: React.createElement(Icon20LinkCircleOutline, null), onClick: () => handleActionClick('open_app'), type: "secondary" })))), [calls, isEdu, lang, handleActionClick, peerId]);
    return (React.createElement(ActionsMenu, { ...props, className: "CallMenu" }, actionsList));
};
//# sourceMappingURL=CallMenu.js.map