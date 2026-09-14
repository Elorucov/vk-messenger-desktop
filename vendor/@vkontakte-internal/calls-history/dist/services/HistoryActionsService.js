import { __decorate, __metadata } from "tslib";
import { CallStatSource, download, isGroupCallByVkId, peerIdToVkId, } from '@vkontakte-internal/calls-core';
import { scope } from '@vkontakte-internal/di';
import { CallsApi } from '@vkontakte-internal/plugins';
import { CallEventType } from '@vkontakte-internal/vk-analytics-events';
import { CallHistoryAnalytics } from '../analytics';
import { getHistoryCallPeerId, getHistoryItemOwner } from '../helpers/historyScreen';
import { handlePromiseError } from '../helpers/logger';
import { ActiveModalType, HistoryCallMenuActionsEnum } from '../types';
import { BridgeService } from './BridgeService';
import { ModalControlService } from './ModalControlService';
import { NavigationService } from './NavigationService';
import { ProfileService } from './ProfileService';
/**
 * Сервис для обработки действий пользователя в истории звонков.
 * Отвечает за:
 * - Совершение аудио и видео звонков
 * - Переход к сообщениям
 * - Скачивание списка участников звонка
 * - Удаление звонков из истории
 * - Обработку групповых звонков и ссылок для присоединения
 */
let HistoryActionsService = class HistoryActionsService {
    constructor(bridgeService, profileService, navigationService, analyticsService, callsApi, modalService) {
        this.bridgeService = bridgeService;
        this.profileService = profileService;
        this.navigationService = navigationService;
        this.analyticsService = analyticsService;
        this.callsApi = callsApi;
        this.modalService = modalService;
        this.handleHistoryAction = async (call, type, index, ownerId = 0) => {
            switch (type) {
                case HistoryCallMenuActionsEnum.AUDIO:
                case HistoryCallMenuActionsEnum.VIDEO:
                    await this.handleCallAction(call, type === HistoryCallMenuActionsEnum.VIDEO, ownerId);
                    break;
                case HistoryCallMenuActionsEnum.MESSAGE:
                    this.handleMessageAction(call);
                    break;
                case HistoryCallMenuActionsEnum.PARTICIPANTS:
                    await this.handleParticipantsAction(call);
                    break;
                case HistoryCallMenuActionsEnum.DELETE:
                    await this.handleDeleteAction(index, ownerId);
                    break;
            }
        };
    }
    async handleCallAction(call, isWithVideo, ownerId) {
        if (this.bridgeService.bridge.isInActiveCall) {
            return;
        }
        const peerId = getHistoryCallPeerId(call);
        const vkId = peerIdToVkId(peerId);
        try {
            if (isGroupCallByVkId(vkId)) {
                await this.handleGroupCall(call, isWithVideo, peerId, ownerId);
            }
            else {
                this.bridgeService.bridge.call({
                    vkId,
                    isWithVideo,
                    entryPoint: CallStatSource.HISTORY,
                    groupId: ownerId,
                });
            }
        }
        catch (error) {
            handlePromiseError(error);
        }
    }
    async handleGroupCall(call, isWithVideo, peerId, ownerId) {
        const { chat } = getHistoryItemOwner(call, this.profileService.profiles);
        const joinLink = call.join_link ?? chat?.call_in_progress?.join_link;
        if (joinLink) {
            await this.joinCallWithLink(joinLink, isWithVideo, ownerId);
        }
        else {
            await this.bridgeService.bridge.startGroupCall(peerIdToVkId(peerId), undefined, null, isWithVideo, CallStatSource.HISTORY);
        }
    }
    async joinCallWithLink(joinLink, isWithVideo, ownerId) {
        await this.bridgeService.bridge.joinCallByLink({
            joinLink,
            isWithVideo,
            entryPoint: CallStatSource.HISTORY,
            groupId: ownerId,
        });
    }
    handleMessageAction(call) {
        const peerId = getHistoryCallPeerId(call);
        this.navigationService.navigateToConvo(peerIdToVkId(peerId));
    }
    async handleParticipantsAction(call) {
        if (!call.call_id) {
            return;
        }
        const peerId = getHistoryCallPeerId(call);
        try {
            const { csv } = await this.callsApi.getCallJoinHistory({ call_id: call.call_id });
            const blob = new Blob([
                new Uint8Array([0xef, 0xbb, 0xbf]), // UTF-8 BOM. Иначе эксель не понимает и открывает криво
                csv,
            ], { type: 'text/csv;' });
            const url = URL.createObjectURL(blob);
            download(url, `call_${call.call_id}_participants.csv`, true);
            this.analyticsService.send(CallEventType.DOWNLOAD_PARTICIPANTS_LIST_CLICK, {
                peer_id: peerId,
            });
        }
        catch (error) {
            handlePromiseError(error);
        }
    }
    async handleDeleteAction(index, ownerId) {
        this.modalService.openModal({
            type: ActiveModalType.DELETE_CALL,
            data: {
                index,
                ownerId,
            },
        });
    }
};
HistoryActionsService = __decorate([
    scope.container(),
    __metadata("design:paramtypes", [BridgeService,
        ProfileService,
        NavigationService,
        CallHistoryAnalytics,
        CallsApi,
        ModalControlService])
], HistoryActionsService);
export { HistoryActionsService };
//# sourceMappingURL=HistoryActionsService.js.map