import { __decorate, __metadata } from "tslib";
import { makeAutoObservable } from 'mobx';
import { createProvider, init, Props, scope } from '@vkontakte-internal/di';
import { ScheduledCallsService, ScheduledCallsType } from '../../../services/ScheduledCallsService';
import { CallOwnersService } from '../../../services/CallOwnersService';
import { RightMenuSpinnerService } from '../../../services/RightMenuSpinnerService';
import { PRIVATE_CALL_OWNER } from '../../../constants';
import { ProfileService } from '../../../services/ProfileService';
import { SnackbarService } from '../../../services/SnackbarService';
import { Langs, VideoApi } from '@vkontakte-internal/plugins';
import { HistoryConfigService } from '../../../services/HistoryConfig';
import { getBroadcastLink, mapCalls } from '../helpers';
import { handlePromiseError } from '../../../helpers/logger';
import { EHistoryScreenPopup, vkIdToPeerId } from '@vkontakte-internal/calls-core';
import { ModalControlService } from '../../../services/ModalControlService';
import { ActiveModalType } from '../../../types';
let ScheduledCallsSectionModel = class ScheduledCallsSectionModel {
    constructor(scheduledCallsService, callOwnersService, rightMenuSpinnerService, profileService, props, snackbarService, langs, videoApi, historyConfigService, modalService) {
        this.scheduledCallsService = scheduledCallsService;
        this.callOwnersService = callOwnersService;
        this.rightMenuSpinnerService = rightMenuSpinnerService;
        this.profileService = profileService;
        this.props = props;
        this.snackbarService = snackbarService;
        this.langs = langs;
        this.videoApi = videoApi;
        this.historyConfigService = historyConfigService;
        this.modalService = modalService;
        this._selectedOwnerId = PRIVATE_CALL_OWNER;
        this._loading = false;
        this.onShareQrCodeClick = (textToEncode, qrFileName) => {
            this.props.current.onShareQrCodeClick?.(textToEncode, qrFileName);
        };
        this.onLinkClick = (event, section, href) => {
            this.props.current.onLinkClick?.(event, section, href);
        };
        this.showText = (text) => {
            this.snackbarService.show({
                message: text,
                duration: 2000,
            });
        };
        this.getBroadcastLink = async (broadcast) => {
            try {
                const videoParams = await this.videoApi.get({ videos: broadcast?.video_id });
                const video = videoParams?.items[0];
                let broadcastId;
                if (!video || !video?.owner_id || !video?.id) {
                    broadcastId = broadcast?.video_id;
                }
                else {
                    broadcastId = `${video?.owner_id}_${video?.id}_${video?.access_key ? video?.access_key : ''}`;
                }
                return getBroadcastLink(broadcastId, this.historyConfigService.config.sferum);
            }
            catch (error) {
                handlePromiseError(error);
                return '';
            }
        };
        this.handleCallDelete = (call) => {
            if (!this.localProfile) {
                return;
            }
            this.modalService.openModal({
                type: ActiveModalType.EDIT_SCHEDULED_CALL,
                data: {
                    popup: EHistoryScreenPopup.DeleteCalendarEvent,
                    meParticipant: this.localProfile,
                    onClose: () => this.modalService.closeModal(),
                    scheduledEditableCall: call,
                    callParticipant: this.profileService.getProfile(vkIdToPeerId(call.caller_id)),
                },
            });
        };
        this.handleCallEdit = (call) => {
            if (!this.localProfile) {
                return;
            }
            this.modalService.openModal({
                type: ActiveModalType.EDIT_SCHEDULED_CALL,
                data: {
                    popup: EHistoryScreenPopup.EditCalendarEvent,
                    meParticipant: this.localProfile,
                    onClose: () => this.modalService.closeModal(),
                    scheduledEditableCall: call,
                    callParticipant: this.profileService.getProfile(vkIdToPeerId(call.caller_id)),
                },
            });
        };
        this.loadMore = async () => {
            this.setLoading(true);
            await this.scheduledCallsService.loadMore();
            this.setLoading(false);
        };
        makeAutoObservable(this);
    }
    get loading() {
        return this._loading;
    }
    setLoading(value) {
        this._loading = value;
    }
    get ownerOptions() {
        return this.callOwnersService.ownerOptions;
    }
    get selectedOwnerId() {
        return this._selectedOwnerId;
    }
    setSelectedOwnerId(value) {
        this._selectedOwnerId = value;
    }
    async [init]() {
        if (this.scheduledCallsService.calls.length === 0) {
            this.setLoading(true);
        }
        await Promise.all([
            this.scheduledCallsService.loadCalls(this.selectedOwnerId),
            this.callOwnersService.fetchGroups(),
            !this.profileService.localProfile && this.profileService.loadLocalProfile(),
        ]);
        this.setLoading(false);
        this.rightMenuSpinnerService.hide();
    }
    async onOwnerChange(ownerId) {
        this.setSelectedOwnerId(ownerId);
        await this.scheduledCallsService.loadCalls(ownerId);
    }
    get isScheduledSection() {
        return this.props.current.section === 'scheduled';
    }
    get localProfile() {
        return this.profileService.localProfile;
    }
    get skeletonHeight() {
        return this.props.current.skeletonHeight ?? 300;
    }
    get allCalls() {
        if (this.isScheduledSection) {
            return mapCalls({
                items: this.scheduledCallsService.getCallsForRange(ScheduledCallsType.Full),
                now: new Date(),
                locale: this.langs.locale,
                getLang: this.langs.getLang,
                groups: this.scheduledCallsService.groups,
            });
        }
        return mapCalls({
            items: this.scheduledCallsService.getCallsForRange(ScheduledCallsType.Preview),
            now: new Date(),
            locale: this.langs.locale,
            getLang: this.langs.getLang,
            groups: this.scheduledCallsService.groups,
        });
    }
    get hasMore() {
        return this.scheduledCallsService.hasMore;
    }
};
ScheduledCallsSectionModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [ScheduledCallsService,
        CallOwnersService,
        RightMenuSpinnerService,
        ProfileService,
        Props,
        SnackbarService,
        Langs,
        VideoApi,
        HistoryConfigService,
        ModalControlService])
], ScheduledCallsSectionModel);
export const { Provider: ScheduledCallsSectionModelProvider, useModel: useScheduledCallsSectionModel } = createProvider(ScheduledCallsSectionModel);
//# sourceMappingURL=ScheduledCallsSectionModel.js.map