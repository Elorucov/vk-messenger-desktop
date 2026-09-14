import { __decorate, __metadata } from "tslib";
import { DisabledBannersService } from '../disabledBanners';
import { SubtitlesService } from '../subtitles';
import { ClickHouseEventType, ModalType, OnboardingFeature, } from '@vkontakte-internal/calls-core';
import { CallsConfigService } from '../config';
import { StateBridge } from '../../utils/stateBridge';
import { isBrowserSupported as isVideoVmojiSupported } from '@vkontakte/calls-vmoji';
import { isParticipantAnonym, isParticipantAnonymOrContact } from '../../helpers/participant';
import { hideHelpHint } from '../backend';
import { handlePromiseError } from '../../helpers/logger';
import { destroy, scope } from '@vkontakte-internal/di';
import { fetchHelpHintByFeature } from '../account';
import { CallsSdkService } from '../sdk';
import { makeAutoObservable } from 'mobx';
import { VmojiService } from '../vmoji';
import { ClickHouseService } from '../shared/ClickHouseService';
import { ModalService } from '../modal';
import { createUnsubscribes } from '../../helpers/serviceUnsubscribers';
import { WatchTogetherPermissionService } from '../../features/watchTogether/services/WatchTogetherPermissionService';
let OnboardingService = class OnboardingService {
    constructor(disabledBannersService, subtitlesService, configService, stateBridge, sdkService, vmojiService, clickHouseService, modalService, watchTogetherPermissionService) {
        this.disabledBannersService = disabledBannersService;
        this.subtitlesService = subtitlesService;
        this.configService = configService;
        this.stateBridge = stateBridge;
        this.sdkService = sdkService;
        this.vmojiService = vmojiService;
        this.clickHouseService = clickHouseService;
        this.modalService = modalService;
        this.watchTogetherPermissionService = watchTogetherPermissionService;
        this._helpHintByFeature = {};
        this._featureType = null;
        this._isOnboardingBannerOpen = false;
        this._wasOnboardingBannerOpened = false;
        this.unsubscribers = createUnsubscribes();
        this.currentFeature = (isVimojiCapture) => {
            const me = this.stateBridge.me;
            const { sferum, enableVmoji } = this.configService.getConfig();
            const isSubtitlesFeatureEnabled = this.subtitlesService.isSubtitlesFeatureEnabled;
            // Смотрим на доступность фич в конфдате
            const isWatchTogetherEnabled = !sferum;
            const isReactionsEnabled = false; // Забрать из конфига нужный флаг
            const isVmojiEnabled = isVideoVmojiSupported() && Boolean(enableVmoji) && !sferum && !isParticipantAnonymOrContact(me);
            // Смотрим не запускалась ли фича ранее, или если мы закрыли баннер с онбоардингом по этой фиче ранее
            const watchTogetherIsUsed = !this._helpHintByFeature[OnboardingFeature.WATCH_TOGETHER];
            const reactionsIsUsed = !this._helpHintByFeature[OnboardingFeature.REACTIONS];
            const vmojiIsUsed = !this._helpHintByFeature[OnboardingFeature.VMOJI] || isVimojiCapture;
            const asrIsUsed = !this._helpHintByFeature[OnboardingFeature.ASR] || this.subtitlesService.isEnabled;
            const allFeatures = [
                OnboardingFeature.WATCH_TOGETHER,
                OnboardingFeature.ASR,
                OnboardingFeature.REACTIONS,
                OnboardingFeature.VMOJI,
            ].filter((feature) => this.disabledBannersService.getEnabledOnboarding(feature));
            const availableMap = {
                [OnboardingFeature.WATCH_TOGETHER]: !watchTogetherIsUsed &&
                    isWatchTogetherEnabled &&
                    this.watchTogetherPermissionService.isMeCanManageWatchTogether &&
                    !isParticipantAnonymOrContact(me),
                [OnboardingFeature.ASR]: !asrIsUsed && isSubtitlesFeatureEnabled,
                [OnboardingFeature.REACTIONS]: !reactionsIsUsed && isReactionsEnabled,
                [OnboardingFeature.VMOJI]: !vmojiIsUsed && isVmojiEnabled,
            };
            const firstAvailableFeature = allFeatures.find((feature) => availableMap[feature]);
            return firstAvailableFeature || null;
        };
        this.isFeatureOpen = (type) => {
            return this.isOnboardingBannerOpen && this.featureType === type;
        };
        this.handleRemoteSharedMovieInfo = () => {
            if (this.isOnboardingBannerOpen) {
                if (this.helpHintByFeature[OnboardingFeature.WATCH_TOGETHER]) {
                    if (!isParticipantAnonym(this.stateBridge.me)) {
                        hideHelpHint(OnboardingFeature.WATCH_TOGETHER).catch(handlePromiseError);
                    }
                    this.setUsedFeature(OnboardingFeature.WATCH_TOGETHER);
                }
                this.setOnboardingBannerIsOpen(false);
            }
        };
        this.onOpenWatchTogetherFeature = () => {
            if (!this.watchTogetherPermissionService.isMeCanManageWatchTogether) {
                return;
            }
            if (this.isFeatureOpen(OnboardingFeature.WATCH_TOGETHER)) {
                this.closeOnboardingBanner(this.vmojiService.isCapture);
            }
            this.clickHouseService.sendStats(ClickHouseEventType.CALL_WATCH_TOGETHER_CLICK);
            this.modalService.openModal(ModalType.MOVIE_CHOOSE);
        };
        this.onOpenVmojiFeature = () => {
            if (this.isFeatureOpen(OnboardingFeature.VMOJI)) {
                this.closeOnboardingBanner(this.vmojiService.isCapture);
            }
            this.clickHouseService.sendStats(ClickHouseEventType.CALL_VMOJI_CLICK);
            this.modalService.openModal(ModalType.VMOJI);
        };
        this.onStartSubtitlesFeature = () => {
            if (this.isFeatureOpen(OnboardingFeature.ASR)) {
                this.closeOnboardingBanner(this.vmojiService.isCapture);
            }
            this.sdkService.getSdk().requestAsr(true);
            this.subtitlesService.setSubtitlesEnabled(true);
            this.subtitlesService.clearSubtitles();
            this.clickHouseService.sendStats(ClickHouseEventType.ONLINE_TRANSCRIPTION_STARTED);
        };
        makeAutoObservable(this);
        this.unsubscribers.add(this.sdkService.subscribe('onRemoteSharedMovieInfo', this.handleRemoteSharedMovieInfo));
    }
    [destroy]() {
        this.unsubscribers.clear();
    }
    get featureType() {
        return this._featureType;
    }
    setFeature(feature) {
        this._featureType = feature;
    }
    get isOnboardingBannerOpen() {
        return this._isOnboardingBannerOpen;
    }
    setOnboardingBannerIsOpen(opened) {
        const wasOnboardingBannerOpened = opened || this._wasOnboardingBannerOpened;
        this._isOnboardingBannerOpen = opened;
        this._wasOnboardingBannerOpened = wasOnboardingBannerOpened;
    }
    openOnboardingBanner() {
        this.setOnboardingBannerIsOpen(true);
    }
    closeOnboardingBanner(isVimojiCapture) {
        const isMeAnonym = isParticipantAnonym(this.stateBridge.me);
        const currentFeature = this.currentFeature(isVimojiCapture);
        if (currentFeature && this._helpHintByFeature[currentFeature]) {
            // у анонимов нет состояния хелп хинтов
            if (!isMeAnonym) {
                hideHelpHint(currentFeature).catch(handlePromiseError);
            }
            this.setUsedFeature(currentFeature);
        }
        this.setOnboardingBannerIsOpen(false);
    }
    setUsedFeature(hintId) {
        const updatedHelpHintByFeature = {
            ...this._helpHintByFeature,
        };
        delete updatedHelpHintByFeature[hintId];
        this._helpHintByFeature = updatedHelpHintByFeature;
    }
    get helpHintByFeature() {
        return this._helpHintByFeature;
    }
    setHelpHintByFeature(helpHintByFeature) {
        this._helpHintByFeature = helpHintByFeature;
    }
    setInitialFeature(isVimojiCapture) {
        const currentFeature = this.currentFeature(isVimojiCapture);
        if (!this._wasOnboardingBannerOpened && currentFeature) {
            this.setFeature(currentFeature);
            this.openOnboardingBanner();
        }
    }
    async fetchHelpHintByFeature() {
        const isMeAnonym = isParticipantAnonym(this.stateBridge.me);
        if (!isMeAnonym) {
            try {
                const helpHintByFeature = await fetchHelpHintByFeature();
                this.setHelpHintByFeature(helpHintByFeature);
            }
            catch (error) {
                handlePromiseError(error);
            }
        }
    }
    closeOnboardingBannerIfASROpen(isVimojiCapture) {
        if (this.isFeatureOpen(OnboardingFeature.ASR)) {
            this.closeOnboardingBanner(isVimojiCapture);
        }
    }
    closeOnboardingBannerIfVmojiOpen(isVimojiCapture) {
        if (this.isFeatureOpen(OnboardingFeature.VMOJI)) {
            this.closeOnboardingBanner(isVimojiCapture);
        }
    }
};
OnboardingService = __decorate([
    scope.container(),
    __metadata("design:paramtypes", [DisabledBannersService,
        SubtitlesService,
        CallsConfigService,
        StateBridge,
        CallsSdkService,
        VmojiService,
        ClickHouseService,
        ModalService,
        WatchTogetherPermissionService])
], OnboardingService);
export { OnboardingService };
//# sourceMappingURL=OnboardingService.js.map