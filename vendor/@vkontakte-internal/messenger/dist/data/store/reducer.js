import { createDraft, finishDraft } from 'immer';
import { insertConvos, insertPeers, insertFolders, insertChannels, getOwnerGroupId, insertSublists, insertSpaces, insertManagedGroups, setTags, setTagsUnavailable, } from '../store/State';
import { exhaustivenessCheck } from '../../core/utils/misc';
import * as Organisers from '../../core/model/Organisers';
import * as Filters from '../../core/model/Filters';
import * as Folder from '../../core/model/Folder';
import * as Queue from '../../core/model/Queue';
import * as ChannelFilters from '../../core/model/ChannelFilters';
import * as Convo from '../../core/model/Convo';
import * as Peer from '../../core/model/Peer';
import * as Message from '../../core/model/Message';
import * as ComposerDraft from '../../core/model/ComposerDraft';
import * as ChannelComposerDraft from '../../core/model/ChannelComposerDraft';
import * as Channel from '../../core/model/Channel';
import * as ManagedGroup from '../../core/model/ManagedGroup';
import * as Post from '../../core/model/Post';
import * as Trie from '../../core/model/Trie';
import * as Viewer from '../../core/model/Viewer';
import * as TextChunk from '../../core/model/TextChunk';
import * as ThemeStyle from '../../core/model/ThemeStyle';
import * as RemindAnswerToMessage from '../../core/model/RemindAnswerToMessage';
import * as BotKeyboard from '../../core/model/BotKeyboard';
import { fromApiGroup, fromApiUser } from '../converter/PeerConverter';
import { API_GET_HELP_HINTS, API_GET_INFO_FIELDS, API_GET_MULTI_FIELDS, CHANNELS_PER_PAGE, CHANNELS_INBOUND_REQUESTS_PER_PAGE, CONVOS_PER_PAGE, EDU_INTEGRATION_BANNER_ID, API_GET_FOLDERS_TYPES, } from '../../core/config/config';
import { fromApiViewerAccount, fromApiViewerProfileInfo, fromApiProfileType, } from '../converter/ViewerConverter';
import { fromApiViewerPushSettings } from '../converter/SettingsConverter';
import * as UserHitSend from '../store/UserHitSend';
import * as UserHitEdit from '../store/UserHitEdit';
import * as UserSeenMessages from '../store/UserSeenMessages';
import * as UserOpenedConvo from '../store/UserOpenedConvo';
import * as EngineBatchReceived from '../store/EngineBatchReceived';
import * as ChannelEngineBatchReceived from '../store/ChannelEngineBatchReceived';
import * as SpaceEngineBatchReceived from '../store/SpaceEngineBatchReceived';
import * as UserChangedSetting from '../store/UserChangedSetting';
import * as SettingThemeUpdated from './SettingThemeUpdated';
import * as SettingExperimentalUpdated from './SettingExperimentalUpdated';
import * as UserChangedFriendship from '../store/UserChangedFriendship';
import * as VacationMarkExpired from '../store/VacationMarkExpired';
import * as UserChangedGroupMembership from '../store/UserChangedGroupMembership';
import * as MiniApp from '../store/MiniApp';
import * as MoreConvosNeeded from '../store/MoreConvosNeeded';
import * as MoreChannelsNeeded from '../store/MoreChannelsNeeded';
import * as MorePrecreatedConvosNeeded from '../store/MorePrecreatedConvosNeeded';
import * as CacheUpdateReceived from '../store/CacheUpdateReceived';
import * as QueueBatchReceived from '../store/QueueBatchReceived';
import * as UserPlayedMessage from '../store/UserPlayedMessage';
import * as UserSeenHelpHint from '../store/UserSeenHelpHint';
import * as UserChangedConvo from '../store/UserChangedConvo';
import * as UserChangedMessage from '../store/UserChangedMessage';
import * as LoadContactList from './LoadContactList';
import * as UserChangedMessageRequest from './UserChangedMessageRequest';
import * as UserHideFilter from './UserHideFilter';
import * as UserScrolledChannelPostponedHistory from './UserScrolledChannelPostponedHistory';
import * as UserClosedChannelPostponed from './UserClosedChannelPostponed';
import * as UserHitPostponedPostEdit from './UserHitPostponedPostEdit';
import * as UserChangedChat from './UserChangedChat';
import * as UserOpenedConvoProfile from './UserOpenedConvoProfile';
import * as UserChangedChatStickersDisplay from './UserChangedChatStickersDisplay';
import * as LoadImportantMessages from './LoadImportantMessages';
import * as UserCreatedFolder from '../store/UserCreatedFolder';
import * as UserUpdatedFolder from '../store/UserUpdatedFolder';
import * as UserDeletedFolder from '../store/UserDeletedFolder';
import * as UserHaveSeenPopupAnimation from '../store/UserHaveSeenPopupAnimation';
import * as UserReorderedFolders from '../store/UserReorderedFolders';
import * as UserScrolledChannelHistory from '../store/UserScrolledChannelHistory';
import * as UserOpenedChannel from '../store/UserOpenedChannel';
import * as UserChangedChannelsConfig from './UserChangedChannelsConfig';
import * as UserChangedChatMember from '../store/UserChangedChatMember';
import * as UserRequestChatInvitationLink from '../store/UserRequestChatInvitationLink';
import * as UserOpenedSpace from '../store/UserOpenedSpace';
import * as LoadChatMembers from '../store/LoadChatMembers';
import * as LoadChatInfo from '../store/LoadChatInfo';
import * as UserChangedChannel from '../store/UserChangedChannel';
import * as UserChangedChannelPost from '../store/UserChangedChannelPost';
import * as UserChangedManagedGroup from '../store/UserChangedManagedGroup';
import * as UserReadPost from '../store/UserReadPost';
import * as UserProfileInfo from './UserProfileInfo';
import * as UnavailabilitySchedule from './UnavailabilitySchedule';
import * as UserLoadedCommentsHistory from '../store/UserLoadedCommentsHistory';
import * as ChannelsOnboardingDone from './ChannelsOnboardingDone';
import * as UserChangedComposerDraft from './UserChangedComposerDraft';
import * as ResetUpdatesCounter from './ResetUpdatesCounter';
import * as UserChangedMessageAttachment from './UserChangedMessageAttachment';
import * as UserLikeActions from './UserLikeActions';
import * as UserChangedComment from './UserChangedComment';
import * as UserChangedBrowserNotifications from './UserChangedBrowserNotifications';
import * as VideoMessageActions from './VideoMessageActions';
import * as UserChangedPostAttachment from './UserChangedPostAttachment';
import * as StickersCacheReceived from './StickersCacheReceived';
import * as TagsChanges from './TagsChanges';
import * as LoadStickersSettingsFromApi from './LoadStickersSettingsFromApi';
import * as UserSetMessageReaction from './UserSetMessageReaction';
import * as UserSetChannelReaction from './UserSetChannelReaction';
import * as PollConvoReactions from './PollConvoReactions';
import * as PollFallenConvos from './PollFallenConvos';
import * as UserChangedChannelComposerDraft from './UserChangedChannelComposerDraft';
import * as UserHitPostSend from './UserHitPostSend';
import * as UserHitPostponedPostSend from './UserHitPostponedPostSend';
import * as ImportContact from './ImportContact';
import * as InvalidateMessageReactions from './InvalidateMessageReactions';
import * as UserChangedPushSetting from './UserChangedPushSetting';
import * as EduIntegrationBannerChanged from './EduIntegrationBannerChanged';
import * as UserScrolledConvoHistory from './UserScrolledConvoHistory';
import * as UserReadAllReactions from './UserReadAllReactions';
import { fromApiConvo } from '../converter/ConvoConverter';
import * as PollChannelPosts from './PollChannelPosts';
import * as ViewerSetLanguage from './ViewerSetLanguage';
import * as UserChangedBubblesTheme from '../store/UserChangedBubblesTheme';
import * as LoadRecommendedFolders from './LoadRecommendedFolders';
import * as ManageUserDetails from './ManageUserDetails';
import { fromApiFolder } from '../converter/FolderConverter';
import { fromApiSublist } from '../converter/SublistConverter';
import { DEFAULT_CONVOS_FAILED_MESSAGES_STORE, getConvosFailedMessagesFromStorage, } from '../env/FailedMessagesManager';
import { getRemindAnswerFromStorage, updateRemindAnswerStorageOnConvoLoad, } from '../env/RemindAnswerManager';
import * as UserHitCommentSend from './UserHitCommentSend';
import * as UserChangedCommentsComposerDraft from './UserChangedCommentsComposerDraft';
import * as UserHitEditComment from './UserHitEditComment';
import * as UserHideConversationsBar from './UserHideConversationsBar';
import * as UserHideConvoBanner from './UserHideConvoBanner';
import { fromApiConversationsBar } from '../converter/ConversationsBarConverter';
import * as ConvoMediaViewerCache from '../store/ConvoMediaViewerCache';
import * as ChannelMediaViewerCache from '../store/ChannelMediaViewerCache';
import * as UserHitPostEdit from '../store/UserHitPostEdit';
import * as SettingsFromApiLoaded from '../store/SettingsFromApiLoaded';
import * as UserLoadedUrlSnippets from '../store/UserLoadedUrlSnippets';
import * as UserOpenedVideoChat from './UserOpenedVideoChat';
import * as MoreVideoCommentsNeeded from './MoreVideoCommentsNeeded';
import * as UserChangedVideoComment from './UserChangedVideoComment';
import * as UserHitVideoCommentSend from './UserHitVideoCommentSend';
import * as VideoUpdateReceived from './VideoUpdateReceived';
import * as VKCOMRightColumnConvosUpdated from '../store/VKCOMRightColumnConvosUpdated';
import * as ContainerSizeUpdate from '../store/ContainerSizeUpdate';
import * as MockUpdate from '../store/MockUpdate';
import * as AddConvosToSearchIndex from '../store/AddConvosToSearchIndex';
import * as LoadChannelPosts from '../store/LoadChannelPosts';
import * as CommunityTemplates from '../store/CommunityTemplates';
import * as ChannelsMarkPostAsFake from '../store/ChannelsMarkPostAsFake';
import * as ChannelsRecommendationsLoad from '../store/ChannelsRecommendationsLoad';
import { fromApiTag } from '../converter/TagConverter';
import { fromApiAppearance, fromApiBackground, fromApiStyle, } from '../converter/ThemeStyleConverter';
import * as SettingsThemeStyleUpdated from '../store/SettingsThemeStyleUpdated';
import { nanoid } from 'nanoid';
import * as UserReportAttach from '../store/UserReportAttach';
import * as UserJoinedSpace from '../store/UserJoinedSpace';
import * as UserChangedSpaceMute from '../store/UserChangedSpaceMute';
import * as UserCreatedSpaceSection from '../store/UserCreatedSpaceSection';
import * as UserCreatedSpaceRoom from '../store/UserCreatedSpaceRoom';
import * as UserUpdatedSpaceRoom from '../store/UserUpdatedSpaceRoom';
import * as LoadCommentGroups from '../store/LoadCommentGroups';
import * as CountersUpdate from '../store/CountersUpdate';
import * as UserChangedSpace from '../store/UserChangedSpace';
import * as LoadGroupBannedUser from '../store/LoadGroupBannedUser';
import * as UserOpenedPostponedMessagesHistory from '../store/UserOpenedPostponedMessagesHistory';
import { IPerfStats } from '../env/IPerfStats';
import { Time } from '../../core/utils/time';
import * as UserChangedChannelPeerBan from '../store/UserChangedChannelPeerBan';
const initialSettings = {
    ctrSubmitFromApi: false,
    soundNotifications: true,
    browserNotifications: false,
    showRecommendations: true,
    countOnlyNotMuted: false,
    countChannels: false,
    countGroupDialogs: false,
    autoUnarchive: true,
    theme: 'system',
    themeStyleId: ThemeStyle.SYSTEM_STYLE_ID,
    showThemeStyles: true,
    verticalFoldersView: false,
    messageReactionAnimation: true,
    businessNotify: false,
    groupsMessagesNotifySetting: true,
    push: Viewer.VIEWER_DEFAULT_PUSH_SETTINGS,
    teacherVerification: false,
    fastActionsTriggerFromApi: 'hoverAndRightClick',
    messageSelfMentionHighlighting: 'none',
    eduAccountSwitchBanner: true,
    autoExtendReactionPicker: false,
    bubblesTheme: 'default',
    stickerHintsEnabled: true,
    isStickersAnimationEnabled: true,
    isPopupStickersAutoplaySettingEnabled: false,
    isPopupStickersInterruptCounterEnabled: false,
    callsEnabled: true,
    convoListWidthPercent: 100,
    videoMessageAutoplay: true,
    shouldShowCompactModeButton: true,
    hasAudioMetaInfo: false,
    featuresDisabledConvoBannerContent: null,
    performanceTweaksEnabled: true,
    layoutMode: 'two-column',
};
export const initial = (featureFlags, viewerId, ownerId, profileType, initialParams, cachedState) => {
    const resolvedViewerId = Peer.resolveId(viewerId);
    const resolvedOwnerId = ownerId ? Peer.resolveId(ownerId) : undefined;
    if (!Peer.isUserPeerId(resolvedViewerId)) {
        throw Error('Viewer может быть только пользователем');
    }
    if (resolvedOwnerId !== undefined &&
        !Peer.isUserPeerId(resolvedOwnerId) &&
        !Peer.isGroupPeerId(resolvedOwnerId)) {
        throw Error('Owner может быть только пользователем или группой');
    }
    const resolvedProfileType = fromApiProfileType(profileType);
    const initialState = {
        convoConn: {
            status: 'loading',
            pts: 0,
            reconnectAttempts: 0,
        },
        channelConn: {
            status: 'running',
            ts: 0,
            channelOffsetMap: new Map(),
            userOffset: 0,
            reconnectAttempts: 0,
        },
        spaceConn: {
            status: 'running',
            ts: 0,
            reconnectAttempts: 0,
        },
        viewer: {
            id: resolvedViewerId,
            profileType: resolvedProfileType,
            settings: initialSettings,
            profileInfo: {
                id: resolvedViewerId,
            },
            accounts: [],
        },
        activeQueueIds: new Set(),
        ownerId: Peer.resolveId(),
        organisers: Organisers.empty(),
        VKCOMRightColumnConvos: {
            peerIds: [],
            isInited: false,
            isVisible: false,
            isLeftColumnConvoListOpened: false,
        },
        managedGroups: new Map([
            [
                ManagedGroup.resolveId(),
                {
                    id: ManagedGroup.resolveId(),
                    name: '',
                    activity: '',
                    type: 'group',
                    photo: {},
                    unreadCount: 0,
                    isMuted: false,
                    canManageBy2FA: true,
                },
            ],
        ]),
        channelsGetRecommendationsQueryUUID: nanoid(),
        channels: new Map([
            [
                Channel.resolveId(0),
                {
                    kind: 'Channel',
                    id: Channel.resolveId(0),
                    name: '',
                    description: [],
                    activity: '',
                    adminLevel: 0 /* Peer.GroupAdminLevel.Member */,
                    isVerified: false,
                    photo: {},
                    inReadCmid: Post.resolveCmid(0),
                    unreadCount: 0,
                    isArchived: false,
                    isOwner: false,
                    isRepostsDisabled: false,
                    isMuted: false,
                    isClosed: false,
                    isPrivate: false,
                    isParentGroupMember: false,
                    notificationsDisabledUntil: 0,
                    majorSortId: 0,
                    minorSortId: 0,
                    membersCount: 0,
                    isMember: false,
                    canMessage: false,
                    isActive: true,
                    rights: {
                        canPost: false,
                        canSendDonut: false,
                    },
                    pending: {},
                    locks: {
                        loading: false,
                        cleanUp: 0,
                    },
                    history: { confirmed: [], pending: [] },
                    postponed: {
                        history: { segments: [] },
                        loaded: false,
                        hasMore: true,
                        count: 0,
                    },
                    actionButton: {
                        isEnabled: false,
                    },
                    mediaViewerCache: { items: [], hasPrev: true, hasNext: true },
                    wall: 3 /* Channel.WallType.Restricted */,
                },
            ],
        ]),
        spaces: new Map(),
        spacesCalls: new Map(),
        spacesTribunes: new Map(),
        channelsRecommendationsIds: [],
        precreatedConvos: {
            peerIds: new Set(),
            hasMore: true,
        },
        convos: new Map([
            [
                Peer.resolveId(),
                {
                    kind: 'UserConvo',
                    peerId: Peer.resolveId(),
                    unreadCount: 0,
                    majorSortId: 0,
                    minorSortId: 0,
                    isDrafted: false,
                    inReadBy: Message.resolveCmid(0),
                    outReadBy: Message.resolveCmid(0),
                    isNew: false,
                    folderIds: new Set(),
                    peerFlags: 0,
                    canWrite: { allowed: false, reason: 'unknown' },
                    push: {
                        mode: 'everything',
                        disabledUntil: 0,
                    },
                    unreadExpireables: new Set(),
                    unreadReactions: new Map(),
                    entrypoint: null,
                    history: {
                        confirmed: [],
                        pending: [],
                    },
                    postponed: {
                        history: {
                            confirmed: [],
                            pending: [],
                        },
                        loaded: false,
                        hasError: false,
                        count: 0,
                    },
                    mediaViewerCache: { items: [], hasPrev: true, hasNext: true },
                    styleId: ThemeStyle.SYSTEM_STYLE_ID,
                    isStickersPopupAutoplayDisabledByAdmin: false,
                    isStickersPopupAutoplayDisabledByUser: false,
                    isAlive: true,
                },
            ],
        ]),
        composerDrafts: {},
        composerPostponedDrafts: {},
        communityTemplates: undefined,
        channelComposerDrafts: {},
        commentsComposerDrafts: {},
        readQueues: new Map(),
        seenPosts: new Map(),
        seenPostsStatsQueues: new Map(),
        channelReadQueues: new Map(),
        peers: new Map([
            [
                Peer.resolveId(),
                {
                    kind: 'User',
                    id: Peer.resolveId(),
                    firstName: '...',
                    firstNameGen: '...',
                    firstNameAcc: '...',
                    firstNameDat: '...',
                    firstNameIns: '...',
                    lastName: '...',
                    lastNameGen: '...',
                    lastNameAcc: '...',
                    lastNameIns: '...',
                    sex: 'unknown',
                    isVerified: false,
                    canCall: true,
                    followersCount: 0,
                    canChangeFriendship: false,
                    canMessage: false,
                    friendship: 'unfamiliar',
                    isBlacklisted: false,
                    isBlacklistedByMe: false,
                    isProfileClosed: false,
                    isDeactivated: false,
                    canInviteToChats: false,
                },
            ],
        ]),
        groupBannedUsers: {},
        lastSeens: new Map(),
        typings: new Map(),
        convosSearchIndex: Trie.create(),
        userDetails: {},
        locks: {
            setViewerLanguage: false,
            getConversations: {
                adTag: false,
                all: false,
                unread: false,
                archive: false,
                important: false,
                messageRequest: false,
                unanswered: false,
            },
            getChannels: {
                all: false,
                unread: false,
            },
            getCommunityTemplates: false,
            getHistory: new Set(),
            getConversationRestrictedMembers: new Set(),
            getConversationMembers: new Set(),
            getConversationInfo: new Set(),
            getPrecreatedConversations: false,
            spacesGetById: new Set(),
            spacesGetCounters: false,
            spacesSetSettings: new Set(),
            sendQueue: new Map(),
            edit: new Set(),
            convosCleanup: new Map(),
            channelsCleanup: new Map(),
            updateFriendshipOrMembership: new Set(),
            clearVacationMark: new Set(),
            convoActions: new Set(),
            setChatStickersDisplay: new Set(),
            messageActions: new Set(),
            channelActions: new Set(),
            managedGroupActions: new Set(),
            channelPostActions: new Set(),
            settings: new Set(),
            contactList: false,
            deleteFolder: new Set(),
            updateFolder: new Set(),
            reorderFolders: false,
            getChannelHistory: new Set(),
            getChannelPostponedHistory: new Set(),
            changeMessageRequest: new Set(),
            getPostCommentsHistory: new Set(),
            likeActions: new Set(),
            commentActions: new Set(),
            getVideoMessageShapesById: new Set(),
            loadStickers: new Set(),
            seenPostsStatsSend: false,
            invalidateMessageReactions: false,
            loadStickersKeywords: false,
            loadStickerPacks: false,
            loadStickersSettings: false,
            loadRecommendedFolders: false,
            getUserDetails: new Set(),
            setUserNote: new Set(),
            readAllReactions: new Set(),
            sendComment: new Set(),
            editPost: new Set(),
            urlSnippets: {
                load: false,
                throttle: false,
            },
            loadCommentGroups: false,
            getVideoCommentsHistory: new Set(),
            videoCommentActions: new Set(),
            sendVideoComment: new Set(),
            bannChannelPeer: new Set(),
            deletePostponed: new Set(),
            loadChannelPosts: new Map(),
            loadChannelsRecommendationsIdsNew: false,
        },
        hiddenPinnedMessages: new Map(),
        helpHints: new Map(),
        forceStickersReload: false,
        stickers: new Map(),
        stickersKeywords: new Map(),
        contacts: {
            items: new Map(),
            contacts: new Map(),
            hasMore: true,
        },
        importantMessages: {
            messages: new Map(),
            hasMore: true,
        },
        hiddenBotKeyboards: new Map(),
        reactionsOld: new Map(),
        messageReactionsConfig: {
            assets: new Map(),
            allowedIds: new Set(),
        },
        allowedMessageReactionIds: new Set(),
        postReactions: new Map(),
        newPostingReactions: new Map(),
        importantUsers: null,
        channelsConfig: {
            isRecommendationsEnabled: initialParams?.isChannelRecommendationsEnabled ?? true,
            recommendations: {
                lastCollapsedVersion: 0,
                version: 1,
            },
        },
        videoMessageShapes: null,
        activeCallsCount: 0,
        messageReactedPeers: new Map(),
        convosFailedMessages: DEFAULT_CONVOS_FAILED_MESSAGES_STORE,
        themeStyles: new Map(),
        themeAppearances: new Map(),
        themeBackgrounds: new Map(),
        urlSnippetsCache: new Map(),
        urlSnippetsQueue: new Set(),
        onboardingTriggers: {
            userArchivedChat: false,
        },
        deviceId: '',
        languageLocale: initialParams?.languageLocale ?? 'ru',
        eduIntegrationBanner: {
            isEnabled: false,
            hiddenAt: null,
            hiddenCount: 0,
        },
        commentGroups: {
            ids: new Set(),
            isReady: false,
        },
        videoConvos: new Map(),
        containerSize: {},
        remindAnswerToMessage: new Map(),
    };
    // На этом этапе у нас уже должен быть viewerId, т.к. приложение запускается после авторизации
    if (resolvedViewerId === 0) {
        return [initialState, []];
    }
    const canUseCachedState = cachedState !== undefined &&
        cachedState.viewer?.id === resolvedViewerId &&
        cachedState.viewer?.profileType === resolvedProfileType &&
        (resolvedOwnerId === undefined || cachedState.ownerId === resolvedOwnerId);
    return [
        canUseCachedState
            ? {
                ...initialState,
                ...cachedState,
            }
            : initialState,
        [
            async function initEnv({ stats }) {
                stats.init();
                return {
                    type: 'Noop',
                };
            },
            () => Promise.resolve({
                type: 'InitialData',
                ownerId: resolvedOwnerId,
                withCache: canUseCachedState,
            }),
        ],
    ];
};
export function reducer(prevState, action, featureFlags, envFeatureFlags) {
    /**
     * Это временная мера для случая, когда невозможно сделать ресинк.
     * Не стоит использовать этот экшен для других целей.
     */
    if (action.type === 'TemporaryHackForResync') {
        const [state, effects] = initial(featureFlags, prevState.viewer.id, prevState.ownerId, prevState.viewer.profileType === 'edu' ? 2 : 0, {
            languageLocale: prevState.languageLocale,
            isChannelRecommendationsEnabled: prevState.channelsConfig.isRecommendationsEnabled,
        });
        // Сохраняем кол-во непрочитанных в неактивной вкладке между перезагрузками стейта
        // Иначе это приведёт к тому, что после долгой неактивности пользователь не увидит непрочитанные в неактивной вкладке
        //@ts-expect-error
        state.organisers.filters.unread.headerNotMutedUnread =
            prevState.organisers.filters.unread.headerNotMutedUnread;
        return [state, effects];
    }
    const draft = createDraft(prevState);
    /**
     * Тут важно оставить эффекты неинициализированными,
     * чтобы компилятор сругнулся, если мы забудем их присвоить ниже.
     */
    let effects;
    switch (action.type) {
        case 'Noop':
            effects = [];
            break;
        case 'InitialData':
        case 'InitialData_RequestCompleted':
        case 'InitialDataWithCached_RequestCompleted':
        case 'InitialData_ChannelsReadyForUse':
        case 'InitialData_SpacesReadyForUse':
        case 'InitialData_ThemeStylesLoaded':
        case 'AdditionalInfo_RequestCompleted':
            effects = handleInitialDataActions(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'LoadVideoMessageShapes_RequestCompleted':
            effects = handleLoadVideoMessageShapesActions(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'EngineBatchReceived':
        case 'EngineBatchReceived_TypingsTimedOut':
        case 'UpdateMessageRequestsCounter':
        case 'UpdateMessageRequestsCounter_RequestCompleted':
        case 'RefetchFoldersRequest_RequestCompleted':
        case 'RefetchEduSchedule_RequestCompleted':
        case 'RefetchSpaceCounters_RequestCompleted':
        case 'RefetchViewerRoles_RequestCompleted':
            effects = EngineBatchReceived.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'ChannelEngineBatchReceived':
            effects = ChannelEngineBatchReceived.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'SpaceEngineBatchReceived':
            effects = SpaceEngineBatchReceived.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'QueueBatchReceived':
        case 'QueueBatchReceived__ManagedGroupsInfo':
            effects = QueueBatchReceived.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'MoreConvosNeeded':
        case 'MoreConvosNeeded_RequestCompleted':
            effects = MoreConvosNeeded.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'MiniAppConfiguration':
        case 'MiniAppConfiguration_Reset':
            effects = MiniApp.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'MorePrecreatedConvosNeeded':
        case 'MorePrecreatedConvosNeeded_RequestCompleted':
            effects = MorePrecreatedConvosNeeded.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'MoreChannelsNeeded':
        case 'MoreChannelsNeeded_RequestCompleted':
            effects = MoreChannelsNeeded.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'CacheUpdateReceived':
            effects = CacheUpdateReceived.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'UserSeenMessages':
        case 'UserSeenMessages_ThrottleTimedOut':
        case 'UserSeenMessages_RequestCompleted':
            effects = UserSeenMessages.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'UserHitSend':
        case 'UserHitSend_RequestCompleted':
        case 'UserHitResendFailedMessage':
        case 'UserHitResendAllFailedMessages':
        case 'UserHitSendWidget':
        case 'UserHitSend_ErrorSnackbarShown':
        case 'UserHitSendPostponedRightNow':
            effects = UserHitSend.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'UserHitEdit':
        case 'UserHitEditPostponed':
        case 'UserHitEdit_Resend':
        case 'UserHitEditPostponed_Resend':
        case 'UserHitEdit_CancelFailedEditing':
        case 'UserHitEditPostponed_CancelFailedEditing':
        case 'UserHitEdit_RequestCompleted':
        case 'UserHitEditPostponed_RequestCompleted':
            effects = UserHitEdit.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'UserOpenedConvo':
        case 'UserClosedConvo':
        case 'UserOpenedConvo_ConvoRequestCompleted':
        case 'UserOpenedConvo_StickersKeywordsRequestCompleted':
            effects = UserOpenedConvo.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'ViewerSetLanguage':
        case 'ViewerSetLanguage_RequestCompleted':
            effects = ViewerSetLanguage.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'StickersCacheReceived':
        case 'StickersReloadCompleted':
            effects = StickersCacheReceived.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'TagsCreated':
        case 'TagsUpdated':
            effects = TagsChanges.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'LoadStickersSettingsFromApi':
        case 'LoadStickersSettingsFromApi_RequestCompleted':
        case 'ChangeStickersSettings':
        case 'ChangeStickersSettings_RequestCompleted':
            effects = LoadStickersSettingsFromApi.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'UserChangedFriendship':
        case 'UserChangedFriendship_RequestCompleted':
            effects = UserChangedFriendship.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'VacationMarkExpired':
            effects = VacationMarkExpired.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'UserChangedGroupMembership':
        case 'UserChangedGroupMembership_RequestCompleted':
            effects = UserChangedGroupMembership.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'UserChangedSetting':
        case 'UserChangedSetting_RequestCompleted':
            effects = UserChangedSetting.handler(draft, action, featureFlags);
            break;
        case 'SettingThemeUpdated':
        case 'SettingThemeUpdated_RequestCompleted':
            effects = SettingThemeUpdated.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'SettingExperimentalUpdated':
        case 'SettingExperimentalUpdated_RequestCompleted':
            effects = SettingExperimentalUpdated.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'UserChangedBubblesTheme':
        case 'UserChangedBubblesTheme_RequestCompleted':
            effects = UserChangedBubblesTheme.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'UserPlayedMessage':
        case 'UserPlayedMessage_RequestCompleted':
            effects = UserPlayedMessage.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'UserSeenHelpHint':
        case 'UserSeenHelpHint_RequestCompleted':
            effects = UserSeenHelpHint.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'UserChangedConvo':
        case 'UserChangedConvo_RequestCompleted':
        case 'UserPinMessage':
        case 'UserPinMessage_RequestCompleted':
        case 'UserUnpinMessage':
        case 'UserUnpinMessage_RequestCompleted':
        case 'UserChangedStickersPopupAutoplay':
        case 'UserChangedStickersPopupAutoplay_RequestCompleted':
        case 'UserChangedMute':
        case 'UserChangedMute_RequestCompleted':
        case 'UserChangedMuteChatMentions':
        case 'UserChangedMuteChatMentions_RequestCompleted':
        case 'UserChangedBusinessNotify':
        case 'UserChangedBusinessNotify_RequestCompleted':
        case 'UserChangeForbidWritingAll':
        case 'UserChangeForbidWritingAll_RequestCompleted':
        case 'UserRestrictChatMemberToWrite':
        case 'UserRestrictChatMemberToWrite_RequestCompleted':
        case 'GroupBanUser':
        case 'GroupBanUser_RequestCompleted':
            effects = UserChangedConvo.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'UserChangedMessage':
        case 'UserChangedMessage_RequestCompleted':
        case 'UserDeleteMessage':
        case 'UserDeleteMessage_RequestCompleted':
        case 'UserDeleteFailedMessage':
        case 'UserDeleteAllFailedMessages':
        case 'UserRestoreMessage':
        case 'UserRestoreMessage_RequestCompleted':
        case 'UserDeletedPostponedMessage':
        case 'UserDeletedPostponedMessage_RequestCompleted':
            effects = UserChangedMessage.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'UserChangedCollapsedVersion':
            effects = UserChangedChannelsConfig.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'LoadContactList':
        case 'LoadContactList_RequestCompleted':
            effects = LoadContactList.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'UserHideFilter':
        case 'UserHideFilter_Completed':
        case 'UserUndoHideFilter':
        case 'UserActualizeHideFilter':
            effects = UserHideFilter.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'UserSentMessageRequest':
        case 'UserSentMessageRequest_RequestCompleted':
        case 'UserAcceptedChatMessageRequest':
        case 'UserRejectedMessageRequest':
        case 'UserAcceptedChatMessageRequest_RequestCompleted':
        case 'UserRejectedChatMessageRequest_RequestCompleted':
            effects = UserChangedMessageRequest.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'UserChangedChatTitle':
        case 'UserChangedChatDescription':
        case 'UserChangedChatTitle_RequestCompleted':
        case 'UserChangedChatDescription_RequestCompleted':
        case 'UserRemovedChatPhoto':
        case 'UserSetChatPhoto':
        case 'UserRemovedChatPhoto_RequestCompleted':
        case 'UserChangedChatSettings':
        case 'UserChangedChatSettings_RequestCompleted':
        case 'UserChangedChatMessagesSettings':
        case 'UserChangedChatMessagesSettings_RequestCompleted':
            effects = UserChangedChat.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'UserOpenedConvoProfile':
        case 'UserOpenedConvoProfile_ConvoRequestCompleted':
        case 'UserOpenedConvoProfile_InviteLinksCompleted':
        case 'UserOpenedConvoProfile_UGCPackListsCompleted':
            effects = UserOpenedConvoProfile.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'UserChangedChatStickersDisplay':
        case 'UserChangedChatStickersDisplay_RequestCompleted':
            effects = UserChangedChatStickersDisplay.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'LoadImportantMessages':
        case 'LoadImportantMessages_RequestCompleted':
        case 'UserClosedImportantMessages':
            effects = LoadImportantMessages.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'UserCreatedFolder':
            effects = UserCreatedFolder.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'UserUpdatedFolder':
        case 'UserUpdatedFolder_UpdateRequestCompleted':
            effects = UserUpdatedFolder.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'UserDeletedFolder':
        case 'UserDeletedFolder_DeleteRequestCompleted':
            effects = UserDeletedFolder.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'UserHaveSeenPopupAnimation':
            effects = UserHaveSeenPopupAnimation.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'UserReorderedFolders':
        case 'UserReorderedFolders_ReorderRequestCompleted':
            effects = UserReorderedFolders.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'UserScrolledChannelHistory':
        case 'UserScrolledChannelHistory_RequestSucceed':
        case 'UserScrolledChannelHistory_RequestFailed':
            effects = UserScrolledChannelHistory.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'UserOpenedChannel':
        case 'UserClosedChannel':
        case 'UserOpenedChannel_ChannelRequestCompleted':
        case 'UserOpenedChannel_NotFoundChannelRequestCompleted':
        case 'UserOpenedChannel_ChannelMissingInfoRequestCompleted':
            effects = UserOpenedChannel.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'UserChangedChatMember':
        case 'UserChangedChatMember_RequestCompleted':
        case 'UserRemoveIncognitoMember':
        case 'UserRemoveIncognitoMember_RequestCompleted':
            effects = UserChangedChatMember.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'UserRequestChatInvitationLink':
        case 'UserRequestChatInvitationLink_RequestCompleted':
        case 'UserResetChatInvitationLink':
        case 'UserResetChatInvitationLink_RequestCompleted':
            effects = UserRequestChatInvitationLink.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'LoadChatMembers':
        case 'LoadChatMembers_RequestComplete':
            effects = LoadChatMembers.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'LoadChatInfo':
        case 'LoadChatInfo_RequestComplete':
            effects = LoadChatInfo.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'UserChangedChannel':
        case 'UserChangedChannel_RequestCompleted':
        case 'UserSetChannelPhoto':
        case 'UserUpdateChannelInfo':
        case 'UserLeftChannel':
        case 'UserAcceptedModerationWarning':
            effects = UserChangedChannel.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'UserChangedManagedGroup':
        case 'UserChangedManagedGroup_RequestCompleted':
            effects = UserChangedManagedGroup.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'UserChangedChannelPost':
        case 'UserChangedChannelPost_RequestCompleted':
            effects = UserChangedChannelPost.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'UserOpenedSpace':
        case 'UserClosedSpace':
        case 'UserOpenedSpace_RequestCompleted':
            effects = UserOpenedSpace.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'UserReadPost':
        case 'UserReadPost_ThrottleTimedOut':
        case 'UserReadPost_RequestCompleted':
            effects = UserReadPost.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'UserLoadedCommentsHistory':
        case 'UserLoadedCommentsHistory_RequestSucceed':
        case 'UserLoadedCommentsHistory_RequestFailed':
        case 'UserInvalidatedCommentsHistory':
        case 'UserInvalidatedCommentsHistory_RequestCompleted':
            effects = UserLoadedCommentsHistory.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'ChannelsOnboardingDone':
        case 'ChannelsOnboardingDone_RequestSucceeded':
        case 'ChannelsOnboardingDone_RequestFailed':
            effects = ChannelsOnboardingDone.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'UserChangedComposerDraft':
        case 'UserClearedComposerDraft':
        case 'ComposerDraftsUpdateNeeded':
        case 'ActualizeComposerDraft':
        case 'ActualizeComposerDraft_RequestCompleted':
            effects = UserChangedComposerDraft.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'ResetUpdatesCounter':
        case 'ResetUpdatesCounter_RequestCompleted':
            effects = ResetUpdatesCounter.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'UserProfileInfo_Update':
            effects = UserProfileInfo.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'UnavailabilitySchedule_Update':
            effects = UnavailabilitySchedule.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'UserChangedMessageAttachment':
        case 'UserChangedMessageAttachment_RequestCompleted':
            effects = UserChangedMessageAttachment.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'UserChangedComment':
        case 'UserChangedComment_RequestCompleted':
            effects = UserChangedComment.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'UserLoadedLikes':
        case 'UserLoadedLikes_RequestCompleted':
        case 'UserChangedLike':
        case 'UserChangedLike_RequestCompleted':
            effects = UserLikeActions.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'UserChangedBrowserNotifications':
        case 'UserChangedBrowserNotifications_RequestCompleted':
            effects = UserChangedBrowserNotifications.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'UserSetMessageReaction':
        case 'UserSetMessageReaction_RequestCompleted':
        case 'UserUnsetMessageReaction':
        case 'UserUnsetMessageReaction_RequestCompleted':
            effects = UserSetMessageReaction.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'ImportContact':
            effects = ImportContact.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'VideoMessageShapesGetById':
        case 'VideoMessageShapesGetById__RequestCompleted':
            effects = VideoMessageActions.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'UserChangedPostAttachment':
        case 'UserChangedPostAttachment_RequestCompleted':
            effects = UserChangedPostAttachment.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'PollFallenConvos':
        case 'PollFallenConvos_RequestSucceed':
        case 'InitPollFallenConvos':
        case 'DisposePollFallenConvos':
            effects = PollFallenConvos.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'PollConvoReactions':
        case 'PollConvoReactions_RequestSucceed':
            effects = PollConvoReactions.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'UserChangedChannelComposerDraft':
        case 'UserClearedChannelComposerDraft':
            effects = UserChangedChannelComposerDraft.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'UserHitPostSend':
        case 'UserHitPostSend_RequestCompleted':
            effects = UserHitPostSend.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'UserHitPostponedPostSend':
        case 'UserHitPostponedPostPublish':
            effects = UserHitPostponedPostSend.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'InvalidateMessageReactions':
        case 'InvalidateMessageReactions_RequestCompleted':
            effects = InvalidateMessageReactions.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'UserChangedPushSetting':
        case 'UserChangedPushSetting_RequestCompleted':
            effects = UserChangedPushSetting.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'UserScrolledConvoHistory':
        case 'UserScrolledConvoHistory_RequestSucceed':
        case 'UserScrolledConvoHistory_RequestFailed':
        case 'MessagesHistoryWarmUp':
        case 'MessagesHistoryWarmUp_RequestSucceed':
        case 'MessagesHistoryWarmUp_RequestFailed':
            effects = UserScrolledConvoHistory.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'UserReadAllReactions':
        case 'UserReadAllReactions_RequestCompleted':
            effects = UserReadAllReactions.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'PollChannelPosts':
        case 'PollChannelPosts_RequestSucceed':
            effects = PollChannelPosts.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'LoadRecommendedFolders':
        case 'LoadRecommendedFolders_RequestComplete':
            effects = LoadRecommendedFolders.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'GetUserDetails':
        case 'SetUserNote':
        case 'SetUserNote_RequestCompleted':
        case 'GetUserDetails_RequestCompleted':
            effects = ManageUserDetails.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'UserHitCommentSend':
        case 'UserHitCommentSend_RequestCompleted':
        case 'UserHitCommentSend_HistoryRequestCompleted':
            effects = UserHitCommentSend.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'UserChangedCommentsComposerDraft':
        case 'UserClearedCommentsComposerDraft':
            effects = UserChangedCommentsComposerDraft.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'UserHitEditComment':
        case 'UserHitEditComment_RequestCompleted':
            effects = UserHitEditComment.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'UserScrolledChannelPostponedHistory':
        case 'UserScrolledChannelPostponedHistory_RequestFailed':
        case 'UserScrolledChannelPostponedHistory_RequestSucceed':
            effects = UserScrolledChannelPostponedHistory.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'UserClosedChannelPostponed': {
            effects = UserClosedChannelPostponed.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        }
        case 'UserHitPostponedPostEdit':
        case 'UserHitPostponedPostEditTime': {
            effects = UserHitPostponedPostEdit.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        }
        case 'UserSetChannelReaction':
        case 'UserSetChannelReaction_RequestCompleted':
        case 'UserUnsetChannelReaction':
        case 'UserUnsetChannelReaction_RequestCompleted':
            effects = UserSetChannelReaction.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'UserHideConversationsBar':
            effects = UserHideConversationsBar.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'UserHideConvoBanner':
            effects = UserHideConvoBanner.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'UserHitPostEdit':
        case 'UserHitPostEdit_RequestCompleted':
            effects = UserHitPostEdit.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'ConvoMediaViewerCacheRemoved':
        case 'ConvoMediaViewerCacheInserted':
            effects = ConvoMediaViewerCache.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'ChannelMediaViewerCacheRemoved':
        case 'ChannelMediaViewerCacheInserted':
            effects = ChannelMediaViewerCache.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'SettingsFromApiLoaded':
        case 'SettingsFromApiLoaded_RequestCompleted':
            effects = SettingsFromApiLoaded.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'SettingsThemeStyleUpdated':
        case 'SettingsThemeStyleUpdated_RequestCompleted':
            effects = SettingsThemeStyleUpdated.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'UserLoadedUrlSnippets':
        case 'UserLoadedUrlSnippets_RequestCompleted':
        case 'UserLoadedUrlSnippets_ThrottleTimedOut':
            effects = UserLoadedUrlSnippets.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'HideEduIntegrationBanner':
        case 'ShowEduIntegrationBanner':
            effects = EduIntegrationBannerChanged.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'UserReportAttach':
            effects = UserReportAttach.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'UserJoinedSpace':
        case 'UserJoinedSpace_RequestCompleted':
        case 'UserLeftSpace':
        case 'UserLeftSpace_RequestCompleted':
            effects = UserJoinedSpace.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'UserChangedSpaceMute':
        case 'UserChangedSpaceMute_RequestCompleted':
            effects = UserChangedSpaceMute.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'UserCreatedSpaceSection':
            effects = UserCreatedSpaceSection.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'UserCreatedSpaceRoom':
            effects = UserCreatedSpaceRoom.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'UserUpdatedSpaceRoom':
            effects = UserUpdatedSpaceRoom.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'LoadCommentGroups':
        case 'LoadCommentGroups_RequestComplete':
            effects = LoadCommentGroups.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'UserChangedSpace':
        case 'UserChangedSpace_RequestCompleted':
            effects = UserChangedSpace.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'UserOpenedVideoChat':
        case 'UserOpenedVideoChat_RequestCompleted':
        case 'UserOpenedVideoChat_RequestFailed':
        case 'UserClosedVideoChat':
        case 'VideoEngineBatchReceived':
            effects = UserOpenedVideoChat.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'MoreVideoCommentsNeeded':
        case 'MoreVideoCommentsNeeded_RequestCompleted':
            effects = MoreVideoCommentsNeeded.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'UserChangedVideoComment':
        case 'UserChangedVideoComment_RequestCompleted':
            effects = UserChangedVideoComment.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'UserHitVideoCommentSend':
        case 'UserHitVideoCommentSend_RequestCompleted':
            effects = UserHitVideoCommentSend.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'UserBannedChannelPeer':
        case 'UserBannedChannelPeer__RequestCompleted':
        case 'UserUnbannedChannelPeer':
        case 'UserUnbannedChannelPeer__RequestCompleted':
            effects = UserChangedChannelPeerBan.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'VideoUpdateReceived':
            effects = VideoUpdateReceived.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'CountersUpdate':
            effects = CountersUpdate.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'VKCOMRightColumnConvosUpdated':
        case 'VKCOMRightColumnDataUpdated':
        case 'VKCOMRightColumnDataInit':
        case 'VKCOMRightColumnDataLoadConvos':
        case 'VKCOMRightColumnDataLoadConvos_RequestCompleted':
            effects = VKCOMRightColumnConvosUpdated.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'UserOpenedPostponedMessagesHistory':
        case 'UserOpenedPostponedMessagesHistory_RequestCompleted':
        case 'UserOpenedPostponedMessagesHistory_RequestFailed':
            effects = UserOpenedPostponedMessagesHistory.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'ContainerSizeUpdate':
            effects = ContainerSizeUpdate.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'MockUpdate':
        case 'MockUpdate_RequestCompleted':
            effects = MockUpdate.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'AddConvosToSearchIndex':
            effects = AddConvosToSearchIndex.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'LoadChannelPosts':
        case 'LoadChannelPosts_RequestCompleted':
            effects = LoadChannelPosts.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'ChannelsMarkPostAsFake':
            effects = ChannelsMarkPostAsFake.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'LoadCommunityTemplates':
        case 'LoadCommunityTemplates_RequestCompleted':
        case 'DeleteCommunityTemplate':
        case 'DeleteCommunityTemplate_RequestCompleted':
        case 'EditCommunityTemplate':
        case 'EditCommunityTemplate_RequestCompleted':
        case 'AddCommunityTemplate':
        case 'AddCommunityTemplate_RequestCompleted':
            effects = CommunityTemplates.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'LoadGroupBannedUser':
        case 'LoadGroupBannedUser_RequestCompleted':
            effects = LoadGroupBannedUser.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        case 'ChannelsRecommendationsLoad':
        case 'ChannelsRecommendationsLoad_RequestCompleted':
            effects = ChannelsRecommendationsLoad.handler(draft, action, featureFlags, envFeatureFlags);
            break;
        default:
            exhaustivenessCheck(action);
    }
    /**
     * Мы хотим, чтобы фейковые пир и конва всегда оставались неизменными.
     * Это защитит нас от "протечки" туда информации любого рода.
     * Поэтому мы просто их всегда перезаписываем из предыдущего состояния.
     *
     * Например, мы случайно обновим заголовок беседы на Администрация Вконтакте
     * и добавим туда сообщение с матом.
     * В теории такой кейс - это фантастика, но на всякий случай перестрахуемся.
     */
    draft.convos.set(Peer.resolveId(), Convo.safeGet(prevState.convos, Peer.resolveId()));
    draft.peers.set(Peer.resolveId(), Peer.safeGet(prevState.peers, Peer.resolveId()));
    draft.channels.set(Channel.resolveId(0), Channel.safeGet(prevState.channels, Channel.resolveId(0)));
    const nextState = finishDraft(draft);
    if (prevState.hiddenPinnedMessages !== nextState.hiddenPinnedMessages) {
        effects.push(async function storeHiddenPinnedMessages({ storage }) {
            storage.set('hidden-pinned-messages', Array.from(nextState.hiddenPinnedMessages.entries()).reduce((acc, [peerId, messageConvoLocalId]) => {
                acc[peerId] = messageConvoLocalId;
                return acc;
            }, {}));
            return {
                type: 'Noop',
            };
        });
    }
    if (prevState.hiddenBotKeyboards !== nextState.hiddenBotKeyboards) {
        effects.push(async function ({ storage }) {
            await storage.setIDB('hidden-bot-keyboards-ids', nextState.hiddenBotKeyboards);
            return { type: 'Noop' };
        });
    }
    if (nextState.organisers.filters.businessNotify.isHidden &&
        action.type !== 'Noop' &&
        action.type !== 'UserUndoHideFilter' &&
        document.visibilityState === 'visible') {
        const newUnreadCount = nextState.organisers.filters.businessNotify.unreadCount;
        effects.push(async function () {
            if (newUnreadCount === 0) {
                return {
                    type: 'Noop',
                };
            }
            return {
                type: 'UserUndoHideFilter',
                kind: 'businessNotify',
            };
        });
    }
    return [nextState, effects];
}
const handleInitialDataActions = (draft, action, featureFlags, envFeatureFlags) => {
    switch (action.type) {
        case 'InitialData': {
            const { ownerId, withCache } = action;
            const groupId = ownerId ? getOwnerGroupId(ownerId) : 0;
            const viewerId = draft.viewer.id;
            const loadInitialDataEffect = async ({ engine, api, storage, perfStats, envFeatureFlags, logger, }) => {
                const convosFailedMessages = await getConvosFailedMessagesFromStorage(storage);
                if (featureFlags.vkm_regex_parser) {
                    TextChunk.dontUse__enableNewParser__hack(1);
                }
                if (withCache) {
                    const [responseInfo, responseMultiAccount, responseProfileInfo, responseNotificationsSettings,] = await api.fetchMany([
                        {
                            method: 'account.getInfo',
                            params: {
                                fields: API_GET_INFO_FIELDS.join(','),
                            },
                        },
                        {
                            method: 'account.getMulti',
                            params: {
                                fields: API_GET_MULTI_FIELDS.join(','),
                            },
                        },
                        { method: 'account.getProfileInfo', params: {} },
                        { method: 'notifications.getSettings', params: {} },
                        // ВНИМАНИЕ!!!
                        // Будьте аккуратнее с добавлением методов сюда.
                        // Стоить помнить, что этот экзекьют блокирует загрузку приложения
                        // и, в случае ошибки одного из методов, ретраится заново.
                        // Эти ретраи будут давать доп нагрузку на все методы АПИ из батча.
                        // Поэтому добавлять сюда стоит лишь критические методы, без вызова которых
                        // невозможно запустить приложение или оно будет работать некорректно.
                        // Остальные данные стоит грузить асинхронно сразу после инициализации
                        // или по мере необходимости.
                        //
                        // Также если данные, которые вы получаете здесь не обновляются из LP событий, то их необходимо
                        // получать и в экшене InitialDataWithCached.
                    ], {
                        retries: 2,
                        // Выставляем большой таймаут, поскольку запрос большой
                        timeout: 20 * 1000,
                    });
                    const result = {
                        type: 'InitialDataWithCached_RequestCompleted',
                        responseMultiAccount,
                        responseProfileInfo,
                        serverUserSettings: {
                            ctrSubmitFromApi: Boolean(responseInfo.messages_multiline_input),
                            showRecommendations: !Boolean(responseInfo.messages_recommendation_list_hidden),
                            countOnlyNotMuted: Boolean(responseInfo.show_only_not_muted_messages ??
                                initialSettings.countOnlyNotMuted),
                            countChannels: Boolean(responseInfo.messages_counter_settings?.include_channels ??
                                initialSettings.countChannels),
                            countGroupDialogs: Boolean(responseInfo.messages_counter_settings?.include_group_dialogs ??
                                initialSettings.countGroupDialogs),
                            autoUnarchive: Boolean(responseInfo.messages_auto_unarchive),
                            businessNotify: Boolean(responseInfo.business_notify_enabled),
                            push: fromApiViewerPushSettings(responseNotificationsSettings),
                            teacherVerification: Boolean(responseInfo.settings?.find((setting) => setting.name ===
                                'messages_show_banner_teacher_verification')?.value === '1'),
                        },
                    };
                    return result;
                }
                const draftedConvoIdsToFetch = Object.keys(storage.get('drafts') || {});
                perfStats?.addEventData(IPerfStats.EventType.appStart, {
                    loadDataStart: perfStats.getCurrentTime(),
                });
                const folderTypes = featureFlags.vkm_optimized_app_start
                    ? API_GET_FOLDERS_TYPES.join(',')
                    : Folder.getSupportedTypes(featureFlags, envFeatureFlags);
                const initExtendedFilters = [
                    'credentials',
                    'server_version',
                    'profiles',
                    'contacts',
                    'groups',
                    'messages',
                ];
                if (groupId === 0) {
                    // Метод getDiff не поддерживаем данные фильтры для получения данных от лица сообщества.
                    initExtendedFilters.push('counters');
                    initExtendedFilters.push('folders');
                    initExtendedFilters.push('folders_with_peers');
                }
                const [responseGetDiff, responseConvosById, responseUsers, responseGroups, responseCounters, responseInfo, responseHelpHints, responseMultiAccount, responseMessagesConfig, responseProfileInfo, responseNotificationsSettings, reponseGroupsMessagesNotifySetting,] = await api.fetchMany([
                    {
                        method: 'messages.getDiff',
                        params: {
                            lp_version: engine.version,
                            conversations_limit: CONVOS_PER_PAGE,
                            extended_filters: initExtendedFilters.join(','),
                            group_id: groupId,
                            counter_filters: 'all',
                            supported_types: folderTypes,
                        },
                    },
                    {
                        method: 'messages.getConversationsById',
                        params: {
                            peer_ids: [viewerId.toString(), ...draftedConvoIdsToFetch].join(','),
                            group_id: groupId,
                            extended: 1,
                        },
                    },
                    {
                        method: 'users.get',
                        params: {},
                    },
                    groupId !== 0 && {
                        method: 'groups.getById',
                        params: {
                            group_ids: String(groupId),
                        },
                    },
                    groupId !== 0 && {
                        method: 'messages.getCounters',
                        params: {
                            filter: 'all',
                            group_id: groupId,
                        },
                    },
                    {
                        method: 'account.getInfo',
                        params: {
                            fields: API_GET_INFO_FIELDS.join(','),
                        },
                    },
                    {
                        method: 'account.getHelpHints',
                        params: {
                            hints: API_GET_HELP_HINTS.join(','),
                        },
                    },
                    {
                        method: 'account.getMulti',
                        params: {
                            fields: API_GET_MULTI_FIELDS.join(','),
                        },
                    },
                    {
                        method: 'messages.getConfig',
                        params: {},
                    },
                    { method: 'account.getProfileInfo', params: {} },
                    { method: 'notifications.getSettings', params: {} },
                    {
                        method: 'settingsGeneral.getNotifySettings',
                        params: {
                            page: 'group_messages',
                            sections: 'notify_group_messages',
                        },
                    },
                    // ВНИМАНИЕ!!!
                    // При внесении изменений в параметры или методы выше,
                    // обязательно требуется делать их и в префетче:
                    // www/VK/API/PrefetchReforgedMessenger.php::prefetch .
                    //
                    // Будьте аккуратнее с добавлением методов сюда.
                    // Стоить помнить, что этот экзекьют блокирует загрузку приложения
                    // и, в случае ошибки одного из методов, ретраится заново.
                    // Эти ретраи будут давать доп нагрузку на все методы АПИ из батча.
                    // Поэтому добавлять сюда стоит лишь критические методы, без вызова которых
                    // невозможно запустить приложение или оно будет работать некорректно.
                    // Остальные данные стоит грузить асинхронно сразу после инициализации
                    // или по мере необходимости.
                    //
                    // Также если данные, которые вы получаете здесь не обновляются из LP событий, то их необходимо
                    // получать и в экшене InitialDataWithCached.
                ], {
                    retries: Infinity,
                    // Выставляем большой таймаут, поскольку запрос большой
                    timeout: 20 * 1000,
                    usePrefetch: true,
                });
                const prefetchedStats = api.getPrefetchedStats?.() ?? [];
                const notPrefetchedMethods = prefetchedStats
                    .filter(
                /**
                 * Отфильтровываем execute, так как он попадет автоматом,
                 * если не запрефетчился один из его запросов.
                 */
                ({ method, isPrefetched }) => !isPrefetched && method !== 'execute')
                    .map(({ method }) => method);
                perfStats?.addEventData(IPerfStats.EventType.appStart, {
                    loadDataEnd: perfStats.getCurrentTime(),
                    notPrefetchedMethodsCount: notPrefetchedMethods.length,
                });
                if (notPrefetchedMethods.length) {
                    logger.info(`Prefetch старта приложения не отработал для методов: ${notPrefetchedMethods.join(', ')}`);
                }
                if (!responseGetDiff.credentials?.server_lp ||
                    !responseGetDiff.credentials?.key ||
                    !responseGetDiff.credentials?.ts) {
                    throw new Error('Отсутствует credentials');
                }
                if (responseGetDiff.server_version === undefined) {
                    throw new Error('Отсутствует pts');
                }
                engine.connect({
                    server: responseGetDiff.credentials.server_lp,
                    key: responseGetDiff.credentials.key,
                    ts: responseGetDiff.credentials.ts,
                    pts: responseGetDiff.server_version,
                    featureFlags: featureFlags,
                });
                const responseGroup = responseGroups?.groups?.[0];
                const responseGroupsTags = responseGroup?.is_tags_available &&
                    (await api.fetch('groups.getTagList', { group_id: groupId }, { retries: 3 }));
                const responseViewer = responseUsers[0];
                const profiles = responseGetDiff.profiles;
                const groups = responseGetDiff.groups;
                const contacts = responseGetDiff.contacts;
                const counters = responseGetDiff.counters || responseCounters || undefined;
                const folders = responseGetDiff.folders || {
                    items: [],
                    count: 0,
                    included_lists_info: [],
                };
                const convosWithMessage = responseGetDiff.conversations_info?.reduce((acc, { conversation, message }) => {
                    if (conversation) {
                        acc.push({
                            conversation,
                            last_message: message?.[0] || undefined,
                        });
                    }
                    return acc;
                }, []) || [];
                // Не может быть: мы должны были получить текущего пользователя
                if (!responseViewer) {
                    throw new Error('Не удалось получить текущего пользователя');
                }
                const messagesApiConfig = responseMessagesConfig.config ?? {};
                const [messagesConfig, settingsWrittenToApi] = getMessagesConfig(storage, messagesApiConfig, envFeatureFlags, featureFlags);
                // Получаем глобальную настройку мьюта/анмьюта сообщений в сообществах
                const groupsMessagesNotifySettingIsChecked = reponseGroupsMessagesNotifySetting?.sections?.find((s) => s.id === 'notify_group_messages')?.params?.[0]?.is_checked;
                const groupsMessagesNotifySetting = groupsMessagesNotifySettingIsChecked === undefined
                    ? true
                    : groupsMessagesNotifySettingIsChecked;
                const deviceId = storage.get('reforged-device-id') || nanoid();
                storage.set('reforged-device-id', deviceId);
                const eduIntegrationBanner = storage.get('edu-integration-banner');
                const storageShowThemeStyles = storage.get('settings-show-theme-styles');
                const allConvos = [...convosWithMessage, ...responseConvosById.items];
                const peersToCheck = new Map(allConvos.map((apiConvo) => {
                    const peerId = 'conversation' in apiConvo
                        ? Peer.resolveId(apiConvo.conversation.peer.id)
                        : Peer.resolveId(apiConvo.peer.id);
                    const inReadBy = 'conversation' in apiConvo
                        ? Message.resolveCmid(apiConvo.conversation.in_read_cmid)
                        : Message.resolveCmid(apiConvo.in_read_cmid);
                    return [peerId, inReadBy];
                }));
                updateRemindAnswerStorageOnConvoLoad(storage, peersToCheck);
                const storedRemindAnswer = await getRemindAnswerFromStorage(storage);
                const hiddenBotKeyboards = (await storage.getIDB('hidden-bot-keyboards-ids')) ||
                    /**
                     * Миграция данных из локал стораджа в IDB, так как пришлось
                     * сохранять данные скрытых клавиатур целиком между сессиями,
                     * чтобы отслеживать обновления.
                     * https://jira.mvk.com/browse/ME-76585
                     */
                    [...(storage.get('hidden-bot-keyboards') ?? [])].reduce((result, peerId) => {
                        result.set(peerId, BotKeyboard.BOT_KEYBOARD_DEFAULT_ID);
                        return result;
                    }, new Map());
                const result = {
                    type: 'InitialData_RequestCompleted',
                    responseViewer,
                    responseMultiAccount,
                    responseGroup,
                    profiles,
                    groups,
                    contacts,
                    convosWithMessage,
                    responseProfileInfo,
                    responseConvosById,
                    responseMessagesConfig,
                    hasMoreConvos: convosWithMessage.length >= CONVOS_PER_PAGE,
                    folders,
                    tags: responseGroupsTags || undefined,
                    activeCallsCount: counters?.calls || 0,
                    unreadCount: {
                        messages: responseGroup
                            ? responseGroup.unread_count || 0
                            : counters?.messages || 0,
                        messagesUnmuted: responseGroup
                            ? responseGroup.unread_count || 0
                            : counters?.messages_unread_unmuted || 0,
                        archive: counters?.messages_archive_unread || 0,
                        archiveMentions: counters?.messages_archive_mentions_count || 0,
                        archiveTotal: counters?.messages_archive || 0,
                        messageRequest: counters?.message_requests || 0,
                        businessNotify: counters?.business_notify || 0,
                        businessNotifyTotal: counters?.business_notify_all || 0,
                        channelsTotal: counters?.channels?.total_count || 0,
                        channelsUnmuted: counters?.channels?.unmuted_count || 0,
                        folders: counters?.messages_folders || [],
                        groups_folder: counters?.groups_folder,
                        adTag: counters?.ad_tag || 0,
                        important: counters?.important || 0,
                        unanswered: counters?.unanswered || 0,
                    },
                    convoLp: {
                        pts: responseGetDiff.server_version,
                    },
                    hiddenPinnedMessages: storage.get('hidden-pinned-messages'),
                    hiddenBotKeyboards,
                    composerDrafts: ComposerDraft.validateRequiredFields(storage.get('drafts') || {}),
                    composerPostponedDrafts: ComposerDraft.validateRequiredFields(storage.get('postponedDrafts') || {}),
                    channelComposerDrafts: ChannelComposerDraft.validateRequiredFields(storage.get('channels-drafts') || {}),
                    commentsComposerDrafts: storage.get('comments-drafts') || {},
                    businessNotifyManuallyHidden: !!storage.get('business-notify-manually-hidden'),
                    userSettings: {
                        isStickersAnimationEnabled: true,
                        isPopupStickersAutoplaySettingEnabled: false,
                        isPopupStickersInterruptCounterEnabled: false,
                        ctrSubmitFromApi: Boolean(responseInfo.messages_multiline_input),
                        soundNotifications: storage.get('settings-sound-notifications-on') ?? true,
                        browserNotifications: Boolean(storage.get('settings-browser-notifications-on')) ??
                            false,
                        showRecommendations: !Boolean(responseInfo.messages_recommendation_list_hidden),
                        countOnlyNotMuted: Boolean(responseInfo.show_only_not_muted_messages ??
                            initialSettings.countOnlyNotMuted),
                        countChannels: Boolean(responseInfo.include_channel_notifications ??
                            initialSettings.countChannels),
                        countGroupDialogs: Boolean(responseInfo.messages_counter_settings?.include_group_dialogs ??
                            initialSettings.countGroupDialogs),
                        autoUnarchive: Boolean(responseInfo.messages_auto_unarchive),
                        businessNotify: Boolean(responseInfo.business_notify_enabled),
                        push: storage.get('settings-push') ??
                            fromApiViewerPushSettings(responseNotificationsSettings),
                        teacherVerification: Boolean(responseInfo.settings?.find((setting) => setting.name === 'messages_show_banner_teacher_verification')?.value === '1'),
                        hasAudioMetaInfo: Boolean(responseInfo.audio_permissions?.audio_meta_info),
                        eduAccountSwitchBanner: messagesConfig.eduAccountSwitchBanner,
                        verticalFoldersView: messagesConfig.verticalFoldersView,
                        messageReactionAnimation: messagesConfig.messageReactionAnimation,
                        autoExtendReactionPicker: messagesConfig.autoExtendReactionPicker,
                        performanceTweaksEnabled: messagesConfig.performanceTweaksEnabled,
                        fastActionsTriggerFromApi: messagesConfig.fastActionsTriggerFromApi,
                        theme: messagesConfig.theme,
                        themeStyleId: messagesConfig.themeStyleId,
                        showThemeStyles: envFeatureFlags.themeStyles
                            ? storageShowThemeStyles ?? true
                            : true,
                        bubblesTheme: messagesConfig.bubblesTheme,
                        messageSelfMentionHighlighting: messagesConfig.messageSelfMentionHighlighting,
                        stickerHintsEnabled: messagesConfig.stickerHintsEnabled,
                        callsEnabled: messagesConfig.callsEnabled,
                        convoListWidthPercent: messagesConfig.convoListWidthPercent,
                        videoMessageAutoplay: messagesConfig.videoMessageAutoplay,
                        shouldShowCompactModeButton: storage.get('settings-show-compact-mode-button') ?? true,
                        groupsMessagesNotifySetting: featureFlags.vkm_managed_groups_mute_unmute
                            ? groupsMessagesNotifySetting
                            : true,
                        featuresDisabledConvoBannerContent: messagesConfig.featuresDisabledConvoBannerContent,
                        layoutMode: messagesApiConfig.reforged_enabled === 'disabled'
                            ? 'one-column'
                            : 'two-column',
                    },
                    settingsWrittenToApi,
                    helpHints: responseHelpHints.items.reduce((acc, apiHint) => {
                        const hintResources = apiHint.resources || [];
                        acc.set(apiHint.id, hintResources);
                        return acc;
                    }, new Map()),
                    conversationsBar: responseInfo.conversations_bar,
                    convosFailedMessages,
                    themeAppearances: storage.get('theme-styles-appearances') || new Map(),
                    themeBackgrounds: storage.get('theme-styles-backgrounds') || new Map(),
                    themeStyles: storage.get('theme-styles')?.items || new Map(),
                    deviceId,
                    eduIntegrationBanner: {
                        isEnabled: !!messagesApiConfig.messages_featureblocks_enabled?.enabled_items?.includes(EDU_INTEGRATION_BANNER_ID),
                        hiddenAt: eduIntegrationBanner?.hiddenAt ?? null,
                        hiddenCount: eduIntegrationBanner?.hiddenCount ?? 0,
                    },
                    storedRemindAnswer,
                };
                return result;
            };
            if (withCache) {
                return [
                    async function handleInitialEngineConnect() {
                        return {
                            type: 'EngineBatchReceived',
                            variant: {
                                kind: 'FromEngineFailure',
                                now: Date.now(),
                            },
                        };
                    },
                    loadInitialDataEffect,
                ];
            }
            return [loadInitialDataEffect];
        }
        case 'InitialDataWithCached_RequestCompleted': {
            draft.viewer.profileInfo = fromApiViewerProfileInfo(action.responseProfileInfo);
            draft.viewer.accounts =
                action.responseMultiAccount.items.map(fromApiViewerAccount);
            draft.viewer.settings = {
                ...draft.viewer.settings,
                ...action.serverUserSettings,
            };
            const viewerId = draft.viewer.id;
            const ownerId = draft.ownerId;
            const shouldInitCalls = draft.viewer.settings.callsEnabled;
            draft.activeQueueIds = Queue.getInitialQueueIds(draft.organisers.folders, featureFlags);
            return [
                ...getAdditionalInfo({
                    viewerId,
                    ownerId,
                    queues: draft.activeQueueIds,
                    withCache: true,
                    featureFlags,
                }),
                async function initCalls({ calls }) {
                    if (shouldInitCalls) {
                        calls?.init?.();
                    }
                    return {
                        type: 'Noop',
                    };
                },
                async function initChannels({ channelEngine, channelWSEngine }) {
                    if (!channelEngine && !channelWSEngine) {
                        return {
                            type: 'Noop',
                        };
                    }
                    return {
                        type: 'ChannelEngineBatchReceived',
                        variant: {
                            kind: 'FromChannelEngine',
                            next: { kind: 'Failure' },
                        },
                    };
                },
            ];
        }
        case 'InitialData_RequestCompleted': {
            draft.eduIntegrationBanner = action.eduIntegrationBanner;
            draft.convosFailedMessages = action.convosFailedMessages;
            draft.convoConn = {
                status: 'running',
                pts: action.convoLp.pts,
                reconnectAttempts: 0,
            };
            draft.deviceId = action.deviceId;
            draft.activeCallsCount = action.activeCallsCount;
            draft.hiddenPinnedMessages = new Map(Object.entries(action.hiddenPinnedMessages || {}).map(([key, value]) => [
                Peer.resolveId(parseInt(key)),
                Message.resolveCmid(value),
            ]));
            draft.hiddenBotKeyboards = action.hiddenBotKeyboards;
            draft.composerDrafts = action.composerDrafts;
            draft.composerPostponedDrafts = action.composerPostponedDrafts;
            draft.channelComposerDrafts = action.channelComposerDrafts;
            draft.commentsComposerDrafts = action.commentsComposerDrafts;
            if (featureFlags.vkm_sublists_in_folder) {
                insertSublists(draft, action.folders.included_lists_info?.map(fromApiSublist));
            }
            if (action.tags?.length) {
                setTags(draft, action.tags.map((item) => fromApiTag(item)));
            }
            else if (!action.tags) {
                setTagsUnavailable(draft);
            }
            const convos = insertConvos(draft, action.convosWithMessage, featureFlags);
            const allFilterPeerIds = convos.map((convo) => convo.peerId);
            insertConvos(draft, action.responseConvosById.items, featureFlags);
            draft.organisers.filters.businessNotify.isHidden =
                !!action.businessNotifyManuallyHidden;
            Filters.push(draft.organisers.filters, 'all', convos, action.hasMoreConvos, featureFlags);
            if (!action.unreadCount.important) {
                Filters.push(draft.organisers.filters, 'important', [], false, featureFlags);
            }
            if (!action.unreadCount.unanswered) {
                Filters.push(draft.organisers.filters, 'unanswered', [], false, featureFlags);
            }
            if (!action.unreadCount.adTag) {
                Filters.push(draft.organisers.filters, 'adTag', [], false, featureFlags);
            }
            if (action.unreadCount.archiveTotal === 0) {
                Filters.push(draft.organisers.filters, 'archive', [], false, featureFlags);
            }
            if (action.unreadCount.messageRequest === 0) {
                Filters.push(draft.organisers.filters, 'messageRequest', [], false, featureFlags);
            }
            Filters.updateCounters(draft.organisers.filters, {
                unread: action.unreadCount.messages,
                unreadUnmuted: action.unreadCount.messagesUnmuted,
                archive: action.unreadCount.archive,
                archiveMentions: action.unreadCount.archiveMentions,
                archiveTotal: action.unreadCount.archiveTotal,
                messageRequests: action.unreadCount.messageRequest,
                businessNotify: action.unreadCount.businessNotify,
                businessNotifyTotal: action.unreadCount.businessNotifyTotal,
                adTag: action.unreadCount.adTag,
                important: action.unreadCount.important,
                unanswered: action.unreadCount.unanswered,
            });
            insertFolders(draft, action.folders.items.map(fromApiFolder), featureFlags, envFeatureFlags);
            action.unreadCount.folders?.forEach((counter) => {
                Folder.setUnreadCounters(draft.organisers.folders, Folder.resolveId(counter.folder_id), counter.total_count, counter.unmuted_count);
            });
            if (featureFlags.vkm_managed_groups_mute_unmute) {
                Folder.setManagedGroupsFolderCounter(draft.organisers.folders, action.unreadCount.groups_folder?.dialogs_count || 0, action.unreadCount.groups_folder?.dialogs_count_unmuted || 0);
            }
            ChannelFilters.updateCounters(draft.organisers.channelFilters, {
                unread: action.unreadCount.channelsTotal,
                unreadUnmuted: action.unreadCount.channelsUnmuted,
                // TODO: поменять с появлением архивов
                archiveTotal: 0,
            });
            insertPeers(draft, {
                apiUsers: [
                    ...(action.profiles || []),
                    ...(action.responseConvosById.profiles || []),
                ],
                apiGroups: [
                    ...(action.groups || []),
                    ...(action.responseConvosById.groups || []),
                ],
                apiContacts: [
                    ...(action.contacts || []),
                    ...(action.responseConvosById.contacts || []),
                ],
            });
            draft.viewer.profileInfo = fromApiViewerProfileInfo(action.responseProfileInfo);
            if (action.conversationsBar) {
                draft.conversationsBar = fromApiConversationsBar(action.conversationsBar);
            }
            const { user: viewer } = fromApiUser(action.responseViewer);
            draft.peers.set(viewer.id, viewer);
            draft.viewer.id = viewer.id;
            draft.viewer.accounts =
                action.responseMultiAccount.items.map(fromApiViewerAccount);
            const group = action.responseGroup
                ? fromApiGroup(action.responseGroup)
                : undefined;
            if (group) {
                draft.peers.set(group.id, group);
            }
            const ownerId = group ? group.id : viewer.id;
            draft.ownerId = ownerId;
            draft.viewer.settings = action.userSettings;
            draft.helpHints = action.helpHints;
            draft.themeStyles = action.themeStyles;
            draft.themeAppearances = action.themeAppearances;
            draft.themeBackgrounds = action.themeBackgrounds;
            const shouldInitCalls = draft.viewer.settings.callsEnabled;
            const languageLocale = draft.languageLocale;
            draft.activeQueueIds = Queue.getInitialQueueIds(draft.organisers.folders, featureFlags);
            const isChannelRecommendationsEnabled = draft.channelsConfig.isRecommendationsEnabled;
            if (action.storedRemindAnswer) {
                RemindAnswerToMessage.initStateFromStorage(draft.remindAnswerToMessage, action.storedRemindAnswer);
            }
            return [
                EngineBatchReceived.pollEngine(),
                ...getAdditionalInfo({
                    viewerId: viewer.id,
                    ownerId,
                    queues: draft.activeQueueIds,
                    withCache: false,
                    featureFlags,
                }),
                async function initCalls({ calls }) {
                    if (shouldInitCalls) {
                        calls?.init?.();
                    }
                    return {
                        type: 'Noop',
                    };
                },
                async function initChannels({ api, channelEngine, channelWSEngine, storage, }) {
                    if (!channelWSEngine && !channelEngine) {
                        return {
                            type: 'Noop',
                        };
                    }
                    let channelLpEngineConfig;
                    const wsEnabledInConfig = action.responseMessagesConfig.config?.channels?.ws_enabled;
                    const wsEngineEnabled = !!(channelWSEngine && wsEnabledInConfig);
                    const lpEngineEnabled = !!(!channelWSEngine && channelEngine);
                    if (wsEngineEnabled) {
                        // Первое подключение с пустой мапой, так как нет кэша
                        channelWSEngine.connect({ offsetMap: new Map(), userOffset: 0 });
                    }
                    if (lpEngineEnabled) {
                        channelLpEngineConfig = await api.fetch('channels.getLongPollServer', {}, { retries: Infinity });
                        channelEngine.connect(channelLpEngineConfig);
                    }
                    const selectedFromSearchChannelIds = storage.get('selected-channels-from-search') || [];
                    let additionalChannelIds = [...selectedFromSearchChannelIds];
                    try {
                        const loadRecommendationIds = async () => {
                            const recommendedChannelsFromCache = storage.get('channels-recomendations');
                            const shouldLoadRecommendations = !recommendedChannelsFromCache ||
                                recommendedChannelsFromCache.expiresAt < Date.now();
                            if (!shouldLoadRecommendations) {
                                return {
                                    recommendedChannelIds: recommendedChannelsFromCache.response,
                                    recommendationsVersion: recommendedChannelsFromCache.version || 1,
                                };
                            }
                            /**
                             * Хоть в типах к channels.getRecommendations указано, что канал придёт с последним постом
                             * но на деле для старых каналов ничего не меняли и последний пост в ответ не добавили (последий пост приходит только для новых каналов вкком).
                             * А старые уже каналы в стадии выпиливания.
                             * */
                            const res = await api.fetch('channels.getRecommendations', {
                                extended: 0,
                            });
                            const recommendedChannelIds = (res.items || []).map((item) => Channel.resolveId(item.channel.channel_id));
                            storage.set('channels-recomendations', {
                                expiresAt: Date.now() + Time.Day,
                                response: recommendedChannelIds,
                                version: res.recommendations_version || 1,
                            });
                            return {
                                recommendedChannelIds,
                                recommendationsVersion: res.recommendations_version || 1,
                            };
                        };
                        let recommendedChannelIds = [];
                        let recommendationsVersion = 1;
                        if (isChannelRecommendationsEnabled) {
                            const recommendsResp = await loadRecommendationIds();
                            recommendedChannelIds = recommendsResp.recommendedChannelIds;
                            recommendationsVersion = recommendsResp.recommendationsVersion;
                            additionalChannelIds = [
                                ...recommendedChannelIds,
                                ...selectedFromSearchChannelIds,
                            ];
                        }
                        const [responseChannels, additionalChannelsResponse, inboundRequestChannelsResponse, channelsConfig,] = await api.fetchMany([
                            {
                                method: 'channels.get',
                                params: {
                                    count: CHANNELS_PER_PAGE,
                                    extended: 1,
                                },
                            },
                            additionalChannelIds.length !== 0 && {
                                method: 'channels.getById',
                                params: {
                                    channel_ids: additionalChannelIds
                                        .map((channelId) => channelId.toString())
                                        .join(','),
                                    extended: 1,
                                },
                            },
                            featureFlags.vkm_channels_inbound_requests &&
                                !isChannelRecommendationsEnabled && {
                                method: 'channels.get',
                                params: {
                                    extended: 1,
                                    count: CHANNELS_INBOUND_REQUESTS_PER_PAGE,
                                    filter: 'inbound_request',
                                },
                            },
                            {
                                method: 'channels.getConfig',
                                params: {},
                            },
                        ], {
                            retries: Infinity,
                        });
                        return {
                            type: 'InitialData_ChannelsReadyForUse',
                            ts: channelLpEngineConfig?.ts,
                            lpEngineEnabled,
                            wsEngineEnabled,
                            channelsGetResponse: responseChannels,
                            additionalChannelsResponse: additionalChannelsResponse || undefined,
                            recommendedChannelIds,
                            channelsConfig: {
                                isRecommendationsEnabled: isChannelRecommendationsEnabled,
                                contentOptions: channelsConfig.channels_content_options,
                                moderatorMarkFakeNewsRightCsrfHash: channelsConfig.fake_news_hash,
                                recommendations: {
                                    lastCollapsedVersion: channelsConfig.last_collapsed_recommendations_version || 0,
                                    version: recommendationsVersion,
                                },
                            },
                            inboundRequestChannelsResponse: inboundRequestChannelsResponse || undefined,
                        };
                    }
                    catch {
                        return {
                            type: 'Noop',
                        };
                    }
                },
                async function initSpaces({ api, spaceEngine }) {
                    if (!spaceEngine) {
                        return {
                            type: 'Noop',
                        };
                    }
                    try {
                        const engineConfig = await api.fetch('spaces.getLongPollServer', {});
                        spaceEngine.connect(engineConfig);
                        return {
                            type: 'InitialData_SpacesReadyForUse',
                            ts: engineConfig.ts,
                            spacesGetResponse: await api.fetch('spaces.get', {}, { retries: Infinity }),
                        };
                    }
                    catch {
                        return { type: 'Noop' };
                    }
                },
                async function changeTheme() {
                    return {
                        type: 'SettingThemeUpdated',
                        value: action.userSettings.theme,
                    };
                },
                async function saveSettings() {
                    return {
                        type: 'SettingsFromApiLoaded',
                        value: action.settingsWrittenToApi,
                    };
                },
                envFeatureFlags.themeStyles &&
                    getLoadThemeStylesAction(ownerId, languageLocale),
                /**
                 * Подробная дока по фиче https://confluence.mvk.com/pages/viewpage.action?pageId=354185656
                 */
                ...(featureFlags.vkm_history_warm_up
                    ? UserScrolledConvoHistory.handler(draft, { type: 'MessagesHistoryWarmUp', convos, now: Date.now() }, featureFlags, envFeatureFlags)
                    : []),
                async function getStickersSettings() {
                    return {
                        type: 'LoadStickersSettingsFromApi',
                    };
                },
                // Отсылаем актуальное значение счётчика непрочитанных при инициализации
                async function updateCounters() {
                    return {
                        type: 'CountersUpdate',
                    };
                },
                allFilterPeerIds &&
                    async function addConvosToSearchIndex() {
                        return {
                            type: 'AddConvosToSearchIndex',
                            peerIds: allFilterPeerIds,
                        };
                    },
                async function initShortPollingConvos() {
                    return {
                        type: 'InitPollFallenConvos',
                    };
                },
            ];
        }
        case 'AdditionalInfo_RequestCompleted': {
            const { queueConfig, importantUsers, selectedFromSearchConvos, groups } = action;
            insertConvos(draft, [...(selectedFromSearchConvos?.items ?? []), ...importantUsers.items], featureFlags);
            insertPeers(draft, {
                apiUsers: [
                    ...(importantUsers.profiles ?? []),
                    ...(selectedFromSearchConvos?.profiles ?? []),
                ],
                apiGroups: [
                    ...(importantUsers.groups ?? []),
                    ...(selectedFromSearchConvos?.groups ?? []),
                    ...(groups?.items || []),
                ],
                apiContacts: [
                    ...(importantUsers.contacts ?? []),
                    ...(selectedFromSearchConvos?.contacts ?? []),
                ],
            });
            const managedGroups = groups?.items || [];
            insertManagedGroups(draft, managedGroups, featureFlags);
            if (!featureFlags.vkm_managed_groups_mute_unmute) {
                const totalManagedGroupsFolderUnreadCount = ManagedGroup.getUnreadTotalCount(draft.managedGroups);
                Folder.setManagedGroupsFolderCounter(draft.organisers.folders, totalManagedGroupsFolderUnreadCount, totalManagedGroupsFolderUnreadCount);
            }
            const importantUsersIds = importantUsers.items.reduce((acc, convo) => {
                const resultConvo = fromApiConvo(featureFlags, convo);
                if (resultConvo) {
                    acc.add(resultConvo.convo.peerId);
                }
                return acc;
            }, new Set());
            draft.importantUsers = importantUsersIds;
            const queues = Array.from(draft.activeQueueIds);
            const viewerId = draft.viewer.id;
            return [
                async function firstTimePollQueue({ queue }) {
                    queue.connect({
                        user_id: Peer.toRealId(viewerId),
                        ...queueConfig,
                        queueIds: queues,
                    });
                    return {
                        type: 'QueueBatchReceived',
                        next: await queue.poll(),
                    };
                },
                async function countersUpdate() {
                    if (managedGroups.length > 0) {
                        return { type: 'CountersUpdate' };
                    }
                    return { type: 'Noop' };
                },
            ];
        }
        case 'InitialData_ChannelsReadyForUse': {
            const { ts, lpEngineEnabled, wsEngineEnabled, channelsConfig, channelsGetResponse, recommendedChannelIds, additionalChannelsResponse, inboundRequestChannelsResponse, } = action;
            draft.channelConn.status = 'running';
            ts && (draft.channelConn.ts = ts);
            draft.channelsConfig.moderatorMarkFakeNewsRightCsrfHash =
                channelsConfig.moderatorMarkFakeNewsRightCsrfHash;
            draft.channelsConfig.recommendations = channelsConfig.recommendations;
            //Если надо потестировать кнопки, то поменяй на (1 << 0) | (1 << 1) | (1 << 2)
            draft.channelsConfig.contentOptions = channelsConfig.contentOptions;
            if (wsEngineEnabled) {
                draft.channelConn.userOffset = channelsGetResponse.user_version ?? 0;
                draft.channelConn.channelOffsetMap = new Map(channelsGetResponse.items?.map(({ channel }) => [
                    Channel.resolveId(channel.channel_id),
                    channel.version ?? 0,
                ]));
            }
            if (additionalChannelsResponse) {
                const additionalChannels = insertChannels(draft, {
                    apiChannels: additionalChannelsResponse.items || [],
                    apiGroups: additionalChannelsResponse.groups || [],
                    featureFlags,
                });
                recommendedChannelIds.forEach((channelId) => {
                    const wasRequested = additionalChannels.findIndex((channel) => channel.id === channelId) !== -1;
                    if (wasRequested) {
                        draft.channelsRecommendationsIds.push(channelId);
                    }
                });
            }
            if (inboundRequestChannelsResponse) {
                const insertedChannels = insertChannels(draft, {
                    apiChannels: inboundRequestChannelsResponse.items || [],
                    apiGroups: inboundRequestChannelsResponse.groups || [],
                    featureFlags,
                });
                const inboundRequestChannels = [];
                for (const { id } of insertedChannels) {
                    const channelDraft = draft.channels.get(id);
                    if (!channelDraft || channelDraft.kind !== 'Channel') {
                        continue;
                    }
                    Channel.setIsInboundRequest(channelDraft, true);
                    void inboundRequestChannels.push(channelDraft);
                }
                const inboundRequestChannelsTotalCount = inboundRequestChannelsResponse.total_count ||
                    inboundRequestChannels.length;
                const hasMore = inboundRequestChannelsTotalCount > inboundRequestChannels.length;
                ChannelFilters.push(draft.organisers.channelFilters, 'inboundRequest', inboundRequestChannels, hasMore);
                ChannelFilters.updateCounters(draft.organisers.channelFilters, {
                    inboundRequestsTotal: inboundRequestChannelsTotalCount,
                });
            }
            const channels = insertChannels(draft, {
                apiChannels: channelsGetResponse.items || [],
                apiGroups: channelsGetResponse.groups || [],
                featureFlags,
            });
            const hasMoreChannels = (channelsGetResponse.items?.length || 0) >= CHANNELS_PER_PAGE;
            ChannelFilters.push(draft.organisers.channelFilters, 'all', channels, hasMoreChannels);
            insertPeers(draft, {
                apiUsers: [
                    ...(channelsGetResponse.profiles || []),
                    ...(additionalChannelsResponse?.profiles || []),
                    ...(inboundRequestChannelsResponse?.profiles || []),
                ],
                apiGroups: [
                    ...(channelsGetResponse.groups || []),
                    ...(additionalChannelsResponse?.groups || []),
                    ...(inboundRequestChannelsResponse?.groups || []),
                ],
                apiContacts: [],
            });
            return [
                async function firstTimePollChannelEngine({ channelEngine, channelWSEngine, }) {
                    if (lpEngineEnabled && channelEngine) {
                        return {
                            type: 'ChannelEngineBatchReceived',
                            variant: {
                                kind: 'FromChannelEngine',
                                next: await channelEngine.poll(),
                            },
                        };
                    }
                    if (wsEngineEnabled && channelWSEngine) {
                        return {
                            type: 'ChannelEngineBatchReceived',
                            variant: {
                                kind: 'FromChannelEngine',
                                next: await channelWSEngine.poll(),
                            },
                        };
                    }
                    return {
                        type: 'Noop',
                    };
                },
            ];
        }
        case 'InitialData_ThemeStylesLoaded': {
            const { themeStyles, themeAppearances, themeBackgrounds } = action;
            draft.themeStyles = themeStyles;
            draft.themeAppearances = themeAppearances;
            draft.themeBackgrounds = themeBackgrounds;
            return [];
        }
        case 'InitialData_SpacesReadyForUse': {
            draft.spaceConn = {
                status: 'running',
                ts: action.ts,
                reconnectAttempts: 0,
            };
            insertSpaces(draft, action.spacesGetResponse.items, {
                apiConvos: [],
                apiUsers: [],
                apiGroups: [],
                apiSpaceCalls: [],
                apiSpaceTribunes: [],
            }, featureFlags);
            return [
                async function firstTimePollSpaceEngine({ spaceEngine }) {
                    if (!spaceEngine) {
                        return {
                            type: 'Noop',
                        };
                    }
                    return {
                        type: 'SpaceEngineBatchReceived',
                        variant: {
                            kind: 'FromSpaceEngine',
                            next: await spaceEngine.poll(),
                        },
                    };
                },
            ];
        }
        default:
            return [];
    }
};
const handleLoadVideoMessageShapesActions = (draft, action) => {
    switch (action.type) {
        case 'LoadVideoMessageShapes_RequestCompleted': {
            // Даже если в action нет videoMessageShapes, устанавливаем пустой Map, чтобы определить, что запрос завершился
            draft.videoMessageShapes =
                action.videoMessageShapes?.shapes.reduce((result, { id, raw_path }) => {
                    result.set(id, raw_path);
                    return result;
                }, new Map()) ?? new Map();
            return [];
        }
        default:
            return [];
    }
};
async function loadVideoMessageShapes({ api, storage, }) {
    const storageVideoMessageShapes = storage.get('videomessage-shapes');
    const NOW_TIMESTAMP = Math.round(new Date().getTime() / 1000);
    const DAY_IN_SEC = 60 * 60 * 24;
    const isStorageDataNotExpired = storageVideoMessageShapes &&
        storageVideoMessageShapes.expiresAt > NOW_TIMESTAMP;
    let response = null;
    if (isStorageDataNotExpired) {
        response = storageVideoMessageShapes.response;
    }
    else {
        try {
            response = await api.fetch('messages.getVideoMessageShapes', {
                client_version: storageVideoMessageShapes?.response.version ?? 0,
            }, {
                retries: 3,
            });
        }
        catch {
            // pass
        }
    }
    // Если в Storage были закешены shapes, то на бэк был передан client_version и в таком случае,
    // придут только новые шейпы (если они есть), поэтому необходимо мерджить локальные шейпы с новыми
    const responseMergedWithStorage = response
        ? {
            ...response,
            shapes: [
                ...(storageVideoMessageShapes?.response.shapes || []),
                ...response.shapes,
            ],
        }
        : null;
    if (!isStorageDataNotExpired && responseMergedWithStorage) {
        storage.set('videomessage-shapes', {
            response: responseMergedWithStorage,
            expiresAt: NOW_TIMESTAMP + DAY_IN_SEC,
        });
    }
    return responseMergedWithStorage;
}
export const IMPORTANT_USERS_COUNT = 10;
function getAdditionalInfo({ viewerId, ownerId, queues, withCache, featureFlags, }) {
    const groupId = getOwnerGroupId(ownerId);
    return [
        async ({ api, storage, logger }) => {
            const selectedFromSearchConvosIds = storage.get('selected-convos-from-search') ?? [];
            const queueIds = Array.from(queues)
                .map((queue) => `${queue}_${viewerId}`)
                .join(',');
            const [queueConfig, importantUsers, selectedFromSearchConvos, groups] = await api
                .fetchMany([
                {
                    method: 'queue.subscribe',
                    params: {
                        queue_ids: queueIds,
                    },
                },
                {
                    method: 'messages.searchConversations',
                    params: {
                        q: ' ',
                        count: IMPORTANT_USERS_COUNT,
                        extended: 1,
                        group_id: groupId,
                    },
                },
                !withCache &&
                    !groupId &&
                    !!selectedFromSearchConvosIds?.length && {
                    method: 'messages.getConversationsById',
                    params: {
                        peer_ids: selectedFromSearchConvosIds.join(','),
                        extended: 1,
                        group_id: groupId,
                    },
                },
                {
                    method: 'groups.get',
                    params: {
                        user_id: viewerId,
                        filter: 'editor,with_messages',
                        offset: 0,
                        count: 1000,
                        extended: 1,
                    },
                },
            ], { retries: Infinity })
                .catch((e) => {
                if (e.apiError?.method === 'messages.getConversationsById' &&
                    e.code === 100) {
                    logger.error(`Какая-то ошибка с пустым peer_ids в messages.getConversationsById. typeof selectedFromSearchConvosIds: ${typeof selectedFromSearchConvosIds}, stringyfied selectedFromSearchConvosIds: ${JSON.stringify(selectedFromSearchConvosIds)}`, e);
                }
                throw e;
            });
            return {
                type: 'AdditionalInfo_RequestCompleted',
                groups,
                queueConfig,
                importantUsers,
                selectedFromSearchConvos,
            };
        },
        async ({ api, storage }) => {
            const videoMessageShapes = await loadVideoMessageShapes({
                api,
                storage,
            });
            return {
                type: 'LoadVideoMessageShapes_RequestCompleted',
                videoMessageShapes,
            };
        },
        async ({ channelEngine }) => {
            if (!featureFlags.vkm_reactions) {
                return {
                    type: 'Noop',
                };
            }
            return {
                type: 'InvalidateMessageReactions',
                shouldFetchChannelReactionsMapping: !!channelEngine,
            };
        },
    ];
}
const getMessagesConfig = (storage, config, envFeatureFlags, featureFlags) => {
    const bubbleThemeLSValue = storage.get('settings-bubbles-theme');
    const rightClickActionsLSValue = storage.get('settings-right-click-actions-enabled');
    const verticalFoldersViewLSValue = storage.get('folders-view-vertical');
    const messageReactionsAnimationLSValue = storage.get('message-reactions-animation');
    const eduAccountSwitchBannerLSValue = storage.get('settings-edu-account-switch-banner-on');
    const autoExtendReactionsPickerLSValue = storage.get('settings-auto-extend-reaction-picker');
    const messageSelfMentionHighlightingLSValue = storage.get('settings-message-self-mention-highlighting');
    const themeLSValue = storage.get('theme');
    const themeStyleLSValue = storage.get('theme-style-id');
    const callsEnabledLSValue = storage.get('settings-calls-enabled');
    const enablePerformanceTweaksValue = storage.get('performance-tweaks-enabled');
    const videoMessageAutoplayLSValue = storage.get('video-message-autoplay');
    const hideCompactModeSwitchButtonLSValue = storage.get('settings-show-compact-mode-button');
    const bubblesTheme = getBubbleTheme(config.bubble_theme ?? bubbleThemeLSValue);
    // Вычисляем значения настроек
    const settings = {
        bubblesTheme,
        fastActionsTriggerFromApi: getFastActionTriggerFromApi(config.fast_action_type ?? rightClickActionsLSValue),
        verticalFoldersView: config.vertical_folders_view ??
            verticalFoldersViewLSValue ??
            initialSettings.verticalFoldersView,
        messageReactionAnimation: config.message_reactions_animation ??
            messageReactionsAnimationLSValue ??
            initialSettings.messageReactionAnimation,
        eduAccountSwitchBanner: config.edu_account_switch_banner ??
            eduAccountSwitchBannerLSValue ??
            initialSettings.eduAccountSwitchBanner,
        autoExtendReactionPicker: config.auto_extend_reactions_picker ??
            autoExtendReactionsPickerLSValue ??
            initialSettings.autoExtendReactionPicker,
        messageSelfMentionHighlighting: getSelfMentionHighlighting(config.message_self_mention_highlighting ??
            messageSelfMentionHighlightingLSValue),
        theme: getTheme(config.theme ?? themeLSValue),
        themeStyleId: getThemeStyle(config.theme_style ?? themeStyleLSValue, bubblesTheme, envFeatureFlags),
        stickerHintsEnabled: config.sticker_hints_enabled ?? initialSettings.stickerHintsEnabled,
        callsEnabled: 
        // @TODO Раскомментить в ME-61632
        /**config.callsEnabled ??*/
        callsEnabledLSValue ?? initialSettings.callsEnabled,
        performanceTweaksEnabled: enablePerformanceTweaksValue ?? initialSettings.performanceTweaksEnabled,
        convoListWidthPercent: config.chat_list_collapse ?? initialSettings.convoListWidthPercent,
        videoMessageAutoplay: videoMessageAutoplayLSValue ?? initialSettings.videoMessageAutoplay,
        shouldShowCompactModeButton: hideCompactModeSwitchButtonLSValue ??
            initialSettings.shouldShowCompactModeButton,
        featuresDisabledConvoBannerContent: featureFlags.vkm_degradation_convo_banner
            ? getConversationBar(config.conversation_bar)
            : null,
    };
    // Вычисляем настройки, которые необходимо перенести из LS в API
    const settingsWrittenToApi = {};
    if (config.bubble_theme === undefined && bubbleThemeLSValue !== undefined) {
        settingsWrittenToApi.bubble_theme = bubbleThemeLSValue === 'enabled';
    }
    if (config.vertical_folders_view === undefined &&
        verticalFoldersViewLSValue !== undefined) {
        settingsWrittenToApi.vertical_folders_view = verticalFoldersViewLSValue;
    }
    if (config.message_reactions_animation === undefined &&
        messageReactionsAnimationLSValue !== undefined) {
        settingsWrittenToApi.message_reactions_animation =
            messageReactionsAnimationLSValue;
    }
    if (config.edu_account_switch_banner === undefined &&
        eduAccountSwitchBannerLSValue !== undefined) {
        settingsWrittenToApi.edu_account_switch_banner =
            eduAccountSwitchBannerLSValue;
    }
    if (config.auto_extend_reactions_picker === undefined &&
        autoExtendReactionsPickerLSValue !== undefined) {
        settingsWrittenToApi.auto_extend_reactions_picker =
            autoExtendReactionsPickerLSValue;
    }
    if (config.message_self_mention_highlighting === undefined &&
        messageSelfMentionHighlightingLSValue !== undefined) {
        settingsWrittenToApi.message_self_mention_highlighting =
            messageSelfMentionHighlightingLSValue;
    }
    if (config.theme === undefined && themeLSValue !== undefined) {
        settingsWrittenToApi.theme = themeLSValue;
    }
    // @TODO Раскомментить в ME-61632
    // if (
    //   config.stickersAnimation === undefined &&
    //   stickersAnimationLSValue !== undefined
    // ) {
    //   settingsWrittenToApi.stickersAnimation = stickersAnimationLSValue
    // }
    // @TODO Раскомментить в ME-61632
    // if (config.callsEnabled === undefined && callsEnabledLSValue !== undefined) {
    //   settingsWrittenToApi.callsEnabled = callsEnabledLSValue
    // }
    return [settings, settingsWrittenToApi];
};
const getSelfMentionHighlighting = (mode) => {
    switch (mode) {
        case 'primary':
        case 'secondary':
            return mode;
        default:
            return initialSettings.messageSelfMentionHighlighting;
    }
};
const getTheme = (theme) => {
    switch (theme) {
        case 'light':
        case 'dark':
        case 'system':
            return theme;
        default:
            return initialSettings.theme;
    }
};
const getThemeStyle = (themeStyleId, bubblesTheme, envFeatureFlags) => {
    if (!envFeatureFlags.themeStyles) {
        return ThemeStyle.SYSTEM_STYLE_ID;
    }
    if (themeStyleId) {
        return themeStyleId;
    }
    /**
     * Раньше экшен переключения на бабловую тему 'UserChangedBubblesTheme' не включал
     * значение какой именно айди бабловой темы должен быть выбран.
     * Поэтому подразумевался по умолчанию 'mable'. Теперь мы меняем дефолтное значение на 'system'.
     * Это значит, что если мы просто раскатим такое изменение - то у всех у кого сейчас используется
     * стиль бабла по умолчанию ('mable') включится 'system'. Чтобы не сбрасывать их настройку, мы
     * смотрим на то, что пользователь включил себе бабловую тему messagesConfig.bubblesTheme === 'enabled'
     * и тогда оставим ему 'mable'. Записав айди в сторадж в будущем мы сможем удалить это условие, так как
     * значение у пользователей уже будет в хранилище (нам не понадобится уже знание, что раньше включение бабловой темы означало в первую
     * очередь включение темы 'mable')
     */
    if (bubblesTheme === 'enabled') {
        return ThemeStyle.MABLE_STYLE_ID;
    }
    return initialSettings.themeStyleId;
};
const getBubbleTheme = (theme) => {
    switch (theme) {
        case 'enabled':
        case true:
            return 'enabled';
        case 'disabled':
        case false:
            return 'disabled';
        case 'default':
            return 'default';
        default:
            return initialSettings.bubblesTheme;
    }
};
function getLoadThemeStylesAction(ownerId, languageLocale) {
    const groupId = getOwnerGroupId(ownerId);
    return async ({ api, storage }) => {
        /**
         * @TODO: удалить через какое-то время после раскатки ME-59780.
         * Чистим старые ключи, с невалидными данными
         */
        if (storage.get('theme-appearances')) {
            storage.del('theme-appearances');
        }
        if (storage.get('theme-backgrounds')) {
            storage.del('theme-backgrounds');
        }
        const storageThemeStyles = storage.get('theme-styles');
        const storageAppearances = storage.get('theme-styles-appearances') || new Map();
        const storageBackgrounds = storage.get('theme-styles-backgrounds') || new Map();
        const [enumerateAppearancesRes, enumerateBackgroundsRes, themeStylesRes, themeStyleLangsRes,] = await api.fetchMany([
            {
                method: 'messages.enumerateAppearances',
                params: { group_id: groupId },
            },
            {
                method: 'messages.enumerateBackgrounds',
                params: { group_id: groupId },
            },
            {
                method: 'messages.getConversationStyles',
                params: {
                    show_hidden: 1,
                },
            },
            {
                method: 'messages.getConversationStylesLang',
                params: {
                    lang: languageLocale,
                    version_hash: storageThemeStyles?.langVersionHash,
                },
            },
        ], {
            retries: 3,
        });
        const missingAppearanceIds = enumerateAppearancesRes.appearances.reduce((acc, apiAppearance) => {
            const appearanceId = ThemeStyle.resolveAppearanceId(apiAppearance.id);
            const appearance = storageAppearances.get(appearanceId);
            if (!appearance || appearance.updateTime < apiAppearance.update_time) {
                acc.push(appearanceId);
            }
            return acc;
        }, []);
        const missingBackgroundIds = enumerateBackgroundsRes.backgrounds.reduce((acc, apiBackground) => {
            const backgroundId = ThemeStyle.resolveBackgroundId(apiBackground.id);
            const background = storageBackgrounds.get(backgroundId);
            if (!background || background.updateTime < apiBackground.update_time) {
                acc.push(backgroundId);
            }
            return acc;
        }, []);
        if (missingAppearanceIds.length !== 0 ||
            missingBackgroundIds.length !== 0) {
            const [appearancesRes, backgroundsRes] = await api.fetchMany([
                missingAppearanceIds.length !== 0 && {
                    method: 'messages.getAppearances',
                    params: {
                        appearance_ids: missingAppearanceIds
                            .map((id) => id.toString())
                            .join(','),
                    },
                },
                missingBackgroundIds.length !== 0 && {
                    method: 'messages.getBackgrounds',
                    params: {
                        background_ids: missingBackgroundIds
                            .map((id) => id.toString())
                            .join(','),
                    },
                },
            ], {
                retries: 3,
            });
            appearancesRes?.appearances.forEach((apiAppearance) => {
                const appearance = fromApiAppearance(apiAppearance);
                storageAppearances.set(appearance.id, appearance);
            });
            backgroundsRes?.backgrounds.forEach((apiBackground) => {
                const background = fromApiBackground(apiBackground);
                storageBackgrounds.set(background.id, background);
            });
            storage.set('theme-styles-appearances', storageAppearances);
            storage.set('theme-styles-backgrounds', storageBackgrounds);
        }
        /**
         * В storage одноверменно храним информацию о переводах и самих стилях.
         * Если в запросе на языки пришел not_changed === true, значит переводы не изменились
         * и мы можем взять значения из кеша.
         */
        const useCachedLangs = themeStyleLangsRes.not_changed &&
            themeStyleLangsRes.lang === storageThemeStyles?.lang;
        const themeStyleLangs = themeStyleLangsRes.styles.reduce((acc, apiLang) => {
            acc.set(apiLang.id, apiLang.value);
            return acc;
        }, new Map());
        const themeStyles = themeStylesRes.items.reduce((acc, apiStyle) => {
            const themeStyleLang = useCachedLangs
                ? storageThemeStyles?.items.get(ThemeStyle.resolveStyleId(apiStyle.id))
                    ?.title
                : themeStyleLangs.get(apiStyle.id);
            // Невозможная ситуация, если бек прислал корректные данные
            if (!themeStyleLang) {
                return acc;
            }
            const style = fromApiStyle(apiStyle, themeStyleLang);
            acc.set(style.id, style);
            return acc;
        }, new Map());
        storage.set('theme-styles', {
            items: themeStyles,
            langVersionHash: themeStyleLangsRes.version_hash,
            lang: themeStyleLangsRes.lang,
        });
        return {
            type: 'InitialData_ThemeStylesLoaded',
            themeStyles,
            themeAppearances: storageAppearances,
            themeBackgrounds: storageBackgrounds,
        };
    };
}
const getFastActionTriggerFromApi = (value) => {
    switch (value) {
        case 'hover':
        case false:
            return 'hover';
        case 'rightClick':
        case 'right_button_click':
        case true:
            return 'rightClick';
        case 'hoverAndRightClick':
        case 'hover_and_right_button_click':
            return 'hoverAndRightClick';
        default:
            return initialSettings.fastActionsTriggerFromApi;
    }
};
const getConversationBar = (value) => {
    if (!value) {
        return null;
    }
    return {
        text: value.text,
        title: value.title || '',
        style: value.style || 'outage',
        button: value.buttons?.length && value.buttons[0]
            ? {
                layout: value.buttons[0]?.layout || 'tertiary',
                text: value.buttons[0]?.text || '',
                type: value.buttons[0]?.type || '',
                popup: value.buttons[0].popup
                    ? {
                        buttonText: value.buttons[0]?.popup?.button_text,
                        style: value.buttons[0]?.popup?.style || 'outage',
                        text: value.buttons[0]?.popup?.text,
                        title: value.buttons[0]?.popup?.title,
                    }
                    : undefined,
            }
            : undefined,
    };
};
//# sourceMappingURL=reducer.js.map