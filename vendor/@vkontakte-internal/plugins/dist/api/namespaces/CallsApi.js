import { __decorate } from "tslib";
import { scope } from '@vkontakte-internal/di';
import { ApiNamespace } from '../ApiNamespace';
let CallsApi = class CallsApi extends ApiNamespace {
    constructor() {
        super(...arguments);
        /**
         * Запрашивает тогглы и прочие настройки для инициализации веб-звонков
         */
        this.getSettings = this.makeMethod('getSettings');
        this.getCallJoinHistory = this.makeMethod('getCallJoinHistory');
        /**
         * Новый метод для запроса превью звонка, поддерживает новую анонимную авторизацию
         */
        this.getCallPreview = this.makeMethod('getCallPreview');
        /**
         * Запрашивает анонимный токен по новому флоу авторизации для анонимов
         */
        this.getAnonymousToken = this.makeMethod('getAnonymousToken');
        /**
         * Получает payload для акта get_anonym_token который нужен для нового флоу авторизации анонимов
         */
        this.getAnonymousAccessTokenPayload = this.makeMethod('getAnonymousAccessTokenPayload');
        this.getCallSettings = this.makeMethod('getCallSettings');
        this.getAsrTranscriptions = this.makeMethod('getAsrTranscriptions');
        this.editAsrTranscription = this.makeMethod('editAsrTranscription');
        this.deleteAsrTranscriptions = this.makeMethod('deleteAsrTranscriptions');
        this.getHistory = this.makeMethod('getHistory');
        this.getGroupHistory = this.makeMethod('getGroupHistory');
        this.getParticipantsByIds = this.makeMethod('getParticipantsByIds');
        this.clearGroupHistory = this.makeMethod('clearGroupHistory');
        this.clearHistory = this.makeMethod('clearHistory');
        this.deleteGroupHistoryRecords = this.makeMethod('deleteGroupHistoryRecords');
        this.deleteHistoryRecords = this.makeMethod('deleteHistoryRecords');
    }
    get namespace() {
        return 'calls';
    }
};
CallsApi = __decorate([
    scope.global()
], CallsApi);
export { CallsApi };
//# sourceMappingURL=CallsApi.js.map