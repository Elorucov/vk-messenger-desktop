import { __decorate, __metadata } from "tslib";
import { action, computed, makeObservable, observable } from 'mobx';
import { scope } from '@vkontakte-internal/di';
import { APIClient } from '../APIClient';
/**
 * Сервис для управления аутентификационными данными пользователя
 */
let AuthService = class AuthService {
    constructor(apiClient) {
        this.apiClient = apiClient;
        this._userId = null;
        makeObservable(this);
    }
    /**
     * Признак авторизованности
     */
    get isAuthorized() {
        // Наличие пользователя отличного от 0 - признак авторизации
        return !!this.userId;
    }
    /**
     * ID текущего пользователя
     */
    get userId() {
        return this._userId;
    }
    /**
     * ID текущего пользователя или ID анонима
     */
    get userIdOrAnonim() {
        return this.userId ?? 0;
    }
    /**
     * Получить ID текущего пользователя
     * @throws Error если нет ID, будет брошено исключение
     */
    ensureUserId() {
        if (!this.userId) {
            throw new Error('AuthService:not authorized user!');
        }
        return this.userId;
    }
    /**
     * Устанавливает ID текущего пользователя
     */
    setUserId(userId) {
        this._userId = userId;
    }
    /**
     * assert для проверки наличия авторизации
     */
    assertAuthorized() {
        if (!this.isAuthorized) {
            throw new Error('[AuthService] Not authorized');
        }
    }
    /**
     * Возвращает токен web_token
     */
    async fetchWebToken() {
        const { access_token } = await this.apiClient.fetchWebToken();
        return access_token;
    }
};
__decorate([
    observable,
    __metadata("design:type", Object)
], AuthService.prototype, "_userId", void 0);
__decorate([
    computed,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], AuthService.prototype, "isAuthorized", null);
__decorate([
    computed,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], AuthService.prototype, "userId", null);
__decorate([
    computed,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], AuthService.prototype, "userIdOrAnonim", null);
__decorate([
    action,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthService.prototype, "setUserId", null);
AuthService = __decorate([
    scope.global(),
    __metadata("design:paramtypes", [APIClient])
], AuthService);
export { AuthService };
//# sourceMappingURL=AuthService.js.map