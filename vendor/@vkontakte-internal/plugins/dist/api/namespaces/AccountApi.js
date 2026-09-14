import { __decorate } from "tslib";
import { ApiNamespace } from '../ApiNamespace';
import { scope } from '@vkontakte-internal/di';
let AccountApi = class AccountApi extends ApiNamespace {
    constructor() {
        super(...arguments);
        this.getProfileNavigationInfo = this.makeMethod('getProfileNavigationInfo');
        this.getContactList = this.makeMethod('getContactList');
        this.getInfo = this.makeMethod('getInfo');
        this.getInfoWithPrefetch = this.makeMethod('getInfo', true);
        this.setInfo = this.makeMethod('setInfo');
        this.getProfileInfo = this.makeMethod('getProfileInfo');
        this.getProfileShortInfo = this.makeMethod('getProfileShortInfo');
        this.getPrivacySettings = this.makeMethod('getPrivacySettings');
        this.getPrivacySettingsWithPrefetch = this.makeMethod('getPrivacySettings', true);
        this.setPrivacy = this.makeMethod('setPrivacy');
        this.saveInfo = this.makeMethod('saveProfileInfo');
        this.deactivate = this.makeMethod('deactivate');
        this.getBalance = this.makeMethod('getBalance');
        this.getBalanceWithPrefetch = this.makeMethod('getBalance', true);
        this.hideHelpHint = this.makeMethod('hideHelpHint');
        this.getHelpHints = this.makeMethod('getHelpHints');
        this.addUniversity = this.makeMethod('addUniversity');
        this.addSchool = this.makeMethod('addSchool');
        this.getHelpHintsWithPrefetch = this.makeMethod('getHelpHints', true);
        this.getBanned = this.makeMethod('getBanned');
        this.getBannedWithPrefetch = this.makeMethod('getBanned', true);
        this.getCounters = this.makeMethod('getCounters');
        this.getCountersWithPrefetch = this.makeMethod('getCounters', true);
        this.ban = this.makeMethod('ban');
        this.unban = this.makeMethod('unban');
        this.getAdsAcceptance = this.makeMethod('getAdsAcceptance');
        this.setAdsAcceptance = this.makeMethod('setAdsAcceptance');
        this.getSilentModeStatus = this.makeMethod('getSilentModeStatus');
        this.getSilentModeStatusWithPrefetch = this.makeMethod('getSilentModeStatus', true);
        this.startSilentMode = this.makeMethod('startSilentMode');
        this.stopSilentMode = this.makeMethod('stopSilentMode');
        this.getProfileDataLegacy = this.makeMethod('getProfileDataLegacy', true);
        this.getProfileType = this.makeMethod('getProfileType', true);
        this.setOnline = this.makeMethod('setOnline');
        this.setOffline = this.makeMethod('setOffline');
        this.getLeftAds = this.makeMethod('getLeftAds');
        this.getProfileMenuData = this.makeMethod('getProfileMenuData', true);
        this.getCommentGroups = this.makeMethod('getCommentGroups', true);
        this.markActualizePhone = this.makeMethod('markActualizePhone');
        this.unmarkActualizePhone = this.makeMethod('unmarkActualizePhone');
    }
    get namespace() {
        return 'account';
    }
};
AccountApi = __decorate([
    scope.global()
], AccountApi);
export { AccountApi };
//# sourceMappingURL=AccountApi.js.map