import { jsx as _jsx } from "react/jsx-runtime";
import { useLang } from '../../../../hooks/useLang';
import { getUserName } from '../../../../helpers/user';
import { useTypedSelector } from '../../../../hooks/useTypedSelector';
import { getMyExternalId } from '../../../../selectors';
import { FeatureNotification } from '../FeatureNotification';
import { articleIcon } from '../icons';
import { observer } from 'mobx-react-lite';
import { AsrStartedNotificationModelProvider, useAsrStartedNotificationModel, } from './AsrStartedNotificationModel';
import { createWidget } from '@vkontakte-internal/di';
import { isSameExternalId } from '@vkontakte-internal/calls-core';
const AsrStartedNotificationView = observer(function AsrStartedNotificationView() {
    const { asrOwnerExternalId, asrOwner } = useAsrStartedNotificationModel();
    const { getLang, langReplace } = useLang();
    const myExternalId = useTypedSelector(getMyExternalId);
    const isMe = isSameExternalId(asrOwnerExternalId, myExternalId);
    let title = '';
    if (isMe) {
        /* Вы запустили расшифровку звонка */
        title = getLang('calls_asr_started_notification_admin');
    }
    else if (asrOwner) {
        /* {username} запустил расшифровку звонка*/
        title = langReplace(getLang('calls_asr_started_notification_user'), {
            userName: getUserName(asrOwner),
        });
    }
    else {
        /* Запущена расшифровка звонка */
        title = getLang('calls_asr_started_notification_common');
    }
    return _jsx(FeatureNotification, { before: articleIcon, header: title });
});
export const AsrStartedNotificationWidget = createWidget(AsrStartedNotificationModelProvider, AsrStartedNotificationView);
//# sourceMappingURL=AsrStartedNotificationWidget.js.map