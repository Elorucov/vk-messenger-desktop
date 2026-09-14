import { jsx as _jsx } from "react/jsx-runtime";
import { useCallback } from 'react';
import { useLang } from '../../../hooks/useLang';
import { getVideoRecordsLink } from '../../../helpers/url';
import { useTypedSelector } from '../../../hooks/useTypedSelector';
import { getTranslationOwnerId } from '../../../selectors';
import { useConfig } from '../../../services/config';
import { Button } from '@vkontakte-internal/vkcom-kit';
import { FeatureNotification } from './FeatureNotification';
import { clockIcon } from './icons';
import { useControlledState } from '../../../components/CallsBanner';
export const RecordEndedNotification = () => {
    const { sferum: isSferum, enableCallsRecords } = useConfig();
    const ownerId = useTypedSelector(getTranslationOwnerId);
    const { getLang } = useLang();
    const [isOpen, toggleBanner] = useControlledState();
    const completeAction = useCallback(() => {
        if (ownerId && window.open) {
            window.open(getVideoRecordsLink(ownerId, enableCallsRecords), '_blank');
        }
        toggleBanner(false);
    }, [ownerId, toggleBanner]);
    return (_jsx(FeatureNotification, { actions: !isSferum && ownerId ? (
        /* Открыть список записей */
        _jsx(Button, { mode: "secondary", appearance: "overlay", onClick: completeAction, children: getLang('calls_open_record_list') })) : undefined, before: clockIcon, 
        /* Запись звонка обрабатывается и скоро будет доступна */
        header: getLang('calls_record_is_processed'), isOpen: isOpen, onDismiss: toggleBanner }));
};
//# sourceMappingURL=RecordEndedNotification.js.map