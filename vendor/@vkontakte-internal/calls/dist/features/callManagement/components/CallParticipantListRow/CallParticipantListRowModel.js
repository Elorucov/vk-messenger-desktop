import { __decorate, __metadata } from "tslib";
import { MuteParticipantMode } from '@vkontakte-internal/calls-core';
import { Props, createProvider, scope } from '@vkontakte-internal/di';
import { makeAutoObservable } from 'mobx';
import { CallsConfigService } from '../../../../services/config';
import { PermissionsService } from '../../../../services/permissions';
let CallParticipantListRowModel = class CallParticipantListRowModel {
    constructor(_props, configService, permissionsService) {
        this._props = _props;
        this.configService = configService;
        this.permissionsService = permissionsService;
        makeAutoObservable(this);
    }
    get props() {
        return this._props.current;
    }
    get externalId() {
        return this.props.device.externalId;
    }
    get roomId() {
        return this.props.device.roomId;
    }
    get hasNewViewOfMuteActions() {
        const { enableNewViewOfMuteActions, enableNewViewOfMuteActionsSferum, sferum: isSferum, } = this.configService.getConfig();
        return isSferum ? enableNewViewOfMuteActionsSferum : enableNewViewOfMuteActions;
    }
    get muteController() {
        const { isCurrentlyOn: isMicrophoneCurrentlyOn, isMediaAllowed: isMicrophoneAllowed, mute: muteMicrophone, } = this.permissionsService.getMuteController(MuteParticipantMode.SINGLE_AUDIO, this.externalId);
        const { isCurrentlyOn: isCameraCurrentlyOn, isMediaAllowed: isCameraAllowed, mute: muteCamera, } = this.permissionsService.getMuteController(MuteParticipantMode.SINGLE_VIDEO, this.externalId);
        return {
            isMicrophoneAllowed,
            isMicrophoneCurrentlyOn,
            muteMicrophone: () => muteMicrophone({ participantExternalId: this.externalId, roomId: this.roomId }),
            isCameraAllowed,
            isCameraCurrentlyOn,
            muteCamera: () => muteCamera({ participantExternalId: this.externalId, roomId: this.roomId }),
        };
    }
};
CallParticipantListRowModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [Props,
        CallsConfigService,
        PermissionsService])
], CallParticipantListRowModel);
export { CallParticipantListRowModel };
export const { Provider, useModel } = createProvider(CallParticipantListRowModel);
//# sourceMappingURL=CallParticipantListRowModel.js.map