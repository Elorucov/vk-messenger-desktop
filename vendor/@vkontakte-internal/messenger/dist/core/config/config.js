export const CLIENT_ID = 7694673;
export const STATIC_BASE_URL = 'https://vk.com';
export const LANG_PACK_URL = 'https://vk.com/js/lang-pack.js?name=me&format=json';
export const ENGINE_VERSION = 21;
export const API_DEFAULT_TIMEOUT = 10 * 1000;
export const REACTIONS_REFRESH_INTERVAL = 15 * 1000;
export const COMMENTS_REFRESH_INTERVAL = 15 * 1000;
export const CONVO_REFRESH_INTERVAL = 15 * 60 * 1000;
export const CHAT_ONLINE_MEMBERS_REFRESH_INTERVAL = 5 * 60 * 1000;
export const API_MIN_RETRY_TIMEOUT = 500;
export const API_MAX_RETRY_TIMEOUT = 20 * 1000;
export const MAX_INT32 = 2 ** 31 - 1;
export const API_USER_FIELDS = [
    'id',
    'first_name',
    'first_name_gen',
    'first_name_acc',
    'first_name_ins',
    'first_name_dat',
    'last_name',
    'last_name_gen',
    'last_name_acc',
    'last_name_ins',
    'sex',
    'has_photo',
    'photo_id',
    'photo_50',
    'photo_100',
    'photo_200',
    'contact_name',
    'occupation',
    'bdate',
    'city',
    'screen_name',
    'online_info',
    'verified',
    'blacklisted',
    'blacklisted_by_me',
    'language',
    'can_call',
    'can_write_private_message',
    'can_send_friend_request',
    'can_invite_to_chats',
    'friend_status',
    'followers_count',
    'profile_type',
    'contacts',
    'employee_mark',
    'employee_working_state',
    'is_service_account',
    'image_status',
    'photo_base',
    'educational_profile',
    'edu_roles',
];
export const API_GROUP_COMMON_FIELDS = [
    'id',
    'name',
    'screen_name',
    'type',
    'photo_id',
    'photo_50',
    'photo_100',
    'members_count',
    'member_status',
    'verified',
    'is_closed',
    'can_message',
    'online_info',
    'deactivated',
    'activity',
    'ban_info',
    'is_messages_blocked',
    'can_send_notify',
    'can_post_donut',
    'site',
    'reposts_disabled',
    'description',
    'action_button',
    'menu',
    'role',
    'unread_count',
    'wall',
    'can_manage',
    'disallow_manage_reason',
    'age_limits',
    'warning_notification',
    /**
     * ВНИМАНИЕ!!!
     *
     * Когда добавляешь сюда поля, убедись, что они также
     * добавляются на стороне САКа для стартовой группы виджета.
     */
];
export const API_GROUP_FIELDS = [
    ...API_GROUP_COMMON_FIELDS,
    'is_tags_available',
    'msg_notifications_allowed',
];
export const API_CHANNEL_FIELDS = [...API_GROUP_COMMON_FIELDS];
export const API_GET_INFO_FIELDS = [
    'messages_recommendation_list_hidden',
    'show_only_not_muted_messages',
    'messages_multiline_input',
    'messages_auto_unarchive',
    'business_notify',
    'messages_show_banner_teacher_verification',
    'conversations_bar',
    'messages_counter_settings',
    'include_channel_notifications',
    '2fa_required',
];
export const API_GET_MULTI_FIELDS = [
    'profile_type',
    'photo_100',
    'is_service_account',
];
export const API_GET_HELP_HINTS = [
    'im:channels_onboarding',
    'im:web_send_options',
    'im:web_archive_location',
    'im:web_return_to_previous_chat',
    'im:reforged_classic_onboarding', // онбоардинг одноколоночного рефа в вкком (замена классического вида интерфейса)
    'im:groups_folder_counter', // онбординг каунтера сообщений сообществ
    /**
     * Включает модалку первого входа в каналы на вкком https://jira.mvk.com/browse/ME-67160
     * Хинт приходит только для вкком
     */
    'im:channels_first_entry',
    'voice_assistant:add_to_group_chat',
    'im:sending_postponed_messages',
    'im:postponed_messages_screen',
];
/**
 * В константе ниже должны быть перечислены
 * все значения из MessagesRecommendedFolderType.
 * Это важно для корректной работы prefetch'а данных
 * стартового вызова api.fetchMany .
 */
export const API_GET_FOLDERS_TYPES = [
    'channels',
    'business',
    'personal',
    'unread',
    'managed_groups',
];
export const YANDEX_MAPS_KEY = 'AKPeBEwBAAAA0qePSQIA03AwA4O4ze6XTqIecsNp7REB6VYAAAAAAAAAAADNzChqedeUxsCAyYkFUHiD7MPITA==';
export const CONVOS_PER_PAGE = 20;
export const CHANNELS_PER_PAGE = 20;
export const CHANNELS_INBOUND_REQUESTS_PER_PAGE = 20;
export const MANAGED_GROUPS_PER_PAGE = 20;
export const MESSAGES_PER_PAGE = 30;
export const POSTS_PER_PAGE = 20;
export const COMMENTS_PER_PAGE = 50;
export const THREAD_COMMENTS_COUNT = 2;
export const SEARCH_MESSAGES_COUNT = 20;
export const SEARCH_POSTS_COUNT = 20;
export const SEARCH_CONVOS_COUNT = 100;
export const SEARCH_CHANNELS_COUNT = 25;
export const SEARCH_DEBOUNCE_MS = 500;
export const LIKE_PEERS_PER_PAGE = 30;
export const LIKE_PEERS_FIRST_LOAD = 6;
export const TYPING_EXPIRATION_TIME = 5000;
export const CHANNELS_GLPH_TIMEOUT = 30 * 1000;
export const MAX_MESSAGES_FORWARD_LEVEL = 2;
export const MAX_VIDEO_FORWARD_LEVEL = 4;
export const VK_PAY_APP_ID = 7131443;
export const UGC_STICKERS_APP_ID = 51538586;
export const VMOJI_CONSTRUCTOR_APP_ID = 7929683;
export const STATUSES_APP_ID = 51890524;
export const VIDEO_COMMENTS_PER_PAGE = 20;
/**
 * Идентификатор MiniApp создания аватарки чата из стикеров в настройках чата
 */
export const STICKER_IMAGE_EDITOR_MINI_APP_ID = 7754294;
/**
 * Идентификатор MiniApp карточки сотрудника
 */
export const EMPLOYEE_CARD_MINI_APP_ID = 7631183;
/**
 * Идентификатор MiniApp настройки стикеров чата
 */
export const UGC_STICKERS_MINI_APP_ID = 51538586;
/**
 * Максимальное количество символов в сообщении
 */
export const MAX_MESSAGE_SIZE = 4096;
/**
 * Максимальное количество аттачей в сообщении
 */
export const MAX_MESSAGE_ATTACHES = 10;
/**
 * Максимальное количество пересланных сообщений
 */
export const MAX_FWD_COUNT = 100;
/**
 * Количество сообщений которое увидит пользователь если его пригласят в чат с показом истории чата
 */
export const INVITE_TO_CHAT_VISIBLE_MESSAGES_COUNT = 250;
/**
 * URL, с которого начинаются ссылки для приглашения в беседу
 */
export const CHAT_INVITE_LINK_URL_BASE = 'https://vk.me/join/';
/**
 * URL, с которого начинаются ссылки для приглашения в беседу, сгенерированные в web.vk.me
 */
export const VKME_CHAT_INVITE_LINK_URL_BASE = 'https://web.vk.me/#/join/';
/**
 * URL, с которого начинаются ссылки на звонок в обычном режиме
 */
export const CALL_JOIN_LINK_URL_BASE = 'https://vk.com/call/join/';
/**
 * URL, с которого начинаются короткие ссылки на звонок в web.vk.me
 */
export const CALL_JOIN_SHORTENED_LINK_URL_BASE = 'https://web.vk.me/call/';
/**
 * URL лендинга vk.me
 */
export const VKME_APP_INSTALL_LINK = 'https://vk.me/app';
/**
 * URL, с которого начинаются ссылки на звонок для изолированного режима
 */
export const ISOLATED_CALL_JOIN_LINK_URL_BASE = 'https://web.vk.me/#/call/join/';
/**
 * URL, с которого начинаются ссылки на звонок для изолированного режима (короткая ссылка)
 */
export const ISOLATED_CALL_JOIN_SHORTENED_LINK_URL_BASE = 'https://sferum.ru/';
/**
 * App_id приложения "Помощь"
 */
export const HELPDESK_MINIAPP_ID = 6126832;
/**
 * ID чата поддержки учебных профилей
 */
export const EDU_HELP_CONVO_ID = -222277107;
export const STORAGE_DB_NAME = 'reforged-storage-db-v1';
/**
 * Урл VKID
 */
export const ID_VK_COM_BASE = 'https://id.vk.com';
/**
 * Ключи в Storage для хранения текущего owner id, viewer id
 */
export const STORAGE_OWNER_ID_KEY = 'reforged-owner-id';
export const STORAGE_VIEWER_ID_KEY = 'reforged-viewer-id';
/**
 * Ключ в Storage для отображения плашки недоступности приложения
 */
export const STORAGE_APP_UNAVAILABLE_KEY = 'reforged-app-unavailable';
export const VK_TERMS_URL = 'https://vk.com/terms';
export const WEB_VK_ME_DOMAIN = 'web.vk.me';
export const MVK_DOMAINS = ['m.vk.com', 'm.vk.ru'];
export const VK_RU_DOMAIN = 'vk.ru';
export const VK_DOMAINS = ['vk.com', VK_RU_DOMAIN];
export const VK_SHORTENING_DOMAIN = 'vk.cc';
export const VK_RELATED_DOMAINS = [...VK_DOMAINS, VK_SHORTENING_DOMAIN, 'vk.me'];
export const SFERUM_DOMAIN = 'sferum.ru';
export const VKCOM_DOMAIN = 'vk.com';
/**
 * В будущем ссылки на чаты/звонки/каналы/посты в канале будут через специальный саб домен Сферума
 * */
export const SFERUM_INTEGRATIONS_DOMAIN = 'me.sferum.ru';
export const SFERUM_SHORTENING_DOMAIN = 'cc.sferum.ru';
export const SFERUM_RELATED_DOMAINS = [
    SFERUM_DOMAIN,
    SFERUM_INTEGRATIONS_DOMAIN,
];
export const SFERUM_VERIFICATION_LINK = `https://${SFERUM_DOMAIN}/?s=me`;
/**
 * Максимальное количество символов в комментарии
 */
export const MAX_COMMENT_SIZE = 2 ** 14; // 16384
export const POST_ADS_MINIAPP_ID = 51707812;
export const VK_DONUT_MINIAPP_ID = 7132546;
/**
 * Дефолтное значение статуса группы для SAK
 * @vkontakte-internal/api-schema-typescript/dist/objects/groups/GroupsOnlineStatus.d.ts
 */
export const DEFAULT_GROUP_ONLINE = {
    status: 'none',
};
/**
 * Идентификатор MiniApp выдачи ачивок образовательным акккаунтам
 */
export const EDU_ACHIEVEMENTS_MINI_APP_ID = 51751619;
/**
 * Идентификатор мини-аппа интеграции с ЭЖД (только учебные профили)
 * @see https://jira.mvk.com/browse/ME-57565
 */
export const EDU_SYSTEM_INTEGRATION_MINI_APP_ID = 51833161;
/**
 * ID блока UI отображением которого будет управлять сервер через 604 событие
 * @see https://jira.mvk.com/browse/ME-57565
 */
export const EDU_INTEGRATION_BANNER_ID = 1;
/**
 * Лимит чатов при превышения которого надо показывать баннер интеграции с ЭЖД вместо тизера
 * @see https://jira.mvk.com/browse/ME-57565
 */
export const EDU_INTEGRATION_BANNER_LIMIT = 1;
/**
 * Размер одной страницы для пагинации загрузки участников чата
 */
export const MEMBERS_PAGE_SIZE = 300;
/**
 * Количество запрошенных участников при поиске
 */
export const MEMBERS_SEARCH_COUNT = 50;
/**
 * Идентификатор подарка-случайного набора стикеров
 */
export const GIFTS_RANDOM_STICKER_PACK_GIFT_ID = 10101;
/**
 * Количество запрошенных контактов при поиске в Сферуме
 */
export const EDU_CONTACTS_SEARCH_COUNT = 50;
/**
 * Идентификатор мини-аппа ЛК Сферума (только учебные профили)
 */
export const EDU_LK_SFERUM_MINI_APP_ID = 51938986;
/*
 * URL для перехода на скачивание приложения VKME в Google Play
 * @see https://jira.mvk.com/browse/ME-59194
 */
export const ANDROID_STORE_URL = 'https://play.google.com/store/apps/details?id=com.vk.im';
/*
 * URL для перехода на скачивание приложения VKME в App Gallery (Google play для Huawei)
 * @see https://jira.mvk.com/browse/ME-59194
 */
export const HUAWEI_STORE_URL = 'https://appgallery.huawei.com/app/C106378919';
/**
 * Ключ в Storage для определения необходимости перехода в нативное приложение
 * для мобилок.
 */
export const GOTO_APP_STORAGE_KEY = 'vkme_show_goto_app';
/**
 * URL's для подключения к EventHub по WS
 */
export const EVENT_HUB_WS_URL = 'wss://eh.vk.com/';
export const EVENT_HUB_WS_URL_VK_RU = 'wss://eh.vk.ru/';
export const EVENT_HUB_WS_URL_TEST = 'wss://eh-test.vk.com/';
//# sourceMappingURL=config.js.map