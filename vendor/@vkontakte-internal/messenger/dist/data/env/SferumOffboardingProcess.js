import { nanoid } from 'nanoid';
import { IApi } from '../env/IApi';
import { Time } from '../../core/utils/time';
import { exhaustivenessCheck } from '../../core/utils/misc';
import { noop } from '../../core/utils/misc';
const refetchTime = Time.Hour;
const dynamicBannerThrottlingTime = Time.Hour / 2;
/*
 * Процесс аггрегации баннерами оффбординга
 * Есть два типа баннеров: статичные и динамичные.
 * - статичные появляются всегда, если соответствуют условию появления (см. state)
 * - динамичные тротлятся и вызывается только при совершении действий (ф-я logEvent)
 */
export class SferumOffboardingProcess {
    api;
    router;
    storage;
    logger;
    refetchTimeout;
    trackId;
    storageData;
    constructor(api, router, storage, logger) {
        this.api = api;
        this.router = router;
        this.storage = storage;
        this.logger = logger;
        this.storageData = this.storage.get('edu-offboarding') ?? {
            hash: undefined,
            lastBannerShownAt: undefined,
            banners: {},
            counters: {},
        };
        this.loadBanners();
    }
    loadBanners() {
        this.trackId = IApi.resolveTrackId('messagesEdu.getTransitionOnboardingBanners', nanoid(5));
        void this.api
            .fetch('messagesEdu.getTransitionOnboardingBanners', { version_hash: this.storageData.hash }, { trackId: this.trackId })
            .then((response) => {
            if (response.banners && response.version_hash) {
                this.storageData.hash = response.version_hash;
                this.storageData.banners = buildBannersFromApi(response.banners);
                this.saveInStorage();
            }
        })
            .catch(noop)
            .finally(() => {
            this.trackId = undefined;
            this.refetchTimeout = setTimeout(() => this.loadBanners(), refetchTime);
        });
    }
    showBanner(banner) {
        this.router.push({
            kind: 'SferumMigrateToMaxRoute',
            banner,
        });
    }
    saveInStorage() {
        this.storage.set('edu-offboarding', this.storageData);
    }
    /**
     * Отправка события, триггерящее показ или скрытие баннера
     * Тротлится, @see dynamicBannerThrottlingTime
     */
    logEvent(event) {
        const bannerConfig = this.storageData.banners[event.screen];
        if (!bannerConfig) {
            return;
        }
        const currentCounter = (this.storageData.counters[event.screen] ?? 0) + 1;
        this.storageData.counters[event.screen] = currentCounter;
        switch (event.kind) {
            case 'click':
                this.showBanner(bannerConfig.banner);
                break;
            case 'navigation':
                const currentTime = new Date().getTime();
                const lastBannerShownAt = this.storageData.lastBannerShownAt ?? 0;
                const timeFromLastShown = currentTime - lastBannerShownAt;
                // не прошло время с прошлого показа
                if (timeFromLastShown < dynamicBannerThrottlingTime) {
                    return;
                }
                // не настало время показа баннера
                if (bannerConfig.showRule.showFromDate &&
                    currentTime < bannerConfig.showRule.showFromDate) {
                    return;
                }
                // показывать еще рано, не прошел минимальный период с прошлого показа
                if (bannerConfig.showRule.kind === 'time' &&
                    bannerConfig.showRule.period &&
                    timeFromLastShown < bannerConfig.showRule.period * 1000) {
                    return;
                }
                // каунтер не достиг значения для показа
                if (bannerConfig.showRule.kind === 'count' &&
                    bannerConfig.showRule.count &&
                    currentCounter < bannerConfig.showRule.count) {
                    return;
                }
                this.storageData.lastBannerShownAt = currentTime;
                /**
                 * Делаем сброс каунтера при показе, чтоб всегда знать текущий прогресс
                 */
                this.storageData.counters[event.screen] = 0;
                this.showBanner(bannerConfig.banner);
                break;
            default:
                exhaustivenessCheck(event);
        }
        this.saveInStorage();
    }
    get state() {
        return {
            chats: 'chats' in this.storageData.banners && !this.storageData.counters.chats, // баннер одноразовый, показываем когда каунтер пуст
        };
    }
    /**
     * Освобождение ресурсов
     */
    dispose() {
        clearTimeout(this.refetchTimeout);
        if (this.trackId) {
            this.api.dangerouslyAbort(this.trackId);
        }
    }
}
const buildBannersFromApi = (apiBanners) => {
    return Object.fromEntries(apiBanners.reduce((acc, apiBanner) => {
        switch (apiBanner.show_rule?.screen) {
            case 'chats':
            case 'group_chat':
                acc.push([
                    apiBanner.show_rule.screen,
                    {
                        id: apiBanner.id,
                        showRule: {
                            kind: apiBanner.show_rule.kind,
                            screen: apiBanner.show_rule.screen,
                            count: apiBanner.show_rule.count,
                            period: apiBanner.show_rule.period,
                            showFromDate: apiBanner.show_rule.date_start,
                        },
                        banner: {
                            content: apiBanner.content,
                            entrypoint: apiBanner.show_rule?.screen === 'chats'
                                ? 'sferum_to_max_expended_chatlist'
                                : 'sferum_to_max_expended_chat',
                        },
                    },
                ]);
                break;
            default:
                break;
        }
        return acc;
    }, []));
};
//# sourceMappingURL=SferumOffboardingProcess.js.map