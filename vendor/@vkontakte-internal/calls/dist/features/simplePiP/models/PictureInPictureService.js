import { __decorate, __metadata } from "tslib";
import { scope } from '@vkontakte-internal/di';
import { makeAutoObservable } from 'mobx';
import { CallsConfigService } from '../../../services/config';
import { videoOptionsStorage } from '../../../helpers/localStorage';
import { EVideoOptionType } from '@vkontakte-internal/calls-core';
import { isFirefox } from '../constants';
import { StateBridge } from '../../../utils/stateBridge';
import { getIsVoiceRoom } from '../../../selectors';
import { isMiniAppSource } from '../../../helpers/apps';
let PictureInPictureService = class PictureInPictureService {
    constructor(config, stateBridge) {
        this.config = config;
        this.stateBridge = stateBridge;
        this.targetElement = '';
        this._enabledByUser = videoOptionsStorage.queryOption(EVideoOptionType.SIMPLE_PIP_ENABLED_BY_USER);
        this.toggleByUser = (enable) => {
            this._enabledByUser = enable;
            videoOptionsStorage.saveOption(EVideoOptionType.SIMPLE_PIP_ENABLED_BY_USER, enable);
        };
        this._pipIsRunning = false;
        makeAutoObservable(this);
    }
    /**
     * Включен ли PiP через ручку
     */
    get isFeatureEnabled() {
        return this.config.getConfig().enableSimplePiP;
    }
    /**
     * Вкл/выкл ли PiP пользователем в настройках
     */
    get isEnabledByUser() {
        return this._enabledByUser;
    }
    /**
     * Показывает, что PiP в целом можно показывать
     */
    get isEnabled() {
        if (!this.isSupportedInBrowser ||
            getIsVoiceRoom({ isVoiceRoom: this.stateBridge.isVoiceRoom }) ||
            isMiniAppSource(this.stateBridge.entryPoint?.source)) {
            return false;
        }
        // для firefox принудительно всегда включаем, пользователи все равно не заметят разницы
        return this.isFeatureEnabled && (this.isEnabledByUser || isFirefox);
    }
    get isRunning() {
        return this._pipIsRunning;
    }
    toggleRunning(isRunning) {
        this._pipIsRunning = isRunning;
    }
    /**
     * Показывает что PiP можно запустить в браузере
     */
    get isSupportedInBrowser() {
        // Firefox нет PiP API, но в целом сам PiP есть. В Опере для vk.com пип выключен.
        // Проверяем что это ff или же браузер, который поддерживает апи, но не выключил его для нас
        return (!isFirefox && Boolean(document.pictureInPictureEnabled)) || isFirefox;
    }
    /**
     * Показывает поддержку браузером PiP апи, чисто кейс для Firefox, запустить через юзера можно, а программно управлять нельзя
     */
    get isSupportApi() {
        return !isFirefox;
    }
};
PictureInPictureService = __decorate([
    scope.global(),
    __metadata("design:paramtypes", [CallsConfigService,
        StateBridge])
], PictureInPictureService);
export { PictureInPictureService };
//# sourceMappingURL=PictureInPictureService.js.map