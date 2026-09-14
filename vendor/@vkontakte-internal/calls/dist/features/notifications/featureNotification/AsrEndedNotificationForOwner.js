import { jsx as _jsx } from "react/jsx-runtime";
import { useCallback } from 'react';
import { useControlledState } from '../../../components/CallsBanner';
import { openAsrList } from '../../../helpers/url';
import { useIsGroupCall } from '../../../hooks/useIsGroupCall';
import { useLang } from '../../../hooks/useLang';
import { useOpenHistoryModal } from '../../../hooks/useOpenHistoryModal';
import { useConfig } from '../../../services/config';
import { Button } from '@vkontakte-internal/vkcom-kit';
import { FeatureNotification } from './FeatureNotification';
import { clockIcon } from './icons';
export const AsrEndedNotificationForOwner = () => {
    const { vkme } = useConfig();
    const { getLang } = useLang();
    const isGroupCall = useIsGroupCall();
    const { openHistoryModal } = useOpenHistoryModal();
    const [isOpen, toggleBanner] = useControlledState();
    const completeAction = useCallback(() => {
        vkme ? openHistoryModal() : openAsrList();
        toggleBanner(false);
    }, [vkme, toggleBanner]);
    return (_jsx(FeatureNotification, { before: clockIcon, actions: _jsx(Button, { mode: "secondary", appearance: "overlay", onClick: completeAction, children: getLang('calls_asr_ended_notification_link') }), 
        /* Расшифровка звонка обрабатывается и скоро будет доступна */
        /* или */
        /* После обработки расшифровка появится в разделе «Расшифровки звонков» */
        header: isGroupCall ? getLang('calls_asr_ended_notification') : getLang('calls_p2p_asr_hint_for_author'), isOpen: isOpen, onDismiss: toggleBanner }));
};
//# sourceMappingURL=AsrEndedNotificationForOwner.js.map