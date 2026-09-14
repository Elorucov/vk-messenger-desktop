export const ROOM_NAME_MAX_LENGTH = 50;
export const SECTION_NAME_MAX_LENGTH = 50;
export function resolveId(id) {
    return id;
}
export function resolveSectionId(id) {
    return id;
}
export function resolveRoomId(id) {
    return id;
}
export function resolveCallId(id) {
    return id;
}
export function resolveTribuneId(id) {
    return id;
}
// #region GETTERS
/**
 * Являюсь ли я админом в пространстве
 * SPC-TODO переделать позже на нормальную проверку, когда появятся роли
 */
export function isAdmin(space) {
    return Boolean(space.viewerData.isOwner);
}
export function isMuted(space) {
    return Boolean(space.viewerData.notificationSettings?.muteTill);
}
// #endregion
// #region SETTERS
/**
 * Добавить мембера в пространство
 */
export function addMember(space, _peerId, newCount) {
    space.membersCount = newCount;
}
/**
 * Удалить мембера из пространства
 */
export function removeMember(space, _peerId, newCount) {
    space.membersCount = newCount;
}
export function setName(space, name) {
    space.name = name;
}
export function setDescription(space, description) {
    space.description = description;
}
export function setShortName(space, shortName) {
    space.shortName = shortName;
}
// Пока не ясно нужно или нет
// export function safeGet(spaces: Cache, spaceId: Id): Space {
//   const space = spaces.get(spaceId)
//   if (space) {
//     return space
//   }
//   if (isDev) {
//     throw new Error(
//       `Пространство ${spaceId} не найден в кэше! Обрати внимание на то как загружаются недостающие данные в сторе.`,
//     )
//   }
//   // TODO: разобраться с кастом
//   return spaces.get(resolveId(0)) as unknown as Space
// }
// #endregion
//# sourceMappingURL=Space.js.map