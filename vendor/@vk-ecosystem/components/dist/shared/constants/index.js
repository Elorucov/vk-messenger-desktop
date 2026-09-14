import { UserStatuses } from '../../entries/EcosystemMultiAccounts/types.js';
var VK_API_VERSION = '5.163';
/*
 * максимальное положительное int 32 число, нужно для генерации id евента статистики,
 * чтобы избежать переполнение kphp идентификатора
 */
var MAX_INT32 = 2147483647;
var BASE_DOMAIN = "vk.com";
var VK_LOGIN_HOST = "https://" + BASE_DOMAIN + "/login";
var MULTIACCOUNT_UNACCESIBLE_STATUSES = [UserStatuses.BANNED_FOREVER, UserStatuses.DEACTIVATED_FULL];
var DEFAULT_TAB_BROADCAST_PREFIX = 'vkid';
var BASE_BID_URL = 'https://bid.vk.com/profile';
export { BASE_BID_URL, BASE_DOMAIN, DEFAULT_TAB_BROADCAST_PREFIX, MAX_INT32, MULTIACCOUNT_UNACCESIBLE_STATUSES, VK_API_VERSION, VK_LOGIN_HOST };
