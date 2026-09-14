// @ts-ignore-next-line пробрасываем версию из package.json в rollup.config
const VERSION = "0.6.2";
// @ts-ignore-next-line пробрасываем тип сборки из rollup.config
const DOMAIN = "vk.ru";
const LOGIN_DOMAIN = `login.${DOMAIN}`;
const OAUTH_DOMAIN = `oauth.${DOMAIN}`;
const CONNECT_DOMAIN = `id.${DOMAIN}`;
const DEFAULT_DOMAIN = 'vk.ru';
const DOMAIN_FILE_URL = 'https://vk.ru/domain.txt';
const VKPAY_APP_ID = 6217559;
const BRIDGE_MESSAGE_TYPE_SDK = 'vk-sak-sdk';
const ALLOWED_APP_SETTINGS_KEYS = [
    'agreements',
    'promo',
    'vkc_behavior',
    'vkc_auth_action',
    'vkc_brand',
    'vkc_display_mode',
    'service_groups',
    'external_device_id'
];
const LANGUAGES = {
    RUS: 0,
    UKR: 1,
    ENG: 3,
    SPA: 4,
    GERMAN: 6,
    POL: 15,
    FRA: 16,
    TURKEY: 82
};
const MODAL_IFRAME_Z_INDEX = 999999;

export { ALLOWED_APP_SETTINGS_KEYS, BRIDGE_MESSAGE_TYPE_SDK, CONNECT_DOMAIN, DEFAULT_DOMAIN, DOMAIN, DOMAIN_FILE_URL, LANGUAGES, LOGIN_DOMAIN, MODAL_IFRAME_Z_INDEX, OAUTH_DOMAIN, VERSION, VKPAY_APP_ID };
