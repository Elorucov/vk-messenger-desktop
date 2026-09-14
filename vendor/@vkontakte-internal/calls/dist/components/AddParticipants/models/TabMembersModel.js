var TabMembersModel_1;
import { __decorate, __metadata } from "tslib";
import { debounce } from '@vkontakte/vkjs';
import { peerIdToVkId, vkIdToPeerId, } from '@vkontakte-internal/calls-core';
import { destroy, scope } from '@vkontakte-internal/di';
import { VkIndexer } from '@vkontakte-internal/vkjs/lib/Indexer';
import { makeAutoObservable, observable, runInAction } from 'mobx';
import { addChatInfo, addFriends, addGroupMembers } from '../../../actions/callMembers';
import { COUNT_OF_CHAT_MEMBERS_TO_LOAD, COUNT_OF_FRIENDS_TO_LOAD, COUNT_OF_GROUP_MEMBERS_TO_LOAD, } from '../../../constants';
import { handlePromiseError } from '../../../helpers/logger';
import { mapAndNormalizeChatMembers, normalizeContact, normalizeUser } from '../../../helpers/user';
import { ETabName } from '../interfaces';
import { AccountService } from '../../../services/account';
import { InternalBridgeWrapper } from '../../../services/bridge';
import { CallsConfigService } from '../../../services/config';
import { FriendsService } from '../../../services/friends';
import { MessagesService } from '../../../services/messages';
import { UsersService } from '../../../services/users';
import { StateBridge } from '../../../utils/stateBridge';
let TabMembersModel = class TabMembersModel {
    static { TabMembersModel_1 = this; }
    static { this.DEFAULT_VIEW_MEMBERS_LIMIT = 10; }
    constructor(accountService, bridge, configService, friendsService, messagesService, stateBridge, usersService) {
        this.accountService = accountService;
        this.bridge = bridge;
        this.configService = configService;
        this.friendsService = friendsService;
        this.messagesService = messagesService;
        this.stateBridge = stateBridge;
        this.usersService = usersService;
        this.abortController = undefined;
        this.contacts = new Set();
        this.defaultViewMembersLimit = TabMembersModel_1.DEFAULT_VIEW_MEMBERS_LIMIT;
        this.foundMembers = new Set();
        this.hasFoundMembersResult = false;
        this.isAllMembersShown = false;
        this.isContactsLoading = false;
        this._isLoading = 0;
        this._isSearching = 0;
        this.isSearchSuggestFilterEnabled = false;
        this.loadedPage = 1;
        this.searchCache = new Set();
        /** VkIndexer, позволяет быстро(tree search) искать по списку, поддерживает транслитерацию  */
        this.searchIndex = undefined;
        this.searchQuery = '';
        this.selected = [];
        this.tab = undefined;
        this.viewMembersLimit = this.defaultViewMembersLimit;
        this.getCallMember = (id) => {
            const { chatMembersCache, friendsCache, groupMembersCache } = this.stateBridge.callMembers;
            if (chatMembersCache[id]) {
                return chatMembersCache[id];
            }
            if (friendsCache[id]) {
                return friendsCache[id];
            }
            if (groupMembersCache[id]) {
                return groupMembersCache[id];
            }
            return undefined;
        };
        this.handleSearch = debounce(async (query) => {
            const tab = this.tab;
            /**
             * флаг-костыль для подгрузки участников сообщества (тк они не скачиваются целиком)
             * после перехода на серверный поиск для всех табов будет удалено
             */
            const needServerSearch = this.stateBridge.callMembers.groupMembersCount > COUNT_OF_GROUP_MEMBERS_TO_LOAD ||
                tab === ETabName.Friends;
            if (!this.isValidSearchQueryLength(query)) {
                this.updateFoundMembers('');
                return;
            }
            if (!needServerSearch || this.searchCache.has(query)) {
                this.updateFoundMembers(query);
                return;
            }
            runInAction(() => {
                this._isLoading++;
                this._isSearching++;
            });
            let abortController = this.refreshAbortController();
            let newMembers = [];
            try {
                switch (tab) {
                    case ETabName.Community: {
                        const response = this.updateCommunityMembers(await this.searchCommunityItems(query, abortController.signal));
                        if (response.length) {
                            newMembers = response;
                        }
                        this.searchCache.add(query);
                        break;
                    }
                    case ETabName.Friends: {
                        if (!this.bridge.authorizedGroupId) {
                            const response = this.updateFriendMembers(await this.searchFriendItems(query, abortController.signal));
                            if (response.length) {
                                newMembers = response;
                            }
                            this.searchCache.add(query);
                        }
                        break;
                    }
                    case ETabName.Participants: {
                        if (this.config.enableChatMembersPagination) {
                            const response = this.updateChatMembers(await this.searchParticipantItems(query, abortController.signal));
                            if (response.length) {
                                newMembers = response;
                            }
                            this.searchCache.add(query);
                        }
                        break;
                    }
                }
                if (newMembers.length && this.tab === tab) {
                    runInAction(() => {
                        this.isSearchSuggestFilterEnabled = true;
                        newMembers.forEach((item) => this.searchIndex?.add(item));
                    });
                }
            }
            catch (error) {
                if (!abortController.signal.aborted) {
                    handlePromiseError(error);
                }
            }
            if (!abortController.signal.aborted) {
                this.updateFoundMembers(query);
            }
            if (this.tab === tab) {
                runInAction(() => {
                    this._isSearching--;
                    this._isLoading--;
                });
            }
            abortController.abort();
        }, 500);
        this.onShowMoreMembers = () => {
            return this.handleFetchMore(this.loadedPage);
        };
        this.setSearchQuery = (query) => {
            if (this.searchQuery !== query) {
                this.searchQuery = query;
                this.handleSearchQueryChanged();
            }
        };
        makeAutoObservable(this, {
            abortController: false,
            searchCache: false,
            searchIndex: false,
            selected: observable.ref,
        });
    }
    [destroy]() {
        this.abortController?.abort();
    }
    get config() {
        return this.configService.getConfig();
    }
    get hasMoreMembers() {
        const { chatMembersCount = 0, friendsCount = 0, groupMembersCount = 0 } = this.stateBridge.callMembers;
        let countAll;
        switch (this.tab) {
            case ETabName.Community:
                countAll = groupMembersCount;
                break;
            case ETabName.Friends:
                countAll = friendsCount;
                break;
            case ETabName.Participants:
                countAll = chatMembersCount;
                break;
            default:
                countAll = 0;
                break;
        }
        return !this.isAllMembersShown && countAll > this.viewMembersLimit;
    }
    get isLoading() {
        return this._isLoading > 0;
    }
    get isSearching() {
        return this._isSearching > 0;
    }
    get members() {
        if (this.hasFoundMembersResult) {
            return [...this.foundMembers];
        }
        return this.isAllMembersShown || this.viewMembersLimit >= this.tabMembers.length
            ? this.tabMembers
            : this.tabMembers.slice(0, this.viewMembersLimit);
    }
    get selectedMembers() {
        if (this.tab !== "selected" /* EInternalTabName.Selected */) {
            return [];
        }
        const { participants } = this.stateBridge;
        const result = new Map();
        this.selectedSet.forEach((id) => {
            const member = participants[id] || this.getCallMember(peerIdToVkId(id));
            if (member?.peerId) {
                result.set(id, member);
            }
        });
        return [...result.values()];
    }
    get selectedSet() {
        return new Set(this.selected);
    }
    get tabMembers() {
        switch (this.tab) {
            case ETabName.Community:
                return this.stateBridge.callMembers.groupMembers;
            case ETabName.Contacts:
                return [...this.contacts];
            case ETabName.Friends:
                return this.stateBridge.callMembers.friends;
            case ETabName.Participants:
                return this.stateBridge.callMembers.chatMembers;
            case "selected" /* EInternalTabName.Selected */:
                return this.selectedMembers;
            default:
                return [];
        }
    }
    get tabMemberCount() {
        switch (this.tab) {
            case ETabName.Community:
                return this.stateBridge.callMembers.groupMembersCount ?? 0;
            case ETabName.Contacts:
                return this.contacts.size;
            case ETabName.Friends:
                return this.stateBridge.callMembers.friendsCount ?? 0;
            case ETabName.Participants:
                return this.stateBridge.callMembers.chatMembersCount ?? 0;
            case "selected" /* EInternalTabName.Selected */:
                return this.selectedSet.size;
            default:
                return 0;
        }
    }
    async fetchContacts(signal) {
        const response = await this.accountService.getContactList({
            options: { signal },
            params: { extended: 1 },
        });
        return (response.contacts || [])
            .map(normalizeContact)
            .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
    }
    fetchFriendItems(loadedPage = 0, signal) {
        return this.friendsService.getPage({
            options: { signal },
            params: { loadedPage },
        });
    }
    async fetchParticipantItems(loadedPage = 0, signal) {
        const response = await this.messagesService.getConversationMembersPage({
            options: { signal },
            params: {
                loadedPage,
                peer_id: peerIdToVkId(this.stateBridge.peer),
            },
        });
        return {
            count: response.count,
            items: mapAndNormalizeChatMembers(response).sort((a, b) => a.peerId === this.stateBridge.me ? -1 : b.peerId === this.stateBridge.me ? 1 : 0),
        };
    }
    async handleFetchContacts() {
        this.isContactsLoading = true;
        try {
            const contacts = await this.fetchContacts();
            this.contacts.clear();
            contacts.forEach((item) => this.contacts.add(item));
        }
        catch (error) {
            handlePromiseError(error);
        }
        runInAction(() => {
            this.isContactsLoading = false;
        });
    }
    async handleFetchMore(loadedPage = 1) {
        const tab = this.tab;
        let newMembers = [];
        this._isLoading++;
        const abortController = this.refreshAbortController();
        try {
            switch (tab) {
                case ETabName.Community:
                    this.isAllMembersShown = true;
                    break;
                case ETabName.Friends: {
                    const response = await this.handleFetchMoreFriends(loadedPage, abortController.signal);
                    if (response?.length) {
                        newMembers = response;
                    }
                    else {
                        runInAction(() => {
                            this.isAllMembersShown = true;
                        });
                    }
                    break;
                }
                case ETabName.Participants: {
                    const response = await this.handleFetchMoreParticipants(loadedPage, abortController.signal);
                    if (response?.length) {
                        newMembers = response;
                    }
                    else {
                        runInAction(() => {
                            this.isAllMembersShown = true;
                        });
                    }
                    break;
                }
            }
            if (newMembers.length && this.tab === tab) {
                runInAction(() => {
                    this.isSearchSuggestFilterEnabled = true;
                    newMembers.forEach((item) => this.searchIndex?.add(item));
                    this.loadedPage++;
                });
            }
        }
        catch (error) {
            if (!abortController.signal.aborted) {
                handlePromiseError(error);
            }
        }
        if (this.tab === tab) {
            runInAction(() => {
                if (this.viewMembersLimit < this.tabMembers.length) {
                    this.viewMembersLimit = this.tabMembers.length;
                }
                this._isLoading--;
            });
        }
        abortController.abort();
    }
    async handleFetchMoreFriends(loadedPage = 1, signal) {
        let newMembers;
        if (!this.bridge.authorizedGroupId && this.tabMembers.length < this.tabMemberCount) {
            const response = this.updateFriendMembers(await this.fetchFriendItems(loadedPage, signal));
            if (response.length) {
                newMembers = response;
            }
        }
        return newMembers;
    }
    async handleFetchMoreParticipants(loadedPage = 1, signal) {
        let newMembers;
        if (this.config.enableChatMembersPagination && this.tabMembers.length < this.tabMemberCount) {
            const response = this.updateChatMembers(await this.fetchParticipantItems(loadedPage, signal), this.stateBridge.callData?.conversation);
            if (response.length) {
                newMembers = response;
            }
        }
        return newMembers;
    }
    handleSearchQueryChanged() {
        this.handleSearch(this.searchQuery);
    }
    handleSelectedChanged() {
        if (this.tab === "selected" /* EInternalTabName.Selected */) {
            this.searchIndex = new VkIndexer([...this.selectedMembers], (member) => member.name, () => this.searchQuery && this.updateFoundMembers(this.searchQuery));
        }
    }
    handleTabChanged() {
        this.initTab();
    }
    initTab() {
        this.abortController?.abort();
        this.foundMembers.clear();
        this.hasFoundMembersResult = false;
        this.isAllMembersShown = [ETabName.Contacts, "selected" /* EInternalTabName.Selected */].includes(this.tab);
        this._isLoading = 0;
        this._isSearching = 0;
        this.isSearchSuggestFilterEnabled = false;
        this.searchCache.clear();
        this.searchQuery = '';
        this.updateTabMembersRelations(true);
        this.viewMembersLimit = this.defaultViewMembersLimit;
    }
    isValidSearchQueryLength(query) {
        return query.length >= 3;
    }
    refreshAbortController() {
        const abortController = new AbortController();
        this.abortController?.abort();
        this.abortController = abortController;
        return abortController;
    }
    async searchCommunityItems(query, signal) {
        const { items } = await this.usersService.search({
            options: { signal },
            params: {
                group_id: -this.stateBridge.groupId,
                q: query,
            },
        });
        return { items: items.filter((item) => !item.deactivated) };
    }
    async searchFriendItems(query, signal) {
        const { items } = await this.friendsService.search({
            options: { signal },
            params: {
                user_id: peerIdToVkId(this.stateBridge.me),
                q: query,
            },
        });
        return { items };
    }
    async searchParticipantItems(query, signal) {
        const response = await this.messagesService.searchConversationMembers({
            options: { signal },
            params: {
                peer_id: peerIdToVkId(this.stateBridge.peer),
                q: query,
            },
        });
        return { items: mapAndNormalizeChatMembers(response) };
    }
    setDefaultViewMembersLimit(limit) {
        this.defaultViewMembersLimit = limit;
    }
    setSelected(selected) {
        if (this.selected !== selected) {
            this.selected = selected;
            this.handleSelectedChanged();
        }
    }
    setTab(tab) {
        if (this.tab !== tab) {
            this.tab = tab;
            this.handleTabChanged();
        }
    }
    updateChatMembers({ count, items }, conversation) {
        const newMembers = items.reduce((acc, item) => {
            if (!(item.id in this.stateBridge.callMembers.chatMembersCache)) {
                acc.push(item);
            }
            return acc;
        }, []);
        if (newMembers.length) {
            this.stateBridge.dispatch(addChatInfo({ count, conversation, members: newMembers }));
        }
        return newMembers;
    }
    updateCommunityMembers({ count, items }) {
        const unableToCallGroupMembersIds = [];
        const newMembers = items.reduce((acc, item) => {
            if (!(item.id in this.stateBridge.callMembers.groupMembersCache)) {
                acc.push(normalizeUser(item));
                if (!item.can_call_from_group) {
                    unableToCallGroupMembersIds.push(vkIdToPeerId(item.id));
                }
            }
            return acc;
        }, []);
        if (newMembers.length) {
            this.stateBridge.dispatch(addGroupMembers({ count, members: newMembers, unableToCallGroupMembersIds }));
        }
        return newMembers;
    }
    updateFriendMembers({ count, items }) {
        const newMembers = items.reduce((acc, item) => {
            if (!(item.id in this.stateBridge.callMembers.friendsCache)) {
                acc.push(normalizeUser(item));
            }
            return acc;
        }, []);
        if (newMembers.length) {
            this.stateBridge.dispatch(addFriends({ count, members: newMembers }));
        }
        return newMembers;
    }
    updateFoundMembers(query) {
        this.foundMembers.clear();
        this.hasFoundMembersResult = false;
        if (query) {
            let members = this.searchIndex?.search(query);
            if (members && this.isSearchSuggestFilterEnabled) {
                members = Object.values(members.reduce((acc, item) => {
                    acc[item.id] = item;
                    return acc;
                }, {}));
            }
            if (members) {
                members.forEach((item) => this.foundMembers.add(item));
                this.hasFoundMembersResult = true;
            }
        }
    }
    updateTabMembersRelations(refreshLoadedPage = false) {
        if (refreshLoadedPage) {
            let pageItemCount;
            switch (this.tab) {
                case ETabName.Community:
                    pageItemCount = COUNT_OF_GROUP_MEMBERS_TO_LOAD;
                    break;
                case ETabName.Friends:
                    pageItemCount = COUNT_OF_FRIENDS_TO_LOAD;
                    break;
                case ETabName.Participants:
                    pageItemCount = COUNT_OF_CHAT_MEMBERS_TO_LOAD;
                    break;
            }
            /** Часть данных может быть закешировано, вычисляем, какая "страница" пагинации загружена сейчас */
            this.loadedPage = (pageItemCount && Math.ceil(this.tabMembers.length / pageItemCount)) || 1;
        }
        this.searchIndex = new VkIndexer([...this.tabMembers], (member) => member.name);
    }
};
TabMembersModel = TabMembersModel_1 = __decorate([
    scope.transient(),
    __metadata("design:paramtypes", [AccountService,
        InternalBridgeWrapper,
        CallsConfigService,
        FriendsService,
        MessagesService,
        StateBridge,
        UsersService])
], TabMembersModel);
export { TabMembersModel };
//# sourceMappingURL=TabMembersModel.js.map