import { jsx as _jsx } from "react/jsx-runtime";
import { createWidget } from '@vkontakte-internal/di';
import { observer } from 'mobx-react-lite';
import { useAdminMessagesModel, AdminMessagesModelProvider } from './AdminMessagesModel';
import { AdminMessageGroup } from './components/AdminMessageGroup';
const AdminMessagesView = observer(function AdminMessagesWidget() {
    const model = useAdminMessagesModel();
    const { canShowMessages, isCallCollapsed, messagesToShow } = model;
    return canShowMessages ? (_jsx(AdminMessageGroup, { isStandalone: isCallCollapsed, messages: messagesToShow, onClose: model.handleRemove })) : null;
});
export const AdminMessagesWidget = createWidget(AdminMessagesModelProvider, AdminMessagesView);
//# sourceMappingURL=AdminMessagesWidget.js.map