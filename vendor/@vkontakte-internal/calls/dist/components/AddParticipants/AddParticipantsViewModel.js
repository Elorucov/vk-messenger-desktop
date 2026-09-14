import { __decorate, __metadata } from "tslib";
import { debounce } from '@vkontakte/vkjs';
import { peerIdToVkId } from '@vkontakte-internal/calls-core';
import { createProvider, destroy, init, Props, scope, update } from '@vkontakte-internal/di';
import { Langs } from '@vkontakte-internal/plugins';
import { makeAutoObservable, runInAction } from 'mobx';
import { DEFAULT_HEIGHT as DEFAULT_ITEM_HEIGHT, } from './AddParticipantsItem';
import { isParticipantContact } from '../../helpers/participant';
import { ETabName } from './hooks/useTabs';
import { TabMembersModel } from './models/TabMembersModel';
import { CallsConfigService } from '../../services/config';
import { StateBridge } from '../../utils/stateBridge';
import { CallMembersService } from '../../services/callMembers';
import { isAuthedByGroupId } from '../../helpers/call';
import { isUserPeer } from '@vkontakte-internal/vkjs/lib/im/Helpers';
let AddParticipantsViewModel = class AddParticipantsViewModel {
    constructor(_props, callMembersService, configService, langs, stateBridge, tabMembersModel) {
        this._props = _props;
        this.callMembersService = callMembersService;
        this.configService = configService;
        this.langs = langs;
        this.stateBridge = stateBridge;
        this.tabMembersModel = tabMembersModel;
        this.defaultViewMembersLimit = TabMembersModel.DEFAULT_VIEW_MEMBERS_LIMIT;
        this.isInternalTab = false;
        this.itemHeight = DEFAULT_ITEM_HEIGHT;
        this.offsetTop = 0;
        this.resizeObserver = undefined;
        this.scrollViewRootRef = null;
        this.handleChangeSearchQuery = (event) => {
            this.tabMembersModel.setSearchQuery(event.target.value || '');
        };
        this.handleClickItem = (id) => {
            if (this.isItemSelected(id)) {
                this.handleDeselect(id);
            }
            else if (!this.isItemDisabled(id)) {
                this.handleSelect(id);
            }
        };
        this.handleChangeTab = (id) => {
            if (id === "selected" /* EInternalTabName.Selected */) {
                this.tabMembersModel.setTab(id);
                this.isInternalTab = true;
            }
            else {
                if (id === this.props.tab) {
                    this.tabMembersModel.setTab(id);
                }
                else {
                    this.props.onChangeTab(id);
                }
                this.isInternalTab = false;
            }
        };
        this.isItemDisabled = (peerId) => {
            if (this.callMembersService.isParticipantInCall(peerId)) {
                return true;
            }
            // TODO CALL-21471 REMOVE TEMPORARY CONTACTS
            if (isParticipantContact(peerId)) {
                // used only for debug
                return false;
            }
            const { groupId } = this.stateBridge;
            if (isAuthedByGroupId(groupId)) {
                if (this.callMembersService.isParticipantUnavailableToCallFromGroup(peerId)) {
                    return true;
                }
            }
            else {
                const member = this.getCallMember(peerIdToVkId(peerId));
                if (!member?.canCall) {
                    return true;
                }
            }
            return !isUserPeer(peerIdToVkId(peerId));
        };
        this.isItemSelected = (id) => {
            return this.selectedSet.has(id) || this.callMembersService.isParticipantInCall(id);
        };
        this.setScrollViewRootRef = (element) => {
            this.scrollViewRootRef = element;
            this.handleScrollViewRootChanged();
        };
        makeAutoObservable(this);
        this.tabMembersModel.setDefaultViewMembersLimit(this.defaultViewMembersLimit);
        this.tabMembersModel.setSelected(this.props.selected);
        this.tabMembersModel.setTab(this.tab);
    }
    [init]() {
        // TODO CALL-21471 REMOVE TEMPORARY CONTACTS
        if (this.config.debugCallsToContacts) {
            void this.tabMembersModel.handleFetchContacts();
        }
    }
    [update]() {
        this.tabMembersModel.setSelected(this.props.selected);
        this.tabMembersModel.setTab(this.tab);
    }
    [destroy]() {
        this.resizeObserver?.disconnect();
    }
    get config() {
        return this.configService.getConfig();
    }
    get getCallMember() {
        return this.tabMembersModel.getCallMember;
    }
    get handleShowMoreMembers() {
        return this.tabMembersModel.onShowMoreMembers;
    }
    get hasFoundMembersResult() {
        return this.tabMembersModel.hasFoundMembersResult;
    }
    get hasMoreMembers() {
        return this.tabMembersModel.hasMoreMembers;
    }
    get height() {
        const { chatMembersCount = 0, friendsCount = 0, groupMembersCount = 0 } = this.stateBridge.callMembers;
        const offset = this.offsetTop || (this.scrollViewRootRef?.offsetTop ?? 0);
        const items = this.itemHeight * this.defaultViewMembersLimit;
        const hasButtonMore = this.defaultViewMembersLimit < Math.max(chatMembersCount, friendsCount, groupMembersCount);
        return offset + items + (hasButtonMore ? this.itemHeight : 0);
    }
    get isContactsLoading() {
        return this.tabMembersModel.isContactsLoading;
    }
    get isLoading() {
        return this.tabMembersModel.isLoading;
    }
    get isSearching() {
        return this.tabMembersModel.isSearching;
    }
    get members() {
        return this.tabMembersModel.members;
    }
    get moreMembersItem() {
        let text;
        switch (this.tab) {
            case ETabName.Community:
                text = this.langs.getLang('calls_show_all_group_members');
                break;
            case ETabName.Friends:
                text = this.langs.getLang('calls_show_more_friends');
                break;
            case ETabName.Participants:
                text = this.config.enableChatMembersPagination
                    ? this.langs.getLang('calls_show_more_members')
                    : this.langs.getLang('calls_show_all_members');
                break;
        }
        if (text) {
            return { text, type: "more" /* AddParticipantsItemDataType.MORE */ };
        }
    }
    get notFoundMembersItem() {
        let text;
        switch (this.tab) {
            case ETabName.Community:
            case ETabName.Friends:
            case ETabName.Participants:
                text = this.langs.getLang('calls_participants_not_found');
                break;
        }
        if (text) {
            return { text, type: "not_found" /* AddParticipantsItemDataType.NOT_FOUND */ };
        }
    }
    get props() {
        return this._props.current;
    }
    get searchQuery() {
        return this.tabMembersModel.searchQuery;
    }
    get selectedMembersCount() {
        return this.selectedSet.size;
    }
    get selectedSet() {
        return this.tabMembersModel.selectedSet;
    }
    get tab() {
        return this.isInternalTab ? "selected" /* EInternalTabName.Selected */ : this.props.tab;
    }
    get tabs() {
        return [
            {
                counter: this.selectedMembersCount,
                id: "selected" /* EInternalTabName.Selected */,
                label: this.langs.getLang('calls_add_participants_tab_selected'),
            },
            ...this.props.tabs,
        ];
    }
    handleDeselect(id) {
        this.props.onChange([...this.selectedSet].filter((item) => item !== id));
    }
    handleScrollViewRootChanged() {
        if (this.scrollViewRootRef) {
            this.offsetTop = this.scrollViewRootRef.offsetTop ?? 0;
            this.resizeObserver?.disconnect();
            this.resizeObserver = new ResizeObserver(debounce((entries) => {
                const entry = entries.find((item) => item.target);
                if (entry) {
                    runInAction(() => {
                        this.offsetTop = this.scrollViewRootRef?.offsetTop ?? 0;
                    });
                }
            }, 100));
            this.resizeObserver.observe(this.scrollViewRootRef);
        }
    }
    handleSelect(id) {
        this.props.onChange([...this.selectedSet, id]);
    }
};
AddParticipantsViewModel = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [Props,
        CallMembersService,
        CallsConfigService,
        Langs,
        StateBridge,
        TabMembersModel])
], AddParticipantsViewModel);
export { AddParticipantsViewModel };
export const { Provider: AddParticipantsViewModelProvider, useModel: useAddParticipantsViewModel } = createProvider(AddParticipantsViewModel, { isolatedContext: false, onlyTransient: true });
//# sourceMappingURL=AddParticipantsViewModel.js.map