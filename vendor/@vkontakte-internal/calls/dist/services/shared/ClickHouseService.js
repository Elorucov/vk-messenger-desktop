import { __decorate, __metadata } from "tslib";
import { makeAutoObservable } from 'mobx';
import { StateBridge } from '../../utils/stateBridge';
import { getSendStatService } from '../../stats/clickHouse';
import { scope } from '@vkontakte-internal/di';
import { CallStatSource, isGroupCallByPeerAndMe, } from '@vkontakte-internal/calls-core';
import { CallsConfigService } from '../config';
let ClickHouseService = class ClickHouseService {
    constructor(stateBridge, configService) {
        this.stateBridge = stateBridge;
        this.configService = configService;
        this.sendStats = (event, data) => {
            return getSendStatService(this.commonData)(event, data);
        };
        makeAutoObservable(this);
    }
    get config() {
        return this.configService.getConfig();
    }
    get commonData() {
        const { me, peer, isVoiceRoom, callData, entryPoint } = this.stateBridge;
        let stats = {
            session_id: callData?.callId,
            peer_id: peer,
            device_id: this.config?.deviceId,
            is_group_call: isGroupCallByPeerAndMe(peer, me),
            is_room: isVoiceRoom,
        };
        if (entryPoint?.source === CallStatSource.MINI_APP) {
            stats.source = CallStatSource.MINI_APP;
            stats.mini_app_id = entryPoint?.miniAppId;
        }
        return stats;
    }
};
ClickHouseService = __decorate([
    scope.container(),
    __metadata("design:paramtypes", [StateBridge,
        CallsConfigService])
], ClickHouseService);
export { ClickHouseService };
//# sourceMappingURL=ClickHouseService.js.map