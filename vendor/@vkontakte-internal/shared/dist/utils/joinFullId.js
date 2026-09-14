/**
 * @deprecated Использовать joinRawId
 */
export const joinFullId = (ownerId, itemId) => {
    return `${ownerId}_${itemId}`;
};
/**
 * @deprecated используйте эти варианты
 * import { getIdentityRawId } from '@vkontakte-internal/vk-utils';
 * import { getIdentityAccessRawId } from '@vkontakte-internal/vk-utils';
 */
export const joinRawId = ({ ownerId, itemId, externalId, }) => {
    return [ownerId, itemId, externalId].filter(Boolean).join('_');
};
//# sourceMappingURL=joinFullId.js.map