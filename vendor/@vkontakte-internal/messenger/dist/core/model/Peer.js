import { Ranges } from '@vkontakte-internal/shared';
import { exhaustivenessCheck, getFirstLetter, getInitials, isDev, } from '../utils/misc';
import { getCurrentWeekDay, getNextWeekDayNumber, getPreviousWeekDay, getTimeInSecondsSinceStartDay, } from '../utils/time';
export function resolveId(id) {
    if (Number.isNaN(id)) {
        id = 0;
    }
    if (isDev && id === 0) {
        /**
         * Если тебе хочется инициализировать отсутствующий айди,
         * то функцию надо вызывать без аргументов.
         */
        throw new Error('Айди беседы никогда не должно быть равно 0! Читай комментарий к ошибке.');
    }
    /**
     * В данном случае нам можно воспользоваться кастом,
     * потому что:
     * 1. Это происходит внутри того же самого модуля, где объявлен айди - инкапсуляция
     * 2. На самом деле вся эта функция создана, чтобы сделать типизацию строже.
     * 3. Это исключительный случай, когда по-другому не получится никак.
     */
    const defaultId = 0;
    if (!id || !Number.isInteger(id)) {
        return defaultId;
    }
    /**
     * Кастим, чтобы воспользоваться тайпгардами.
     */
    const castedId = id;
    if (isUserPeerId(castedId) ||
        isGroupPeerId(castedId) ||
        isChatPeerId(castedId) ||
        isContactPeerId(castedId)) {
        return castedId;
    }
    return defaultId;
}
export function resolveAnyId(id) {
    /**
     * В данном случае нам можно воспользоваться кастом,
     * потому что:
     * 1. Это происходит внутри того же самого модуля, где объявлен айди - инкапсуляция
     * 2. На самом деле вся эта функция создана, чтобы сделать типизацию строже.
     * 3. Это исключительный случай, когда по-другому не получится никак.
     */
    const defaultId = 0;
    if (!id || !Number.isInteger(id)) {
        return defaultId;
    }
    /**
     * Кастим, чтобы воспользоваться тайпгардами.
     */
    const castedId = id;
    if (isUserPeerId(castedId) ||
        isGroupPeerId(castedId) ||
        isChatPeerId(castedId) ||
        isAnonymPeerId(castedId)) {
        return castedId;
    }
    return defaultId;
}
export function isUserPeerId(peerId) {
    return Ranges.isUserId(peerId) || peerId === 0;
}
export function isContactPeerId(peerId) {
    return Ranges.isContactId(peerId);
}
export function isChatPeerId(peerId) {
    return Ranges.isChatOrChannelPeer(peerId);
}
export function isGroupPeerId(peerId) {
    return Ranges.isGroupId(peerId);
}
export function isAnonymPeerId(peerId) {
    return Ranges.isAnonymousCallPeerId(peerId);
}
/**
 * Проверяет наличие фото у пира
 */
export function hasPhoto(peer) {
    return !!peer.photo?.photo50 || !!peer.photo?.baseUrl;
}
/**
 * Получает "реальный" ID чата, контакта или группы
 */
export function toRealId(peerId) {
    if (isContactPeerId(peerId)) {
        return Ranges.convertPeerIdToContactId(peerId);
    }
    if (isChatPeerId(peerId)) {
        return Ranges.convertChatPeerIdToChatId(peerId);
    }
    if (isGroupPeerId(peerId)) {
        return -peerId;
    }
    if (isUserPeerId(peerId)) {
        return peerId;
    }
    exhaustivenessCheck(peerId);
}
export function resolveRealId(kind, id) {
    switch (kind) {
        case 'User':
            return resolveId(id);
        case 'Contact':
            return resolveId(Ranges.convertContactIdToPeerId(id));
        case 'Group':
            return resolveId(-id);
        case 'Chat':
            return resolveId(Ranges.convertChatIdToChatPeerId(id));
        default:
            exhaustivenessCheck(kind);
    }
}
/**
 * Является ли диалог избранным
 */
export function isFavorites(peerId, ownerId) {
    return peerId === ownerId;
}
/**
 * Является ли диалог Администрацией ВКонтакте
 */
export function isVkAdministration(peerId) {
    return peerId === 100;
}
export const MARUSIA_PEER_ID = -194070336;
export const STICKERS_KEYWORDS_BOT_PEER_ID = -184940019;
export const DEACTIVATED_REASON_DELETED = 'deleted';
export const DEACTIVATED_REASON_BANNED = 'banned';
/**
 * Является ли диалог Марусей
 */
export function isMarusia(peerId) {
    return peerId === MARUSIA_PEER_ID;
}
/**
 * Является ли диалог ботом для создания пользовательских подсказок стикеров
 */
export function isStickersKeywordsBot(peerId) {
    return peerId === STICKERS_KEYWORDS_BOT_PEER_ID;
}
/**
 * Является ли юзер сотрудником
 */
export function isEmployee(user) {
    return user.employeeMark !== undefined;
}
/**
 * Возвращает дату завершения командировки при её наличии
 */
export function businessTripEndDate(user) {
    if (!user.employeeWorkingState ||
        user.employeeWorkingState.state !== 'business_trip') {
        return;
    }
    return user.employeeWorkingState.ts_to;
}
/**
 * Возвращает дату завершения отпуска при его наличии
 */
export function vacationEndDate(user) {
    if (!user.employeeWorkingState ||
        user.employeeWorkingState.state !== 'vacation') {
        return;
    }
    return user.employeeWorkingState.ts_to;
}
/**
 * Возвращает длинное имя пира (ИОФ)
 */
export function name(peer, nameCase = 'nom') {
    switch (peer.kind) {
        case 'User':
            switch (nameCase) {
                case 'nom':
                    return peer.firstName + ' ' + peer.lastName;
                case 'gen':
                    return peer.firstNameGen + ' ' + peer.lastNameGen;
                case 'acc':
                    return peer.firstNameAcc + ' ' + peer.lastNameAcc;
                case 'ins':
                    return peer.firstNameIns + ' ' + peer.lastNameIns;
                default:
                    return exhaustivenessCheck(nameCase);
            }
        case 'Contact':
        case 'Group':
            return peer.name;
        case 'Chat':
            return peer.title;
        default:
            return exhaustivenessCheck(peer);
    }
}
/**
 * Возвращает длинное имя пира (ФИО)
 */
export function classicName(peer, nameCase = 'nom') {
    switch (peer.kind) {
        case 'User':
            switch (nameCase) {
                case 'nom':
                    return peer.lastName + ' ' + peer.firstName;
                case 'gen':
                    return peer.lastNameGen + ' ' + peer.firstNameGen;
                case 'acc':
                    return peer.lastNameAcc + ' ' + peer.firstNameAcc;
                case 'ins':
                    return peer.lastNameIns + ' ' + peer.firstNameIns;
                default:
                    return exhaustivenessCheck(nameCase);
            }
        case 'Contact':
        case 'Group':
            return peer.name;
        case 'Chat':
            return peer.title;
        default:
            return exhaustivenessCheck(peer);
    }
}
export function screenName(peer) {
    switch (peer.kind) {
        case 'User':
            return peer.screenName || `id${peer.id}`;
        case 'Group':
            return peer.screenName || `club${peer.id}`;
        default:
            // Только для валидации типов на уровне TS
            return;
    }
}
export function domain(peer) {
    switch (peer.kind) {
        case 'User':
            return peer.screenName === `id${peer.id}` ? undefined : peer.screenName;
        case 'Group':
            return peer.screenName === `club${peer.id}` ? undefined : peer.screenName;
        default:
            // Только для валидации типов на уровне TS
            return;
    }
}
export function phone(peer) {
    switch (peer.kind) {
        case 'User':
        case 'Contact':
            return peer.phone;
        default:
            // Только для валидации типов на уровне TS
            return;
    }
}
/**
 * Возвращает пол пира.
 */
export function sex(peer) {
    switch (peer.kind) {
        case 'User':
            return peer.sex;
        case 'Contact':
        case 'Group':
        case 'Chat':
            return 'unknown';
        default:
            return exhaustivenessCheck(peer);
    }
}
/**
 * Возвращает короткое имя пира.
 */
export function shortName(peer, nameCase = 'nom', withDot = true) {
    switch (peer.kind) {
        case 'User':
            const namePostfix = peer.lastName.charAt(0) +
                (withDot && peer.lastName.length > 1 ? '.' : '');
            switch (nameCase) {
                case 'nom':
                    return peer.firstName + ' ' + namePostfix;
                case 'gen':
                    return peer.firstNameGen + ' ' + namePostfix;
                case 'acc':
                    return peer.firstNameAcc + ' ' + namePostfix;
                case 'ins':
                    return peer.firstNameIns + ' ' + namePostfix;
                default:
                    return exhaustivenessCheck(nameCase);
            }
        case 'Contact':
        case 'Group':
            return peer.name;
        case 'Chat':
            return peer.title;
        default:
            return exhaustivenessCheck(peer);
    }
}
/**
 * Возвращает короткое имя пира.
 */
export function firstName(peer, nameCase = 'nom') {
    switch (peer.kind) {
        case 'User':
            switch (nameCase) {
                case 'nom':
                    return peer.firstName;
                case 'gen':
                    return peer.firstNameGen;
                case 'acc':
                    return peer.firstNameAcc;
                case 'ins':
                    return peer.firstNameIns;
                default:
                    return exhaustivenessCheck(nameCase);
            }
        case 'Contact':
        case 'Group':
            return peer.name;
        case 'Chat':
            return peer.title;
        default:
            return exhaustivenessCheck(peer);
    }
}
/**
 * Возвращает ссылку на пир
 * @param peer
 */
export function link(peer) {
    if (peer.kind === 'Chat' || peer.kind === 'Contact') {
        return '';
    }
    if (peer.screenName) {
        return `/${peer.screenName}`;
    }
    switch (peer.kind) {
        case 'User':
            return `/id${toRealId(peer.id)}`;
        case 'Group':
            return `/club${toRealId(peer.id)}`;
        default:
            return exhaustivenessCheck(peer);
    }
}
/**
 * Возвращает ссылку на пир для видео-каталога
 */
export function linkVideo(peer) {
    if (peer.kind === 'Chat' || peer.kind === 'Contact') {
        return '';
    }
    switch (peer.kind) {
        case 'User':
            return `id${peer.id}`;
        case 'Group':
            return `club${Math.abs(peer.id)}`;
        default:
            return exhaustivenessCheck(peer);
    }
}
export function maxPhotoSizeUrl(peer) {
    return peer.kind !== 'Contact'
        ? peer.photo?.photo200 ?? peer.photo?.photo100 ?? peer.photo?.photo50
        : peer.photo?.photo50;
}
/**
 * Получает первые буквы пира
 */
export function initials(peer) {
    let letters = '';
    switch (peer.kind) {
        case 'User':
            letters = [peer.firstName, peer.lastName]
                .filter(Boolean)
                .map(getFirstLetter)
                .join('');
            break;
        case 'Group':
            letters = getFirstLetter(peer.name);
            break;
        case 'Chat':
            letters = getFirstLetter(peer.title);
            break;
        case 'Contact':
            letters = getInitials(peer.name);
            break;
        default:
            exhaustivenessCheck(peer);
    }
    return letters;
}
/**
 * Возвращает строковый тип пира в зависимости от Peer.Id
 * Полезно для сценариев когда есть только ID, но нет информации о типе пира, и нужно сделать switch
 */
export function toKind(peerId) {
    if (isUserPeerId(peerId)) {
        return 'User';
    }
    if (isChatPeerId(peerId)) {
        return 'Chat';
    }
    if (isGroupPeerId(peerId)) {
        return 'Group';
    }
    if (isContactPeerId(peerId)) {
        return 'Contact';
    }
    exhaustivenessCheck(peerId);
}
/**
 * Проверяет можно ли отправить личное сообщение пиру
 */
export function canSendPrivateMessage(peer) {
    switch (peer.kind) {
        case 'User':
            return peer.canMessage;
        case 'Contact':
            return peer.canWrite;
        default:
            exhaustivenessCheck(peer);
    }
}
// #endregion
// #region SETTERS
export function updateChatInfo(chat, info) {
    if ('title' in info) {
        chat.title = info.title;
    }
    else {
        if (Object.values(info).every((el) => el === undefined)) {
            chat.photo = undefined;
        }
        else {
            if (!chat.photo) {
                chat.photo = {};
            }
            chat.photo.photo50 = info.photo50;
            chat.photo.photo100 = info.photo100;
            chat.photo.photo200 = info.photo200;
            chat.photo.baseUrl = info.photo;
            chat.photo.thumbhashUrl = info.thumbHashUrl;
        }
    }
}
export function clearChatDataOnLeave(chat) {
    delete chat.photo;
    delete chat.hasDefaultPhoto;
    chat.canCall = false;
}
export function updateMutualFriends(peer, hint, count) {
    if (peer.kind === 'Contact') {
        return;
    }
    peer.mutualFriends = {
        hint,
        count,
    };
}
/**
 * Присваивает userId при конвертации контакта
 */
export function convertContact(peer, userId) {
    peer.userId = userId;
}
/**
 * Изменяет статус дружбы с пользователем.
 */
export function updateFriendship(peer, change) {
    switch (change) {
        case 'add': {
            if (!peer.canChangeFriendship) {
                break;
            }
            const friendStatusMap = {
                unfamiliar: 'outgoingRequest',
                outgoingRequest: 'outgoingRequest',
                incomingRequest: 'friends',
                friends: 'friends',
            };
            peer.friendship = friendStatusMap[peer.friendship];
            break;
        }
        case 'delete': {
            const friendStatusMap = {
                unfamiliar: 'unfamiliar',
                outgoingRequest: 'unfamiliar',
                incomingRequest: 'incomingRequest',
                friends: 'incomingRequest',
            };
            peer.friendship = friendStatusMap[peer.friendship];
            break;
        }
        default:
            exhaustivenessCheck(change);
    }
}
/**
 * Изменяет статус участия в сообществе.
 */
export function updateMembership(peer, change) {
    switch (change) {
        case 'join': {
            const nextMembership = {
                notMember: peer.isClosed ? 'outgoingRequest' : 'member',
                member: 'member',
                unsure: 'member',
                declined: 'member',
                outgoingRequest: 'outgoingRequest',
                incomingRequest: 'member',
            }[peer.membership];
            if (peer.membership !== nextMembership && nextMembership === 'member') {
                peer.memberCount++;
            }
            peer.membership = nextMembership;
            break;
        }
        case 'leave': {
            const nextMembership = {
                notMember: 'notMember',
                member: 'notMember',
                unsure: 'notMember',
                declined: 'notMember',
                outgoingRequest: 'notMember',
                incomingRequest: 'declined',
            }[peer.membership];
            if (peer.membership !== nextMembership) {
                peer.memberCount--;
            }
            peer.membership = nextMembership;
            break;
        }
        default:
            exhaustivenessCheck(change);
    }
}
export function updateIsPeerBlacklistedByMe(peer, change) {
    peer.isBlacklistedByMe = change;
}
export function updateIsPeerBusinessBlacklistedByMe(peer, change) {
    peer.isBusinessBlacklistedByMe = change;
}
/**
 * Чистит информацию об отпусках и командировках.
 */
export function clearVacation(peer) {
    delete peer.employeeWorkingState;
}
/**
 * Получение образовательных ролей из пира
 */
export function getEduRoles(peer) {
    if (peer.kind === 'User') {
        return peer.eduRoles;
    }
    return;
}
/**
 * Есть ли у пользователя в одной из организаций роль учителя, администратора или сотрудника
 */
export function hasEduOrganizationalRoles(peer) {
    if (!peer.eduRoles) {
        return false;
    }
    const organizations = peer.eduRoles.organizations;
    for (let i = 0; i < organizations.length; i++) {
        const roles = organizations[i]?.roles || [];
        for (let roleIndex = 0; roleIndex < roles.length; roleIndex++) {
            const role = roles[roleIndex];
            if (role && ['admin', 'employee', 'teacher'].includes(role.code)) {
                return true;
            }
        }
    }
    return false;
}
export function getUnavailabilityEnabled(peer) {
    const intervals = peer.eduSchedule?.intervals;
    if (!intervals) {
        return false;
    }
    const enabledIntervals = intervals.reduce((acc, current) => {
        if (current.enabled) {
            acc[current.dayNumber] = current;
        }
        return acc;
    }, {});
    const currentTime = getTimeInSecondsSinceStartDay(new Date());
    const currentWeekDay = getCurrentWeekDay();
    const prevWeekDay = getPreviousWeekDay(currentWeekDay);
    const currentInterval = enabledIntervals[currentWeekDay];
    const prevInterval = enabledIntervals[prevWeekDay];
    if (prevInterval) {
        if (prevInterval.start >= prevInterval.finish &&
            currentTime <= prevInterval.finish) {
            return true;
        }
    }
    if (currentInterval) {
        if (currentInterval.start >= currentInterval.finish &&
            currentTime >= currentInterval.start) {
            return true;
        }
        if (currentTime >= currentInterval.start &&
            currentTime <= currentInterval.finish) {
            return true;
        }
    }
    return false;
}
/**
 * Получаем данные о нахождении пользователя в расписании недоступности
 * Если не рамках расписания недоступности, то получаем { enable: false }
 * Если пользователь в рамках, то получам время и день недели окончания расписания недоступности
 */
export function getUnavailabilityEndTime(peer) {
    const intervals = peer.eduSchedule?.intervals;
    if (!intervals) {
        return null;
    }
    const enabledIntervals = intervals.filter((interval) => interval.enabled);
    const getIntervalEndTime = (day, days) => {
        // время не уходит на другой день
        if (day.start < day.finish) {
            return day;
        }
        let nextDay = days.find((item) => {
            const nextWeekDay = getNextWeekDayNumber(day.dayNumber);
            return item.dayNumber === nextWeekDay;
        });
        if (!nextDay) {
            if (day.start >= day.finish) {
                return {
                    ...day,
                    dayNumber: getNextWeekDayNumber(day.dayNumber),
                };
            }
            return day;
        }
        day = {
            ...day,
            dayNumber: getNextWeekDayNumber(day.dayNumber),
        };
        if (day.finish >= nextDay.start) {
            if (day.finish > nextDay.finish && nextDay.start < nextDay.finish) {
                nextDay = {
                    ...nextDay,
                    finish: day.finish,
                };
            }
            else {
                day = {
                    ...day,
                    start: nextDay.start,
                    finish: nextDay.finish,
                };
                day = getIntervalEndTime(day, days);
            }
        }
        return day;
    };
    // получаем сегодняшний и вчерашний день недели
    const currentWeekDay = getCurrentWeekDay();
    const previousWeekDay = getPreviousWeekDay(currentWeekDay);
    // получаем сегодняшний и вчерашний интервал
    const currentInterval = enabledIntervals.find((interval) => interval.dayNumber === currentWeekDay);
    const previousInterval = enabledIntervals.find((interval) => interval.dayNumber === previousWeekDay);
    // получаем время истечений обоих интервалов (до какого времени и дня недели)
    const currentIntervalExpirationTime = currentInterval && getIntervalEndTime(currentInterval, enabledIntervals);
    const previousIntervalExpirationTime = previousInterval && getIntervalEndTime(previousInterval, enabledIntervals);
    let result = null;
    /**
     * Добавляем время к result
     * Если нет текущего интервала, но есть прерыдущий, который переходит на следующий день и может стать текущим
     * Тогда время окончания интервала будет равно времени окончания предыдущего интервала, а день недели окончания - сегодня
     */
    if (!currentIntervalExpirationTime &&
        previousIntervalExpirationTime &&
        previousIntervalExpirationTime.dayNumber === currentWeekDay) {
        result = {
            time: previousIntervalExpirationTime.finish,
            dayweek: currentWeekDay,
        };
    }
    // Если у нас есть текущий интервал, то по умолчанию ставим время окончания и день недели окончания
    if (currentIntervalExpirationTime) {
        result = {
            time: currentIntervalExpirationTime.finish,
            dayweek: currentIntervalExpirationTime.dayNumber,
        };
        /**
         * Если у нас есть еще и предыдущий, то надо проверить, не "кушает" ли он наш текущий:
         * если предыдущий интервал есть и он находит на наш текущий и при этом время окончания предыдущего больше чем время окончания текущего
         */
        if (previousIntervalExpirationTime &&
            previousIntervalExpirationTime.dayNumber === currentWeekDay &&
            currentIntervalExpirationTime.dayNumber === currentWeekDay && // если наш текущий день НЕ перетекает дальше в следующие дни
            previousIntervalExpirationTime.finish >
                currentIntervalExpirationTime.finish) {
            result.time = previousIntervalExpirationTime.finish;
        }
    }
    return result;
}
const ROLE_PRIORITY = {
    admin: 0,
    employee: 1,
    teacher: 2,
    parent: 3,
    student: 4,
};
/**
 * Проверка может ли текущий пользователь перейти в миниапп "ЛК Сферум"
 * для данной организации
 */
export function canOpenSferumMiniApp(viewer, orgFromPeer) {
    const viewerOrg = viewer.eduRoles?.organizations.find((viewerOrg) => viewerOrg.id === orgFromPeer.id);
    // ищем самую крупную роль
    const maxViewerRole = [...(viewerOrg?.roles || [])].sort((roleA, roleB) => {
        const indexA = ROLE_PRIORITY[roleA.code];
        const indexB = ROLE_PRIORITY[roleB.code];
        if (indexA === -1) {
            return 1;
        }
        if (indexB === -1) {
            return -1;
        }
        return indexA - indexB;
    })?.[0]?.code;
    switch (maxViewerRole) {
        case 'admin':
            // может видеть все роли в организации
            return true;
        case 'employee':
        case 'teacher':
            // могут видеть только роли учеников и родителей
            return !!orgFromPeer.roles.find((role) => ['teacher', 'student'].includes(role.code));
        default:
            return false;
    }
}
export function safeGet(peers, id) {
    const peer = peers.get(id);
    if (peer) {
        return peer;
    }
    if (isDev) {
        throw new Error(`Пир ${id} не найден в кэше! Обрати внимание на то, как загружаются недостающие данные в сторе.`);
    }
    return peers.get(resolveId());
}
/**
 * Доступен ли чат в звонке
 */
export function isCallInChatEnabled(peer) {
    switch (peer.kind) {
        case 'Chat':
        case 'User':
            return true;
        case 'Group':
        case 'Contact':
            return false;
        default:
            exhaustivenessCheck(peer);
    }
}
/**
 * Идентификатор языка перевода интерфейса
 * Возможные значения можно подсмотреть в монолите, искать по "public const CHUVASH"
 */
export var LanguageId;
(function (LanguageId) {
    LanguageId[LanguageId["ru"] = 0] = "ru";
    LanguageId[LanguageId["en"] = 3] = "en";
})(LanguageId || (LanguageId = {}));
export function setLanguage(peer, languageId) {
    peer.languageId = languageId;
}
export function isLangCode(key) {
    return key in LanguageId;
}
export function resolveLangIdKeyToLang(key) {
    return `me_lang_${key}`;
}
//# sourceMappingURL=Peer.js.map