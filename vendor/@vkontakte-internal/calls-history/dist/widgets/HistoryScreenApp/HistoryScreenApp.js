import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { observer } from 'mobx-react-lite';
import { useVkmeContext } from '@vkontakte-internal/calls-core';
import { useLangs } from '@vkontakte-internal/plugins';
import { useMemo } from 'react';
import { HistoryScreenRouter } from '../HistoryScreenRouter';
import { VkMeContainer } from './components';
import { HistoryScreenErrorBoundary } from '../HistoryScreenErrorBoundary';
import { createWidget } from '@vkontakte-internal/di';
import { HistoryScreenAppModelProvider, useHistoryScreenAppModel } from './models';
import { Snackbar } from '@vkontakte-internal/vkcom-kit';
import { DeleteCallAlert, DeleteCallHistoryAlert, BroadcastHistoryModal, ModalEditCalendarEvent, } from '../../modals';
import { ActiveModalType } from '../../types';
import { changeQuery } from './helpers';
const HistoryScreenAppView = observer(function HistoryScreenAppView() {
    const vm = useHistoryScreenAppModel();
    const langs = useLangs();
    const { isVkme, onNavigateAway, startedSection } = useVkmeContext();
    const currentModal = useMemo(() => {
        const modal = vm.currentModal;
        if (!modal) {
            return null;
        }
        switch (modal.type) {
            case ActiveModalType.DELETE_CALL:
                return _jsx(DeleteCallAlert, { data: modal.data });
            case ActiveModalType.DELETE_ALL_CALLS:
                return _jsx(DeleteCallHistoryAlert, { data: modal.data });
            case ActiveModalType.BROADCASTS:
                return _jsx(BroadcastHistoryModal, { ...modal.data });
            case ActiveModalType.EDIT_SCHEDULED_CALL:
                return _jsx(ModalEditCalendarEvent, { ...modal.data });
            default:
                return null;
        }
    }, [vm.currentModal]);
    const snackbars = (() => {
        return vm.snackbars.map((snackbar) => (_jsx(Snackbar, { onClose: () => vm.hideSnackbar(snackbar.id), duration: snackbar.duration, subtitle: snackbar.title ? snackbar.message : undefined, before: snackbar.icon, children: snackbar.title ? snackbar.title : snackbar.message }, snackbar.id)));
    })();
    return (_jsxs(HistoryScreenErrorBoundary, { getLang: langs.getLang, children: [isVkme && onNavigateAway ? (_jsx(VkMeContainer, { title: langs.getLang('calls_landing_standalone_title'), onClose: onNavigateAway, startedSection: startedSection })) : (_jsx(HistoryScreenRouter, { changeQuery: changeQuery })), currentModal, snackbars] }));
});
export const HistoryScreenApp = createWidget(HistoryScreenAppModelProvider, HistoryScreenAppView);
//# sourceMappingURL=HistoryScreenApp.js.map