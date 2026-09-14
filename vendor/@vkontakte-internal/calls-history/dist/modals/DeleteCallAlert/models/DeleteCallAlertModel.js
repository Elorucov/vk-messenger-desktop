import { __decorate, __metadata } from "tslib";
import { makeAutoObservable } from 'mobx';
import { createProvider, Props, scope } from '@vkontakte-internal/di';
import { shorten } from '@vkontakte-internal/calls-core';
import { ModalControlService } from '../../../services/ModalControlService';
import { CallHistoryAnalytics } from '../../../analytics/CallHistoryAnalytics';
import { CurrentCallsService } from '../../../services/CurrentCallsService';
import { CallHistoryService } from '../../../services/CallHistoryService';
import { HistoryConfigService } from '../../../services/HistoryConfig';
import { CallsApi, Langs, MessagesApi } from '@vkontakte-internal/plugins';
import { getHistoryItemOwner } from '../../../helpers/historyScreen';
import { ProfileService } from '../../../services/ProfileService';
import { CallEventType } from '@vkontakte-internal/vk-analytics-events';
import { handlePromiseError } from '../../../helpers/logger';
let DeleteCallAlertModel = class DeleteCallAlertModel {
    constructor(props, modalService, analyticsService, currentCalls, historyService, profileService, historyConfigService, callsApi, messagesApi, langs) {
        this.props = props;
        this.modalService = modalService;
        this.analyticsService = analyticsService;
        this.currentCalls = currentCalls;
        this.historyService = historyService;
        this.profileService = profileService;
        this.historyConfigService = historyConfigService;
        this.callsApi = callsApi;
        this.messagesApi = messagesApi;
        this.langs = langs;
        this.onClose = () => {
            this.modalService.closeModal();
        };
        this.onDelete = async () => {
            if (this.enableNewHistoryDeletion) {
                this.analyticsService.send(CallEventType.CALL_HISTORY_DELETE_SINGLE, {
                    group_id: this.ownerId,
                });
            }
            const items = this.deleteCall?.type === 'merged' ? this.deleteCall.items : [this.deleteCall];
            const callIds = items?.map((item) => item?.id).filter((id) => id !== undefined) ?? [];
            if (!callIds.length) {
                return;
            }
            if (!this.enableNewHistoryDeletion) {
                const { removeHistoryRecords } = await import(
                /* webpackChunkName: "calls-sdk" */ '@vkontakte/calls-sdk');
                await removeHistoryRecords(callIds);
            }
            else {
                try {
                    if (this.ownerId !== 0) {
                        await this.callsApi.deleteGroupHistoryRecords({
                            group_id: this.ownerId,
                            record_ids: callIds.join(','),
                        });
                    }
                    else {
                        await this.callsApi.deleteHistoryRecords({
                            record_ids: callIds.join(','),
                        });
                    }
                }
                catch (error) {
                    handlePromiseError(error);
                }
            }
            if (this.callIndex !== -1) {
                this.historyService.removeItemByIndex(this.callIndex);
            }
            this.onClose();
        };
        this.onFinishAndDeleteCall = async () => {
            if (this.deleteCall?.id) {
                await this.messagesApi.forceCallFinish({
                    call_id: this.deleteCall.id.toString(),
                });
                this.currentCalls.removeCurrentCallByCallId(this.deleteCall.call_id);
            }
            return this.onDelete();
        };
        makeAutoObservable(this);
    }
    get enableNewHistoryDeletion() {
        return this.historyConfigService.config.enableNewHistoryDeletion;
    }
    get ownerId() {
        return this.props.current.data.ownerId;
    }
    get callIndex() {
        return this.props.current.data.index;
    }
    get deleteCall() {
        if (this.callIndex in this.historyService.items) {
            return this.historyService.items[this.callIndex];
        }
        return null;
    }
    get text() {
        if (!this.deleteCall) {
            return null;
        }
        const { member, chat } = getHistoryItemOwner(this.deleteCall, this.profileService.profiles);
        if (!member && !chat) {
            return null;
        }
        const date = this.deleteCall.finished_at
            ? this.langs.compactDate(new Date(this.deleteCall.finished_at))
            : '';
        if (chat) {
            return this.langs
                .getLang('calls_history_delete_group_call')
                .replace('%name', shorten(chat.title, 50))
                .replace('%date', date);
        }
        if (member) {
            const { is_missed, is_inbound } = this.deleteCall;
            let text = '';
            if (is_missed && is_inbound) {
                text = this.langs.getLang('calls_history_delete_missed_call');
            }
            else if (!is_missed && is_inbound) {
                text = this.langs.getLang('calls_history_delete_inbound_call');
            }
            else if (is_missed && !is_inbound) {
                text = this.langs.getLang('calls_history_delete_declined_call');
            }
            else {
                text = this.langs.getLang('calls_history_delete_outbound_call');
            }
            return text.replace('%name', String(member.nameGen || member.name)).replace('%date', date);
        }
        return null;
    }
};
DeleteCallAlertModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [Props,
        ModalControlService,
        CallHistoryAnalytics,
        CurrentCallsService,
        CallHistoryService,
        ProfileService,
        HistoryConfigService,
        CallsApi,
        MessagesApi,
        Langs])
], DeleteCallAlertModel);
export { DeleteCallAlertModel };
export const { Provider: DeleteCallAlertModelProvider, useModel: useDeleteCallAlertModel } = createProvider(DeleteCallAlertModel);
//# sourceMappingURL=DeleteCallAlertModel.js.map