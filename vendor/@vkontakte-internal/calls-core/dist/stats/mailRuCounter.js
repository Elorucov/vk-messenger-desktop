import { isLocationCallsStandalone } from '../helpers';
export var EMailRuGoals;
(function (EMailRuGoals) {
    EMailRuGoals["StartP2PCall"] = "start_p2p_call";
    EMailRuGoals["StartGroupCall"] = "start_group_call";
    EMailRuGoals["AcceptCall"] = "accept_call";
    EMailRuGoals["JoinCall"] = "join_call";
    EMailRuGoals["ScheduledCall"] = "scheduled_call";
    EMailRuGoals["DownloadAppLend"] = "download_app_lend";
    EMailRuGoals["DownloadAppVkCalls"] = "download_app_vk_calls";
    EMailRuGoals["DownloadAppVkCommon"] = "download_app_vk_common";
    EMailRuGoals["DownloadAppJoinDeeplink"] = "download_app_join_deeplink";
})(EMailRuGoals || (EMailRuGoals = {}));
export var EMailRuProject;
(function (EMailRuProject) {
    /** айди для основного `vk.com` */
    EMailRuProject["VkCom"] = "2579437";
    /** айди для лендоса `calls.vk.com` */
    EMailRuProject["CallsVkCom"] = "3252492";
})(EMailRuProject || (EMailRuProject = {}));
export var EOS;
(function (EOS) {
    EOS["Windows"] = "windows";
    EOS["Linux"] = "linux";
    EOS["Mac"] = "mac";
})(EOS || (EOS = {}));
export var EMOBAPP;
(function (EMOBAPP) {
    EMOBAPP["IOs"] = "ios_mobapp";
    EMOBAPP["Android"] = "android_mobapp";
    EMOBAPP["Rustore"] = "rustore_mobapp";
})(EMOBAPP || (EMOBAPP = {}));
export var E_MOBAPP_QR_MODAL;
(function (E_MOBAPP_QR_MODAL) {
    E_MOBAPP_QR_MODAL["Android"] = "android_qr";
    E_MOBAPP_QR_MODAL["IOs"] = "ios_qr";
    E_MOBAPP_QR_MODAL["Rustore"] = "rustore_qr";
})(E_MOBAPP_QR_MODAL || (E_MOBAPP_QR_MODAL = {}));
export var EAPP;
(function (EAPP) {
    EAPP["VkRooms"] = "vkrooms";
    EAPP["VkRoomsAlias"] = "conf";
})(EAPP || (EAPP = {}));
const customWindow = window;
/** @see https://tracker.my.com/docs/sdk/web/api/#events_tracking */
class MailRuCounter {
    constructor() {
        this.events = [];
    }
    push(goal, params) {
        const counter = customWindow._tmr || this.events;
        const id = isLocationCallsStandalone() ? EMailRuProject.CallsVkCom : EMailRuProject.VkCom;
        const userid = String(customWindow.vk?.id || 0);
        const event = { id, type: 'reachGoal', goal, userid };
        if (params) {
            event.params = params;
        }
        if (goal === EMailRuGoals.JoinCall) {
            const login = customWindow.vk?.id ? 1 : 0;
            event.params = { ...(event.params || {}), login };
        }
        counter.push(event);
    }
}
/** синглтон счетчика `mail.ru` */
export const mailRuCounter = new MailRuCounter();
//# sourceMappingURL=mailRuCounter.js.map