/**
 * This is auto-generated file, don't modify this file manually
 */
/**
 * Unknown error occurred
 *
 * @deprecated
 */
const API_ERROR_UNKNOWN = 1;
/**
 * Application is disabled. Enable your application or use test mode
 */
const API_ERROR_DISABLED = 2;
/**
 * Unknown method passed
 */
const API_ERROR_METHOD = 3;
/**
 * Incorrect signature
 */
const API_ERROR_SIGNATURE = 4;
/**
 * User authorization failed
 */
const API_ERROR_AUTH = 5;
/**
 * Too many requests per second
 */
const API_ERROR_TOO_MANY = 6;
/**
 * Permission to perform this action is denied
 */
const API_ERROR_PERMISSION = 7;
/**
 * Invalid request
 */
const API_ERROR_REQUEST = 8;
/**
 * Flood control
 */
const API_ERROR_FLOOD = 9;
/**
 * Internal server error
 */
const API_ERROR_SERVER = 10;
/**
 * In test mode application should be disabled or user should be authorized
 */
const API_ERROR_ENABLED_IN_TEST = 11;
/**
 * Unable to compile code
 */
const API_ERROR_COMPILE = 12;
/**
 * Runtime error occurred during code invocation
 */
const API_ERROR_RUNTIME = 13;
/**
 * Captcha needed
 */
const API_ERROR_CAPTCHA = 14;
/**
 * Access denied
 */
const API_ERROR_ACCESS = 15;
/**
 * HTTP authorization failed
 */
const API_ERROR_AUTH_HTTPS = 16;
/**
 * Validation required
 */
const API_ERROR_AUTH_VALIDATION = 17;
/**
 * User was deleted or banned
 */
const API_ERROR_USER_DELETED = 18;
/**
 * Content blocked
 */
const API_ERROR_BLOCKED = 19;
/**
 * Permission to perform this action is denied for non-standalone applications
 */
const API_ERROR_METHOD_PERMISSION = 20;
/**
 * Permission to perform this action is allowed only for standalone and OpenAPI applications
 */
const API_ERROR_METHOD_ADS = 21;
/**
 * Upload error
 */
const API_ERROR_UPLOAD = 22;
/**
 * This method was disabled
 */
const API_ERROR_METHOD_DISABLED = 23;
/**
 * Confirmation required
 */
const API_ERROR_NEED_CONFIRMATION = 24;
/**
 * Token confirmation required
 */
const API_ERROR_NEED_TOKEN_CONFIRMATION = 25;
/**
 * Invalid device receipt
 */
const API_ERROR_INVALID_RECEIPT = 26;
/**
 * Group authorization failed
 */
const API_ERROR_GROUP_AUTH = 27;
/**
 * Application authorization failed
 */
const API_ERROR_APP_AUTH = 28;
/**
 * Rate limit reached
 *
 * Получение этой ошибки на несколько секунд блокирует все последующие запросы в API на уровне nginx
 */
const API_ERROR_RATE_LIMIT = 29;
/**
 * This profile is private
 */
const API_ERROR_PRIVATE_PROFILE = 30;
/**
 * User is invalid
 */
const API_ERROR_USER_INVALID = 31;
/**
 * Need wait
 */
const API_ERROR_WAIT = 32;
/**
 * Not implemented yet
 */
const API_ERROR_NOT_IMPLEMENTED_YET = 33;
/**
 * Client version deprecated
 *
 * Клиент устарел для конкретного метода
 */
const API_ERROR_CLIENT_VERSION_DEPRECATED = 34;
/**
 * Client update needed
 *
 * Клиент устарел и нуждается в обновлении, дальнейшая работа невозможна
 */
const API_ERROR_CLIENT_UPDATE_NEEDED = 35;
/**
 * Method execution was interrupted due to timeout
 *
 * Выполнение метода было прервано по причине превышения допустимого времени выполнения
 */
const API_ERROR_TIMEOUT = 36;
/**
 * User was banned
 */
const API_ERROR_USER_BANNED = 37;
/**
 * Unknown application
 */
const API_ERROR_UNKNOWN_APPLICATION = 38;
/**
 * Unknown user
 */
const API_ERROR_UNKNOWN_USER = 39;
/**
 * Unknown group
 */
const API_ERROR_UNKNOWN_GROUP = 40;
/**
 * Additional signup required
 */
const API_ERROR_ADDITIONAL_SIGNUP_REQUIRED = 41;
/**
 * IP is not allowed
 */
const API_ERROR_IP_IS_NOT_ALLOWED = 42;
/**
 * This section is temporary unavailable
 */
const API_ERROR_SECTION_DISABLED = 43;
/**
 * One of the parameters specified was missing or invalid
 */
const API_ERROR_PARAM = 100;
/**
 * Invalid application API ID
 */
const API_ERROR_PARAM_API_ID = 101;
/**
 * Out of limits
 */
const API_ERROR_LIMITS = 103;
/**
 * Not found
 */
const API_ERROR_NOT_FOUND = 104;
/**
 * Couldn't save file
 */
const API_ERROR_SAVE_FILE = 105;
/**
 * Unable to process action
 */
const API_ERROR_ACTION_FAILED = 106;
/**
 * Invalid user id
 */
const API_ERROR_PARAM_USER_ID = 113;
/**
 * Invalid album id
 */
const API_ERROR_PARAM_ALBUM_ID = 114;
/**
 * Invalid server
 */
const API_ERROR_PARAM_SERVER = 118;
/**
 * Invalid title
 */
const API_ERROR_PARAM_TITLE = 119;
/**
 * Invalid hash
 */
const API_ERROR_PARAM_HASH = 121;
/**
 * Invalid photos
 */
const API_ERROR_PARAM_PHOTOS = 122;
/**
 * Invalid audio
 */
const API_ERROR_PARAM_AUDIO = 123;
/**
 * Invalid status
 */
const API_ERROR_PARAM_STATUS = 124;
/**
 * Invalid group id
 */
const API_ERROR_PARAM_GROUP_ID = 125;
/**
 * Invalid school id
 */
const API_ERROR_PARAM_SCHOOL_ID = 126;
/**
 * Invalid photo
 */
const API_ERROR_PARAM_PHOTO = 129;
/**
 * Question text is too short
 */
const API_ERROR_PARAM_QUESTION_TEXT = 130;
/**
 * Question number limit is reached
 */
const API_ERROR_PARAM_QUESTION_LIMIT = 133;
/**
 * Page not found
 */
const API_ERROR_PARAM_PAGE_ID = 140;
/**
 * Access to page denied
 */
const API_ERROR_ACCESS_PAGE = 141;
/**
 * The mobile number of the user is unknown
 */
const API_ERROR_MOBILE_NOT_ACTIVATED = 146;
/**
 * Application has insufficient funds
 */
const API_ERROR_INSUFFICIENT_FUNDS = 147;
/**
 * Access to the menu of the user denied
 */
const API_ERROR_ACCESS_MENU = 148;
/**
 * Invalid timestamp
 */
const API_ERROR_PARAM_TIMESTAMP = 150;
/**
 * Invalid list id
 */
const API_ERROR_FRIENDS_LIST_ID = 171;
/**
 * Reached the maximum number of lists
 */
const API_ERROR_FRIENDS_LIST_LIMIT = 173;
/**
 * Cannot add user himself as friend
 */
const API_ERROR_FRIENDS_ADD_YOURSELF = 174;
/**
 * Cannot add this user to friends as they have put you on their blacklist
 */
const API_ERROR_FRIENDS_ADD_IN_ENEMY = 175;
/**
 * Cannot add this user to friends as you put him on blacklist
 */
const API_ERROR_FRIENDS_ADD_ENEMY = 176;
/**
 * Cannot add this user to friends as user not found
 */
const API_ERROR_FRIENDS_ADD_NOT_FOUND = 177;
/**
 * Note not found
 */
const API_ERROR_PARAM_NOTE_ID = 180;
/**
 * Access to note denied
 */
const API_ERROR_ACCESS_NOTE = 181;
/**
 * You can't comment this note
 */
const API_ERROR_ACCESS_NOTE_COMMENT = 182;
/**
 * Access to comment denied
 */
const API_ERROR_ACCESS_COMMENT = 183;
/**
 * Access denied
 */
const API_ERROR_ACCESS_ALBUM = 200;
/**
 * Access denied
 */
const API_ERROR_ACCESS_AUDIO = 201;
/**
 * Access to group denied
 */
const API_ERROR_ACCESS_GROUP = 203;
/**
 * Access denied
 */
const API_ERROR_ACCESS_VIDEO = 204;
/**
 * Access denied
 */
const API_ERROR_ACCESS_MARKET = 205;
/**
 * Access denied
 */
const API_ERROR_ACCESS_AUTOLOGIN = 207;
/**
 * Access to wall's post denied
 */
const API_ERROR_WALL_ACCESS_POST = 210;
/**
 * Access to wall's comment denied
 */
const API_ERROR_WALL_ACCESS_COMMENT = 211;
/**
 * Access to post comments denied
 */
const API_ERROR_WALL_ACCESS_REPLIES = 212;
/**
 * Access to status replies denied
 */
const API_ERROR_WALL_ACCESS_ADD_REPLY = 213;
/**
 * Access to adding post denied
 */
const API_ERROR_WALL_ADD_POST = 214;
/**
 * Wall post is already liked
 */
const API_ERROR_WALL_ALREADY_LIKED = 215;
/**
 * Wall post is already unliked
 */
const API_ERROR_WALL_ALREADY_UNLIKED = 216;
/**
 * Advertisement post was recently added
 */
const API_ERROR_WALL_ADS_PUBLISHED = 219;
/**
 * Too many recipients
 */
const API_ERROR_WALL_TOO_MANY_RECIPIENTS = 220;
/**
 * User disabled track name broadcast
 */
const API_ERROR_STATUS_NO_AUDIO = 221;
/**
 * Hyperlinks are forbidden
 */
const API_ERROR_WALL_LINKS_FORBIDDEN = 222;
/**
 * Too many replies
 */
const API_ERROR_WALL_REPLY_OWNER_FLOOD = 223;
/**
 * Too many ads posts
 */
const API_ERROR_WALL_ADS_POST_LIMIT_REACHED = 224;
/**
 * Donut is disabled
 */
const API_ERROR_WALL_DONUT = 225;
/**
 * Reaction can not be applied to the object
 */
const API_ERROR_LIKES_REACTION_CAN_NOT_BE_APPLIED = 232;
/**
 * Too many friends
 */
const API_ERROR_FRIENDS_TOO_MANY_FRIENDS = 242;
/**
 * Comment has not been deleted
 */
const API_ERROR_WALL_COMMENT_NOT_DELETED = 243;
/**
 * Access to poll denied
 */
const API_ERROR_POLLS_ACCESS = 250;
/**
 * Invalid poll id
 */
const API_ERROR_POLLS_POLL_ID = 251;
/**
 * Invalid answer id
 */
const API_ERROR_POLLS_ANSWER_ID = 252;
/**
 * Access denied, please vote first
 */
const API_ERROR_POLLS_ACCESS_WITHOUT_VOTE = 253;
/**
 * Access to the groups list is denied due to the user's privacy settings
 */
const API_ERROR_ACCESS_GROUPS = 260;
/**
 * The audio file was removed by the copyright holder and cannot be reuploaded.
 */
const API_ERROR_AUDIO_CLAIMED = 270;
/**
 * The audio file already exists in the favorites.
 */
const API_ERROR_AUDIO_ALBUM_DUPLICATE = 271;
/**
 * User cannot follow the artist
 */
const API_ERROR_FOLLOW_ARTIST_ACCESS_DENIED = 273;
/**
 * Unknown like type or artist id cannot be split into owner and item id
 */
const API_ERROR_FOLLOW_ARTIST_WRONG_FORMAT = 274;
/**
 * Unknown like type or artist id cannot be split into owner and item id
 */
const API_ERROR_UNFOLLOW_ARTIST_WRONG_FORMAT = 275;
/**
 * This album is full
 */
const API_ERROR_ALBUM_FULL = 300;
/**
 * Invalid filename
 */
const API_ERROR_FILENAME = 301;
/**
 * Albums number limit is reached
 */
const API_ERROR_ALBUMS_LIMIT = 302;
/**
 * Invalid filesize
 */
const API_ERROR_FILESIZE = 303;
/**
 * Session was expired or closed
 */
const API_ERROR_AUDIO_SEARCH_SESSION_EXPIRED = 400;
/**
 * Reached the maximum number of playlists
 */
const API_ERROR_AUDIO_PLAYLISTS_LIMIT = 401;
/**
 * Permission denied. You must enable votes processing in application settings
 */
const API_ERROR_VOTES_PERMISSION = 500;
/**
 * Not enough money on owner's balance
 */
const API_ERROR_BALANCE = 504;
/**
 * Cannot withdraw votes
 */
const API_ERROR_WITHDRAW = 505;
/**
 * Invalid amount
 */
const API_ERROR_PARAM_AMOUNT = 506;
/**
 * Transaction in bad state
 */
const API_ERROR_TRANSACTION_STATUS = 507;
/**
 * Transaction not found
 */
const API_ERROR_TRANSACTION_NOT_FOUND = 508;
/**
 * Invalid PIN
 */
const API_ERROR_WRONG_PIN = 509;
/**
 * Permission denied. You have no access to operations specified with given object(s)
 */
const API_ERROR_ADS_PERMISSION = 600;
/**
 * Permission denied. You have requested too many actions this day. Try later.
 */
const API_ERROR_WEIGHTED_FLOOD = 601;
/**
 * Some part of the request has not been completed
 */
const API_ERROR_ADS_PARTIAL_SUCCESS = 602;
/**
 * Some ads error occurs
 */
const API_ERROR_ADS_SPECIFIC = 603;
/**
 * Invalid domain
 */
const API_ERROR_ADS_PARAM_DOMAIN_INVALID = 604;
/**
 * Domain is forbidden
 */
const API_ERROR_ADS_PARAM_DOMAIN_FORBIDDEN = 605;
/**
 * Domain is reserved
 */
const API_ERROR_ADS_PARAM_DOMAIN_RESERVED = 606;
/**
 * Domain is occupied
 */
const API_ERROR_ADS_PARAM_DOMAIN_OCCUPIED = 607;
/**
 * Domain is active
 */
const API_ERROR_ADS_PARAM_DOMAIN_ACTIVE = 608;
/**
 * Domain app is invalid
 */
const API_ERROR_ADS_PARAM_DOMAIN_APP_INVALID = 609;
/**
 * Domain app is forbidden
 */
const API_ERROR_ADS_PARAM_DOMAIN_APP_FORBIDDEN = 610;
/**
 * Application must be verified
 */
const API_ERROR_ADS_APP_NOT_VERIFIED = 611;
/**
 * Application must be in domains list of site of ad unit
 */
const API_ERROR_APP_NOT_IN_SITE_DOMAINS = 612;
/**
 * Application is blocked
 */
const API_ERROR_ADS_APP_BLOCKED = 613;
/**
 * Domain of type specified is forbidden in current office type
 */
const API_ERROR_ADS_PARAM_DOMAIN_WRONG_TYPE = 614;
/**
 * Domain group is invalid
 */
const API_ERROR_ADS_PARAM_DOMAIN_GROUP_INVALID = 615;
/**
 * Domain group is forbidden
 */
const API_ERROR_ADS_PARAM_DOMAIN_GROUP_FORBIDDEN = 616;
/**
 * Domain app is blocked
 */
const API_ERROR_ADS_PARAM_DOMAIN_APP_BLOCKED = 617;
/**
 * Domain group is not open
 */
const API_ERROR_ADS_PARAM_DOMAIN_GROUP_NOT_OPEN = 618;
/**
 * Domain group is not possible to be joined to adsweb
 */
const API_ERROR_ADS_PARAM_DOMAIN_GROUP_NOT_POSSIBLE_YET = 619;
/**
 * Domain group is blocked
 */
const API_ERROR_ADS_PARAM_DOMAIN_GROUP_BLOCKED = 620;
/**
 * Domain group has restriction: links are forbidden
 */
const API_ERROR_ADS_PARAM_DOMAIN_GROUP_FORBIDDEN_LINKS = 621;
/**
 * Domain group has restriction: excluded from search
 */
const API_ERROR_ADS_PARAM_DOMAIN_GROUP_FORBIDDEN_SEARCH = 622;
/**
 * Domain group has restriction: cover is forbidden
 */
const API_ERROR_ADS_PARAM_DOMAIN_GROUP_FORBIDDEN_COVER = 623;
/**
 * Domain group has wrong category
 */
const API_ERROR_ADS_PARAM_DOMAIN_GROUP_WRONG_CATEGORY = 624;
/**
 * Domain group has wrong name
 */
const API_ERROR_ADS_PARAM_DOMAIN_GROUP_WRONG_NAME = 625;
/**
 * Domain group has low posts reach
 */
const API_ERROR_ADS_PARAM_DOMAIN_GROUP_LOW_POSTS_REACH = 626;
/**
 * Domain group has wrong class
 */
const API_ERROR_ADS_PARAM_DOMAIN_GROUP_WRONG_CLASS = 627;
/**
 * Domain group is created recently
 */
const API_ERROR_ADS_PARAM_DOMAIN_GROUP_RECENTLY_CREATED = 628;
/**
 * Object deleted
 */
const API_ERROR_ADS_OBJECT_DELETED = 629;
/**
 * Lookalike request with same source already in progress
 */
const API_ERROR_ADS_LOOKALIKE_REQUEST_ALREADY_IN_PROGRESS = 630;
/**
 * Max count of lookalike requests per day reached
 */
const API_ERROR_ADS_LOOKALIKE_REQUEST_MAX_COUNT_PER_DAY_REACHED = 631;
/**
 * Given audience is too small
 */
const API_ERROR_ADS_LOOKALIKE_REQUEST_AUDIENCE_TOO_SMALL = 632;
/**
 * Given audience is too large
 */
const API_ERROR_ADS_LOOKALIKE_REQUEST_AUDIENCE_TOO_LARGE = 633;
/**
 * Lookalike request audience save already in progress
 */
const API_ERROR_ADS_LOOKALIKE_REQUEST_EXPORT_ALREADY_IN_PROGRESS = 634;
/**
 * Max count of lookalike request audience saves per day reached
 */
const API_ERROR_ADS_LOOKALIKE_REQUEST_EXPORT_MAX_COUNT_PER_DAY_REACHED = 635;
/**
 * Max count of retargeting groups reached
 */
const API_ERROR_ADS_LOOKALIKE_REQUEST_EXPORT_RETARGETING_GROUP_LIMIT = 636;
/**
 * Domain group has active nemesis punishment
 */
const API_ERROR_ADS_PARAM_DOMAIN_GROUP_NEMESIS_PUNISHMENT = 637;
/**
 * Ads already created
 */
const API_ERROR_ADS_ALREADY_CREATED = 640;
/**
 * Domain group has low subscribers growth last period
 */
const API_ERROR_ADS_PARAM_DOMAIN_GROUP_LOW_SUBSCRIBERS_GROWTH = 641;
/**
 * Cannot edit creator role
 */
const API_ERROR_GROUP_CHANGE_CREATOR = 700;
/**
 * User should be in club
 */
const API_ERROR_GROUP_NOT_IN_CLUB = 701;
/**
 * Too many officers in club
 */
const API_ERROR_GROUP_TOO_MANY_OFFICERS = 702;
/**
 * You need to enable 2FA for this action
 */
const API_ERROR_GROUP_NEED_2FA = 703;
/**
 * User needs to enable 2FA for this action
 */
const API_ERROR_GROUP_HOST_NEED_2FA = 704;
/**
 * Too many addresses in club
 */
const API_ERROR_GROUP_TOO_MANY_ADDRESSES = 706;
/**
 * Too long payload
 */
const API_ERROR_GROUP_PAYLOAD_MAX_LENGTH = 707;
/**
 * Invalid signature
 */
const API_ERROR_GROUP_PAYLOAD_SIGNATURE_INVALID = 708;
/**
 * Signature has already expired
 */
const API_ERROR_GROUP_PAYLOAD_SIGNATURE_EXPIRED = 709;
/**
 * Too many payloads, try again later
 */
const API_ERROR_GROUP_PAYLOAD_FLOOD = 710;
/**
 * Application is not installed in community
 */
const API_ERROR_GROUP_APP_IS_NOT_INSTALLED_IN_COMMUNITY = 711;
/**
 * Cannot delete chat
 */
const API_ERROR_GROUP_CHAT_CANT_DELETE = 712;
/**
 * Invite links is available for closed groups and events
 */
const API_ERROR_GROUP_INVITE_LINKS_CANT_USE = 713;
/**
 * Invite link is invalid - expired, deleted or not exists
 */
const API_ERROR_GROUP_INVITE_LINKS_NOT_VALID = 714;
/**
 * User already in club
 */
const API_ERROR_GROUP_INVITE_LINKS_USER_IN_CLUB = 715;
/**
 * Donut is disabled
 */
const API_ERROR_GROUP_DONUT_DISABLED = 716;
/**
 * Group list is not obsolete
 */
const API_ERROR_GROUP_LIST_IS_NOT_OBSOLETE = 717;
/**
 * This video is already added
 */
const API_ERROR_VIDEO_ALREADY_ADDED = 800;
/**
 * Comments for this video are closed
 */
const API_ERROR_VIDEO_COMMENTS_CLOSED = 801;
/**
 * Action is forbidden at the moment, try again later
 */
const API_ERROR_VIDEO_TRY_LATER = 802;
/**
 * Can't send messages for users from blacklist
 */
const API_ERROR_MESSAGES_USER_BLOCKED = 900;
/**
 * Can't send messages for users without permission
 */
const API_ERROR_MESSAGES_DENY_SEND = 901;
/**
 * Can't send messages to this user due to their privacy settings
 */
const API_ERROR_MESSAGES_PRIVACY = 902;
/**
 * The user does not use an official app
 */
const API_ERROR_MESSAGES_PHONE_NUMBER_NO_MOBILE_APP = 905;
/**
 * This phone number is not verified
 */
const API_ERROR_MESSAGES_PHONE_NUMBER_NOT_VERIFIED = 906;
/**
 * Value of ts or pts is too old
 */
const API_ERROR_MESSAGES_TOO_OLD_PTS = 907;
/**
 * Value of ts or pts is too new
 */
const API_ERROR_MESSAGES_TOO_NEW_PTS = 908;
/**
 * Can't edit this message, because it's too old
 */
const API_ERROR_MESSAGES_EDIT_EXPIRED = 909;
/**
 * Can't sent this message, because it's too big
 */
const API_ERROR_MESSAGES_TOO_BIG = 910;
/**
 * Keyboard format is invalid
 */
const API_ERROR_MESSAGES_KEYBOARD_INVALID = 911;
/**
 * This is a chat bot feature, change this status in settings
 */
const API_ERROR_MESSAGES_CHAT_BOT_FEATURE = 912;
/**
 * Too many forwarded messages
 */
const API_ERROR_MESSAGES_TOO_LONG_FORWARDS = 913;
/**
 * Message is too long
 */
const API_ERROR_MESSAGES_TOO_LONG_MESSAGE = 914;
/**
 * Group turned off messages
 */
const API_ERROR_MESSAGES_GROUP_MESSAGES_OFF = 915;
/**
 * Group messages were banned
 */
const API_ERROR_MESSAGES_GROUP_MESSAGES_FORBIDDEN = 916;
/**
 * You don't have access to this chat
 */
const API_ERROR_MESSAGES_CHAT_USER_NO_ACCESS = 917;
/**
 * You can't send messages to this email
 */
const API_ERROR_MESSAGES_EMAIL_NO_ACCESS = 918;
/**
 * You can't see invite link for this chat
 */
const API_ERROR_MESSAGES_CANT_SEE_INVITE_LINK = 919;
/**
 * Can't edit this kind of message
 */
const API_ERROR_MESSAGES_EDIT_KIND_DISALLOWED = 920;
/**
 * Can't forward these messages
 */
const API_ERROR_MESSAGES_CANT_FWD = 921;
/**
 * You left this chat
 */
const API_ERROR_MESSAGES_CHAT_USER_LEFT = 922;
/**
 * Receiver's app is too old
 */
const API_ERROR_MESSAGES_OLD_RECEIVER_APP = 923;
/**
 * Can't delete this message for everybody
 */
const API_ERROR_MESSAGES_CANT_DELETE_FOR_ALL = 924;
/**
 * You are not admin of this chat
 */
const API_ERROR_MESSAGES_CHAT_NOT_ADMIN = 925;
/**
 * Chat does not exist
 */
const API_ERROR_MESSAGES_CHAT_NOT_EXIST = 927;
/**
 * Can't make a call due to user privacy settings
 */
const API_ERROR_MESSAGES_CALL_PRIVACY = 928;
/**
 * You can't change invite link for this chat
 */
const API_ERROR_MESSAGES_CANT_CHANGE_INVITE_LINK = 931;
/**
 * Your community can't interact with this peer
 */
const API_ERROR_MESSAGES_GROUP_PEER_ACCESS = 932;
/**
 * The user disallowed finding him by phone number
 */
const API_ERROR_MESSAGES_PHONE_NUMBER_NO_ACCESS = 933;
/**
 * This user is not a member of your community
 */
const API_ERROR_MESSAGES_PHONE_NUMBER_NOT_CLUB_MEMBER = 934;
/**
 * User not found in chat
 */
const API_ERROR_MESSAGES_CHAT_USER_NOT_IN_CHAT = 935;
/**
 * Contact not found
 */
const API_ERROR_MESSAGES_CONTACT_NOT_FOUND = 936;
/**
 * Too many contacts to sync
 */
const API_ERROR_MESSAGES_TOO_MANY_CONTACTS = 937;
/**
 * Message request already sent
 */
const API_ERROR_MESSAGES_MESSAGE_REQUEST_ALREADY_SENT = 939;
/**
 * Too many posts in messages
 */
const API_ERROR_MESSAGES_TOO_MANY_POSTS = 940;
/**
 * Cannot pin one-time story
 */
const API_ERROR_MESSAGES_CANT_PIN_ONE_TIME_STORY = 942;
/**
 * Cannot use this intent
 */
const API_ERROR_MESSAGES_INTENT_CANT_USE = 943;
/**
 * Limits overflow for this intent
 */
const API_ERROR_MESSAGES_INTENT_LIMIT_OVERFLOW = 944;
/**
 * Chat was disabled
 */
const API_ERROR_MESSAGES_CHAT_DISABLED = 945;
/**
 * Chat not supported
 */
const API_ERROR_MESSAGES_CHAT_UNSUPPORTED = 946;
/**
 * Can't add user to chat, because user has no access to group
 */
const API_ERROR_MESSAGES_MEMBER_ACCESS_TO_GROUP_DENIED = 947;
/**
 * Call recipient is busy
 */
const API_ERROR_MESSAGES_CALL_BUSY = 948;
/**
 * Can't edit pinned message yet
 */
const API_ERROR_MESSAGES_CANT_EDIT_PINNED_YET = 949;
/**
 * Can't send message, reply timed out
 */
const API_ERROR_MESSAGES_PEER_BLOCKED_REASON_BY_TIME = 950;
/**
 * Call not found
 */
const API_ERROR_MESSAGES_CALL_NOT_FOUND = 951;
/**
 * Invalid secret
 */
const API_ERROR_MESSAGES_CALL_INVALID_SECRET = 952;
/**
 * Invalid name
 */
const API_ERROR_MESSAGES_CALL_INVALID_NAME = 953;
/**
 * Invalid join link
 */
const API_ERROR_MESSAGES_CALL_INVALID_JOIN_LINK = 954;
/**
 * Invalid chat invite link
 */
const API_ERROR_MESSAGES_CHAT_INVALID_INVITE_LINK = 955;
/**
 * Too many pinned conversations
 */
const API_ERROR_MESSAGES_TOO_MANY_PINNED_CONVERSATIONS = 956;
/**
 * Conversation already pinned
 */
const API_ERROR_MESSAGES_ALREADY_PINNED_CONVERSATION = 957;
/**
 * Audio message not recognized
 */
const API_ERROR_MESSAGES_AUDIO_MESSAGE_NOT_RECOGNIZED = 958;
/**
 * Audio message transcription size not allowed
 */
const API_ERROR_MESSAGES_TRANSCRIPTION_SIZE_NOT_ALLOWED = 959;
/**
 * Call requires auth
 */
const API_ERROR_MESSAGES_CALL_REQUIRES_AUTH = 960;
/**
 * Outdated call join link
 */
const API_ERROR_MESSAGES_OUTDATED_CALL_JOIN_LINK = 961;
/**
 * You can't access donut chat without subscription
 */
const API_ERROR_MESSAGES_USER_NOT_DON = 962;
/**
 * You are not allowed to join this call
 */
const API_ERROR_MESSAGES_CALL_JOIN_NOT_ALLOWED = 963;
/**
 * Conversation already in archive
 */
const API_ERROR_MESSAGES_ALREADY_ARCHIVED = 964;
/**
 * Conversation not in archive
 */
const API_ERROR_MESSAGES_NOT_ARCHIVED = 965;
/**
 * Too many conversation styling updates
 */
const API_ERROR_MESSAGES_CONVERSATION_STYLE_UPDATE_FLOOD = 966;
/**
 * This user can't be added to the work chat, as they aren't an employee.
 */
const API_ERROR_MESSAGES_CHAT_MEMBER_NOT_STAFF = 967;
/**
 * Unsupported destination language.
 */
const API_ERROR_MESSAGES_TRANSLATION_UNSUPPORTED_LANGUAGE = 968;
/**
 * Message cannot be forwarded
 */
const API_ERROR_MESSAGES_MESSAGE_CANNOT_BE_FORWARDED = 969;
/**
 * Cannot pin an expiring message
 */
const API_ERROR_MESSAGES_CANT_PIN_EXPIRING_MESSAGE = 970;
/**
 * Invalid message for translation.
 */
const API_ERROR_MESSAGES_TRANSLATION_INVALID_MESSAGE = 971;
/**
 * Can't translate. Try later.
 */
const API_ERROR_MESSAGES_TRANSLATION_CANT_TRANSLATE = 972;
/**
 * Invalid languages pair for translation.
 */
const API_ERROR_MESSAGES_TRANSLATION_INVALID_LANGUAGES = 973;
/**
 * Folder not found
 */
const API_ERROR_MESSAGES_FOLDER_NOT_FOUND = 974;
/**
 * Folders limit reached
 */
const API_ERROR_MESSAGES_FOLDERS_LIMIT_REACHED = 975;
/**
 * Folder conversations limit reached
 */
const API_ERROR_MESSAGES_FOLDER_CONVERSATIONS_LIMIT_REACHED = 976;
/**
 * Outdated vk rooms link
 */
const API_ERROR_MESSAGES_OUTDATED_VK_ROOMS_LINK = 977;
/**
 * Only p2p enabled for call
 */
const API_ERROR_MESSAGES_ONLY_P2P_ENABLED_FOR_CALL = 978;
/**
 * App action is restricted for conversations with communities
 */
const API_ERROR_MESSAGES_APP_ACTION_RESTRICTED_FOR_COMMUNITY = 979;
/**
 * Cannot pin service message
 */
const API_ERROR_MESSAGES_CANT_PIN_SERVICE_MESSAGE = 980;
/**
 * Cannot add this user by privacy settings
 */
const API_ERROR_MESSAGES_CHAT_CANT_ADD_USER_BY_PRIVACY = 981;
/**
 * Cannot add users to chat temporary
 */
const API_ERROR_MESSAGES_CHAT_ADD_TEMPORARY_DENIED = 982;
/**
 * You are restricted to write to a chat
 */
const API_ERROR_MESSAGES_USER_IS_RESTRICTED_TO_WRITE_TO_CHAT = 983;
/**
 * You has spam restriction
 */
const API_ERROR_MESSAGES_SPAM_RESTRICTION = 984;
/**
 * Cannot write to notifications only groups
 */
const API_ERROR_MESSAGES_GROUP_FOR_NOTIFICATIONS_ONLY = 985;
/**
 * Need edu role
 */
const API_ERROR_MESSAGES_NEED_EDU_ROLE = 986;
/**
 * Need message request
 */
const API_ERROR_MESSAGES_NEED_MESSAGE_REQUEST = 987;
/**
 * Pending message request
 */
const API_ERROR_MESSAGES_PENDING_MESSAGE_REQUEST = 988;
/**
 * Editing is not available, unlink your profile from ESIA
 */
const API_ERROR_MESSAGES_EDITING_DISABLED_UNLINK_ESIA = 989;
/**
 * Drop device cache
 */
const API_ERROR_MESSAGES_DROP_DEVICE_CACHE = 990;
/**
 * Postponed messages for this peer not supported
 */
const API_ERROR_MESSAGES_POSTPONED_NOT_SUPPORTED = 991;
/**
 * Postponed messages limit for this peer id reached
 */
const API_ERROR_MESSAGES_POSTPONED_LIMIT = 992;
/**
 * Chat moved to MAX
 */
const API_ERROR_MESSAGES_CHAT_MOVED_TO_MAX = 993;
/**
 * Chat forward disabled
 */
const API_ERROR_MESSAGES_CHAT_FORWARD_DISABLED = 994;
/**
 * Messenger degradation
 */
const API_ERROR_MESSAGES_DEGRADATION = 995;
/**
 * Invalid phone number
 */
const API_ERROR_PARAM_PHONE = 1000;
/**
 * No user with such phone number
 */
const API_ERROR_NO_USER_BY_PHONE = 1001;
/**
 * This phone number is used by another user
 */
const API_ERROR_PHONE_ALREADY_USED = 1004;
/**
 * Validating phone is needed to start before confirm
 */
const API_ERROR_PHONE_VALIDATING_NOT_STARTED = 1005;
/**
 * Old lib
 */
const API_ERROR_MESSAGES_OLD_CALLS_LIB = 1006;
/**
 * Call chat limit reached
 */
const API_ERROR_MESSAGES_CALL_CHAT_LIMIT_REACHED = 1007;
/**
 * Already in the call
 */
const API_ERROR_MESSAGES_ALREADY_IN_THE_CALL = 1008;
/**
 * Unknown reaction passed
 */
const API_ERROR_MESSAGES_INVALID_REACTION_ID = 1009;
/**
 * This reaction has been disabled
 */
const API_ERROR_MESSAGES_FORBIDDEN_REACTION = 1010;
/**
 * Reactions limit for this message has been reached
 */
const API_ERROR_MESSAGES_REACTIONS_LIMIT_REACHED = 1011;
/**
 * Writing is disabled for this chat
 */
const API_ERROR_MESSAGES_WRITING_DISABLED_FOR_CHAT = 1012;
/**
 * Max count of pinned messages reached
 */
const API_ERROR_MESSAGES_MAX_PINNED_MESSAGES = 1014;
/**
 * Invalid account type - should be edu
 */
const API_ERROR_MESSAGES_SHOULD_BE_EDU = 1015;
/**
 * Invalid account type - should not be edu
 */
const API_ERROR_MESSAGES_SHOULD_NOT_BE_EDU = 1016;
/**
 * Chat was deleted
 */
const API_ERROR_MESSAGES_CHAT_WAS_DELETED = 1017;
/**
 * Message was deleted
 */
const API_ERROR_MESSAGES_MESSAGE_WAS_DELETED = 1018;
/**
 * Chat can not be joined because user who want to join not organization member
 */
const API_ERROR_MESSAGES_CHAT_CAN_NOT_BE_JOINED_FOR_NOT_ORGANIZATION_MEMBER = 1019;
/**
 * Conversation can not be pinned
 */
const API_ERROR_MESSAGES_CONVERSATION_CAN_NOT_BE_PINNED = 1020;
/**
 * Can't send messages for users without conversation
 */
const API_ERROR_MESSAGES_NO_CONVERSATION = 1021;
/**
 * User is not an edu user
 */
const API_ERROR_ME_EDUCATION_IS_NOT_AN_EDU_USER = 1050;
/**
 * Method is not available for this profile type
 */
const API_ERROR_METHOD_IS_NOT_AVAILABLE_FOR_THE_PROFILE_TYPE = 1051;
/**
 * Invalid login or domain
 */
const API_ERROR_AUTH_PARAM_LOGIN = 1104;
/**
 * Too many auth attempts, try again later
 */
const API_ERROR_AUTH_FLOOD_ERROR = 1105;
/**
 * Token may be expired
 */
const API_ERROR_AUTH_NO_TOKEN = 1109;
/**
 * Incorrect code
 */
const API_ERROR_AUTH_PARAM_CODE = 1110;
/**
 * Invalid password
 */
const API_ERROR_AUTH_PARAM_PASSWORD = 1111;
/**
 * Processing.. Try later
 */
const API_ERROR_AUTH_DELAY = 1112;
/**
 * Invalid sid
 */
const API_ERROR_AUTH_INVALID_SID = 1113;
/**
 * Anonymous token has expired
 */
const API_ERROR_AUTH_ANONYMOUS_TOKEN_HAS_EXPIRED = 1114;
/**
 * Super app token is invalid
 */
const API_ERROR_AUTH_SUPER_APP_TOKEN_IS_INVALID = 1115;
/**
 * Anonymous token is invalid
 */
const API_ERROR_AUTH_ANONYMOUS_TOKEN_IS_INVALID = 1116;
/**
 * Access token has expired
 */
const API_ERROR_AUTH_ACCESS_TOKEN_HAS_EXPIRED = 1117;
/**
 * Anonymous token ip mismatch
 */
const API_ERROR_AUTH_ANONYMOUS_TOKEN_IP_MISMATCH = 1118;
/**
 * Passkey registration error
 */
const API_ERROR_PASSKEY_REGISTRATION = 1119;
/**
 * Business ID Organization error
 */
const API_ERROR_BID_ORGANIZATION = 1121;
/**
 * Business ID invalid organization
 */
const API_ERROR_BID_ORG_INVALID = 1122;
/**
 * Business ID logic error
 */
const API_ERROR_BID_BUSINESS_LOGIC_ERROR = 1123;
/**
 * Business ID already on verification
 */
const API_ERROR_BID_ALREADY_ON_VERIFICATION = 1125;
/**
 * Business ID legal full name required
 */
const API_ERROR_BID_LEGAL_FULLNAME_REQUIRED = 1126;
/**
 * Business ID no enough rights for verification
 */
const API_ERROR_BID_NO_ENOUGH_RIGHTS = 1127;
/**
 * Business ID has verified duplicates
 */
const API_ERROR_BID_HAS_VERIFIED_DUPLICATES = 1128;
/**
 * Business ID has duplicates by Legal1C
 */
const API_ERROR_BID_HAS_DUPLICATES_BY_1C = 1129;
/**
 * ABF flood limit
 */
const API_ERROR_ABF_FLOOD_LIMIT = 1139;
/**
 * Invalid document id
 */
const API_ERROR_PARAM_DOC_ID = 1150;
/**
 * Access to document deleting is denied
 */
const API_ERROR_PARAM_DOC_DELETE_ACCESS = 1151;
/**
 * Invalid document title
 */
const API_ERROR_PARAM_DOC_TITLE = 1152;
/**
 * Access to document is denied
 */
const API_ERROR_PARAM_DOC_ACCESS = 1153;
/**
 * Access to document restoring is denied
 */
const API_ERROR_PARAM_DOC_RESTORE_ACCESS = 1154;
/**
 * Document was deleted too long ago
 */
const API_ERROR_PARAM_DOC_RESTORE_TIMEOUT = 1155;
/**
 * Original photo was changed
 */
const API_ERROR_PHOTO_CHANGED = 1160;
/**
 * Too many feed lists
 */
const API_ERROR_TOO_MANY_LISTS = 1170;
/**
 * Unknown login
 */
const API_ERROR_UNKNOW_LOGIN = 1180;
/**
 * Cannot send this gift
 */
const API_ERROR_GIFT_NOT_AVAILABLE = 1190;
/**
 * Product is not available
 */
const API_ERROR_PRODUCT_NOT_AVAILABLE = 1210;
/**
 * Product not found
 */
const API_ERROR_PRODUCT_NOT_FOUND = 1211;
/**
 * This achievement is already unlocked
 */
const API_ERROR_APPS_ALREADY_UNLOCKED = 1251;
/**
 * Payments in this app is not allowed
 */
const API_ERROR_APPS_PAYMENTS_NOT_ALLOWED = 1252;
/**
 * Votes transfer limit in this app
 */
const API_ERROR_APPS_PAYMENTS_LIMIT = 1253;
/**
 * Apps item waiting
 */
const API_ERROR_APPS_PAYMENTS_WAITING_ITEM = 1254;
/**
 * Error while purchasing order
 */
const API_ERROR_APPS_ORDER_ERROR = 1255;
/**
 * Subscription not found
 */
const API_ERROR_APPS_SUBSCRIPTION_NOT_FOUND = 1256;
/**
 * Subscription is in invalid status
 */
const API_ERROR_APPS_SUBSCRIPTION_INVALID_STATUS = 1257;
/**
 * Application is already added
 */
const API_ERROR_APPS_ALREADY_ADDED = 1258;
/**
 * Too many apps in menu
 */
const API_ERROR_APPS_MENU_TOO_MANY_APPS = 1259;
/**
 * Invalid screen name
 */
const API_ERROR_INVALID_ADDRESS = 1260;
/**
 * No rights to install app in this community
 */
const API_ERROR_APPS_NO_RIGHTS_IN_COMMUNITY = 1261;
/**
 * Too much profile buttons
 */
const API_ERROR_APPS_TOO_MUCH_PROFILE_BUTTONS = 1262;
/**
 * Too late for restore
 */
const API_ERROR_MARKET_RESTORE_TOO_LATE = 1400;
/**
 * Comments for this market are closed
 */
const API_ERROR_MARKET_COMMENTS_CLOSED = 1401;
/**
 * Album not found
 */
const API_ERROR_MARKET_ALBUM_NOT_FOUND = 1402;
/**
 * Item not found
 */
const API_ERROR_MARKET_ITEM_NOT_FOUND = 1403;
/**
 * Item already added to album
 */
const API_ERROR_MARKET_ITEM_ALREADY_ADDED = 1404;
/**
 * Too many items
 */
const API_ERROR_MARKET_TOO_MANY_ITEMS = 1405;
/**
 * Too many items in album
 */
const API_ERROR_MARKET_TOO_MANY_ITEMS_IN_ALBUM = 1406;
/**
 * Too many albums
 */
const API_ERROR_MARKET_TOO_MANY_ALBUMS = 1407;
/**
 * Item has bad links in description
 */
const API_ERROR_MARKET_ITEM_HAS_BAD_LINKS = 1408;
/**
 * Extended market not enabled
 */
const API_ERROR_MARKET_EXTENDED_NOT_ENABLED = 1409;
/**
 * Variants not enabled
 */
const API_ERROR_MARKET_VARIANTS_NOT_ENABLED = 1410;
/**
 * Variants error
 */
const API_ERROR_MARKET_VARIANTS_ERROR = 1411;
/**
 * Grouping items with different properties
 */
const API_ERROR_MARKET_GROUPING_ITEMS_WITH_DIFFERENT_PROPERTIES = 1412;
/**
 * Grouping already has such variant
 */
const API_ERROR_MARKET_GROUPING_ALREADY_HAS_SUCH_VARIANT = 1413;
/**
 * Grouping has other properties
 */
const API_ERROR_MARKET_GROUPING_HAS_OTHER_PROPERTIES = 1414;
/**
 * Grouping must have variants
 */
const API_ERROR_MARKET_GROUPING_MUST_HAVE_VARIANTS = 1415;
/**
 * Variant not found
 */
const API_ERROR_MARKET_VARIANT_NOT_FOUND = 1416;
/**
 * Property not found
 */
const API_ERROR_MARKET_PROPERTY_NOT_FOUND = 1417;
/**
 * Max properties limit exceeded
 */
const API_ERROR_MARKET_MAX_PROPERTIES_LIMIT_EXCEED = 1418;
/**
 * Max variant limit exceeded
 */
const API_ERROR_MARKET_MAX_VARIANTS_LIMIT_EXCEED = 1419;
/**
 * Name too long
 */
const API_ERROR_MARKET_NAME_TOO_LONG = 1421;
/**
 * Variant value is too long
 */
const API_ERROR_MARKET_VARIANT_VALUE_TOO_LONG = 1423;
/**
 * Unknown property type
 */
const API_ERROR_MARKET_UNKNOWN_PROPERTY_TYPE = 1424;
/**
 * Grouping must have two or more items
 */
const API_ERROR_MARKET_GROUPING_MUST_CONTAIN_MORE_THAN_ONE_ITEM = 1425;
/**
 * Item must have distinct properties
 */
const API_ERROR_MARKET_GROUPING_ITEMS_MUST_HAVE_DISTINCT_PROPERTIES = 1426;
/**
 * Cart is empty
 */
const API_ERROR_MARKET_ORDERS_NO_CART_ITEMS = 1427;
/**
 * Cart total price less than min order price
 */
const API_ERROR_MARKET_ORDERS_LESS_THAN_MIN_ORDER_PRICE = 1428;
/**
 * Specify width, length, height and weight all together
 */
const API_ERROR_MARKET_INVALID_DIMENSIONS = 1429;
/**
 * VK Pay status can not be changed
 */
const API_ERROR_MARKET_CANT_CHANGE_VKPAY_STATUS = 1430;
/**
 * Market was already enabled in this group
 */
const API_ERROR_MARKET_SHOP_ALREADY_ENABLED = 1431;
/**
 * Market was already disabled in this group
 */
const API_ERROR_MARKET_SHOP_ALREADY_DISABLED = 1432;
/**
 * Invalid image crop format
 */
const API_ERROR_MARKET_PHOTOS_CROP_INVALID_FORMAT = 1433;
/**
 * Crop bottom right corner is outside of the image
 */
const API_ERROR_MARKET_PHOTOS_CROP_OVERFLOW = 1434;
/**
 * Crop size is less than the minimum
 */
const API_ERROR_MARKET_PHOTOS_CROP_SIZE_TOO_LOW = 1435;
/**
 * Order not found
 */
const API_ERROR_MARKET_ORDERS_ORDER_NOT_FOUND = 1436;
/**
 * At least one of required order form field is empty
 */
const API_ERROR_MARKET_ORDERS_REQUIRED_FIELD_IS_EMPTY = 1437;
/**
 * Market not enabled
 */
const API_ERROR_MARKET_NOT_ENABLED = 1438;
/**
 * The product is out of stock
 */
const API_ERROR_MARKET_ORDERS_OUT_OF_STOCK = 1439;
/**
 * Resulting item quantity is higher than limits
 */
const API_ERROR_MARKET_ORDERS_CART_ITEM_QUANTITY_EXCEEDED = 1440;
/**
 * Courier delivery not enabled in this group
 */
const API_ERROR_MARKET_COURIER_DELIVERY_NOT_ENABLED = 1441;
/**
 * Promo code already exists. Use market.editPromoCode
 */
const API_ERROR_MARKET_PROMO_CODE_ALREADY_EXISTS = 1442;
/**
 * Only one value of items_amount and items_percent can be grater than zero
 */
const API_ERROR_MARKET_PROMO_CODE_ITEMS_DISCOUNT = 1443;
/**
 * Only one value of delivery_amount and delivery_percent can be grater than zero
 */
const API_ERROR_MARKET_PROMO_CODE_DELIVERY_DISCOUNT = 1444;
/**
 * Invalid promo code name
 */
const API_ERROR_MARKET_PROMO_CODE_NAME = 1445;
/**
 * Main album can not be hidden
 */
const API_ERROR_MARKET_ALBUM_MAIN_HIDDEN = 1446;
/**
 * Market category is not valid
 */
const API_ERROR_MARKET_CATEGORY_IS_NOT_VALID = 1447;
/**
 * Too many attendant items
 */
const API_ERROR_MARKET_TOO_MANY_ATTENDANT_ITEMS = 1448;
/**
 * Promo codes limit exceed for this group
 */
const API_ERROR_MARKET_PROMO_CODE_LIMIT_EXCEED = 1449;
/**
 * Invalid time_from
 */
const API_ERROR_MARKET_PROMO_CODE_TIME_FROM = 1450;
/**
 * Invalid time_to
 */
const API_ERROR_MARKET_PROMO_CODE_TIME_TO = 1451;
/**
 * Several types of discounts have been selected
 */
const API_ERROR_MARKET_PROMO_CODE_MANY_DISCOUNT = 1452;
/**
 * Type of discount has not been selected
 */
const API_ERROR_MARKET_PROMO_CODE_EMPTY_DISCOUNT = 1453;
/**
 * apply_limit has come to an end
 */
const API_ERROR_MARKET_PROMO_CODE_APPLY_LIMIT_INVALID = 1454;
/**
 * Fields for extended promo codes are not available
 */
const API_ERROR_MARKET_PROMO_CODE_EXTENDED_FIELDS = 1455;
/**
 * Order status is invalid
 */
const API_ERROR_MARKET_ORDERS_INVALID_STATUS = 1456;
/**
 * Failed to set album as main
 */
const API_ERROR_MARKET_FAILED_TO_SET_ALBUM_AS_MAIN = 1457;
/**
 * Failed to unset album as main
 */
const API_ERROR_MARKET_FAILED_TO_UNSET_ALBUM_AS_MAIN = 1458;
/**
 * User is admin of community
 */
const API_ERROR_MARKET_COMMUNITY_REVIEW_USER_IS_GROUP_EDITOR = 1461;
/**
 * User has already left review
 */
const API_ERROR_MARKET_COMMUNITY_REVIEW_USER_LEFT_REVIEW = 1462;
/**
 * User account is new
 */
const API_ERROR_MARKET_COMMUNITY_REVIEW_USER_IS_NEW = 1463;
/**
 * Group is not business community
 */
const API_ERROR_MARKET_COMMUNITY_REVIEW_NOT_BUSINESS_COMMUNITY = 1464;
/**
 * Market items carousel feature disabled
 */
const API_ERROR_MARKET_CAROUSEL_DISABLED = 1465;
/**
 * Market user underage
 */
const API_ERROR_MARKET_USER_UNDERAGE = 1466;
/**
 * Invalid market delivery settings
 */
const API_ERROR_MARKET_DELIVERY_SETTINGS = 1467;
/**
 * Another profile linked to community
 */
const API_ERROR_MARKET_ANOTHER_PROFILE_LINKED_TO_COMMUNITY = 1468;
/**
 * Another community linked to profile
 */
const API_ERROR_MARKET_ANOTHER_COMMUNITY_LINKED_TO_PROFILE = 1469;
/**
 * Market set settings error
 */
const API_ERROR_MARKET_SET_SETTINGS = 1470;
/**
 * Market set payments settings error
 */
const API_ERROR_MARKET_PAYMENTS_SETTINGS = 1471;
/**
 * Invalid delivery method
 */
const API_ERROR_VKSTORE_INVALID_DELIVERY_METHOD = 1480;
/**
 * Specify contact phone
 */
const API_ERROR_VKSTORE_CONTACT_PHONE = 1481;
/**
 * Specify delivery person
 */
const API_ERROR_VKSTORE_DELIVERY_PERSON = 1482;
/**
 * Specify delivery address
 */
const API_ERROR_VKSTORE_DELIVERY_ADDRESS = 1483;
/**
 * Insufficient order amount for the selected delivery method
 */
const API_ERROR_VKSTORE_DELIVERY_MIN_PRICE = 1484;
/**
 * Waiting for another order to be processed
 */
const API_ERROR_VKSTORE_ORDER_LOCKED = 1485;
/**
 * Failed to save order
 */
const API_ERROR_VKSTORE_ORDER_SAVE = 1486;
/**
 * Failed to pay order
 */
const API_ERROR_VKSTORE_ORDER_PAY = 1487;
/**
 * Cart items changed
 */
const API_ERROR_VKSTORE_CART_ITEMS_CHANGED = 1488;
/**
 * Failed to cancel order, wrong status
 */
const API_ERROR_VKSTORE_ORDER_CANCEL_WRONG_STATUS = 1489;
/**
 * Failed to cancel order
 */
const API_ERROR_VKSTORE_ORDER_CANCEL = 1490;
/**
 * Not enough coins
 */
const API_ERROR_VKSTORE_NOT_ENOUGH_COINS = 1491;
/**
 * Item count limit exceeded
 */
const API_ERROR_VKSTORE_ITEM_COUNT_LIMIT = 1492;
/**
 * Editing archived promo code
 */
const API_ERROR_MARKET_PROMO_CODE_EDITING_ARCHIVE = 1496;
/**
 * Failed to close order, wrong status
 */
const API_ERROR_VKSTORE_ORDER_CLOSE_WRONG_STATUS = 1497;
/**
 * Failed to close order
 */
const API_ERROR_VKSTORE_ORDER_CLOSE = 1498;
/**
 * Item is deleted
 */
const API_ERROR_MARKET_ITEM_IS_DELETED = 1507;
/**
 * Item is service
 */
const API_ERROR_MARKET_ITEM_IS_SERVICE = 1508;
/**
 * Item reviews is disabled
 */
const API_ERROR_MARKET_ITEM_REVIEW_DISABLED = 1509;
/**
 * Community is not a business
 */
const API_ERROR_MARKET_ITEM_REVIEW_NOT_BUSINESS = 1510;
/**
 * Community is marked as government group
 */
const API_ERROR_MARKET_ITEM_REVIEW_IS_GOVERNMENT = 1511;
/**
 * User is too new
 */
const API_ERROR_MARKET_ITEM_REVIEW_NEW_USER = 1512;
/**
 * Review already exists
 */
const API_ERROR_MARKET_ITEM_REVIEW_ALREADY_EXISTS = 1513;
/**
 * User is in blacklist of community
 */
const API_ERROR_MARKET_ITEM_REVIEW_USER_BLACKLISTED = 1514;
/**
 * Community is private
 */
const API_ERROR_MARKET_ITEM_REVIEW_GROUP_IS_PRIVATE = 1515;
/**
 * Not a pro market
 */
const API_ERROR_MARKET_ITEM_REVIEW_NOT_PRO_MARKET = 1516;
/**
 * There are stop words in text
 */
const API_ERROR_MARKET_ITEM_REVIEW_STOP_WORDS_IN_TEXT = 1517;
/**
 * Item is not deleted
 */
const API_ERROR_MARKET_ITEM_IS_NOT_DELETED = 1518;
/**
 * Reviews not found
 */
const API_ERROR_MARKET_REVIEWS_NOT_FOUND = 1519;
/**
 * Reviews not available
 */
const API_ERROR_MARKET_REVIEWS_NOT_AVAILABLE = 1520;
/**
 * Friends error
 */
const API_ERROR_MARKET_COMMUNITY_REVIEW_FRIENDS = 1522;
/**
 * Add to cart error
 */
const API_ERROR_MARKET_ADD_TO_CART = 1524;
/**
 * Market is disabled
 */
const API_ERROR_MARKET_DISABLED = 1525;
/**
 * Market services are disabled
 */
const API_ERROR_MARKET_SERVICES_DISABLED = 1526;
/**
 * Add to cart limit reached
 */
const API_ERROR_MARKET_ADD_TO_CART_LIMIT = 1530;
/**
 * Add item to service album
 */
const API_ERROR_MARKET_ADD_TO_SERVICE_ALBUM = 1531;
/**
 * Add service to market album
 */
const API_ERROR_MARKET_ADD_TO_MARKET_ALBUM = 1532;
/**
 * Cart is locked
 */
const API_ERROR_MARKET_CART_IS_LOCKED = 1533;
/**
 * Unknown user location
 */
const API_ERROR_MARKET_UNKNOWN_USER_LOCATION = 1534;
/**
 * Another group binded to YC branch
 */
const API_ERROR_YCLIENTS_ANOTHER_GROUP_BINDED_TO_BRANCH = 1550;
/**
 * Another YC branch  binded to group
 */
const API_ERROR_YCLIENTS_ANOTHER_BRANCH_BINDED_TO_GROUP = 1551;
/**
 * The specified bind already exists
 */
const API_ERROR_YCLIENTS_BIND_ALREADY_EXISTS = 1552;
/**
 * Group is not bound to YC branch
 */
const API_ERROR_YCLIENTS_GROUP_NOT_BINDED_TO_BRANCH = 1553;
/**
 * No active binding for group and YC branch
 */
const API_ERROR_YCLIENTS_NO_ACTIVE_BINDING = 1554;
/**
 * YC branch has no license
 */
const API_ERROR_YCLIENTS_BRANCH_HAS_NO_LICENSE = 1555;
/**
 * YC api error
 */
const API_ERROR_YCLIENTS_API_ERROR = 1560;
/**
 * VK boosts trial already exists
 */
const API_ERROR_VK_BOOSTS_TRIAL_EXISTS = 1580;
/**
 * Can't start VK boosts due to no YC license
 */
const API_ERROR_VK_BOOSTS_NO_LICENSE = 1581;
/**
 * Can't start VK boosts due to no content available
 */
const API_ERROR_VK_BOOSTS_NO_CONTENT_AVAILABLE = 1582;
/**
 * VK boosts already exists
 */
const API_ERROR_VK_BOOSTS_EXISTS = 1583;
/**
 * VK boosts trial has not expired
 */
const API_ERROR_VK_BOOSTS_TRIAL_NOT_EXPIRED = 1584;
/**
 * VK boost was started by another user
 */
const API_ERROR_VK_BOOSTS_ANOTHER_BOOST_USER_STARTED = 1585;
/**
 * Active VK boost not found
 */
const API_ERROR_VK_BOOSTS_NO_ACTIVE_BOOST = 1586;
/**
 * VK boosts not found
 */
const API_ERROR_VK_BOOSTS_NOT_FOUND = 1587;
/**
 * Story has already expired
 */
const API_ERROR_STORY_EXPIRED = 1600;
/**
 * Incorrect reply privacy
 */
const API_ERROR_STORY_INCORRECT_REPLY_PRIVACY = 1602;
/**
 * Phone or email were missing or invalid
 */
const API_ERROR_RESTORE_INCORRECT_PHONE_OR_EMAIL = 1801;
/**
 * User was not found
 */
const API_ERROR_RESTORE_USER_WAS_NOT_FOUND = 1802;
/**
 * Phone number is occupied
 */
const API_ERROR_RESTORE_PHONE_OCCUPIED = 1803;
/**
 * Phone format is incorrect
 */
const API_ERROR_RESTORE_PHONE_FORMAT = 1804;
/**
 * Card not found
 */
const API_ERROR_PRETTY_CARDS_CARD_NOT_FOUND = 1900;
/**
 * Too many cards
 */
const API_ERROR_PRETTY_CARDS_TOO_MANY_CARDS = 1901;
/**
 * Card is connected to post
 */
const API_ERROR_PRETTY_CARDS_CARD_IS_CONNECTED_TO_POST = 1902;
/**
 * Servers number limit is reached
 */
const API_ERROR_CALLBACK_API_SERVERS_LIMIT = 2000;
/**
 * Stickers are not purchased
 */
const API_ERROR_STICKERS_NOT_PURCHASED = 2100;
/**
 * Too many favorite stickers
 */
const API_ERROR_STICKERS_TOO_MANY_FAVORITES = 2101;
/**
 * Stickers are not favorite
 */
const API_ERROR_STICKERS_NOT_FAVORITE = 2102;
/**
 * Episode not found
 */
const API_ERROR_PODCASTS_EPISODE_NOT_FOUND = 2300;
/**
 * Podcasts is not available for this owner
 */
const API_ERROR_PODCASTS_OWNER_DISABLED = 2301;
/**
 * Podcasts already moderation
 */
const API_ERROR_PODCASTS_ALREADY_MODERATION = 2302;
/**
 * Episode and podcast have different owners
 */
const API_ERROR_PODCASTS_EPISODE_OWNER_MISMATCH = 2303;
/**
 * Episode does not belong to this podcast
 */
const API_ERROR_PODCASTS_EPISODE_NOT_IN_PODCAST = 2304;
/**
 * Episode is being processed, try again later
 */
const API_ERROR_PODCASTS_EPISODE_PENDING = 2305;
/**
 * User already has card
 */
const API_ERROR_STUDENTS_VERIFICATION_CARD_ALREADY_EXISTS = 2500;
/**
 * Message must not be empty
 */
const API_ERROR_TEXTLIVES_EMPTY_MESSAGE = 2600;
/**
 * There must be no more than one attachment
 */
const API_ERROR_TEXTLIVES_TOO_MANY_ATTACHMENTS = 2601;
/**
 * Author is not suitable
 */
const API_ERROR_TEXTLIVES_AUTHOR_IS_INVALID = 2602;
/**
 * Live Text is finished
 */
const API_ERROR_TEXTLIVES_TEXTLIVE_IS_FINISHED = 2603;
/**
 * Live Text is unavailable
 */
const API_ERROR_TEXTLIVES_TEXTLIVE_IS_UNAVAILABLE = 2604;
/**
 * Server error, try again
 */
const API_ERROR_TEXTLIVES_SERVER_TRY_AGAIN = 2605;
/**
 * Message is too big
 */
const API_ERROR_TEXTLIVES_MESSAGE_IS_TOO_BIG = 2606;
/**
 * Bot is not in this chat
 */
const API_ERROR_BOT_NOT_IN_CHAT = 3001;
/**
 * Specified link is incorrect (can't find source)
 */
const API_ERROR_WALL_CHECK_LINK_CANT_DETERMINE_SOURCE = 3102;
/**
 * Unban data expired
 */
const API_ERROR_UNBLOCK_UNBAN_DATA_EXPIRED = 3200;
/**
 * Recaptcha needed
 */
const API_ERROR_RECAPTCHA = 3300;
/**
 * Phone validation needed
 */
const API_ERROR_PHONE_VALIDATION_NEED = 3301;
/**
 * Password validation needed
 */
const API_ERROR_PASSWORD_VALIDATION_NEED = 3302;
/**
 * Otp app validation needed
 */
const API_ERROR_OTP_VALIDATION_NEED = 3303;
/**
 * Email confirmation needed
 */
const API_ERROR_EMAIL_CONFIRMATION_NEED = 3304;
/**
 * Assert votes
 */
const API_ERROR_ASSERT_VOTES = 3305;
/**
 * App is not registered
 */
const API_ERROR_PROMO_CODES_APP_IS_NOT_REGISTERED = 3500;
/**
 * Partner disabled
 */
const API_ERROR_PROMO_CODES_PARTNER_DISABLED = 3501;
/**
 * Campaign does not exist
 */
const API_ERROR_PROMO_CODES_CAMPAIGN_DOES_NOT_EXIST = 3502;
/**
 * Campaign disabled
 */
const API_ERROR_PROMO_CODES_CAMPAIGN_DISABLED = 3503;
/**
 * Limit is reached
 */
const API_ERROR_PROMO_CODES_LIMIT_IS_REACHED = 3504;
/**
 * Quota exceeded
 */
const API_ERROR_PROMO_CODES_QUOTA_EXCEEDED = 3505;
/**
 * Task is not complete
 */
const API_ERROR_PROMO_CODES_TASK_IS_NOT_COMPLETE = 3506;
/**
 * Task does not exist
 */
const API_ERROR_PROMO_CODES_TASK_DOES_NOT_EXIST = 3507;
/**
 * Item is not available
 */
const API_ERROR_PROMO_CODES_ITEM_IS_NOT_AVAILABLE = 3508;
/**
 * User has partner subscription
 */
const API_ERROR_PROMO_CODES_PARTNER_SUBSCRIPTION_EXISTS = 3509;
/**
 * User already has this sticker pack
 */
const API_ERROR_PROMO_CODES_STICKER_PACK_IS_ALREADY_ADDED = 3510;
/**
 * User has already activated discount this month
 */
const API_ERROR_PROMO_CODES_ADD_DISCOUNT_STICKERS_LIMIT_ACTIVATION = 3511;
/**
 * User has already activated promocode this day
 */
const API_ERROR_PROMO_CODES_ADD_PROMOCODE_LIMIT_ACTIVATION_PER_DAY = 3512;
/**
 * Promocode expired
 */
const API_ERROR_PROMO_CODES_PROMOCODE_EXPIRED = 3513;
/**
 * Promocode has activated
 */
const API_ERROR_PROMO_CODES_PROMOCODE_ACTIVATED = 3514;
/**
 * Promocode has other related user
 */
const API_ERROR_PROMO_CODES_PROMOCODE_BIND_OTHER_USER = 3515;
/**
 * Phone is not verified
 *
 * Не верифицирован
 */
const API_ERROR_PHONE_IS_NOT_VERIFIED = 3607;
/**
 * Token extension required
 *
 * Ошибка, при которой необходима замена текущего a/t на новый после ввода пароля
 */
const API_ERROR_TOKEN_EXTENSION_REQUIRED = 3609;
/**
 * User is deactivated
 *
 * Пользователь удалился из VK Connect, но может быть восстановлен
 */
const API_ERROR_USER_DEACTIVATED = 3610;
/**
 * Service is deactivated for user
 *
 * Пользователь удалился из сервиса VK Connect
 */
const API_ERROR_USER_SERVICE_DEACTIVATED = 3611;
/**
 * User already has external binding
 *
 * Возникает при попытке привязать очередную учетную запись одного и того же внешнего сервиса
 */
const API_ERROR_USER_ALREADY_HAS_EXTERNAL_BINDING = 3612;
/**
 * Error while sending code
 *
 * Ошибка отправки OTP
 */
const API_ERROR_OTP_SEND = 3615;
/**
 * Flood error while sending code
 *
 * Сработал флуд контроль при отправке OTP
 */
const API_ERROR_FLOOD_OTP_SEND = 3616;
/**
 * Resend delay hasn't expired
 */
const API_ERROR_RESEND_DELAY_NOT_EXPIRED = 3617;
/**
 * Invalid email
 *
 * Невалидная почта
 */
const API_ERROR_INVALID_EMAIL = 3618;
/**
 * No access to user's wishlist
 */
const API_ERROR_WISHLISTS_NO_ACCESS_NOT_FRIEND = 3700;
/**
 * Ticket id not found in title
 */
const API_ERROR_SUPPORT_TICKET_ID_NOT_FOUND = 3701;
/**
 * Ticket with this id not found
 */
const API_ERROR_SUPPORT_TICKET_NOT_FOUND = 3702;
/**
 * Can't set AliExpress tag to this type of object
 */
const API_ERROR_FAVE_ALIEXPRESS_TAG = 3800;
/**
 * Unsupported notification type
 */
const API_ERROR_NOTIFICATION_TYPE_UNSUPPORTED = 4101;
/**
 * Invalid notification parameters
 */
const API_ERROR_NOTIFICATION_PARAMS_INVALID = 4102;
/**
 * Incorrect header length
 */
const API_ERROR_MICROLANDINGS_HEADER_LENGTH = 4200;
/**
 * Incorrect desc length
 */
const API_ERROR_MICROLANDINGS_DESC_LENGTH = 4201;
/**
 * Incorrect advantages count
 */
const API_ERROR_MICROLANDINGS_ADVANTAGE_MAX_COUNT = 4202;
/**
 * Incorrect advantage length
 */
const API_ERROR_MICROLANDINGS_ADVANTAGE_LENGTH = 4203;
/**
 * Incorrect phone format
 */
const API_ERROR_MICROLANDINGS_PHONE_FORMAT = 4204;
/**
 * Incorrect email format
 */
const API_ERROR_MICROLANDINGS_EMAIL_FORMAT = 4205;
/**
 * Incorrect url format
 */
const API_ERROR_MICROLANDINGS_URL_FORMAT = 4206;
/**
 * Url is not safety
 */
const API_ERROR_MICROLANDINGS_URL_NOT_SAFETY = 4207;
/**
 * Incorrect vk contact
 */
const API_ERROR_MICROLANDINGS_VK_CONTACT = 4208;
/**
 * Community messages for lead form is disabled
 */
const API_ERROR_MICROLANDINGS_LEAD_FORM_DISABLE_MESSAGES = 4209;
/**
 * Community messages for send vk button is disabled
 */
const API_ERROR_MICROLANDINGS_SEND_VK_DISABLE_MESSAGES = 4210;
/**
 * Incorrect rights name
 */
const API_ERROR_MICROLANDINGS_LEAD_FORM_INCORRECT_NAME = 4211;
/**
 * Incorrect rights email
 */
const API_ERROR_MICROLANDINGS_LEAD_FORM_INCORRECT_EMAIL = 4212;
/**
 * Incorrect rights ogrn
 */
const API_ERROR_MICROLANDINGS_LEAD_FORM_INCORRECT_OGRN = 4213;
/**
 * Incorrect cta button
 */
const API_ERROR_MICROLANDINGS_CTA_BUTTON = 4214;
/**
 * Incorrect rights address
 */
const API_ERROR_MICROLANDINGS_LEAD_FORM_INCORRECT_ADDRESS = 4215;
/**
 * Need agree with rights
 */
const API_ERROR_MICROLANDINGS_LEAD_FORM_INCORRECT_AGREE = 4216;
/**
 * Incorrect cta button
 */
const API_ERROR_MICROLANDINGS_CTA_BUTTON_INCORRECT = 4224;
/**
 * Incorrect content block title length
 */
const API_ERROR_MICROLANDINGS_CONTENT_BLOCK_TITLE_LENGTH = 4225;
/**
 * Incorrect content block desc length
 */
const API_ERROR_MICROLANDINGS_CONTENT_BLOCK_DESC_LENGTH = 4226;
/**
 * Incorrect content block attach
 */
const API_ERROR_MICROLANDINGS_CONTENT_BLOCK_INCORRECT_ATTACH = 4227;
/**
 * Incorrect content block attachments count
 */
const API_ERROR_MICROLANDINGS_CONTENT_BLOCK_ATTACH_MAX_COUNT = 4228;
/**
 * Incorrect products block header length
 */
const API_ERROR_MICROLANDINGS_PRODUCTS_BLOCK_HEADER_LENGTH = 4229;
/**
 * Incorrect photos block header length
 */
const API_ERROR_MICROLANDINGS_PHOTOS_BLOCK_HEADER_LENGTH = 4230;
/**
 * Incorrect reviews block header length
 */
const API_ERROR_MICROLANDINGS_REVIEWS_BLOCK_HEADER_LENGTH = 4231;
/**
 * Uploaded video is restricted
 */
const API_ERROR_MICROLANDINGS_VIDEO_RESTRICTED = 4232;
/**
 * Uploaded video is out of max duration
 */
const API_ERROR_MICROLANDINGS_VIDEO_MAX_DURATION = 4233;
/**
 * Incorrect pixel id
 */
const API_ERROR_MICROLANDINGS_INCORRECT_PIXEL_ID = 4234;
/**
 * Incorrect block type
 */
const API_ERROR_MICROLANDINGS_INCORRECT_BLOCK_TYPE = 4235;
/**
 * Incorrect lead form widget block header length
 */
const API_ERROR_MICROLANDINGS_LEAD_FORM_WIDGET_BLOCK_HEADER_LENGTH = 4236;
/**
 * Incorrect lead form widget block subheader length
 */
const API_ERROR_MICROLANDINGS_LEAD_FORM_WIDGET_BLOCK_SUBHEADER_LENGTH = 4237;
/**
 * Incorrect lead form widget block incorrect cta button
 */
const API_ERROR_MICROLANDINGS_LEAD_FORM_WIDGET_BLOCK_CTA_BUTTON_INCORRECT = 4238;
/**
 * Invalid font id
 */
const API_ERROR_MICROLANDINGS_APPEARANCE_INVALID_FONT_ID = 4239;
/**
 * Invalid button radius
 */
const API_ERROR_MICROLANDINGS_APPEARANCE_INVALID_BUTTON_RADIUS = 4240;
/**
 * Invalid background
 */
const API_ERROR_MICROLANDINGS_APPEARANCE_INVALID_BACKGROUND = 4241;
/**
 * Invalid font size
 */
const API_ERROR_MICROLANDINGS_APPEARANCE_INVALID_FONT_SIZE = 4242;
/**
 * Incorrect lead magnet block header length
 */
const API_ERROR_MICROLANDINGS_LEAD_MAGNET_BLOCK_HEADER_LENGTH = 4243;
/**
 * Incorrect lead magnet block success message length
 */
const API_ERROR_MICROLANDINGS_LEAD_MAGNET_BLOCK_SUCCESS_MESSAGE_LENGTH = 4244;
/**
 * Incorrect lead magnet block cta type
 */
const API_ERROR_MICROLANDINGS_LEAD_MAGNET_BLOCK_CTA_TYPE_INCORRECT = 4245;
/**
 * Incorrect lead magnet block attach
 */
const API_ERROR_MICROLANDINGS_LEAD_MAGNET_BLOCK_ATTACH_INCORRECT = 4246;
/**
 * Incorrect lead magnet block attach value length
 */
const API_ERROR_MICROLANDINGS_LEAD_MAGNET_BLOCK_ATTACH_VALUE_LENGTH = 4247;
/**
 * Incorrect lead magnet block attach value doc
 */
const API_ERROR_MICROLANDINGS_LEAD_MAGNET_BLOCK_ATTACH_VALUE_DOC_INCORRECT = 4248;
/**
 * Incorrect format of custom domain name
 */
const API_ERROR_MICROLANDINGS_CUSTOM_DOMAIN_INCORRECT_FORMAT = 4249;
/**
 * Url of custom domain is not safe
 */
const API_ERROR_MICROLANDINGS_CUSTOM_DOMAIN_URL_NOT_SAFE = 4250;
/**
 * Invalid font weight
 */
const API_ERROR_MICROLANDINGS_APPEARANCE_INVALID_FONT_WEIGHT = 4252;
/**
 * Custom domain name is not set
 */
const API_ERROR_MICROLANDINGS_CUSTOM_DOMAIN_NAME_NOT_SET = 4253;
/**
 * Can't give gift
 */
const API_ERROR_FORTUNE_SQUARE_GIVE_GIFTS = 4301;
/**
 * User state not found
 */
const API_ERROR_FORTUNE_SQUARE_USER_STATE_NOT_FOUND = 4302;
/**
 * Wrong while spin process
 */
const API_ERROR_FORTUNE_SQUARE_SPIN_PROCESS = 4303;
/**
 * Sector not found
 */
const API_ERROR_FORTUNE_SQUARE_SECTOR_NOT_FOUND = 4304;
/**
 * End date is greater than year in future
 */
const API_ERROR_VKRUN_END_DATE_GREATER_THAN_YEAR = 4400;
/**
 * End date is less or equal than start date
 */
const API_ERROR_VKRUN_END_DATE_LESS_OR_EQUAL_THAN_START_DATE = 4401;
/**
 * Cannot accept challenge
 */
const API_ERROR_VKRUN_CHALLENGE_CANNOT_ACCEPT = 4402;
/**
 * Cannot leave from challenge
 */
const API_ERROR_VKRUN_CHALLENGE_CANNOT_LEAVE = 4403;
/**
 * Invitation is outdated
 */
const API_ERROR_VKRUN_INVITATION_IS_OUTDATED = 4405;
/**
 * Cannot ban user with current status
 */
const API_ERROR_VKRUN_CHALLENGE_CANNOT_BAN_USER_CURRENT_STATUS = 4406;
/**
 * Cannot invite users
 */
const API_ERROR_VKRUN_CHALLENGE_CANNOT_INVITE_USERS = 4407;
/**
 * Resource locked. To avoid this you should provide another idempotency_key
 */
const API_ERROR_API_ERROR_VKRUN_RESOURCE_LOCKED = 4409;
/**
 * Not enough coins
 */
const API_ERROR_API_ERROR_VKRUN_NOT_ENOUGH_COINS = 4410;
/**
 * Out of stock
 */
const API_ERROR_API_ERROR_VKRUN_OUT_OF_STOCK = 4411;
/**
 * Import is disabled
 */
const API_ERROR_API_ERROR_VKRUN_IMPORT_DISABLED = 4412;
/**
 * Resource is locked
 */
const API_ERROR_HEALTH_RESOURCE_LOCKED = 4450;
/**
 * Logic error
 */
const API_ERROR_HEALTH_LOGIC_ERROR = 4451;
/**
 * There is no user with such id
 */
const API_ERROR_CLASSIFIEDS_USER_NOT_FOUND = 4500;
/**
 * There is no product with such id
 */
const API_ERROR_CLASSIFIEDS_PRODUCT_NOT_FOUND = 4501;
/**
 * Invalid notification_type
 */
const API_ERROR_CLASSIFIEDS_NOTIFICATION_INVALID_TYPE = 4502;
/**
 * Invalid notification_text
 */
const API_ERROR_CLASSIFIEDS_NOTIFICATION_INVALID_TEXT = 4503;
/**
 * Request with such id has been already sent
 */
const API_ERROR_CLASSIFIEDS_CORRELATION_ERROR = 4504;
/**
 * Error while sending notification
 */
const API_ERROR_CLASSIFIEDS_NOTIFICATION_SENDING_ERROR = 4505;
/**
 * Invalid chat type
 */
const API_ERROR_CLASSIFIEDS_INVALID_CHAT_TYPE = 4506;
/**
 * Could not send message
 */
const API_ERROR_CLASSIFIEDS_COULD_NOT_SEND_MESSAGE = 4507;
/**
 * Group classifieds section is disabled
 */
const API_ERROR_CLASSIFIEDS_GROUP_CLASSIFIEDS_SECTION_IS_DISABLED = 4508;
/**
 * Allowed categories for group not found
 */
const API_ERROR_CLASSIFIEDS_ALLOWED_CATEGORIES_FOR_GROUP_NOT_FOUND = 4509;
/**
 * Error when issuing cities
 */
const API_ERROR_CLASSIFIEDS_YOULA_CITIES_LOAD_ERROR = 4510;
/**
 * Failed to archive product
 */
const API_ERROR_CLASSIFIEDS_YOULA_PRODUCT_ARCHIVING_ERROR = 4511;
/**
 * Classifieds mode in group does not match with requested
 */
const API_ERROR_CLASSIFIEDS_INVALID_GROUP_MODE = 4513;
/**
 * Group was not approved by moderation
 */
const API_ERROR_CLASSIFIEDS_NOT_MODERATED_COMMUNITY = 4514;
/**
 * Group has no geo selected
 */
const API_ERROR_CLASSIFIEDS_EMPTY_GEO_IN_COMMUNITY = 4515;
/**
 * Group categories do not match with requested
 */
const API_ERROR_CLASSIFIEDS_INVALID_CATEGORY = 4516;
/**
 * Requested geo does not match with geo selected in group
 */
const API_ERROR_CLASSIFIEDS_INVALID_GEO = 4517;
/**
 * User in black list in requested community
 */
const API_ERROR_CLASSIFIEDS_USER_IN_BLACKLIST = 4518;
/**
 * Community not found
 */
const API_ERROR_CLASSIFIEDS_COMMUNITY_NOT_FOUND = 4519;
/**
 * Invalid photo ID
 */
const API_ERROR_CLASSIFIEDS_INVALID_PHOTO_ID = 4520;
/**
 * Prizes in contest run out
 */
const API_ERROR_CLASSIFIEDS_CONTEST_PRIZES_RUN_OUT = 4521;
/**
 * Max prizes count per user exceeded
 */
const API_ERROR_CLASSIFIEDS_CONTEST_MAX_PRIZE_COUNT_EXCEEDED = 4522;
/**
 * No user identifier
 */
const API_ERROR_CLASSIFIEDS_NOTIFICATION_EMPTY_USER_IDENTIFIER = 4523;
/**
 * Phone not found
 */
const API_ERROR_CLASSIFIEDS_NOTIFICATION_PHONE_NOT_FOUND = 4524;
/**
 * Photo access error
 */
const API_ERROR_CLASSIFIEDS_PHOTO_ACCESS_ERROR = 4525;
/**
 * User is locked error
 */
const API_ERROR_CLASSIFIEDS_USER_IS_LOCKED_ERROR = 4526;
/**
 * Product duplicate error
 */
const API_ERROR_CLASSIFIEDS_PRODUCT_DUPLICATE_ERROR = 4527;
/**
 * Post is not classifieds product
 */
const API_ERROR_CLASSIFIEDS_POST_IS_NOT_PRODUCT = 4528;
/**
 * Can not subscribe to user
 */
const API_ERROR_CLASSIFIEDS_SUBSCRIPTION_ADD_ERROR = 4529;
/**
 * Can not unsubscribe from user
 */
const API_ERROR_CLASSIFIEDS_SUBSCRIPTION_DEL_ERROR = 4530;
/**
 * Can not add user to blacklist
 */
const API_ERROR_CLASSIFIEDS_BLACKLIST_ADD_ERROR = 4531;
/**
 * Can not delete user from blacklist
 */
const API_ERROR_CLASSIFIEDS_BLACKLIST_DEL_ERROR = 4532;
/**
 * Notifications was disabled
 */
const API_ERROR_CLASSIFIEDS_NOTIFICATION_DISABLED = 4533;
/**
 * Can not send message
 */
const API_ERROR_CLASSIFIEDS_SEND_MESSAGE_ERROR = 4534;
/**
 * Create chat error
 */
const API_ERROR_CLASSIFIEDS_CREATE_CHAT_ERROR = 4535;
/**
 * Product is blocked
 */
const API_ERROR_CLASSIFIEDS_PRODUCT_IS_BLOCKED_ERROR = 4536;
/**
 * Product is sold
 */
const API_ERROR_CLASSIFIEDS_PRODUCT_IS_SOLD_ERROR = 4537;
/**
 * Product is not active
 */
const API_ERROR_CLASSIFIEDS_PRODUCT_IS_NOT_ACTIVE_ERROR = 4538;
/**
 * Classified detector returns null
 */
const API_ERROR_CLASSIFIEDS_EMPTY_RESULT = 4539;
/**
 * No account
 */
const API_ERROR_LOYALTY_NO_ACCOUNT = 5000;
/**
 * Task already completed
 */
const API_ERROR_LOYALTY_TASK_ALREADY_COMPLETED = 5001;
/**
 * Task not found
 */
const API_ERROR_LOYALTY_TASK_NOT_FOUND = 5002;
/**
 * Request processing
 */
const API_ERROR_LOYALTY_REQUEST_PROCESSING = 5003;
/**
 * Request failed
 */
const API_ERROR_LOYALTY_REQUEST_FAILED = 5004;
/**
 * Request finished
 */
const API_ERROR_LOYALTY_REQUEST_FINISHED = 5005;
/**
 * Offer not found
 */
const API_ERROR_LOYALTY_OFFER_NOT_FOUND = 5006;
/**
 * Not enough money
 */
const API_ERROR_LOYALTY_NOT_ENOUGH_MONEY = 5007;
/**
 * Coupon expired
 */
const API_ERROR_LOYALTY_COUPON_EXPIRED = 5008;
/**
 * Coupon has no available code
 */
const API_ERROR_LOYALTY_COUPON_HAS_NO_AVAILABLE_CODE = 5009;
/**
 * Coupon unknown error
 */
const API_ERROR_LOYALTY_COUPON_UNKNOWN_ERROR = 5010;
/**
 * Coupon not active
 */
const API_ERROR_LOYALTY_COUPON_NOT_ACTIVE = 5011;
/**
 * Coupon access denied
 */
const API_ERROR_LOYALTY_COUPON_ACCESS_DENIED = 5012;
/**
 * Coupon invalid_distribution
 */
const API_ERROR_LOYALTY_COUPON_INVALID_DISTRIBUTION = 5013;
/**
 * Offer has no price
 */
const API_ERROR_LOYALTY_OFFER_HAS_NO_PRICE = 5014;
/**
 * Offer has no coupon
 */
const API_ERROR_LOYALTY_OFFER_HAS_NO_COUPON = 5015;
/**
 * Request has already been processed successfully
 */
const API_ERROR_LOYALTY_REQUEST_ALREADY_PROCESSED_SUCCESSFULLY = 5016;
/**
 * Partner's app_id already exist
 */
const API_ERROR_LOYALTY_PARTNER_APP_ID_ALREADY_EXIST = 5017;
/**
 * Can't buy offer
 */
const API_ERROR_LOYALTY_CANT_BUY_OFFER = 5018;
/**
 * Wrong code
 */
const API_ERROR_LOYALTY_WRONG_CODE = 5019;
/**
 * Used code
 */
const API_ERROR_LOYALTY_USED_CODE = 5020;
/**
 * Incorrect task type
 */
const API_ERROR_LOYALTY_INCORRECT_TASK_TYPE = 5021;
/**
 * Task not started
 */
const API_ERROR_LOYALTY_TASK_NOT_STARTED = 5022;
/**
 * Wrong promocode
 */
const API_ERROR_LOYALTY_WRONG_PROMOCODE = 5023;
/**
 * Is bot
 */
const API_ERROR_LOYALTY_IS_BOT = 5024;
/**
 * Need verify
 */
const API_ERROR_LOYALTY_NEED_VERIFY = 5025;
/**
 * Verification is in progress
 */
const API_ERROR_LOYALTY_VERIFICATION_IN_PROGRESS = 5026;
/**
 * User wrong region
 */
const API_ERROR_LOYALTY_USER_WRONG_REGION = 5027;
/**
 * Team with this event id or token not found
 */
const API_ERROR_LOYALTY_TEAM_NOT_FOUND = 5028;
/**
 * Team with this event id is full
 */
const API_ERROR_LOYALTY_TEAM_IS_FULL = 5029;
/**
 * Team code is already used
 */
const API_ERROR_LOYALTY_TEAM_CODE_IS_USED = 5030;
/**
 * User must win in previous event before start current
 */
const API_ERROR_LOYALTY_WIN_PREVIOUS_EVENT = 5032;
/**
 * User already exists
 */
const API_ERROR_LOYALTY_USER_ALREADY_EXISTS = 5033;
/**
 * Leaderboard template not found
 */
const API_ERROR_LOYALTY_LEADERBOARD_TEMPLATE_NOT_FOUND = 5034;
/**
 * Leaderboard not found
 */
const API_ERROR_LOYALTY_LEADERBOARD_NOT_FOUND = 5035;
/**
 * Category task not allowed
 */
const API_ERROR_LOYALTY_CATEGORY_TASK_NOT_ALLOWED = 5036;
/**
 * Quantity stickers is exhausted
 */
const API_ERROR_LOYALTY_STICKER_NOT_AVAILABLE = 5037;
/**
 * Requested feature is disabled
 */
const API_ERROR_LOYALTY_FEATURE_DISABLED = 5038;
/**
 * Coupon removed
 */
const API_ERROR_COUPONS_COUPON_REMOVED = 5100;
/**
 * Coupon expired
 */
const API_ERROR_COUPONS_COUPON_EXPIRED = 5101;
/**
 * Coupon is not active
 */
const API_ERROR_COUPONS_COUPON_NOT_ACTIVE = 5102;
/**
 * No available codes
 */
const API_ERROR_COUPONS_NO_AVAILABLE_CODE = 5103;
/**
 * Upsell is not available
 */
const API_ERROR_MUSIC_UPSELL_NOT_AVAILABLE = 5200;
/**
 * URL domain is not allowed to advertise
 */
const API_ERROR_URL_DOMAIN_BANNED = 5300;
/**
 * Inappropriate source
 */
const API_ERROR_PARAM_SOURCE = 5400;
/**
 * Need to enter linked phone
 */
const API_ERROR_NEED_ENTER_PHONE = 5401;
/**
 * Incorrect snippet URL
 */
const API_ERROR_UTILS_SNIPPET_URL_INCORRECT = 5500;
/**
 * Snippet URL timeout
 */
const API_ERROR_UTILS_SNIPPET_URL_TIMEOUT = 5501;
/**
 * Status is already set
 */
const API_ERROR_INAPP_ORDERS_STATUS_IS_ACTUAL = 5600;
/**
 * Requested status transition is forbidden
 */
const API_ERROR_INAPP_ORDERS_STATUS_TRANSITION_FORBIDDEN = 5601;
/**
 * Order is not found
 */
const API_ERROR_INAPP_ORDERS_NOT_FOUND = 5602;
/**
 * Access denied
 */
const API_ERROR_INAPP_ORDERS_ACCESS_DENIED = 5603;
/**
 * Invalid upload response
 */
const API_ERROR_GO_UPLOAD_INVALID_RESPONSE = 5701;
/**
 * Invalid upload hash
 */
const API_ERROR_GO_UPLOAD_INVALID_UPLOAD_HASH = 5702;
/**
 * Invalid upload user
 */
const API_ERROR_GO_UPLOAD_INVALID_USER = 5703;
/**
 * Invalid upload group
 */
const API_ERROR_GO_UPLOAD_INVALID_GROUP = 5704;
/**
 * Invalid crop data
 */
const API_ERROR_GO_UPLOAD_INVALID_CROP = 5705;
/**
 * To small avatar
 */
const API_ERROR_GO_UPLOAD_TO_SMALL_AVATAR = 5706;
/**
 * Photo not found
 */
const API_ERROR_GO_UPLOAD_PHOTO_NOT_FOUND = 5708;
/**
 * Invalid Photo
 */
const API_ERROR_GO_UPLOAD_INVALID_PHOTO = 5709;
/**
 * Invalid hash
 */
const API_ERROR_GO_UPLOAD_INVALID_HASH = 5710;
/**
 * Cannot transfer money yourself
 */
const API_ERROR_MONEY_TRANSFER_CANT_YOURSELF = 5800;
/**
 * Money request already processed
 */
const API_ERROR_MONEY_REQUEST_ALREADY_PROCESSED = 5801;
/**
 * Money transfer no available
 */
const API_ERROR_MONEY_TRANSFER_NO_AVAILABLE = 5802;
/**
 * Money transfer maintenance
 */
const API_ERROR_MONEY_TRANSFER_MAINTENANCE = 5803;
/**
 * Recipient has not phone number
 *
 * ДМР не смогли получить номер телефона от vk id
 */
const API_ERROR_MONEY_TRANSFER_SBP_NO_PHONE = 5804;
/**
 * Recipient has an unsupported phone number
 *
 * На этот номер нельзя перевести по СБП (например зарубежные номера)
 */
const API_ERROR_MONEY_TRANSFER_SBP_NOT_RU_PHONE = 5805;
/**
 * SBP provider error
 *
 * Что-то внезапное у ДМР
 */
const API_ERROR_MONEY_TRANSFER_SBP_PROVIDER_ERROR = 5806;
/**
 * SBP rate limits
 *
 * Рейтлимиты на переводы СБП от ДМР
 */
const API_ERROR_MONEY_TRANSFER_SBP_RATE_LIMITS = 5807;
/**
 * VK Pay response fail
 *
 * VK Pay вернул ошибку в ответе
 */
const API_ERROR_MONEY_VKPAY_RESPONSE_FAIL = 5808;
/**
 * Ejd region vendor not found
 */
const API_ERROR_EDUCATION_EJD_REGION_VENDOR_NOT_FOUND = 6007;
/**
 * Could not create proposal
 */
const API_ERROR_EDUCATION_PROPOSAL_CREATE_ERROR = 6008;
/**
 * Platform confirmation required
 */
const API_ERROR_PLATFORM_CONFIRMATION_REQUIRED = 6100;
/**
 * Phones list is not supported
 */
const API_ERROR_PHONES_LIST_IS_NOT_SUPPORTED = 6101;
/**
 * App not enabled
 */
const API_ERROR_PLATFORM_APP_NOT_ENABLED = 6104;
/**
 * Internal server error
 */
const API_ERROR_PLATFORM_ONLY_ONE_INDIVIDUAL_ORGANIZATION = 6105;
/**
 * Internal server error
 */
const API_ERROR_PLATFORM_MODERATION_NOT_FOUND = 6106;
/**
 * Monetization is not enabled in your app
 */
const API_ERROR_PLATFORM_MONETIZATION_DISABLED = 6110;
/**
 * Stats not available
 */
const API_ERROR_PLATFORM_MONETIZATION_STATS_NOT_AVAILABLE = 6111;
/**
 * Monetization is disabled in your cashout cabinet
 */
const API_ERROR_PLATFORM_MONETIZATION_CABINET_DISABLED = 6112;
/**
 * Organization verification required
 */
const API_ERROR_PLATFORM_VERIFICATION_REQUIRED = 6113;
/**
 * In progress, need try later
 *
 * Операция выполняется асинхронно, повторите запрос позже
 */
const API_ERROR_CASHOUT_NEED_TRY_LATER = 6200;
/**
 * Attempt to personal payout when SE with same INN exists
 *
 * Поптыка выплаты от Физлицу при наличии СЗ с идентичным ИНН
 */
const API_ERROR_CASHOUT_PAYOUT_TO_SE_WITH_SAME_INN = 6201;
/**
 * User is employee
 *
 * Пользователь является сотрудником Вконтакте
 */
const API_ERROR_CASHOUT_USER_IS_EMPLOYEE = 6202;
/**
 * Duplicated personal profile
 *
 * В процессе/активное физлицо с таким ИНН уже существует
 */
const API_ERROR_CASHOUT_DUPLICATED_PERSONAL_INN = 6203;
/**
 * Common cashout error
 *
 * Общая ошибка
 */
const API_ERROR_CASHOUT_COMMON_ERROR = 6205;
/**
 * Invalid BID organization
 */
const API_ERROR_INVALID_BID_ORG = 6300;
/**
 * Invalid auth service organization
 */
const API_ERROR_INVALID_ORG = 6301;
/**
 * Invalid linking
 */
const API_ERROR_INVALID_LINKING_ORG = 6302;
/**
 * BID organization already linked
 */
const API_ERROR_BID_ORG_ALREADY_LINKED = 6303;
/**
 * Cannot send badge
 */
const API_ERROR_BADGES_CANNOT_SEND_BADGE = 7100;
/**
 * Too many subscriptions
 */
const API_ERROR_FIND_ME_TOO_MANY_SUBSCRIPTIONS = 7200;
/**
 * Invite links is available for closed channels
 */
const API_ERROR_CHANNEL_INVITE_LINKS_CANT_USE = 7400;
/**
 * Invite link is invalid - expired, deleted or not exists
 */
const API_ERROR_CHANNEL_INVITE_LINKS_NOT_VALID = 7401;
/**
 * User already in
 */
const API_ERROR_CHANNEL_USER_ALREADY_IN = 7402;
/**
 * Channel for this group already exists
 */
const API_ERROR_COMMUNITY_CHANNEL_ALREADY_EXISTS = 7403;
/**
 * Invalid account secret
 */
const API_ERROR_ACCOUNT_CALL_INVALID_SECRET = 7500;
/**
 * Processing, retry later
 */
const API_ERROR_DONUT_WAIT = 7601;
/**
 * Import disabled
 */
const API_ERROR_API_ERROR_VKSTART_IMPORT_DISABLED = 7800;
/**
 * Unknown VkUp error
 */
const API_ERROR_VKUP_UNKNOWN_ERROR = 7900;
/**
 * User update wrong parameters
 */
const API_ERROR_VKUP_USER_UPDATE_WRONG_PARAMETERS = 7901;
/**
 * User not registered
 */
const API_ERROR_VKUP_USER_NOT_REGISTERED = 7902;
/**
 * User save failed
 */
const API_ERROR_VKUP_USER_SAVE_FAILED = 7903;
/**
 * User already onboarded
 */
const API_ERROR_VKUP_USER_ALREADY_ONBOARDED = 7904;
/**
 * User already accepted offer
 */
const API_ERROR_VKUP_USER_ALREADY_ACCEPTED_OFFER = 7905;
/**
 * Product not found
 */
const API_ERROR_VKUP_PRODUCT_NOT_FOUND = 7906;
/**
 * User cannot buy product
 */
const API_ERROR_VKUP_USER_CANNOT_BUY_PRODUCT = 7907;
/**
 * User product save failed
 */
const API_ERROR_VKUP_USER_PRODUCT_SAVE_FAILED = 7908;
/**
 * Product type not found
 */
const API_ERROR_VKUP_PRODUCT_TYPE_NOT_FOUND = 7909;
/**
 * User product not found
 */
const API_ERROR_VKUP_USER_PRODUCT_NOT_FOUND = 7910;
/**
 * Product is not emoji status
 */
const API_ERROR_VKUP_PRODUCT_NOT_EMOJI_STATUS = 7911;
/**
 * Product is not sticker pack
 */
const API_ERROR_VKUP_PRODUCT_NOT_STICKER_PACK = 7912;
/**
 * User not accepted offer
 */
const API_ERROR_VKUP_USER_NOT_ACCEPTED_OFFER = 7916;
/**
 * User cannot skip quest
 */
const API_ERROR_VKUP_USER_CANNOT_SKIP_QUEST = 7917;
/**
 * Bad owner selected
 */
const API_ERROR_VKUP_GIFT_CARD_BAD_OWNER = 7918;
/**
 * Gift card not found
 */
const API_ERROR_VKUP_GIFT_CARD_NOT_FOUND = 7919;
/**
 * Gift card not allowed for user
 */
const API_ERROR_VKUP_GIFT_CARD_NOT_ALLOWED_FOR_USER = 7920;
/**
 * Gift card is used
 */
const API_ERROR_VKUP_GIFT_CARD_IS_USED = 7921;
/**
 * Request is empty
 */
const API_ERROR_VKUP_REQUEST_IS_EMPTY = 7922;
/**
 * Can't change started time in active quest
 */
const API_ERROR_VKUP_CAN_NOT_CHANGE_STARTED_TIME_IN_ACTIVE_QUEST = 7923;
/**
 * Quest already exists
 */
const API_ERROR_VKUP_QUEST_ALREADY_EXISTS = 7925;
/**
 * User quest wrong status
 */
const API_ERROR_VKUP_USER_QUEST_WRONG_STATUS = 7926;
/**
 * User quest reward locked
 */
const API_ERROR_VKUP_USER_CAN_NOT_GET_REWARD = 7927;
/**
 * Product has different type
 */
const API_ERROR_VKUP_HAS_DIFFERENT_TYPE = 7930;
/**
 * Verification request not found
 */
const API_ERROR_VERIFICATION_REQUEST_NOT_FOUND = 8000;
/**
 * You can't change the invite link
 */
const API_ERROR_SPACES_INVITE_LINK_CANT_CHANGE = 8100;
/**
 * You can't see the invite link
 */
const API_ERROR_SPACES_INVITE_LINK_CANT_SEE = 8101;
/**
 * Invite link is invalid - expired, deleted or not exists
 */
const API_ERROR_SPACES_INVITE_LINK_NOT_VALID = 8102;
/**
 * User already in
 */
const API_ERROR_SPACES_USER_ALREADY_IN = 8103;
/**
 * Synchronization failed
 */
const API_ERROR_OAUTH_SYNCHRONIZATION_FAILED = 8200;
/**
 * User is not linked
 */
const API_ERROR_OAUTH_USER_IS_NOT_LINKED = 8201;
/**
 * User is deleted
 */
const API_ERROR_OAUTH_USER_IS_DELETED = 8202;
/**
 * User is untrusted
 */
const API_ERROR_OAUTH_USER_IS_UNTRUSTED = 8203;
/**
 * Birthdate is invalid
 */
const API_ERROR_OAUTH_INVALID_BIRTHDATE = 8204;
/**
 * There is no linked parents
 */
const API_ERROR_OAUTH_NOT_LINKED_PARENTS = 8205;
/**
 * Entity is already linked
 */
const API_ERROR_OAUTH_ENTITY_IS_ALREADY_LINKED = 8206;
/**
 * Invalid service ID
 */
const API_ERROR_OAUTH_INVALID_SERVICE_ID = 8207;
/**
 * Synchronization failed
 */
const API_ERROR_OAUTH_EXTERNAL_SERVICE_IS_NOT_AVAILABLE = 8208;
/**
 * Invalid external user data
 */
const API_ERROR_OAUTH_EXTERNAL_SERVICE_HAS_INVALID_USER_DATA = 8209;
/**
 * Invalid sid
 */
const API_ERROR_OAUTH_INVALID_SID = 8210;
/**
 * Friend already installed app
 */
const API_ERROR_APP_INVITE_FRIEND_ALREADY_INSTALLED = 8301;
/**
 * Not a friend
 */
const API_ERROR_APP_INVITE_FRIEND_NOT_A_FRIEND = 8302;
/**
 * Slow down
 */
const API_ERROR_RFC_SLOW_DOWN = 8500;
/**
 * Invalid token
 */
const API_ERROR_RFC_INVALID_TOKEN = 8501;
/**
 * Invalid scope
 */
const API_ERROR_RFC_INVALID_SCOPE = 8502;
/**
 * Invalid client
 */
const API_ERROR_RFC_INVALID_CLIENT = 8503;
/**
 * Unsupported grant type
 */
const API_ERROR_RFC_UNSUPPORTED_GRANT_TYPE = 8504;
/**
 * Unsupported response type
 */
const API_ERROR_RFC_UNSUPPORTED_RESPONSE_TYPE = 8505;
/**
 * Unauthorized client
 */
const API_ERROR_RFC_UNAUTHORIZED_CLIENT = 8506;
/**
 * Insufficient scope
 */
const API_ERROR_RFC_INSUFFICIENT_SCOPE = 8507;
/**
 * Invalid grant
 */
const API_ERROR_RFC_INVALID_GRANT = 8508;
/**
 * Call not found
 */
const API_ERROR_CALLS_UNKNOWN_CALL = 9000;
/**
 * Participant does not exist in call
 */
const API_ERROR_CALLS_UNKNOWN_PARTICIPANT = 9001;
/**
 * Participant name is not valid
 */
const API_ERROR_CALLS_INVALID_PARTICIPANT_NAME = 9002;
/**
 * Invalid secret
 */
const API_ERROR_CALLS_INVALID_SECRET = 9003;
/**
 * Call chat limit reached
 */
const API_ERROR_CALLS_CHAT_LIMIT_REACTED = 9004;
/**
 * Call requires auth
 */
const API_ERROR_CALLS_CALL_REQUIRES_AUTH = 9005;
/**
 * Join link is outdated
 */
const API_ERROR_CALLS_JOIN_LINK_IS_OUTDATED = 9006;
/**
 * Wrong anonymous access token type, the token should be issued with token_type=messages
 */
const API_ERROR_CALLS_WRONG_ANONYMOUS_ACCESS_TOKEN_TYPE = 9007;
/**
 * Join link is not valid
 */
const API_ERROR_CALLS_JOIN_LINK_IS_NOT_VALID = 9008;
/**
 * Speaker privacy error
 */
const API_ERROR_CALLS_SPEAKER_PRIVACY = 9009;
/**
 * Room only for auth users
 */
const API_ERROR_CALLS_AUTH_USERS_ROOM = 9010;
/**
 * Room only for group members
 */
const API_ERROR_CALLS_GROUP_MEMBERS_ROOM = 9011;
/**
 * Room only for donat users
 */
const API_ERROR_CALLS_DONAT_ROOM = 9012;
/**
 * Room is already closed
 */
const API_ERROR_CALLS_ROOM_IS_ALREADY_CLOSED = 9013;
/**
 * Room is banned
 */
const API_ERROR_CALLS_ROOM_IS_BANNED = 9014;
/**
 * Could not join a call by link because password is missing
 */
const API_ERROR_CALLS_COULD_NOT_JOIN_A_CALL_BY_LINK_BECAUSE_PASSWORD_IS_MISSING = 9015;
/**
 * Not supported http method
 */
const API_ERROR_NOT_SUPPORTED_HTTP_METHOD = 9999;
/**
 * User already exists
 */
const API_ERROR_HEALTH_LOYALTY_USER_ALREADY_EXISTS = 10000;
/**
 * User not exists
 */
const API_ERROR_HEALTH_LOYALTY_USER_NOT_EXISTS = 10001;
/**
 * Followers mode is disabled
 */
const API_ERROR_FRIENDS_FOLLOWERS_MODE_IS_DISABLED = 10002;
/**
 * Shop item not found
 */
const API_ERROR_HEALTH_LOYALTY_SHOP_ITEM_NOT_FOUND = 10003;
/**
 * No current lottery
 */
const API_ERROR_HEALTH_LOYALTY_NO_CURRENT_LOTTERY = 10004;
/**
 * Already liked
 */
const API_ERROR_HEALTH_FEED_ALREADY_LIKED = 10005;
/**
 * Not liked
 */
const API_ERROR_HEALTH_FEED_NOT_LIKED = 10006;
/**
 * Not owner
 */
const API_ERROR_HEALTH_FEED_NOT_OWNER = 10007;
/**
 * Not enough balance
 */
const API_ERROR_HEALTH_LOYALTY_NOT_ENOUGH_BALANCE = 10008;
/**
 * User task not found
 */
const API_ERROR_HEALTH_LOYALTY_USER_TASK_NOT_FOUND = 10009;
/**
 * User task is burned
 */
const API_ERROR_HEALTH_LOYALTY_USER_TASK_IS_BURNED = 10010;
/**
 * Reward already collected
 */
const API_ERROR_HEALTH_LOYALTY_REWARD_ALREADY_COLLECTED = 10011;
/**
 * User task not finished
 */
const API_ERROR_HEALTH_LOYALTY_USER_TASK_NOT_FINISHED = 10012;
/**
 * Catalog not found
 */
const API_ERROR_HEALTH_LOYALTY_CATALOG_NOT_FOUND = 10013;
/**
 * Max own count reached
 */
const API_ERROR_HEALTH_LOYALTY_MAX_OWN_COUNT_REACHED = 10014;
/**
 * Coupon limit per user reached
 */
const API_ERROR_HEALTH_LOYALTY_COUPON_LIMIT_PER_USER_REACHED = 10015;
/**
 * Too many set recommendations
 */
const API_ERROR_FRIENDS_TOO_MANY_SET_RECOMMENDATIONS = 10020;
/**
 * Locked
 */
const API_ERROR_HEALTH_LOCKED = 10100;
/**
 * Function name invalid
 */
const API_ERROR_PLATFORM_FUNCTION_NAME_INVALID = 11000;
/**
 * Function compilation error
 */
const API_ERROR_PLATFORM_FUNCTION_COMPILATION_ERROR = 11001;
/**
 * Function already exists
 */
const API_ERROR_PLATFORM_FUNCTION_ALREADY_EXISTS = 11002;
/**
 * Empty filter params
 */
const API_ERROR_APPS_EMPTY_FILTER_PARAMS = 11003;
/**
 * Empty snippet data
 */
const API_ERROR_APPS_EMPTY_SNIPPET_DATA = 11004;
/**
 * Too many snippets
 */
const API_ERROR_APPS_TOO_MANY_SNIPPETS = 11005;
/**
 * Not found snippet
 */
const API_ERROR_APPS_NOT_FOUND_SNIPPET = 11006;
/**
 * Can't translate.
 */
const API_ERROR_TRANSLATIONS_CANT_TRANSLATE = 11101;
/**
 * Multiple source languages. Only one allowed.
 */
const API_ERROR_TRANSLATIONS_MULTIPLE_SOURCE_LANG = 11102;
/**
 * No linked account found
 */
const API_ERROR_NO_COUPLED_ACCOUNT = 11200;
/**
 * Empty phone and email
 */
const API_ERROR_APPS_NO_CODE_FEEDBACK_EMPTY_PHONE_AND_EMAIL = 11400;
/**
 * Incorrect email format
 */
const API_ERROR_APPS_NO_CODE_FEEDBACK_INCORRECT_EMAIL = 11401;
/**
 * Incorrect phone format
 */
const API_ERROR_APPS_NO_CODE_FEEDBACK_INCORRECT_PHONE = 11402;
/**
 * CheckUserAction confirmation required
 */
const API_ERROR_CUA_CONFIRMATION_REQUIRED = 11500;
/**
 * CheckUserAction validation method unavailable
 */
const API_ERROR_CUA_VALIDATION_METHOD_UNAVAILABLE = 11501;
/**
 * CheckUserAction session invalid
 */
const API_ERROR_CUA_SESSION_INVALID = 11502;
/**
 * CheckUserAction no verification methods available
 */
const API_ERROR_CUA_NO_VERIFICATION_METHODS_AVAILABLE = 11503;
/**
 * Doesnt have VK Pay wallet
 */
const API_ERROR_VK_PAY_DOESNT_HAVE_WALLET = 11600;
/**
 * Limit for this month has been reached
 */
const API_ERROR_VK_PAY_LIMIT_HAS_BEEN_REACHED = 11601;
/**
 * Card bind not found
 */
const API_ERROR_VK_PAY_BIND_CARD_NOT_FOUND = 11602;
/**
 * Card bind timeout
 */
const API_ERROR_VK_PAY_BIND_CARD_TIMEOUT = 11603;
/**
 * Recipient banned
 */
const API_ERROR_VK_PAY_RECIPIENT_BANNED = 11604;
/**
 * At least one credential should be available for employee with OnePass only
 */
const API_ERROR_WEBAUTHN_EMPLOYEE_LAST_CREDENTIAL = 11800;
/**
 * Author already exists
 */
const API_ERROR_AUTHORS_MARKETPLACE_AUTHOR_ALREADY_EXISTS = 12000;
/**
 * Author is not found
 */
const API_ERROR_AUTHORS_MARKETPLACE_AUTHOR_NOT_FOUND = 12001;
/**
 * Author is declined
 */
const API_ERROR_AUTHORS_MARKETPLACE_AUTHOR_DECLINED = 12003;
/**
 * Invalid offer content url
 */
const API_ERROR_AUTHORS_MARKETPLACE_OFFER_CONTENT_URL_INVALID = 12006;
/**
 * Content upload was denied due to active community strikes
 */
const API_ERROR_COMMUNITY_STRIKES_UPLOAD_CONTENT_DENIED = 13000;
/**
 * Wrong stage data
 *
 * Введены некорректные данные шага
 */
const API_ERROR_CROWD_WRONG_STAGE_DATA = 13001;
/**
 * No job for user
 *
 * Не найдено доступных заданий
 */
const API_ERROR_CROWD_NO_JOB_FOR_USER = 13002;
/**
 * User is banned in task
 *
 * Юзер забанен в задаче
 */
const API_ERROR_CROWD_USER_IS_BANNED_IN_TASK = 13004;
/**
 * User access to task is denied for time
 *
 * Юзер получил временную блокировку в задаче
 */
const API_ERROR_CROWD_USER_ACCESS_TO_TASK_IS_DENIED_FOR_TIME = 13005;
/**
 * User did not accept terms of offer
 *
 * Юзер не принял новые условия оферты
 */
const API_ERROR_CROWD_USER_DID_NOT_ACCEPT_TERMS_OF_OFFER = 13006;
/**
 * Provided job_id by user is invalid.
 *
 * Получили от юзера job_id, который не равен user_state->job_id
 */
const API_ERROR_CROWD_USER_PROVIDED_INVALID_JOB_ID = 13007;
/**
 * User state does not have stage
 *
 * Стейт юзера не имеет стейджа
 */
const API_ERROR_CROWD_USER_STATE_DOES_NOT_HAVE_STAGE = 13008;
/**
 * Unknown stage
 *
 * Неизвестный стейдж
 */
const API_ERROR_CROWD_UNKNOWN_STAGE = 13009;
/**
 * Not valid clip error.
 *
 * Не удалось получить клип. по причине его валидности(реклама, приватно, удалено).
 */
const API_ERROR_CROWD_NOT_VALID_CLIP_ERROR = 13011;
/**
 * Can not get clip
 *
 * Не удалось получить клип из единого видео.
 */
const API_ERROR_CROWD_CAN_NOT_GET_CLIP_ERROR = 13012;
/**
 * It is not time for next exam attempt. User cant do exam yet
 *
 * Время для следующей попытки сдать экзамен ещё не пришло. Юзеру надо подождать
 */
const API_ERROR_CROWD_IT_IS_NOT_TIME_FOR_NEXT_EXAM_ATTEMPT = 13013;
/**
 * User already added to task so he cant do exam error
 *
 * Юзер уже добавлен в задачу, проходить экзамен он не может и это не имеет смысла
 */
const API_ERROR_CROWD_USER_IN_TASK_SO_HE_CANT_DO_EXAM = 13014;
/**
 * Exam is being checked error
 *
 * Экзамен на проверке, пока что пройти экзамен нельзя
 */
const API_ERROR_CROWD_EXAM_IS_BEING_CHECKED = 13015;
/**
 * Skip job is not available for user now.
 *
 * Пока что юзер не может пропустить задание.
 */
const API_ERROR_CROWD_SKIP_IS_NOT_AVAILABLE_FOR_USER = 13016;
/**
 * User cash_out status not active
 *
 * У пользователя нет активного кабинета выплат
 */
const API_ERROR_CROWD_USER_CASH_OUT_STATUS_NOT_ACTIVE = 13017;
/**
 * User not found in our system
 *
 * В базе данных пользователь не найден
 */
const API_ERROR_CROWD_USER_NOT_FOUND = 13018;
/**
 * Utm params for user already added
 *
 * UTM метки для пользователя уже были добавлены
 */
const API_ERROR_CROWD_UTM_FOR_USER_ALREADY_ADDED = 13019;
/**
 * Task not found
 *
 * Задача не найдена
 */
const API_ERROR_CROWD_TASK_NOT_FOUND = 13020;
/**
 * Project not found
 *
 * Проект не найден
 */
const API_ERROR_CROWD_PROJECT_NOT_FOUND = 13021;
/**
 * User doesn't have access to do task
 *
 * Нет прав на выполнение задачи
 */
const API_ERROR_CROWD_USER_DOES_NOT_HAVE_ACCESS_TO_DO_TASK = 13022;
/**
 * Job for editing is not assigned
 *
 * Задание на редактирование не назначено
 */
const API_ERROR_CROWD_JOB_FOR_EDITING_IS_NOT_ASSIGNED = 13023;
/**
 * Job result have no answers
 *
 * Результат не имеет ответов
 */
const API_ERROR_CROWD_JOB_RESULT_HAVE_NO_ANSWERS = 13025;
/**
 * Task have no ability for edit answer
 *
 * В задаче отключена функция редактирования овтетов
 */
const API_ERROR_CROWD_TASK_HAS_NO_ABILITY_FOR_EDIT_ANSWERS = 13026;
/**
 * Cant acquire lock
 *
 * Не получается заблокировать ресурс под запрос
 */
const API_ERROR_CROWD_CAN_NOT_ACQUIRE_LOCK = 13027;
/**
 * Source already locked
 *
 * Ресурс уже заблокирован
 */
const API_ERROR_CROWD_SOURCE_ALREADY_LOCKED = 13028;
/**
 * User can not assign new job for editing
 *
 * Пользователь не может назначить новое задание, пока не отменит старое редактирование
 */
const API_ERROR_CROWD_USER_CAN_NOT_ASSIGN_NEW_JOB_FOR_EDITING = 13029;
/**
 * User can not edit answers in this task
 *
 * В задаче не включена возможность редактировать свои ответы
 */
const API_ERROR_CROWD_USER_CAN_NOT_EDIT_ANSWERS_IN_THIS_TASK = 13030;
/**
 * Invalid notification key
 */
const API_ERROR_CROWD_INVALID_NOTIFICATION_KEY = 13031;
/**
 * Not valid task job content.
 *
 * Не удалось получить данные по прикреплённому контенту
 */
const API_ERROR_CROWD_NOT_VALID_TASK_JOB_CONTENT_ERROR = 13032;
/**
 * Task job result is expired
 */
const API_ERROR_CROWD_JOB_RESULT_IS_EXPIRED = 13033;
/**
 * User is banned in crowd system
 */
const API_ERROR_CROWD_USER_IS_BANNED = 13034;
/**
 * User is temporarily blocked
 */
const API_ERROR_CROWD_USER_IS_TEMPORARILY_BLOCKED = 13035;
/**
 * Task have no ability show media links
 *
 * В задаче не включена функция показа копирования ссылок на медиа файлы
 */
const API_ERROR_CROWD_TASK_HAVE_NO_ABILITY_SHOW_MEDIA_LINKS = 13036;
/**
 * The user has reached the task completion limit.
 *
 * Пользователь достиг лимита по выполнению заданий в задаче
 */
const API_ERROR_CROWD_USER_HAS_REACHED_THE_TASK_COMPLETION_LIMIT = 13038;
/**
 * Authorization with OnePass is not available
 */
const API_ERROR_AUTHORIZATION_NOT_AVAILABLE = 13102;
/**
 * cannot delete this banner
 */
const API_ERROR_GAMES_BANNERS_CANNOT_DELETE = 13104;
/**
 * error while saving
 */
const API_ERROR_CANNOT_SAVE = 13107;
/**
 * Access denied by geo
 */
const API_ERROR_ACCESS_GEO = 13300;
/**
 * Map already exists
 */
const API_ERROR_ALREADY_HAS_MAP = 14000;
/**
 * Seller is already linked
 */
const API_ERROR_SELLER_ALREADY_LINKED = 14001;
/**
 * Community is already linked
 */
const API_ERROR_COMMUNITY_ALREADY_LINKED = 14002;
/**
 * Booking service not available
 */
const API_ERROR_BOOKING_SERVICE_NOT_AVAILABLE = 14101;
/**
 * No data for the request
 */
const API_ERROR_BOOKING_SERVICE_NO_DATA = 14102;
/**
 * No staff for booking
 */
const API_ERROR_BOOKING_SERVICE_NO_STAFF_FOR_BOOKING = 14103;
/**
 * Service not available at selected time, choose another time
 */
const API_ERROR_BOOKING_SERVICE_SERVICE_NOT_AVAILABLE_AT_SELECTED_TIME = 14104;
/**
 * Service not available for booking, choose another service
 */
const API_ERROR_BOOKING_SERVICE_SERVICE_NOT_AVAILABLE_FOR_BOOKING = 14105;
/**
 * Invalid phone number
 */
const API_ERROR_BOOKING_SERVICE_INVALID_PHONE = 14106;
/**
 * Group has no subscription
 */
const API_ERROR_BOOKING_SERVICE_GROUP_HAS_NO_SUBSCRIPTION = 14107;
/**
 * Report not found
 */
const API_ERROR_REPORTS_DECISION_NOT_FOUND = 15101;
/**
 * Object not found
 */
const API_ERROR_REPORTS_DECISION_OBJECT_NOT_FOUND = 15102;
/**
 * Invalid data
 */
const API_ERROR_REPORTS_DECISION_INVALID_DATA = 15300;
/**
 * Owner protected
 */
const API_ERROR_REPORTS_DECISION_OWNER_PROTECTED = 15400;
/**
 * Max content_ids limit reached
 */
const API_ERROR_EMO_GET_REPORTS_MAX_ITEMS_SIZE_INVALID = 16100;
/**
 * Stream source invalid
 */
const API_ERROR_EMO_GET_REPORTS_STREAM_INVALID = 16101;

export { API_ERROR_ABF_FLOOD_LIMIT, API_ERROR_ACCESS, API_ERROR_ACCESS_ALBUM, API_ERROR_ACCESS_AUDIO, API_ERROR_ACCESS_AUTOLOGIN, API_ERROR_ACCESS_COMMENT, API_ERROR_ACCESS_GEO, API_ERROR_ACCESS_GROUP, API_ERROR_ACCESS_GROUPS, API_ERROR_ACCESS_MARKET, API_ERROR_ACCESS_MENU, API_ERROR_ACCESS_NOTE, API_ERROR_ACCESS_NOTE_COMMENT, API_ERROR_ACCESS_PAGE, API_ERROR_ACCESS_VIDEO, API_ERROR_ACCOUNT_CALL_INVALID_SECRET, API_ERROR_ACTION_FAILED, API_ERROR_ADDITIONAL_SIGNUP_REQUIRED, API_ERROR_ADS_ALREADY_CREATED, API_ERROR_ADS_APP_BLOCKED, API_ERROR_ADS_APP_NOT_VERIFIED, API_ERROR_ADS_LOOKALIKE_REQUEST_ALREADY_IN_PROGRESS, API_ERROR_ADS_LOOKALIKE_REQUEST_AUDIENCE_TOO_LARGE, API_ERROR_ADS_LOOKALIKE_REQUEST_AUDIENCE_TOO_SMALL, API_ERROR_ADS_LOOKALIKE_REQUEST_EXPORT_ALREADY_IN_PROGRESS, API_ERROR_ADS_LOOKALIKE_REQUEST_EXPORT_MAX_COUNT_PER_DAY_REACHED, API_ERROR_ADS_LOOKALIKE_REQUEST_EXPORT_RETARGETING_GROUP_LIMIT, API_ERROR_ADS_LOOKALIKE_REQUEST_MAX_COUNT_PER_DAY_REACHED, API_ERROR_ADS_OBJECT_DELETED, API_ERROR_ADS_PARAM_DOMAIN_ACTIVE, API_ERROR_ADS_PARAM_DOMAIN_APP_BLOCKED, API_ERROR_ADS_PARAM_DOMAIN_APP_FORBIDDEN, API_ERROR_ADS_PARAM_DOMAIN_APP_INVALID, API_ERROR_ADS_PARAM_DOMAIN_FORBIDDEN, API_ERROR_ADS_PARAM_DOMAIN_GROUP_BLOCKED, API_ERROR_ADS_PARAM_DOMAIN_GROUP_FORBIDDEN, API_ERROR_ADS_PARAM_DOMAIN_GROUP_FORBIDDEN_COVER, API_ERROR_ADS_PARAM_DOMAIN_GROUP_FORBIDDEN_LINKS, API_ERROR_ADS_PARAM_DOMAIN_GROUP_FORBIDDEN_SEARCH, API_ERROR_ADS_PARAM_DOMAIN_GROUP_INVALID, API_ERROR_ADS_PARAM_DOMAIN_GROUP_LOW_POSTS_REACH, API_ERROR_ADS_PARAM_DOMAIN_GROUP_LOW_SUBSCRIBERS_GROWTH, API_ERROR_ADS_PARAM_DOMAIN_GROUP_NEMESIS_PUNISHMENT, API_ERROR_ADS_PARAM_DOMAIN_GROUP_NOT_OPEN, API_ERROR_ADS_PARAM_DOMAIN_GROUP_NOT_POSSIBLE_YET, API_ERROR_ADS_PARAM_DOMAIN_GROUP_RECENTLY_CREATED, API_ERROR_ADS_PARAM_DOMAIN_GROUP_WRONG_CATEGORY, API_ERROR_ADS_PARAM_DOMAIN_GROUP_WRONG_CLASS, API_ERROR_ADS_PARAM_DOMAIN_GROUP_WRONG_NAME, API_ERROR_ADS_PARAM_DOMAIN_INVALID, API_ERROR_ADS_PARAM_DOMAIN_OCCUPIED, API_ERROR_ADS_PARAM_DOMAIN_RESERVED, API_ERROR_ADS_PARAM_DOMAIN_WRONG_TYPE, API_ERROR_ADS_PARTIAL_SUCCESS, API_ERROR_ADS_PERMISSION, API_ERROR_ADS_SPECIFIC, API_ERROR_ALBUMS_LIMIT, API_ERROR_ALBUM_FULL, API_ERROR_ALREADY_HAS_MAP, API_ERROR_API_ERROR_VKRUN_IMPORT_DISABLED, API_ERROR_API_ERROR_VKRUN_NOT_ENOUGH_COINS, API_ERROR_API_ERROR_VKRUN_OUT_OF_STOCK, API_ERROR_API_ERROR_VKRUN_RESOURCE_LOCKED, API_ERROR_API_ERROR_VKSTART_IMPORT_DISABLED, API_ERROR_APPS_ALREADY_ADDED, API_ERROR_APPS_ALREADY_UNLOCKED, API_ERROR_APPS_EMPTY_FILTER_PARAMS, API_ERROR_APPS_EMPTY_SNIPPET_DATA, API_ERROR_APPS_MENU_TOO_MANY_APPS, API_ERROR_APPS_NOT_FOUND_SNIPPET, API_ERROR_APPS_NO_CODE_FEEDBACK_EMPTY_PHONE_AND_EMAIL, API_ERROR_APPS_NO_CODE_FEEDBACK_INCORRECT_EMAIL, API_ERROR_APPS_NO_CODE_FEEDBACK_INCORRECT_PHONE, API_ERROR_APPS_NO_RIGHTS_IN_COMMUNITY, API_ERROR_APPS_ORDER_ERROR, API_ERROR_APPS_PAYMENTS_LIMIT, API_ERROR_APPS_PAYMENTS_NOT_ALLOWED, API_ERROR_APPS_PAYMENTS_WAITING_ITEM, API_ERROR_APPS_SUBSCRIPTION_INVALID_STATUS, API_ERROR_APPS_SUBSCRIPTION_NOT_FOUND, API_ERROR_APPS_TOO_MANY_SNIPPETS, API_ERROR_APPS_TOO_MUCH_PROFILE_BUTTONS, API_ERROR_APP_AUTH, API_ERROR_APP_INVITE_FRIEND_ALREADY_INSTALLED, API_ERROR_APP_INVITE_FRIEND_NOT_A_FRIEND, API_ERROR_APP_NOT_IN_SITE_DOMAINS, API_ERROR_ASSERT_VOTES, API_ERROR_AUDIO_ALBUM_DUPLICATE, API_ERROR_AUDIO_CLAIMED, API_ERROR_AUDIO_PLAYLISTS_LIMIT, API_ERROR_AUDIO_SEARCH_SESSION_EXPIRED, API_ERROR_AUTH, API_ERROR_AUTHORIZATION_NOT_AVAILABLE, API_ERROR_AUTHORS_MARKETPLACE_AUTHOR_ALREADY_EXISTS, API_ERROR_AUTHORS_MARKETPLACE_AUTHOR_DECLINED, API_ERROR_AUTHORS_MARKETPLACE_AUTHOR_NOT_FOUND, API_ERROR_AUTHORS_MARKETPLACE_OFFER_CONTENT_URL_INVALID, API_ERROR_AUTH_ACCESS_TOKEN_HAS_EXPIRED, API_ERROR_AUTH_ANONYMOUS_TOKEN_HAS_EXPIRED, API_ERROR_AUTH_ANONYMOUS_TOKEN_IP_MISMATCH, API_ERROR_AUTH_ANONYMOUS_TOKEN_IS_INVALID, API_ERROR_AUTH_DELAY, API_ERROR_AUTH_FLOOD_ERROR, API_ERROR_AUTH_HTTPS, API_ERROR_AUTH_INVALID_SID, API_ERROR_AUTH_NO_TOKEN, API_ERROR_AUTH_PARAM_CODE, API_ERROR_AUTH_PARAM_LOGIN, API_ERROR_AUTH_PARAM_PASSWORD, API_ERROR_AUTH_SUPER_APP_TOKEN_IS_INVALID, API_ERROR_AUTH_VALIDATION, API_ERROR_BADGES_CANNOT_SEND_BADGE, API_ERROR_BALANCE, API_ERROR_BID_ALREADY_ON_VERIFICATION, API_ERROR_BID_BUSINESS_LOGIC_ERROR, API_ERROR_BID_HAS_DUPLICATES_BY_1C, API_ERROR_BID_HAS_VERIFIED_DUPLICATES, API_ERROR_BID_LEGAL_FULLNAME_REQUIRED, API_ERROR_BID_NO_ENOUGH_RIGHTS, API_ERROR_BID_ORGANIZATION, API_ERROR_BID_ORG_ALREADY_LINKED, API_ERROR_BID_ORG_INVALID, API_ERROR_BLOCKED, API_ERROR_BOOKING_SERVICE_GROUP_HAS_NO_SUBSCRIPTION, API_ERROR_BOOKING_SERVICE_INVALID_PHONE, API_ERROR_BOOKING_SERVICE_NOT_AVAILABLE, API_ERROR_BOOKING_SERVICE_NO_DATA, API_ERROR_BOOKING_SERVICE_NO_STAFF_FOR_BOOKING, API_ERROR_BOOKING_SERVICE_SERVICE_NOT_AVAILABLE_AT_SELECTED_TIME, API_ERROR_BOOKING_SERVICE_SERVICE_NOT_AVAILABLE_FOR_BOOKING, API_ERROR_BOT_NOT_IN_CHAT, API_ERROR_CALLBACK_API_SERVERS_LIMIT, API_ERROR_CALLS_AUTH_USERS_ROOM, API_ERROR_CALLS_CALL_REQUIRES_AUTH, API_ERROR_CALLS_CHAT_LIMIT_REACTED, API_ERROR_CALLS_COULD_NOT_JOIN_A_CALL_BY_LINK_BECAUSE_PASSWORD_IS_MISSING, API_ERROR_CALLS_DONAT_ROOM, API_ERROR_CALLS_GROUP_MEMBERS_ROOM, API_ERROR_CALLS_INVALID_PARTICIPANT_NAME, API_ERROR_CALLS_INVALID_SECRET, API_ERROR_CALLS_JOIN_LINK_IS_NOT_VALID, API_ERROR_CALLS_JOIN_LINK_IS_OUTDATED, API_ERROR_CALLS_ROOM_IS_ALREADY_CLOSED, API_ERROR_CALLS_ROOM_IS_BANNED, API_ERROR_CALLS_SPEAKER_PRIVACY, API_ERROR_CALLS_UNKNOWN_CALL, API_ERROR_CALLS_UNKNOWN_PARTICIPANT, API_ERROR_CALLS_WRONG_ANONYMOUS_ACCESS_TOKEN_TYPE, API_ERROR_CANNOT_SAVE, API_ERROR_CAPTCHA, API_ERROR_CASHOUT_COMMON_ERROR, API_ERROR_CASHOUT_DUPLICATED_PERSONAL_INN, API_ERROR_CASHOUT_NEED_TRY_LATER, API_ERROR_CASHOUT_PAYOUT_TO_SE_WITH_SAME_INN, API_ERROR_CASHOUT_USER_IS_EMPLOYEE, API_ERROR_CHANNEL_INVITE_LINKS_CANT_USE, API_ERROR_CHANNEL_INVITE_LINKS_NOT_VALID, API_ERROR_CHANNEL_USER_ALREADY_IN, API_ERROR_CLASSIFIEDS_ALLOWED_CATEGORIES_FOR_GROUP_NOT_FOUND, API_ERROR_CLASSIFIEDS_BLACKLIST_ADD_ERROR, API_ERROR_CLASSIFIEDS_BLACKLIST_DEL_ERROR, API_ERROR_CLASSIFIEDS_COMMUNITY_NOT_FOUND, API_ERROR_CLASSIFIEDS_CONTEST_MAX_PRIZE_COUNT_EXCEEDED, API_ERROR_CLASSIFIEDS_CONTEST_PRIZES_RUN_OUT, API_ERROR_CLASSIFIEDS_CORRELATION_ERROR, API_ERROR_CLASSIFIEDS_COULD_NOT_SEND_MESSAGE, API_ERROR_CLASSIFIEDS_CREATE_CHAT_ERROR, API_ERROR_CLASSIFIEDS_EMPTY_GEO_IN_COMMUNITY, API_ERROR_CLASSIFIEDS_EMPTY_RESULT, API_ERROR_CLASSIFIEDS_GROUP_CLASSIFIEDS_SECTION_IS_DISABLED, API_ERROR_CLASSIFIEDS_INVALID_CATEGORY, API_ERROR_CLASSIFIEDS_INVALID_CHAT_TYPE, API_ERROR_CLASSIFIEDS_INVALID_GEO, API_ERROR_CLASSIFIEDS_INVALID_GROUP_MODE, API_ERROR_CLASSIFIEDS_INVALID_PHOTO_ID, API_ERROR_CLASSIFIEDS_NOTIFICATION_DISABLED, API_ERROR_CLASSIFIEDS_NOTIFICATION_EMPTY_USER_IDENTIFIER, API_ERROR_CLASSIFIEDS_NOTIFICATION_INVALID_TEXT, API_ERROR_CLASSIFIEDS_NOTIFICATION_INVALID_TYPE, API_ERROR_CLASSIFIEDS_NOTIFICATION_PHONE_NOT_FOUND, API_ERROR_CLASSIFIEDS_NOTIFICATION_SENDING_ERROR, API_ERROR_CLASSIFIEDS_NOT_MODERATED_COMMUNITY, API_ERROR_CLASSIFIEDS_PHOTO_ACCESS_ERROR, API_ERROR_CLASSIFIEDS_POST_IS_NOT_PRODUCT, API_ERROR_CLASSIFIEDS_PRODUCT_DUPLICATE_ERROR, API_ERROR_CLASSIFIEDS_PRODUCT_IS_BLOCKED_ERROR, API_ERROR_CLASSIFIEDS_PRODUCT_IS_NOT_ACTIVE_ERROR, API_ERROR_CLASSIFIEDS_PRODUCT_IS_SOLD_ERROR, API_ERROR_CLASSIFIEDS_PRODUCT_NOT_FOUND, API_ERROR_CLASSIFIEDS_SEND_MESSAGE_ERROR, API_ERROR_CLASSIFIEDS_SUBSCRIPTION_ADD_ERROR, API_ERROR_CLASSIFIEDS_SUBSCRIPTION_DEL_ERROR, API_ERROR_CLASSIFIEDS_USER_IN_BLACKLIST, API_ERROR_CLASSIFIEDS_USER_IS_LOCKED_ERROR, API_ERROR_CLASSIFIEDS_USER_NOT_FOUND, API_ERROR_CLASSIFIEDS_YOULA_CITIES_LOAD_ERROR, API_ERROR_CLASSIFIEDS_YOULA_PRODUCT_ARCHIVING_ERROR, API_ERROR_CLIENT_UPDATE_NEEDED, API_ERROR_CLIENT_VERSION_DEPRECATED, API_ERROR_COMMUNITY_ALREADY_LINKED, API_ERROR_COMMUNITY_CHANNEL_ALREADY_EXISTS, API_ERROR_COMMUNITY_STRIKES_UPLOAD_CONTENT_DENIED, API_ERROR_COMPILE, API_ERROR_COUPONS_COUPON_EXPIRED, API_ERROR_COUPONS_COUPON_NOT_ACTIVE, API_ERROR_COUPONS_COUPON_REMOVED, API_ERROR_COUPONS_NO_AVAILABLE_CODE, API_ERROR_CROWD_CAN_NOT_ACQUIRE_LOCK, API_ERROR_CROWD_CAN_NOT_GET_CLIP_ERROR, API_ERROR_CROWD_EXAM_IS_BEING_CHECKED, API_ERROR_CROWD_INVALID_NOTIFICATION_KEY, API_ERROR_CROWD_IT_IS_NOT_TIME_FOR_NEXT_EXAM_ATTEMPT, API_ERROR_CROWD_JOB_FOR_EDITING_IS_NOT_ASSIGNED, API_ERROR_CROWD_JOB_RESULT_HAVE_NO_ANSWERS, API_ERROR_CROWD_JOB_RESULT_IS_EXPIRED, API_ERROR_CROWD_NOT_VALID_CLIP_ERROR, API_ERROR_CROWD_NOT_VALID_TASK_JOB_CONTENT_ERROR, API_ERROR_CROWD_NO_JOB_FOR_USER, API_ERROR_CROWD_PROJECT_NOT_FOUND, API_ERROR_CROWD_SKIP_IS_NOT_AVAILABLE_FOR_USER, API_ERROR_CROWD_SOURCE_ALREADY_LOCKED, API_ERROR_CROWD_TASK_HAS_NO_ABILITY_FOR_EDIT_ANSWERS, API_ERROR_CROWD_TASK_HAVE_NO_ABILITY_SHOW_MEDIA_LINKS, API_ERROR_CROWD_TASK_NOT_FOUND, API_ERROR_CROWD_UNKNOWN_STAGE, API_ERROR_CROWD_USER_ACCESS_TO_TASK_IS_DENIED_FOR_TIME, API_ERROR_CROWD_USER_CAN_NOT_ASSIGN_NEW_JOB_FOR_EDITING, API_ERROR_CROWD_USER_CAN_NOT_EDIT_ANSWERS_IN_THIS_TASK, API_ERROR_CROWD_USER_CASH_OUT_STATUS_NOT_ACTIVE, API_ERROR_CROWD_USER_DID_NOT_ACCEPT_TERMS_OF_OFFER, API_ERROR_CROWD_USER_DOES_NOT_HAVE_ACCESS_TO_DO_TASK, API_ERROR_CROWD_USER_HAS_REACHED_THE_TASK_COMPLETION_LIMIT, API_ERROR_CROWD_USER_IN_TASK_SO_HE_CANT_DO_EXAM, API_ERROR_CROWD_USER_IS_BANNED, API_ERROR_CROWD_USER_IS_BANNED_IN_TASK, API_ERROR_CROWD_USER_IS_TEMPORARILY_BLOCKED, API_ERROR_CROWD_USER_NOT_FOUND, API_ERROR_CROWD_USER_PROVIDED_INVALID_JOB_ID, API_ERROR_CROWD_USER_STATE_DOES_NOT_HAVE_STAGE, API_ERROR_CROWD_UTM_FOR_USER_ALREADY_ADDED, API_ERROR_CROWD_WRONG_STAGE_DATA, API_ERROR_CUA_CONFIRMATION_REQUIRED, API_ERROR_CUA_NO_VERIFICATION_METHODS_AVAILABLE, API_ERROR_CUA_SESSION_INVALID, API_ERROR_CUA_VALIDATION_METHOD_UNAVAILABLE, API_ERROR_DISABLED, API_ERROR_DONUT_WAIT, API_ERROR_EDUCATION_EJD_REGION_VENDOR_NOT_FOUND, API_ERROR_EDUCATION_PROPOSAL_CREATE_ERROR, API_ERROR_EMAIL_CONFIRMATION_NEED, API_ERROR_EMO_GET_REPORTS_MAX_ITEMS_SIZE_INVALID, API_ERROR_EMO_GET_REPORTS_STREAM_INVALID, API_ERROR_ENABLED_IN_TEST, API_ERROR_FAVE_ALIEXPRESS_TAG, API_ERROR_FILENAME, API_ERROR_FILESIZE, API_ERROR_FIND_ME_TOO_MANY_SUBSCRIPTIONS, API_ERROR_FLOOD, API_ERROR_FLOOD_OTP_SEND, API_ERROR_FOLLOW_ARTIST_ACCESS_DENIED, API_ERROR_FOLLOW_ARTIST_WRONG_FORMAT, API_ERROR_FORTUNE_SQUARE_GIVE_GIFTS, API_ERROR_FORTUNE_SQUARE_SECTOR_NOT_FOUND, API_ERROR_FORTUNE_SQUARE_SPIN_PROCESS, API_ERROR_FORTUNE_SQUARE_USER_STATE_NOT_FOUND, API_ERROR_FRIENDS_ADD_ENEMY, API_ERROR_FRIENDS_ADD_IN_ENEMY, API_ERROR_FRIENDS_ADD_NOT_FOUND, API_ERROR_FRIENDS_ADD_YOURSELF, API_ERROR_FRIENDS_FOLLOWERS_MODE_IS_DISABLED, API_ERROR_FRIENDS_LIST_ID, API_ERROR_FRIENDS_LIST_LIMIT, API_ERROR_FRIENDS_TOO_MANY_FRIENDS, API_ERROR_FRIENDS_TOO_MANY_SET_RECOMMENDATIONS, API_ERROR_GAMES_BANNERS_CANNOT_DELETE, API_ERROR_GIFT_NOT_AVAILABLE, API_ERROR_GO_UPLOAD_INVALID_CROP, API_ERROR_GO_UPLOAD_INVALID_GROUP, API_ERROR_GO_UPLOAD_INVALID_HASH, API_ERROR_GO_UPLOAD_INVALID_PHOTO, API_ERROR_GO_UPLOAD_INVALID_RESPONSE, API_ERROR_GO_UPLOAD_INVALID_UPLOAD_HASH, API_ERROR_GO_UPLOAD_INVALID_USER, API_ERROR_GO_UPLOAD_PHOTO_NOT_FOUND, API_ERROR_GO_UPLOAD_TO_SMALL_AVATAR, API_ERROR_GROUP_APP_IS_NOT_INSTALLED_IN_COMMUNITY, API_ERROR_GROUP_AUTH, API_ERROR_GROUP_CHANGE_CREATOR, API_ERROR_GROUP_CHAT_CANT_DELETE, API_ERROR_GROUP_DONUT_DISABLED, API_ERROR_GROUP_HOST_NEED_2FA, API_ERROR_GROUP_INVITE_LINKS_CANT_USE, API_ERROR_GROUP_INVITE_LINKS_NOT_VALID, API_ERROR_GROUP_INVITE_LINKS_USER_IN_CLUB, API_ERROR_GROUP_LIST_IS_NOT_OBSOLETE, API_ERROR_GROUP_NEED_2FA, API_ERROR_GROUP_NOT_IN_CLUB, API_ERROR_GROUP_PAYLOAD_FLOOD, API_ERROR_GROUP_PAYLOAD_MAX_LENGTH, API_ERROR_GROUP_PAYLOAD_SIGNATURE_EXPIRED, API_ERROR_GROUP_PAYLOAD_SIGNATURE_INVALID, API_ERROR_GROUP_TOO_MANY_ADDRESSES, API_ERROR_GROUP_TOO_MANY_OFFICERS, API_ERROR_HEALTH_FEED_ALREADY_LIKED, API_ERROR_HEALTH_FEED_NOT_LIKED, API_ERROR_HEALTH_FEED_NOT_OWNER, API_ERROR_HEALTH_LOCKED, API_ERROR_HEALTH_LOGIC_ERROR, API_ERROR_HEALTH_LOYALTY_CATALOG_NOT_FOUND, API_ERROR_HEALTH_LOYALTY_COUPON_LIMIT_PER_USER_REACHED, API_ERROR_HEALTH_LOYALTY_MAX_OWN_COUNT_REACHED, API_ERROR_HEALTH_LOYALTY_NOT_ENOUGH_BALANCE, API_ERROR_HEALTH_LOYALTY_NO_CURRENT_LOTTERY, API_ERROR_HEALTH_LOYALTY_REWARD_ALREADY_COLLECTED, API_ERROR_HEALTH_LOYALTY_SHOP_ITEM_NOT_FOUND, API_ERROR_HEALTH_LOYALTY_USER_ALREADY_EXISTS, API_ERROR_HEALTH_LOYALTY_USER_NOT_EXISTS, API_ERROR_HEALTH_LOYALTY_USER_TASK_IS_BURNED, API_ERROR_HEALTH_LOYALTY_USER_TASK_NOT_FINISHED, API_ERROR_HEALTH_LOYALTY_USER_TASK_NOT_FOUND, API_ERROR_HEALTH_RESOURCE_LOCKED, API_ERROR_INAPP_ORDERS_ACCESS_DENIED, API_ERROR_INAPP_ORDERS_NOT_FOUND, API_ERROR_INAPP_ORDERS_STATUS_IS_ACTUAL, API_ERROR_INAPP_ORDERS_STATUS_TRANSITION_FORBIDDEN, API_ERROR_INSUFFICIENT_FUNDS, API_ERROR_INVALID_ADDRESS, API_ERROR_INVALID_BID_ORG, API_ERROR_INVALID_EMAIL, API_ERROR_INVALID_LINKING_ORG, API_ERROR_INVALID_ORG, API_ERROR_INVALID_RECEIPT, API_ERROR_IP_IS_NOT_ALLOWED, API_ERROR_LIKES_REACTION_CAN_NOT_BE_APPLIED, API_ERROR_LIMITS, API_ERROR_LOYALTY_CANT_BUY_OFFER, API_ERROR_LOYALTY_CATEGORY_TASK_NOT_ALLOWED, API_ERROR_LOYALTY_COUPON_ACCESS_DENIED, API_ERROR_LOYALTY_COUPON_EXPIRED, API_ERROR_LOYALTY_COUPON_HAS_NO_AVAILABLE_CODE, API_ERROR_LOYALTY_COUPON_INVALID_DISTRIBUTION, API_ERROR_LOYALTY_COUPON_NOT_ACTIVE, API_ERROR_LOYALTY_COUPON_UNKNOWN_ERROR, API_ERROR_LOYALTY_FEATURE_DISABLED, API_ERROR_LOYALTY_INCORRECT_TASK_TYPE, API_ERROR_LOYALTY_IS_BOT, API_ERROR_LOYALTY_LEADERBOARD_NOT_FOUND, API_ERROR_LOYALTY_LEADERBOARD_TEMPLATE_NOT_FOUND, API_ERROR_LOYALTY_NEED_VERIFY, API_ERROR_LOYALTY_NOT_ENOUGH_MONEY, API_ERROR_LOYALTY_NO_ACCOUNT, API_ERROR_LOYALTY_OFFER_HAS_NO_COUPON, API_ERROR_LOYALTY_OFFER_HAS_NO_PRICE, API_ERROR_LOYALTY_OFFER_NOT_FOUND, API_ERROR_LOYALTY_PARTNER_APP_ID_ALREADY_EXIST, API_ERROR_LOYALTY_REQUEST_ALREADY_PROCESSED_SUCCESSFULLY, API_ERROR_LOYALTY_REQUEST_FAILED, API_ERROR_LOYALTY_REQUEST_FINISHED, API_ERROR_LOYALTY_REQUEST_PROCESSING, API_ERROR_LOYALTY_STICKER_NOT_AVAILABLE, API_ERROR_LOYALTY_TASK_ALREADY_COMPLETED, API_ERROR_LOYALTY_TASK_NOT_FOUND, API_ERROR_LOYALTY_TASK_NOT_STARTED, API_ERROR_LOYALTY_TEAM_CODE_IS_USED, API_ERROR_LOYALTY_TEAM_IS_FULL, API_ERROR_LOYALTY_TEAM_NOT_FOUND, API_ERROR_LOYALTY_USED_CODE, API_ERROR_LOYALTY_USER_ALREADY_EXISTS, API_ERROR_LOYALTY_USER_WRONG_REGION, API_ERROR_LOYALTY_VERIFICATION_IN_PROGRESS, API_ERROR_LOYALTY_WIN_PREVIOUS_EVENT, API_ERROR_LOYALTY_WRONG_CODE, API_ERROR_LOYALTY_WRONG_PROMOCODE, API_ERROR_MARKET_ADD_TO_CART, API_ERROR_MARKET_ADD_TO_CART_LIMIT, API_ERROR_MARKET_ADD_TO_MARKET_ALBUM, API_ERROR_MARKET_ADD_TO_SERVICE_ALBUM, API_ERROR_MARKET_ALBUM_MAIN_HIDDEN, API_ERROR_MARKET_ALBUM_NOT_FOUND, API_ERROR_MARKET_ANOTHER_COMMUNITY_LINKED_TO_PROFILE, API_ERROR_MARKET_ANOTHER_PROFILE_LINKED_TO_COMMUNITY, API_ERROR_MARKET_CANT_CHANGE_VKPAY_STATUS, API_ERROR_MARKET_CAROUSEL_DISABLED, API_ERROR_MARKET_CART_IS_LOCKED, API_ERROR_MARKET_CATEGORY_IS_NOT_VALID, API_ERROR_MARKET_COMMENTS_CLOSED, API_ERROR_MARKET_COMMUNITY_REVIEW_FRIENDS, API_ERROR_MARKET_COMMUNITY_REVIEW_NOT_BUSINESS_COMMUNITY, API_ERROR_MARKET_COMMUNITY_REVIEW_USER_IS_GROUP_EDITOR, API_ERROR_MARKET_COMMUNITY_REVIEW_USER_IS_NEW, API_ERROR_MARKET_COMMUNITY_REVIEW_USER_LEFT_REVIEW, API_ERROR_MARKET_COURIER_DELIVERY_NOT_ENABLED, API_ERROR_MARKET_DELIVERY_SETTINGS, API_ERROR_MARKET_DISABLED, API_ERROR_MARKET_EXTENDED_NOT_ENABLED, API_ERROR_MARKET_FAILED_TO_SET_ALBUM_AS_MAIN, API_ERROR_MARKET_FAILED_TO_UNSET_ALBUM_AS_MAIN, API_ERROR_MARKET_GROUPING_ALREADY_HAS_SUCH_VARIANT, API_ERROR_MARKET_GROUPING_HAS_OTHER_PROPERTIES, API_ERROR_MARKET_GROUPING_ITEMS_MUST_HAVE_DISTINCT_PROPERTIES, API_ERROR_MARKET_GROUPING_ITEMS_WITH_DIFFERENT_PROPERTIES, API_ERROR_MARKET_GROUPING_MUST_CONTAIN_MORE_THAN_ONE_ITEM, API_ERROR_MARKET_GROUPING_MUST_HAVE_VARIANTS, API_ERROR_MARKET_INVALID_DIMENSIONS, API_ERROR_MARKET_ITEM_ALREADY_ADDED, API_ERROR_MARKET_ITEM_HAS_BAD_LINKS, API_ERROR_MARKET_ITEM_IS_DELETED, API_ERROR_MARKET_ITEM_IS_NOT_DELETED, API_ERROR_MARKET_ITEM_IS_SERVICE, API_ERROR_MARKET_ITEM_NOT_FOUND, API_ERROR_MARKET_ITEM_REVIEW_ALREADY_EXISTS, API_ERROR_MARKET_ITEM_REVIEW_DISABLED, API_ERROR_MARKET_ITEM_REVIEW_GROUP_IS_PRIVATE, API_ERROR_MARKET_ITEM_REVIEW_IS_GOVERNMENT, API_ERROR_MARKET_ITEM_REVIEW_NEW_USER, API_ERROR_MARKET_ITEM_REVIEW_NOT_BUSINESS, API_ERROR_MARKET_ITEM_REVIEW_NOT_PRO_MARKET, API_ERROR_MARKET_ITEM_REVIEW_STOP_WORDS_IN_TEXT, API_ERROR_MARKET_ITEM_REVIEW_USER_BLACKLISTED, API_ERROR_MARKET_MAX_PROPERTIES_LIMIT_EXCEED, API_ERROR_MARKET_MAX_VARIANTS_LIMIT_EXCEED, API_ERROR_MARKET_NAME_TOO_LONG, API_ERROR_MARKET_NOT_ENABLED, API_ERROR_MARKET_ORDERS_CART_ITEM_QUANTITY_EXCEEDED, API_ERROR_MARKET_ORDERS_INVALID_STATUS, API_ERROR_MARKET_ORDERS_LESS_THAN_MIN_ORDER_PRICE, API_ERROR_MARKET_ORDERS_NO_CART_ITEMS, API_ERROR_MARKET_ORDERS_ORDER_NOT_FOUND, API_ERROR_MARKET_ORDERS_OUT_OF_STOCK, API_ERROR_MARKET_ORDERS_REQUIRED_FIELD_IS_EMPTY, API_ERROR_MARKET_PAYMENTS_SETTINGS, API_ERROR_MARKET_PHOTOS_CROP_INVALID_FORMAT, API_ERROR_MARKET_PHOTOS_CROP_OVERFLOW, API_ERROR_MARKET_PHOTOS_CROP_SIZE_TOO_LOW, API_ERROR_MARKET_PROMO_CODE_ALREADY_EXISTS, API_ERROR_MARKET_PROMO_CODE_APPLY_LIMIT_INVALID, API_ERROR_MARKET_PROMO_CODE_DELIVERY_DISCOUNT, API_ERROR_MARKET_PROMO_CODE_EDITING_ARCHIVE, API_ERROR_MARKET_PROMO_CODE_EMPTY_DISCOUNT, API_ERROR_MARKET_PROMO_CODE_EXTENDED_FIELDS, API_ERROR_MARKET_PROMO_CODE_ITEMS_DISCOUNT, API_ERROR_MARKET_PROMO_CODE_LIMIT_EXCEED, API_ERROR_MARKET_PROMO_CODE_MANY_DISCOUNT, API_ERROR_MARKET_PROMO_CODE_NAME, API_ERROR_MARKET_PROMO_CODE_TIME_FROM, API_ERROR_MARKET_PROMO_CODE_TIME_TO, API_ERROR_MARKET_PROPERTY_NOT_FOUND, API_ERROR_MARKET_RESTORE_TOO_LATE, API_ERROR_MARKET_REVIEWS_NOT_AVAILABLE, API_ERROR_MARKET_REVIEWS_NOT_FOUND, API_ERROR_MARKET_SERVICES_DISABLED, API_ERROR_MARKET_SET_SETTINGS, API_ERROR_MARKET_SHOP_ALREADY_DISABLED, API_ERROR_MARKET_SHOP_ALREADY_ENABLED, API_ERROR_MARKET_TOO_MANY_ALBUMS, API_ERROR_MARKET_TOO_MANY_ATTENDANT_ITEMS, API_ERROR_MARKET_TOO_MANY_ITEMS, API_ERROR_MARKET_TOO_MANY_ITEMS_IN_ALBUM, API_ERROR_MARKET_UNKNOWN_PROPERTY_TYPE, API_ERROR_MARKET_UNKNOWN_USER_LOCATION, API_ERROR_MARKET_USER_UNDERAGE, API_ERROR_MARKET_VARIANTS_ERROR, API_ERROR_MARKET_VARIANTS_NOT_ENABLED, API_ERROR_MARKET_VARIANT_NOT_FOUND, API_ERROR_MARKET_VARIANT_VALUE_TOO_LONG, API_ERROR_MESSAGES_ALREADY_ARCHIVED, API_ERROR_MESSAGES_ALREADY_IN_THE_CALL, API_ERROR_MESSAGES_ALREADY_PINNED_CONVERSATION, API_ERROR_MESSAGES_APP_ACTION_RESTRICTED_FOR_COMMUNITY, API_ERROR_MESSAGES_AUDIO_MESSAGE_NOT_RECOGNIZED, API_ERROR_MESSAGES_CALL_BUSY, API_ERROR_MESSAGES_CALL_CHAT_LIMIT_REACHED, API_ERROR_MESSAGES_CALL_INVALID_JOIN_LINK, API_ERROR_MESSAGES_CALL_INVALID_NAME, API_ERROR_MESSAGES_CALL_INVALID_SECRET, API_ERROR_MESSAGES_CALL_JOIN_NOT_ALLOWED, API_ERROR_MESSAGES_CALL_NOT_FOUND, API_ERROR_MESSAGES_CALL_PRIVACY, API_ERROR_MESSAGES_CALL_REQUIRES_AUTH, API_ERROR_MESSAGES_CANT_CHANGE_INVITE_LINK, API_ERROR_MESSAGES_CANT_DELETE_FOR_ALL, API_ERROR_MESSAGES_CANT_EDIT_PINNED_YET, API_ERROR_MESSAGES_CANT_FWD, API_ERROR_MESSAGES_CANT_PIN_EXPIRING_MESSAGE, API_ERROR_MESSAGES_CANT_PIN_ONE_TIME_STORY, API_ERROR_MESSAGES_CANT_PIN_SERVICE_MESSAGE, API_ERROR_MESSAGES_CANT_SEE_INVITE_LINK, API_ERROR_MESSAGES_CHAT_ADD_TEMPORARY_DENIED, API_ERROR_MESSAGES_CHAT_BOT_FEATURE, API_ERROR_MESSAGES_CHAT_CANT_ADD_USER_BY_PRIVACY, API_ERROR_MESSAGES_CHAT_CAN_NOT_BE_JOINED_FOR_NOT_ORGANIZATION_MEMBER, API_ERROR_MESSAGES_CHAT_DISABLED, API_ERROR_MESSAGES_CHAT_FORWARD_DISABLED, API_ERROR_MESSAGES_CHAT_INVALID_INVITE_LINK, API_ERROR_MESSAGES_CHAT_MEMBER_NOT_STAFF, API_ERROR_MESSAGES_CHAT_MOVED_TO_MAX, API_ERROR_MESSAGES_CHAT_NOT_ADMIN, API_ERROR_MESSAGES_CHAT_NOT_EXIST, API_ERROR_MESSAGES_CHAT_UNSUPPORTED, API_ERROR_MESSAGES_CHAT_USER_LEFT, API_ERROR_MESSAGES_CHAT_USER_NOT_IN_CHAT, API_ERROR_MESSAGES_CHAT_USER_NO_ACCESS, API_ERROR_MESSAGES_CHAT_WAS_DELETED, API_ERROR_MESSAGES_CONTACT_NOT_FOUND, API_ERROR_MESSAGES_CONVERSATION_CAN_NOT_BE_PINNED, API_ERROR_MESSAGES_CONVERSATION_STYLE_UPDATE_FLOOD, API_ERROR_MESSAGES_DEGRADATION, API_ERROR_MESSAGES_DENY_SEND, API_ERROR_MESSAGES_DROP_DEVICE_CACHE, API_ERROR_MESSAGES_EDITING_DISABLED_UNLINK_ESIA, API_ERROR_MESSAGES_EDIT_EXPIRED, API_ERROR_MESSAGES_EDIT_KIND_DISALLOWED, API_ERROR_MESSAGES_EMAIL_NO_ACCESS, API_ERROR_MESSAGES_FOLDERS_LIMIT_REACHED, API_ERROR_MESSAGES_FOLDER_CONVERSATIONS_LIMIT_REACHED, API_ERROR_MESSAGES_FOLDER_NOT_FOUND, API_ERROR_MESSAGES_FORBIDDEN_REACTION, API_ERROR_MESSAGES_GROUP_FOR_NOTIFICATIONS_ONLY, API_ERROR_MESSAGES_GROUP_MESSAGES_FORBIDDEN, API_ERROR_MESSAGES_GROUP_MESSAGES_OFF, API_ERROR_MESSAGES_GROUP_PEER_ACCESS, API_ERROR_MESSAGES_INTENT_CANT_USE, API_ERROR_MESSAGES_INTENT_LIMIT_OVERFLOW, API_ERROR_MESSAGES_INVALID_REACTION_ID, API_ERROR_MESSAGES_KEYBOARD_INVALID, API_ERROR_MESSAGES_MAX_PINNED_MESSAGES, API_ERROR_MESSAGES_MEMBER_ACCESS_TO_GROUP_DENIED, API_ERROR_MESSAGES_MESSAGE_CANNOT_BE_FORWARDED, API_ERROR_MESSAGES_MESSAGE_REQUEST_ALREADY_SENT, API_ERROR_MESSAGES_MESSAGE_WAS_DELETED, API_ERROR_MESSAGES_NEED_EDU_ROLE, API_ERROR_MESSAGES_NEED_MESSAGE_REQUEST, API_ERROR_MESSAGES_NOT_ARCHIVED, API_ERROR_MESSAGES_NO_CONVERSATION, API_ERROR_MESSAGES_OLD_CALLS_LIB, API_ERROR_MESSAGES_OLD_RECEIVER_APP, API_ERROR_MESSAGES_ONLY_P2P_ENABLED_FOR_CALL, API_ERROR_MESSAGES_OUTDATED_CALL_JOIN_LINK, API_ERROR_MESSAGES_OUTDATED_VK_ROOMS_LINK, API_ERROR_MESSAGES_PEER_BLOCKED_REASON_BY_TIME, API_ERROR_MESSAGES_PENDING_MESSAGE_REQUEST, API_ERROR_MESSAGES_PHONE_NUMBER_NOT_CLUB_MEMBER, API_ERROR_MESSAGES_PHONE_NUMBER_NOT_VERIFIED, API_ERROR_MESSAGES_PHONE_NUMBER_NO_ACCESS, API_ERROR_MESSAGES_PHONE_NUMBER_NO_MOBILE_APP, API_ERROR_MESSAGES_POSTPONED_LIMIT, API_ERROR_MESSAGES_POSTPONED_NOT_SUPPORTED, API_ERROR_MESSAGES_PRIVACY, API_ERROR_MESSAGES_REACTIONS_LIMIT_REACHED, API_ERROR_MESSAGES_SHOULD_BE_EDU, API_ERROR_MESSAGES_SHOULD_NOT_BE_EDU, API_ERROR_MESSAGES_SPAM_RESTRICTION, API_ERROR_MESSAGES_TOO_BIG, API_ERROR_MESSAGES_TOO_LONG_FORWARDS, API_ERROR_MESSAGES_TOO_LONG_MESSAGE, API_ERROR_MESSAGES_TOO_MANY_CONTACTS, API_ERROR_MESSAGES_TOO_MANY_PINNED_CONVERSATIONS, API_ERROR_MESSAGES_TOO_MANY_POSTS, API_ERROR_MESSAGES_TOO_NEW_PTS, API_ERROR_MESSAGES_TOO_OLD_PTS, API_ERROR_MESSAGES_TRANSCRIPTION_SIZE_NOT_ALLOWED, API_ERROR_MESSAGES_TRANSLATION_CANT_TRANSLATE, API_ERROR_MESSAGES_TRANSLATION_INVALID_LANGUAGES, API_ERROR_MESSAGES_TRANSLATION_INVALID_MESSAGE, API_ERROR_MESSAGES_TRANSLATION_UNSUPPORTED_LANGUAGE, API_ERROR_MESSAGES_USER_BLOCKED, API_ERROR_MESSAGES_USER_IS_RESTRICTED_TO_WRITE_TO_CHAT, API_ERROR_MESSAGES_USER_NOT_DON, API_ERROR_MESSAGES_WRITING_DISABLED_FOR_CHAT, API_ERROR_METHOD, API_ERROR_METHOD_ADS, API_ERROR_METHOD_DISABLED, API_ERROR_METHOD_IS_NOT_AVAILABLE_FOR_THE_PROFILE_TYPE, API_ERROR_METHOD_PERMISSION, API_ERROR_ME_EDUCATION_IS_NOT_AN_EDU_USER, API_ERROR_MICROLANDINGS_ADVANTAGE_LENGTH, API_ERROR_MICROLANDINGS_ADVANTAGE_MAX_COUNT, API_ERROR_MICROLANDINGS_APPEARANCE_INVALID_BACKGROUND, API_ERROR_MICROLANDINGS_APPEARANCE_INVALID_BUTTON_RADIUS, API_ERROR_MICROLANDINGS_APPEARANCE_INVALID_FONT_ID, API_ERROR_MICROLANDINGS_APPEARANCE_INVALID_FONT_SIZE, API_ERROR_MICROLANDINGS_APPEARANCE_INVALID_FONT_WEIGHT, API_ERROR_MICROLANDINGS_CONTENT_BLOCK_ATTACH_MAX_COUNT, API_ERROR_MICROLANDINGS_CONTENT_BLOCK_DESC_LENGTH, API_ERROR_MICROLANDINGS_CONTENT_BLOCK_INCORRECT_ATTACH, API_ERROR_MICROLANDINGS_CONTENT_BLOCK_TITLE_LENGTH, API_ERROR_MICROLANDINGS_CTA_BUTTON, API_ERROR_MICROLANDINGS_CTA_BUTTON_INCORRECT, API_ERROR_MICROLANDINGS_CUSTOM_DOMAIN_INCORRECT_FORMAT, API_ERROR_MICROLANDINGS_CUSTOM_DOMAIN_NAME_NOT_SET, API_ERROR_MICROLANDINGS_CUSTOM_DOMAIN_URL_NOT_SAFE, API_ERROR_MICROLANDINGS_DESC_LENGTH, API_ERROR_MICROLANDINGS_EMAIL_FORMAT, API_ERROR_MICROLANDINGS_HEADER_LENGTH, API_ERROR_MICROLANDINGS_INCORRECT_BLOCK_TYPE, API_ERROR_MICROLANDINGS_INCORRECT_PIXEL_ID, API_ERROR_MICROLANDINGS_LEAD_FORM_DISABLE_MESSAGES, API_ERROR_MICROLANDINGS_LEAD_FORM_INCORRECT_ADDRESS, API_ERROR_MICROLANDINGS_LEAD_FORM_INCORRECT_AGREE, API_ERROR_MICROLANDINGS_LEAD_FORM_INCORRECT_EMAIL, API_ERROR_MICROLANDINGS_LEAD_FORM_INCORRECT_NAME, API_ERROR_MICROLANDINGS_LEAD_FORM_INCORRECT_OGRN, API_ERROR_MICROLANDINGS_LEAD_FORM_WIDGET_BLOCK_CTA_BUTTON_INCORRECT, API_ERROR_MICROLANDINGS_LEAD_FORM_WIDGET_BLOCK_HEADER_LENGTH, API_ERROR_MICROLANDINGS_LEAD_FORM_WIDGET_BLOCK_SUBHEADER_LENGTH, API_ERROR_MICROLANDINGS_LEAD_MAGNET_BLOCK_ATTACH_INCORRECT, API_ERROR_MICROLANDINGS_LEAD_MAGNET_BLOCK_ATTACH_VALUE_DOC_INCORRECT, API_ERROR_MICROLANDINGS_LEAD_MAGNET_BLOCK_ATTACH_VALUE_LENGTH, API_ERROR_MICROLANDINGS_LEAD_MAGNET_BLOCK_CTA_TYPE_INCORRECT, API_ERROR_MICROLANDINGS_LEAD_MAGNET_BLOCK_HEADER_LENGTH, API_ERROR_MICROLANDINGS_LEAD_MAGNET_BLOCK_SUCCESS_MESSAGE_LENGTH, API_ERROR_MICROLANDINGS_PHONE_FORMAT, API_ERROR_MICROLANDINGS_PHOTOS_BLOCK_HEADER_LENGTH, API_ERROR_MICROLANDINGS_PRODUCTS_BLOCK_HEADER_LENGTH, API_ERROR_MICROLANDINGS_REVIEWS_BLOCK_HEADER_LENGTH, API_ERROR_MICROLANDINGS_SEND_VK_DISABLE_MESSAGES, API_ERROR_MICROLANDINGS_URL_FORMAT, API_ERROR_MICROLANDINGS_URL_NOT_SAFETY, API_ERROR_MICROLANDINGS_VIDEO_MAX_DURATION, API_ERROR_MICROLANDINGS_VIDEO_RESTRICTED, API_ERROR_MICROLANDINGS_VK_CONTACT, API_ERROR_MOBILE_NOT_ACTIVATED, API_ERROR_MONEY_REQUEST_ALREADY_PROCESSED, API_ERROR_MONEY_TRANSFER_CANT_YOURSELF, API_ERROR_MONEY_TRANSFER_MAINTENANCE, API_ERROR_MONEY_TRANSFER_NO_AVAILABLE, API_ERROR_MONEY_TRANSFER_SBP_NOT_RU_PHONE, API_ERROR_MONEY_TRANSFER_SBP_NO_PHONE, API_ERROR_MONEY_TRANSFER_SBP_PROVIDER_ERROR, API_ERROR_MONEY_TRANSFER_SBP_RATE_LIMITS, API_ERROR_MONEY_VKPAY_RESPONSE_FAIL, API_ERROR_MUSIC_UPSELL_NOT_AVAILABLE, API_ERROR_NEED_CONFIRMATION, API_ERROR_NEED_ENTER_PHONE, API_ERROR_NEED_TOKEN_CONFIRMATION, API_ERROR_NOTIFICATION_PARAMS_INVALID, API_ERROR_NOTIFICATION_TYPE_UNSUPPORTED, API_ERROR_NOT_FOUND, API_ERROR_NOT_IMPLEMENTED_YET, API_ERROR_NOT_SUPPORTED_HTTP_METHOD, API_ERROR_NO_COUPLED_ACCOUNT, API_ERROR_NO_USER_BY_PHONE, API_ERROR_OAUTH_ENTITY_IS_ALREADY_LINKED, API_ERROR_OAUTH_EXTERNAL_SERVICE_HAS_INVALID_USER_DATA, API_ERROR_OAUTH_EXTERNAL_SERVICE_IS_NOT_AVAILABLE, API_ERROR_OAUTH_INVALID_BIRTHDATE, API_ERROR_OAUTH_INVALID_SERVICE_ID, API_ERROR_OAUTH_INVALID_SID, API_ERROR_OAUTH_NOT_LINKED_PARENTS, API_ERROR_OAUTH_SYNCHRONIZATION_FAILED, API_ERROR_OAUTH_USER_IS_DELETED, API_ERROR_OAUTH_USER_IS_NOT_LINKED, API_ERROR_OAUTH_USER_IS_UNTRUSTED, API_ERROR_OTP_SEND, API_ERROR_OTP_VALIDATION_NEED, API_ERROR_PARAM, API_ERROR_PARAM_ALBUM_ID, API_ERROR_PARAM_AMOUNT, API_ERROR_PARAM_API_ID, API_ERROR_PARAM_AUDIO, API_ERROR_PARAM_DOC_ACCESS, API_ERROR_PARAM_DOC_DELETE_ACCESS, API_ERROR_PARAM_DOC_ID, API_ERROR_PARAM_DOC_RESTORE_ACCESS, API_ERROR_PARAM_DOC_RESTORE_TIMEOUT, API_ERROR_PARAM_DOC_TITLE, API_ERROR_PARAM_GROUP_ID, API_ERROR_PARAM_HASH, API_ERROR_PARAM_NOTE_ID, API_ERROR_PARAM_PAGE_ID, API_ERROR_PARAM_PHONE, API_ERROR_PARAM_PHOTO, API_ERROR_PARAM_PHOTOS, API_ERROR_PARAM_QUESTION_LIMIT, API_ERROR_PARAM_QUESTION_TEXT, API_ERROR_PARAM_SCHOOL_ID, API_ERROR_PARAM_SERVER, API_ERROR_PARAM_SOURCE, API_ERROR_PARAM_STATUS, API_ERROR_PARAM_TIMESTAMP, API_ERROR_PARAM_TITLE, API_ERROR_PARAM_USER_ID, API_ERROR_PASSKEY_REGISTRATION, API_ERROR_PASSWORD_VALIDATION_NEED, API_ERROR_PERMISSION, API_ERROR_PHONES_LIST_IS_NOT_SUPPORTED, API_ERROR_PHONE_ALREADY_USED, API_ERROR_PHONE_IS_NOT_VERIFIED, API_ERROR_PHONE_VALIDATING_NOT_STARTED, API_ERROR_PHONE_VALIDATION_NEED, API_ERROR_PHOTO_CHANGED, API_ERROR_PLATFORM_APP_NOT_ENABLED, API_ERROR_PLATFORM_CONFIRMATION_REQUIRED, API_ERROR_PLATFORM_FUNCTION_ALREADY_EXISTS, API_ERROR_PLATFORM_FUNCTION_COMPILATION_ERROR, API_ERROR_PLATFORM_FUNCTION_NAME_INVALID, API_ERROR_PLATFORM_MODERATION_NOT_FOUND, API_ERROR_PLATFORM_MONETIZATION_CABINET_DISABLED, API_ERROR_PLATFORM_MONETIZATION_DISABLED, API_ERROR_PLATFORM_MONETIZATION_STATS_NOT_AVAILABLE, API_ERROR_PLATFORM_ONLY_ONE_INDIVIDUAL_ORGANIZATION, API_ERROR_PLATFORM_VERIFICATION_REQUIRED, API_ERROR_PODCASTS_ALREADY_MODERATION, API_ERROR_PODCASTS_EPISODE_NOT_FOUND, API_ERROR_PODCASTS_EPISODE_NOT_IN_PODCAST, API_ERROR_PODCASTS_EPISODE_OWNER_MISMATCH, API_ERROR_PODCASTS_EPISODE_PENDING, API_ERROR_PODCASTS_OWNER_DISABLED, API_ERROR_POLLS_ACCESS, API_ERROR_POLLS_ACCESS_WITHOUT_VOTE, API_ERROR_POLLS_ANSWER_ID, API_ERROR_POLLS_POLL_ID, API_ERROR_PRETTY_CARDS_CARD_IS_CONNECTED_TO_POST, API_ERROR_PRETTY_CARDS_CARD_NOT_FOUND, API_ERROR_PRETTY_CARDS_TOO_MANY_CARDS, API_ERROR_PRIVATE_PROFILE, API_ERROR_PRODUCT_NOT_AVAILABLE, API_ERROR_PRODUCT_NOT_FOUND, API_ERROR_PROMO_CODES_ADD_DISCOUNT_STICKERS_LIMIT_ACTIVATION, API_ERROR_PROMO_CODES_ADD_PROMOCODE_LIMIT_ACTIVATION_PER_DAY, API_ERROR_PROMO_CODES_APP_IS_NOT_REGISTERED, API_ERROR_PROMO_CODES_CAMPAIGN_DISABLED, API_ERROR_PROMO_CODES_CAMPAIGN_DOES_NOT_EXIST, API_ERROR_PROMO_CODES_ITEM_IS_NOT_AVAILABLE, API_ERROR_PROMO_CODES_LIMIT_IS_REACHED, API_ERROR_PROMO_CODES_PARTNER_DISABLED, API_ERROR_PROMO_CODES_PARTNER_SUBSCRIPTION_EXISTS, API_ERROR_PROMO_CODES_PROMOCODE_ACTIVATED, API_ERROR_PROMO_CODES_PROMOCODE_BIND_OTHER_USER, API_ERROR_PROMO_CODES_PROMOCODE_EXPIRED, API_ERROR_PROMO_CODES_QUOTA_EXCEEDED, API_ERROR_PROMO_CODES_STICKER_PACK_IS_ALREADY_ADDED, API_ERROR_PROMO_CODES_TASK_DOES_NOT_EXIST, API_ERROR_PROMO_CODES_TASK_IS_NOT_COMPLETE, API_ERROR_RATE_LIMIT, API_ERROR_RECAPTCHA, API_ERROR_REPORTS_DECISION_INVALID_DATA, API_ERROR_REPORTS_DECISION_NOT_FOUND, API_ERROR_REPORTS_DECISION_OBJECT_NOT_FOUND, API_ERROR_REPORTS_DECISION_OWNER_PROTECTED, API_ERROR_REQUEST, API_ERROR_RESEND_DELAY_NOT_EXPIRED, API_ERROR_RESTORE_INCORRECT_PHONE_OR_EMAIL, API_ERROR_RESTORE_PHONE_FORMAT, API_ERROR_RESTORE_PHONE_OCCUPIED, API_ERROR_RESTORE_USER_WAS_NOT_FOUND, API_ERROR_RFC_INSUFFICIENT_SCOPE, API_ERROR_RFC_INVALID_CLIENT, API_ERROR_RFC_INVALID_GRANT, API_ERROR_RFC_INVALID_SCOPE, API_ERROR_RFC_INVALID_TOKEN, API_ERROR_RFC_SLOW_DOWN, API_ERROR_RFC_UNAUTHORIZED_CLIENT, API_ERROR_RFC_UNSUPPORTED_GRANT_TYPE, API_ERROR_RFC_UNSUPPORTED_RESPONSE_TYPE, API_ERROR_RUNTIME, API_ERROR_SAVE_FILE, API_ERROR_SECTION_DISABLED, API_ERROR_SELLER_ALREADY_LINKED, API_ERROR_SERVER, API_ERROR_SIGNATURE, API_ERROR_SPACES_INVITE_LINK_CANT_CHANGE, API_ERROR_SPACES_INVITE_LINK_CANT_SEE, API_ERROR_SPACES_INVITE_LINK_NOT_VALID, API_ERROR_SPACES_USER_ALREADY_IN, API_ERROR_STATUS_NO_AUDIO, API_ERROR_STICKERS_NOT_FAVORITE, API_ERROR_STICKERS_NOT_PURCHASED, API_ERROR_STICKERS_TOO_MANY_FAVORITES, API_ERROR_STORY_EXPIRED, API_ERROR_STORY_INCORRECT_REPLY_PRIVACY, API_ERROR_STUDENTS_VERIFICATION_CARD_ALREADY_EXISTS, API_ERROR_SUPPORT_TICKET_ID_NOT_FOUND, API_ERROR_SUPPORT_TICKET_NOT_FOUND, API_ERROR_TEXTLIVES_AUTHOR_IS_INVALID, API_ERROR_TEXTLIVES_EMPTY_MESSAGE, API_ERROR_TEXTLIVES_MESSAGE_IS_TOO_BIG, API_ERROR_TEXTLIVES_SERVER_TRY_AGAIN, API_ERROR_TEXTLIVES_TEXTLIVE_IS_FINISHED, API_ERROR_TEXTLIVES_TEXTLIVE_IS_UNAVAILABLE, API_ERROR_TEXTLIVES_TOO_MANY_ATTACHMENTS, API_ERROR_TIMEOUT, API_ERROR_TOKEN_EXTENSION_REQUIRED, API_ERROR_TOO_MANY, API_ERROR_TOO_MANY_LISTS, API_ERROR_TRANSACTION_NOT_FOUND, API_ERROR_TRANSACTION_STATUS, API_ERROR_TRANSLATIONS_CANT_TRANSLATE, API_ERROR_TRANSLATIONS_MULTIPLE_SOURCE_LANG, API_ERROR_UNBLOCK_UNBAN_DATA_EXPIRED, API_ERROR_UNFOLLOW_ARTIST_WRONG_FORMAT, API_ERROR_UNKNOWN, API_ERROR_UNKNOWN_APPLICATION, API_ERROR_UNKNOWN_GROUP, API_ERROR_UNKNOWN_USER, API_ERROR_UNKNOW_LOGIN, API_ERROR_UPLOAD, API_ERROR_URL_DOMAIN_BANNED, API_ERROR_USER_ALREADY_HAS_EXTERNAL_BINDING, API_ERROR_USER_BANNED, API_ERROR_USER_DEACTIVATED, API_ERROR_USER_DELETED, API_ERROR_USER_INVALID, API_ERROR_USER_SERVICE_DEACTIVATED, API_ERROR_UTILS_SNIPPET_URL_INCORRECT, API_ERROR_UTILS_SNIPPET_URL_TIMEOUT, API_ERROR_VERIFICATION_REQUEST_NOT_FOUND, API_ERROR_VIDEO_ALREADY_ADDED, API_ERROR_VIDEO_COMMENTS_CLOSED, API_ERROR_VIDEO_TRY_LATER, API_ERROR_VKRUN_CHALLENGE_CANNOT_ACCEPT, API_ERROR_VKRUN_CHALLENGE_CANNOT_BAN_USER_CURRENT_STATUS, API_ERROR_VKRUN_CHALLENGE_CANNOT_INVITE_USERS, API_ERROR_VKRUN_CHALLENGE_CANNOT_LEAVE, API_ERROR_VKRUN_END_DATE_GREATER_THAN_YEAR, API_ERROR_VKRUN_END_DATE_LESS_OR_EQUAL_THAN_START_DATE, API_ERROR_VKRUN_INVITATION_IS_OUTDATED, API_ERROR_VKSTORE_CART_ITEMS_CHANGED, API_ERROR_VKSTORE_CONTACT_PHONE, API_ERROR_VKSTORE_DELIVERY_ADDRESS, API_ERROR_VKSTORE_DELIVERY_MIN_PRICE, API_ERROR_VKSTORE_DELIVERY_PERSON, API_ERROR_VKSTORE_INVALID_DELIVERY_METHOD, API_ERROR_VKSTORE_ITEM_COUNT_LIMIT, API_ERROR_VKSTORE_NOT_ENOUGH_COINS, API_ERROR_VKSTORE_ORDER_CANCEL, API_ERROR_VKSTORE_ORDER_CANCEL_WRONG_STATUS, API_ERROR_VKSTORE_ORDER_CLOSE, API_ERROR_VKSTORE_ORDER_CLOSE_WRONG_STATUS, API_ERROR_VKSTORE_ORDER_LOCKED, API_ERROR_VKSTORE_ORDER_PAY, API_ERROR_VKSTORE_ORDER_SAVE, API_ERROR_VKUP_CAN_NOT_CHANGE_STARTED_TIME_IN_ACTIVE_QUEST, API_ERROR_VKUP_GIFT_CARD_BAD_OWNER, API_ERROR_VKUP_GIFT_CARD_IS_USED, API_ERROR_VKUP_GIFT_CARD_NOT_ALLOWED_FOR_USER, API_ERROR_VKUP_GIFT_CARD_NOT_FOUND, API_ERROR_VKUP_HAS_DIFFERENT_TYPE, API_ERROR_VKUP_PRODUCT_NOT_EMOJI_STATUS, API_ERROR_VKUP_PRODUCT_NOT_FOUND, API_ERROR_VKUP_PRODUCT_NOT_STICKER_PACK, API_ERROR_VKUP_PRODUCT_TYPE_NOT_FOUND, API_ERROR_VKUP_QUEST_ALREADY_EXISTS, API_ERROR_VKUP_REQUEST_IS_EMPTY, API_ERROR_VKUP_UNKNOWN_ERROR, API_ERROR_VKUP_USER_ALREADY_ACCEPTED_OFFER, API_ERROR_VKUP_USER_ALREADY_ONBOARDED, API_ERROR_VKUP_USER_CANNOT_BUY_PRODUCT, API_ERROR_VKUP_USER_CANNOT_SKIP_QUEST, API_ERROR_VKUP_USER_CAN_NOT_GET_REWARD, API_ERROR_VKUP_USER_NOT_ACCEPTED_OFFER, API_ERROR_VKUP_USER_NOT_REGISTERED, API_ERROR_VKUP_USER_PRODUCT_NOT_FOUND, API_ERROR_VKUP_USER_PRODUCT_SAVE_FAILED, API_ERROR_VKUP_USER_QUEST_WRONG_STATUS, API_ERROR_VKUP_USER_SAVE_FAILED, API_ERROR_VKUP_USER_UPDATE_WRONG_PARAMETERS, API_ERROR_VK_BOOSTS_ANOTHER_BOOST_USER_STARTED, API_ERROR_VK_BOOSTS_EXISTS, API_ERROR_VK_BOOSTS_NOT_FOUND, API_ERROR_VK_BOOSTS_NO_ACTIVE_BOOST, API_ERROR_VK_BOOSTS_NO_CONTENT_AVAILABLE, API_ERROR_VK_BOOSTS_NO_LICENSE, API_ERROR_VK_BOOSTS_TRIAL_EXISTS, API_ERROR_VK_BOOSTS_TRIAL_NOT_EXPIRED, API_ERROR_VK_PAY_BIND_CARD_NOT_FOUND, API_ERROR_VK_PAY_BIND_CARD_TIMEOUT, API_ERROR_VK_PAY_DOESNT_HAVE_WALLET, API_ERROR_VK_PAY_LIMIT_HAS_BEEN_REACHED, API_ERROR_VK_PAY_RECIPIENT_BANNED, API_ERROR_VOTES_PERMISSION, API_ERROR_WAIT, API_ERROR_WALL_ACCESS_ADD_REPLY, API_ERROR_WALL_ACCESS_COMMENT, API_ERROR_WALL_ACCESS_POST, API_ERROR_WALL_ACCESS_REPLIES, API_ERROR_WALL_ADD_POST, API_ERROR_WALL_ADS_POST_LIMIT_REACHED, API_ERROR_WALL_ADS_PUBLISHED, API_ERROR_WALL_ALREADY_LIKED, API_ERROR_WALL_ALREADY_UNLIKED, API_ERROR_WALL_CHECK_LINK_CANT_DETERMINE_SOURCE, API_ERROR_WALL_COMMENT_NOT_DELETED, API_ERROR_WALL_DONUT, API_ERROR_WALL_LINKS_FORBIDDEN, API_ERROR_WALL_REPLY_OWNER_FLOOD, API_ERROR_WALL_TOO_MANY_RECIPIENTS, API_ERROR_WEBAUTHN_EMPLOYEE_LAST_CREDENTIAL, API_ERROR_WEIGHTED_FLOOD, API_ERROR_WISHLISTS_NO_ACCESS_NOT_FRIEND, API_ERROR_WITHDRAW, API_ERROR_WRONG_PIN, API_ERROR_YCLIENTS_ANOTHER_BRANCH_BINDED_TO_GROUP, API_ERROR_YCLIENTS_ANOTHER_GROUP_BINDED_TO_BRANCH, API_ERROR_YCLIENTS_API_ERROR, API_ERROR_YCLIENTS_BIND_ALREADY_EXISTS, API_ERROR_YCLIENTS_BRANCH_HAS_NO_LICENSE, API_ERROR_YCLIENTS_GROUP_NOT_BINDED_TO_BRANCH, API_ERROR_YCLIENTS_NO_ACTIVE_BINDING };
//# sourceMappingURL=errors.js.map
