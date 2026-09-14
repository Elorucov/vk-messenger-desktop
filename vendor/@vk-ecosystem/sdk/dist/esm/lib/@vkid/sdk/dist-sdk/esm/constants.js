// @ts-ignore-next-line пробрасываем версию из package.json в rollup.config
const VERSION = "1.3.0";
// @ts-ignore-next-line пробрасываем тип сборки из rollup.config
const DOMAIN = 'vk.com';
const LOGIN_DOMAIN = `login.${DOMAIN}`;
const OAUTH_DOMAIN = `oauth.${DOMAIN}`;
const VKID_DOMAIN = `id.${DOMAIN}`;

export { DOMAIN, LOGIN_DOMAIN, OAUTH_DOMAIN, VERSION, VKID_DOMAIN };
