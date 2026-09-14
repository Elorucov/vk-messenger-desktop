import { jsx as _jsx } from "react/jsx-runtime";
import { isGroupCallByPeer } from '@vkontakte-internal/calls-core';
import { useLang } from '../../../hooks/useLang';
import { useTypedSelector } from '../../../hooks/useTypedSelector';
import { getPeerId } from '../../../selectors';
import { useConfig } from '../../../services/config';
import { FeatureNotification } from './FeatureNotification';
import { clockIcon } from './icons';
export const AsrEndedNotification = () => {
    const { getLang } = useLang();
    const { sferum: isSferum } = useConfig();
    const isGroupCall = isGroupCallByPeer(useTypedSelector(getPeerId));
    let header = isGroupCall && !isSferum
        ? /* Расшифровка звонка обрабатывается и скоро появится в чате звонка */
            getLang('calls_asr_ended_notification_admin')
        : // p2p или Sferum где нет чата для звонка
            /* После обработки расшифровка появится в разделе «Расшифровки звонков» у автора расшифровки */
            getLang('calls_p2p_asr_hint_for_non_author');
    return _jsx(FeatureNotification, { before: clockIcon, header: header });
};
//# sourceMappingURL=AsrEndedNotification.js.map