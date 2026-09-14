import { __decorate, __metadata } from "tslib";
import { CallsConfigService } from '../config';
import { StateBridge } from '../../utils/stateBridge';
import { ConversationOption, ParticipantStatus } from '@vkontakte/calls-sdk';
import { ClickHouseEventType } from '@vkontakte-internal/calls-core';
import { getUpdatedHistory, SUBTITLES_TTL } from './utils';
import { destroy, scope } from '@vkontakte-internal/di';
import { CallsSdkService } from '../sdk';
import { makeAutoObservable } from 'mobx';
import { ClickHouseService } from '../shared/ClickHouseService';
import { createUnsubscribes } from '../../helpers/serviceUnsubscribers';
/**
 * Класс хранит в себе значение субтитров и распознование речи
 * Флаг работы фичи
 * А также отдаёт информацию о доступности фичи
 */
let SubtitlesService = class SubtitlesService {
    constructor(configService, stateBridge, sdkService, clickHouseService) {
        this.configService = configService;
        this.stateBridge = stateBridge;
        this.sdkService = sdkService;
        this.clickHouseService = clickHouseService;
        this._enabled = false;
        /**
         * Тут хранятся субтитры, разбитые на линии в зависимости от вместимости экрана
         * И с именами
         */
        this._lines = [];
        /** Здесь хранятся субтитры с id пользователя и временными метками  */
        this._history = [];
        this.unsubscribers = createUnsubscribes();
        this.handleLocalStatus = (status) => {
            if (status === ParticipantStatus.CONNECTED) {
                if (this.isEnabled) {
                    void this.sdkService.getSdk().requestAsr(true);
                }
            }
        };
        this.handleAsrTranscription = (externalId, text, timestamp, duration) => {
            this.addSubtitlesTranscription({
                externalId,
                text,
                timestamp,
                duration,
                clientTimestamp: Date.now(),
            });
        };
        // Очищаем субтитры при смене комнаты
        this.handleRoomSwitched = () => {
            this.clearSubtitles();
        };
        makeAutoObservable(this);
        this.unsubscribers.add(this.sdkService.subscribe('onLocalStatus', this.handleLocalStatus), this.sdkService.subscribe('onAsrTranscription', this.handleAsrTranscription), this.sdkService.subscribe('onRoomSwitched', this.handleRoomSwitched));
    }
    [destroy]() {
        this.unsubscribers.clear();
    }
    get isEnabled() {
        return this._enabled;
    }
    /** Вернет строки субтитров для рендера */
    get subtitleLines() {
        return this._lines;
    }
    /**
     * Вернет список субтитров для их обработки внутри виджета
     * Только в виджете можно понять его размер и размер строк
     */
    get asrTranscription() {
        return this._history;
    }
    setSubtitlesEnabled(value) {
        this._enabled = value;
    }
    clearSubtitles() {
        this._history = [];
        this._lines = [];
    }
    /** Субтитры старше SUBTITLES_TTL будут периодически очищаться по таймеру */
    clearOldSubtitles(history) {
        const updatedHistory = history.filter(({ clientTimestamp }) => Date.now() - clientTimestamp < SUBTITLES_TTL);
        if (updatedHistory.length < history.length) {
            this._history = updatedHistory;
        }
    }
    /**
     * Обновляет историю субтитров в стейте с учетом новой реплики
     * @param transcription Новая реплика
     */
    addSubtitlesTranscription(transcription) {
        this._history = getUpdatedHistory(transcription, this.asrTranscription);
    }
    /** После расчета в виджете линии будут сохраняться сюда */
    setSubtitlesLines(subtitleLines) {
        this._lines = subtitleLines;
    }
    toggleSubtitles(clickSource) {
        this.sdkService.getSdk().requestAsr(!this.isEnabled);
        if (this.isEnabled) {
            this.clearSubtitles();
        }
        this.clickHouseService.sendStats(!this.isEnabled
            ? ClickHouseEventType.ONLINE_TRANSCRIPTION_STARTED
            : ClickHouseEventType.ONLINE_TRANSCRIPTION_STOPPED, {
            reason: clickSource || '',
        });
        this.setSubtitlesEnabled(!this.isEnabled);
    }
    /** Включена ли фича из конфдаты и настроек звонка */
    get isSubtitlesFeatureEnabled() {
        const { enableSubtitlesSferum: isSubtitlesFeatureEnabled, sferum } = this.configService.getConfig();
        const conversationOptions = this.stateBridge.conversationOptions;
        const isSubtitlesEnabled = !sferum || (sferum && isSubtitlesFeatureEnabled);
        return Boolean(isSubtitlesEnabled && conversationOptions.includes(ConversationOption.ASR));
    }
};
SubtitlesService = __decorate([
    scope.container(),
    __metadata("design:paramtypes", [CallsConfigService,
        StateBridge,
        CallsSdkService,
        ClickHouseService])
], SubtitlesService);
export { SubtitlesService };
//# sourceMappingURL=SubtitlesService.js.map