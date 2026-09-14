import { EVideoEffectType, LS_KEYS, LS_SFERUM_KEYS } from '../constants';
import { EVideoOptionType, NoiseCancellationTypes, } from '@vkontakte-internal/calls-core';
import { localStorage } from '@vkontakte/vkjs';
import { isYandex } from '../features/simplePiP/constants';
export var EEffectAppType;
(function (EEffectAppType) {
    EEffectAppType["VkCalls"] = "vkcalls";
    EEffectAppType["Sferum"] = "sferum";
})(EEffectAppType || (EEffectAppType = {}));
/**
 * @private
 *
 * используется для получения нужного словаря ключей для настроек
 * опций видео и эффектов через `localStorage`
 *
 * выставляем при монтировании в `<App />` через хук `useSetEffectsLsAppType`
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class EffectAppType {
    static { this._appType = EEffectAppType.VkCalls; }
    /** получает словарь ключей в зависимости от типа приложения */
    static { this._lsKeysMap = {
        [EEffectAppType.VkCalls]: LS_KEYS,
        [EEffectAppType.Sferum]: LS_SFERUM_KEYS,
    }; }
    static setAppType(type) {
        EffectAppType._appType = type;
    }
    static getAppType() {
        return EffectAppType._appType;
    }
    static getLsKeys() {
        return EffectAppType._lsKeysMap[EffectAppType._appType];
    }
}
/** хелпер для работы с опциями видео из `localStorage` */
export const videoOptionsStorage = {
    queryOption(option) {
        return videoOptionsStorage.getOptions()[option] ?? videoOptionsStorage.getDefaultOptions()[option];
    },
    getOptions() {
        try {
            const keys = EffectAppType.getLsKeys();
            const value = localStorage.getItem(keys.VIDEO_OPTIONS);
            if (typeof value !== 'string') {
                throw new Error('no value stored');
            }
            return JSON.parse(value);
        }
        catch {
            return videoOptionsStorage.getDefaultOptions();
        }
    },
    saveOption(option, value) {
        const next = {
            ...videoOptionsStorage.getOptions(),
            [option]: value,
        };
        const keys = EffectAppType.getLsKeys();
        localStorage.setItem(keys.VIDEO_OPTIONS, JSON.stringify(next));
        return next;
    },
    saveOptions(options) {
        const keys = EffectAppType.getLsKeys();
        localStorage.setItem(keys.VIDEO_OPTIONS, JSON.stringify(options));
        return options;
    },
    /**
     * получаем объект с дефолтными опциями,
     * нужен, если фича флаг выключен глобально
     */
    getDefaultOptions() {
        return {
            [EVideoOptionType.IS_VIDEO_MIRRORED]: true,
            [EVideoOptionType.NOISE_CANCELLATION_MODE]: NoiseCancellationTypes.NEURAL,
            // для яндекса выключаем пип по умолчанию
            [EVideoOptionType.SIMPLE_PIP_ENABLED_BY_USER]: !isYandex,
            [EVideoOptionType.VIDEO_SUSPEND_BANNER_TIMES]: 0,
        };
    },
};
/** хелпер для работы с опциями виртуального фона из `localStorage` */
export const effectStorage = {
    /** получаем текущий выбранный эффект */
    getEffect() {
        const keys = EffectAppType.getLsKeys();
        const value = localStorage.getItem(keys.VIRTUAL_BACKGROUND_EFFECT);
        if (typeof value !== 'string') {
            return {
                id: EVideoEffectType.NONE,
                type: EVideoEffectType.NONE,
            };
        }
        try {
            return JSON.parse(value);
        }
        catch (e) {
            return {
                id: EVideoEffectType.NONE,
                type: EVideoEffectType.NONE,
            };
        }
    },
    /** сохраняем выбранный эффект */
    saveEffect(value) {
        const keys = EffectAppType.getLsKeys();
        localStorage.setItem(keys.VIRTUAL_BACKGROUND_EFFECT, JSON.stringify(value));
    },
    /** получить timestamp, когда эффект был выбран */
    getEffectTs() {
        const keys = EffectAppType.getLsKeys();
        const value = localStorage.getItem(keys.VIRTUAL_BACKGROUND_EFFECT_SELECTED_TS);
        if (typeof value !== 'string') {
            return 0;
        }
        return +value;
    },
    /** сохранить timestamp, когда эффект был выбран */
    saveEffectTs(value) {
        const keys = EffectAppType.getLsKeys();
        localStorage.setItem(keys.VIRTUAL_BACKGROUND_EFFECT_SELECTED_TS, `${value}`);
    },
    /** удаляет timestamp, когда эффект был выбран */
    clearEffectTs() {
        const keys = EffectAppType.getLsKeys();
        localStorage.removeItem(keys.VIRTUAL_BACKGROUND_EFFECT_SELECTED_TS);
    },
};
export const CallChangeNameStorage = {
    getAllOptions() {
        try {
            const value = localStorage.getItem(LS_KEYS.CHANGED_NAME);
            if (typeof value !== 'string') {
                throw new Error('no value stored');
            }
            return JSON.parse(value) || {};
        }
        catch {
            return {};
        }
    },
    getOptions(vkId) {
        const localStorageValue = this.getAllOptions();
        // @ts-expect-error TS2339: TODO CALL-23757 Property 'type' does not exist on type 'Record<number, ICallByChangedName>'.
        if (localStorageValue.type !== undefined) {
            /** Для обратной совместимости со старым способом хранения */
            return localStorageValue;
        }
        return localStorageValue[vkId];
    },
    saveOptions(vkId, options) {
        let localStorageValue = this.getAllOptions();
        // @ts-expect-error TS2339: Property does not exist
        if (localStorageValue.type !== undefined) {
            /** Для обратной совместимости со старым способом хранения */
            localStorageValue = {};
        }
        localStorageValue[vkId] = options;
        localStorage.setItem(LS_KEYS.CHANGED_NAME, JSON.stringify(localStorageValue));
        return options;
    },
};
//# sourceMappingURL=localStorage.js.map