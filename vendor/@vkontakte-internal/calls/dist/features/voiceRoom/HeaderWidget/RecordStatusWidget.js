import { jsx as _jsx } from "react/jsx-runtime";
import { Icon20RecordingCircleFill } from '@vkontakte/icons';
import { Button } from '@vkontakte-internal/vkcom-kit';
import { useLang } from '../../../hooks/useLang';
import { createWidget } from '@vkontakte-internal/di';
import { RecordStatusModelProvider, useRecordStatusModel } from './RecordStatusModel';
import { observer } from 'mobx-react-lite';
const RecordStatusView = observer(function RecordStatusView() {
    const { getRecordActionSettings } = useRecordStatusModel();
    const { getLang } = useLang();
    const recordActionSettings = getRecordActionSettings();
    if (!recordActionSettings?.isInProgress) {
        return null;
    }
    return (_jsx(Button, { appearance: "negative", before: _jsx(Icon20RecordingCircleFill, {}), hasActive: recordActionSettings.canBeStopped, hasHover: recordActionSettings.canBeStopped, mode: "secondary", onClick: recordActionSettings.canBeStopped ? recordActionSettings.onToggle : undefined, children: recordActionSettings.canBeStopped
            ? getLang('voicerooms_status_container_stop_record_action')
            : getLang('voicerooms_status_container_recording') }));
});
export const RecordStatusWidget = createWidget(RecordStatusModelProvider, RecordStatusView);
//# sourceMappingURL=RecordStatusWidget.js.map