import { __decorate, __metadata } from "tslib";
import { jsx as _jsx } from "react/jsx-runtime";
import { makeAutoObservable } from 'mobx';
import { createProvider, Props, scope } from '@vkontakte-internal/di';
import { CallsApi, Langs } from '@vkontakte-internal/plugins';
import { CallHistoryAnalytics } from '../../../analytics';
import { CallEventType } from '@vkontakte-internal/vk-analytics-events';
import { ModalControlService } from '../../../services/ModalControlService';
import { Icon24CheckCircleOutline } from '@vkontakte/icons';
import { getColorClass } from '@vkontakte-internal/vkcom-kit';
import { CallHistoryService } from '../../../services/CallHistoryService';
import { SnackbarService } from '../../../services/SnackbarService';
let DeleteCallHistoryAlertModel = class DeleteCallHistoryAlertModel {
    constructor(props, callsApi, historyAnalytics, modalService, callHistoryService, snackbarService, langs) {
        this.props = props;
        this.callsApi = callsApi;
        this.historyAnalytics = historyAnalytics;
        this.modalService = modalService;
        this.callHistoryService = callHistoryService;
        this.snackbarService = snackbarService;
        this.langs = langs;
        this._loading = false;
        this.onClose = () => {
            this.modalService.closeModal();
        };
        this.fireDeletion = async () => {
            this.setLoading(true);
            this.historyAnalytics.send(CallEventType.CALL_HISTORY_DELETE_ALL, {
                group_id: this.deleteCallsMeta.ownerId,
            });
            if (this.deleteCallsMeta.ownerId === 0) {
                await this.callsApi.clearHistory({});
            }
            else {
                await this.callsApi.clearGroupHistory({
                    group_id: this.deleteCallsMeta.ownerId,
                });
            }
            this.callHistoryService.loadHistory(this.deleteCallsMeta.ownerId, 'all');
            this.setLoading(false);
            this.snackbarService.show({
                message: this.langs.getLang('calls_history_list_delete_snackbar_mass'),
                icon: _jsx(Icon24CheckCircleOutline, { className: getColorClass('color_icon_medium') }),
                duration: 3000, // опционально: автоматически скрыть через 3 секунды
            });
            this.modalService.closeModal();
        };
        makeAutoObservable(this);
    }
    get deleteCallsMeta() {
        return this.props.current.data;
    }
    get loading() {
        return this._loading;
    }
    setLoading(value) {
        this._loading = value;
    }
};
DeleteCallHistoryAlertModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [Props,
        CallsApi,
        CallHistoryAnalytics,
        ModalControlService,
        CallHistoryService,
        SnackbarService,
        Langs])
], DeleteCallHistoryAlertModel);
export const { Provider: DeleteCallHistoryAlertModelProvider, useModel: useDeleteCallHistoryAlertModel } = createProvider(DeleteCallHistoryAlertModel);
//# sourceMappingURL=DeleteCallHistoryModalModel.js.map