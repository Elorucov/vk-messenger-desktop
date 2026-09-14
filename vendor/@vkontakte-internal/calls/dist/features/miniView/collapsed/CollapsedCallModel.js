import { __decorate, __metadata } from "tslib";
import { getDefaultExternalId, isSameExternalId } from '@vkontakte-internal/calls-core';
import { createProvider, destroy, init, scope } from '@vkontakte-internal/di';
import { ParticipantStatus } from '@vkontakte/calls-sdk';
import { makeAutoObservable } from 'mobx';
import { CallService } from '../../../services/call/CallService';
import { DevicesService } from '../../../services/devices/DevicesService';
import { PermissionsService } from '../../../services/permissions';
import { VmojiService } from '../../../services/vmoji';
import { StateBridge } from '../../../utils/stateBridge';
import { targetElementId } from '../../../features/simplePiP/constants';
import { PictureInPictureService } from '../../../features/simplePiP/models/PictureInPictureService';
import { getUserName, getUserShortName } from '../../../helpers/user';
let CollapsedCallModel = class CollapsedCallModel {
    constructor(callService, devicesService, permissionsService, pipService, stateBridge, vmojiService) {
        this.callService = callService;
        this.devicesService = devicesService;
        this.permissionsService = permissionsService;
        this.pipService = pipService;
        this.stateBridge = stateBridge;
        this.vmojiService = vmojiService;
        this.loadVmojiSvg = (externalIds) => {
            void this.vmojiService.loadMultipleSvg(externalIds);
        };
        makeAutoObservable(this);
    }
    get isAudioAllowed() {
        return this.permissionsService.isMediaAllowed('audio', this.stateBridge.localDevice);
    }
    get visibleParticipant() {
        return this.devicesService.visibleParticipant;
    }
    [init]() {
        if (this.pipService.isEnabled) {
            this.pipService.targetElement = targetElementId;
        }
    }
    [destroy]() {
        if (this.pipService.targetElement) {
            this.pipService.targetElement = '';
        }
    }
    get targetElement() {
        return this.pipService.targetElement;
    }
    get conversation() {
        const peerParticipant = this.stateBridge.participants[this.stateBridge.peer];
        return this.callService.isGroupCall
            ? this.stateBridge.callData.conversation
            : peerParticipant
                ? { ...peerParticipant, status: ParticipantStatus.CONNECTED }
                : undefined;
    }
    get visibleParticipantData() {
        const participant = this.visibleParticipant && this.stateBridge.participants[this.visibleParticipant.externalId.id];
        return this.visibleParticipant && participant
            ? {
                participantId: this.visibleParticipant.externalId,
                isMe: isSameExternalId(this.visibleParticipant.externalId, this.stateBridge.externalId),
                photo: participant.photo,
                name: this.callService.isMiniApp ? getUserShortName(participant) : getUserName(participant),
                status: this.visibleParticipant.status,
                isNFT: participant?.is_nft,
            }
            : {
                participantId: getDefaultExternalId(),
                isMe: false,
                photo: this.conversation?.photo || '',
                name: this.conversation?.tab || '',
                status: this.conversation?.status,
            };
    }
};
CollapsedCallModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [CallService,
        DevicesService,
        PermissionsService,
        PictureInPictureService,
        StateBridge,
        VmojiService])
], CollapsedCallModel);
export { CollapsedCallModel };
export const { useModel: useCollapsedCallModel, Provider: CollapsedCallModelProvider } = createProvider(CollapsedCallModel);
//# sourceMappingURL=CollapsedCallModel.js.map