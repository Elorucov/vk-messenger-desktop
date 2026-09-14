import { jsx as _jsx } from "react/jsx-runtime";
import { observer } from 'mobx-react-lite';
import { createWidget } from '@vkontakte-internal/di';
import { useHistoryWidgets } from '../../services/CallsWidgetsProvider';
import { CallRecordsSectionModelProvider, useCallRecordsSectionModel } from './models';
export const CallRecordsSectionView = observer(function CallRecordsSectionView() {
    const { callsRecordsWidget: WidgetComponent } = useHistoryWidgets();
    const { hideLoading } = useCallRecordsSectionModel();
    if (!WidgetComponent) {
        return null;
    }
    return _jsx(WidgetComponent, { onInitDone: hideLoading });
});
export const CallRecordsSection = createWidget(CallRecordsSectionModelProvider, CallRecordsSectionView);
//# sourceMappingURL=CallRecordsSection.js.map