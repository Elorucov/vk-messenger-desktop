import { __decorate } from "tslib";
import { scope } from '@vkontakte-internal/di';
let BridgeService = class BridgeService {
};
BridgeService = __decorate([
    scope.container()
], BridgeService);
export { BridgeService };
export const createBridgeServiceImplementation = (bridge) => {
    let BridgeServiceImpl = class BridgeServiceImpl {
        get bridge() {
            return bridge;
        }
    };
    BridgeServiceImpl = __decorate([
        scope.container()
    ], BridgeServiceImpl);
    return BridgeServiceImpl;
};
//# sourceMappingURL=BridgeService.js.map