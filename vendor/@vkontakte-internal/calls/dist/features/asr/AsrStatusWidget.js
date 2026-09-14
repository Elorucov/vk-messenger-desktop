import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { createWidget } from '@vkontakte-internal/di';
import { observer } from 'mobx-react-lite';
import { AsrStatus } from './AsrStatus/AsrStatus';
import { DropdownActionSheet } from '@vkontakte-internal/vkcom-kit';
import { useLang } from '../../hooks/useLang';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { getMyExternalId } from '../../selectors';
import { openAsrList } from '../../helpers/url';
import { isSameExternalId } from '@vkontakte-internal/calls-core';
import { getUserShortName } from '../../helpers/user';
import { useOpenHistoryModal } from '../../hooks/useOpenHistoryModal';
import { AsrStatusModelProvider, useAsrStatusModel } from './AsrStatusModel';
import { useConfig } from '../../services/config';
const AsrStatusContainer = observer(function AsrStatusContainer() {
    const { toggleAsrPopup, asrOwner, isMeCanManageAsr, asrState } = useAsrStatusModel();
    const myExternalId = useTypedSelector(getMyExternalId);
    const { getLang } = useLang();
    const { vkme } = useConfig();
    const { openHistoryModal } = useOpenHistoryModal();
    if (!asrState) {
        return null;
    }
    const openAsrListHandler = vkme ? openHistoryModal : openAsrList;
    const actions = (_jsxs(_Fragment, { children: [_jsx(DropdownActionSheet.Item, { onClick: openAsrListHandler, children: getLang('calls_asr_status_go_to_asr_list_action') }), _jsx(DropdownActionSheet.Item, { onClick: toggleAsrPopup, children: getLang('calls_asr_status_stop_action') })] }));
    const name = getUserShortName(asrOwner);
    return (_jsx(AsrStatus, { actions: actions, isCanManage: isMeCanManageAsr, ownerName: name, isMeOwner: isSameExternalId(myExternalId, asrState.externalId) }));
});
export const AsrStatusWidget = createWidget(AsrStatusModelProvider, AsrStatusContainer);
//# sourceMappingURL=AsrStatusWidget.js.map