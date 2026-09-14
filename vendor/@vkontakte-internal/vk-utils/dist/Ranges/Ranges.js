import { RANGES_IDS } from './internal';
/**
 * Порт класса Ranges из www/VK/LongID/Ranges.php для использования во фронтенд коде
 */
export const Ranges = Object.freeze({
    getAutotestGroupIdRand() {
        return random(RANGES_IDS.AUTOTEST_GROUP_ID_MIN, RANGES_IDS.AUTOTEST_GROUP_ID_MAX);
    },
    isAutotestGroup(groupId) {
        return groupId >= RANGES_IDS.AUTOTEST_GROUP_ID_MIN && groupId <= RANGES_IDS.AUTOTEST_GROUP_ID_MAX;
    },
    /**
     * @param {number} ownerId отрицательный
     * Принимает ownerId, т.е отрицательный groupId, иначе вернет false.
     */
    isGroupId(ownerId) {
        return ownerId <= RANGES_IDS.GROUPS_UPPER_BOUND && ownerId > RANGES_IDS.GROUPS_LOWER_BOUND;
    },
    /**
     * @param {number} ownerId положительный
     */
    isUserId(ownerId) {
        if (ownerId >= RANGES_IDS.USERS_LOWER_BOUND && ownerId < RANGES_IDS.USERS_UPPER_BOUND) {
            return true;
        }
        if (ownerId >= RANGES_IDS.USERS_LOWER_BOUND_LONG && ownerId < RANGES_IDS.USERS_UPPER_BOUND_LONG) {
            return true;
        }
        return false;
    },
    /*
     * Удобно, но во многих кейсах сейчас peerId проверяется на вхождение в диапазон 0 < peerId < 2e9,
     * что на самом деле некорректно, потому что максимальное значение,
     * закрепленное за userId - 1.9e9, следом идут контакты.
     *
     * Задача данного метода - аккуратно внести ограничения для подобных кейсов, а в последствии заменить на isUserId
     */
    isUserIdTransitional(peerId) {
        const realResult = Ranges.isUserId(peerId);
        const transitionalResult = inRange(peerId, 0, RANGES_IDS.CONTACTS_UPPER_BOUND);
        if (transitionalResult !== realResult) {
            // Здесь при необходимости можно отправить лог в Sentry (m.kraynov)
        }
        return transitionalResult;
    },
    isRealOwner(ownerId) {
        return Ranges.isGroupId(ownerId) || Ranges.isUserId(ownerId);
    },
    // #region audio Проверяет, является ли овнер владельцем аудио
    /**
     * Проверяет, является ли овнер владельцем аудио
     */
    isAudioOwner(ownerId) {
        return Ranges.isRealOwner(ownerId) || Ranges.isUMA(ownerId) || Ranges.isFakeWallAudioOwner(ownerId);
    },
    /**
     * Проверяет, является ли овнер владельцем плейлиста
     */
    isPlaylistOwner(ownerId) {
        return Ranges.isRealOwner(ownerId) || Ranges.isUMA(ownerId) || Ranges.isChatOrChannelPeer(ownerId);
    },
    isOfficialPlaylist(ownerId) {
        return Ranges.isUMAReleaseOwner(ownerId) || Ranges.isUMAAlbumOwner(ownerId);
    },
    /*
     * @see audioCopyToWall
     * @see \VK\FakeIDs\FakeIDs
     */
    isFakeWallAudioOwner(ownerId) {
        return inRangeInclusive(ownerId, RANGES_IDS.AUDIO_FAKE_WALL_OWNER_MIN, RANGES_IDS.AUDIO_FAKE_WALL_OWNER_MAX);
    },
    /*
     * Проверяет, является ли овнер фейковым ботом для UMA контента
     * @see \VK\Audio\UMA\Albums\Album::getAlbumOwner()
     */
    isUMA(ownerId) {
        return Ranges.isUMAReleaseOwner(ownerId) || Ranges.isUMAAlbumOwner(ownerId);
    },
    /**
     * Фейковые пользователи для UMA контента, которые владеют видео или музыкальными альбомами
     */
    isUMAAlbumOwner(ownerId) {
        return inRangeInclusive(ownerId, RANGES_IDS.AUDIO_FAKE_UMA_ALBUM_OWNER_MIN, RANGES_IDS.AUDIO_FAKE_UMA_ALBUM_OWNER_MAX);
    },
    getUMAAlbumOwnerByShift(shift) {
        return (RANGES_IDS.AUDIO_FAKE_UMA_ALBUM_OWNER_MAX - Math.abs(shift % RANGES_IDS.AUDIO_FAKE_UMA_OWNERS_COUNT));
    },
    /**
     * Фейковые пользователи для UMA контента у который в id объекта зашит UMA release_id
     */
    isUMAReleaseOwner(ownerId) {
        return inRangeInclusive(ownerId, RANGES_IDS.AUDIO_FAKE_UMA_RELEASE_OWNER_MIN, RANGES_IDS.AUDIO_FAKE_UMA_RELEASE_OWNER_MAX);
    },
    getUMAReleaseOwnerByShift(shift) {
        return (RANGES_IDS.AUDIO_FAKE_UMA_RELEASE_OWNER_MAX - Math.abs(shift % RANGES_IDS.AUDIO_FAKE_UMA_OWNERS_COUNT));
    },
    // #endregion uma
    isEmailId(emailId) {
        return emailId < RANGES_IDS.EMAIL_UPPER_BOUND;
    },
    isOwnerId(ownerId) {
        if (ownerId >= RANGES_IDS.USERS_LOWER_BOUND) {
            return Ranges.isUserId(ownerId);
        }
        return Ranges.isGroupId(ownerId);
    },
    isContactId(peerId) {
        return peerId >= RANGES_IDS.CONTACTS_LOWER_BOUND && peerId < RANGES_IDS.CONTACTS_UPPER_BOUND;
    },
    convertContactIdToPeerId(contactId) {
        return contactId + RANGES_IDS.USERS_UPPER_BOUND;
    },
    convertPeerIdToContactId(peerId) {
        return peerId - RANGES_IDS.USERS_UPPER_BOUND;
    },
    isChatOrChannelPeer(peerId) {
        return (peerId >= RANGES_IDS.CHAT_OR_CHANNEL_LOWER_BOUND && peerId <= RANGES_IDS.CHAT_OR_CHANNEL_UPPER_BOUND);
    },
    isChatId(peerId) {
        return peerId > RANGES_IDS.MIN_CHAT_ID && peerId <= RANGES_IDS.MAX_CHAT_ID;
    },
    convertChatPeerIdToChatId(chatPeerId) {
        // id - 2e9
        return chatPeerId - RANGES_IDS.CONTACTS_UPPER_BOUND;
    },
    convertChatIdToChatPeerId(chatId) {
        // id + 2e9
        return chatId + RANGES_IDS.CONTACTS_UPPER_BOUND;
    },
    isAppDomain(peerId) {
        return peerId >= RANGES_IDS.APP_LOWER_BOUND && peerId < RANGES_IDS.APP_UPPER_BOUND;
    },
    convertPeerIdToAppId(peerId) {
        // -id - 1e9
        return -peerId + RANGES_IDS.APP_UPPER_BOUND;
    },
    convertAppIdToPeerId(appId) {
        // -1e9 - id
        return RANGES_IDS.APP_UPPER_BOUND - appId;
    },
    isUnauthLongId(unauthLongId) {
        return inRangeInclusive(unauthLongId, RANGES_IDS.UNAUTH_LONG_ID_MIN, RANGES_IDS.UNAUTH_LONG_ID_MAX);
    },
    isUnauthLongIdOld(unauthLongId) {
        return inRangeInclusive(unauthLongId, RANGES_IDS.UNAUTH_LONG_ID_MIN_OLD, RANGES_IDS.UNAUTH_LONG_ID_MAX_OLD);
    },
    isMarusyaUploadOwner(peerId) {
        return RANGES_IDS.MARUSYA_UPLOAD_OWNER_MIN <= peerId && peerId <= RANGES_IDS.MARUSYA_UPLOAD_OWNER_MAX;
    },
    getRandomMarusyaUploadOwnerId() {
        return random(RANGES_IDS.MARUSYA_UPLOAD_OWNER_MIN, RANGES_IDS.MARUSYA_UPLOAD_OWNER_MAX);
    },
    isFakeDocOwner(ownerId) {
        return inRangeInclusive(ownerId, RANGES_IDS.FAKE_DOC_OWNER_MIN, RANGES_IDS.FAKE_DOC_OWNER_MAX);
    },
    getFirstFakeOwnerId() {
        return RANGES_IDS.FAKE_DOC_OWNER_MIN;
    },
    getRandomFirstFakeOwnerId() {
        return random(RANGES_IDS.FAKE_DOC_OWNER_MIN, RANGES_IDS.FAKE_DOC_OWNER_MIN + 64000);
    },
    getRandomFakeOwnerId() {
        return RANGES_IDS.FAKE_DOC_OWNER_MIN + ((Math.floor(Date.now() / 1000) / 173 + random(0, 999)) % 64000);
    },
    isAdsVideoOwner(peerId) {
        return inRangeInclusive(peerId, RANGES_IDS.ADS_VIDEO_OWNER_MIN, RANGES_IDS.ADS_VIDEO_OWNER_MAX);
    },
    getRandomAdsVideoOwner() {
        return random(RANGES_IDS.ADS_VIDEO_OWNER_MIN, RANGES_IDS.ADS_VIDEO_OWNER_MAX);
    },
    isAdsPhotoOwner(peerId) {
        return inRangeInclusive(peerId, RANGES_IDS.ADS_PHOTO_OWNER_MIN, RANGES_IDS.ADS_PHOTO_OWNER_MAX);
    },
    getRandomAdsPhotoOwner() {
        return random(RANGES_IDS.ADS_PHOTO_OWNER_MIN, RANGES_IDS.ADS_PHOTO_OWNER_MAX);
    },
    isZeroOwner(peerId) {
        return peerId === 0;
    },
    convertEmailIdToEmailPeerId(emailId) {
        if (!Ranges.isEmailId(emailId)) {
            return 0;
        }
        return -emailId + RANGES_IDS.EMAIL_UPPER_BOUND;
    },
    isZeroOwnerDeprecated(peerId) {
        return !!peerId || Ranges.isZeroOwner(peerId);
    },
    isExternalUser(peerId) {
        return inRange(peerId, RANGES_IDS.EMAIL_UPPER_BOUND, RANGES_IDS.EXTERNAL_USER_ID_OFFSET);
    },
    isExternalUserDeprecated(peerId) {
        const realResult = Ranges.isExternalUser(peerId);
        const transitionalResult = inRange(peerId, RANGES_IDS.EMAIL_UPPER_BOUND, RANGES_IDS.APP_DOMAIN_ID_OFFSET);
        if (transitionalResult !== realResult) {
            // Здесь при необходимости можно отправить лог в Sentry (m.kraynov)
        }
        return transitionalResult;
    },
    isAnonymousCallPeerId(peerId) {
        return peerId >= RANGES_IDS.CALLS_PEER_LOWER_BOUND && peerId < RANGES_IDS.CALLS_PEER_UPPER_BOUND;
    },
    isAnonymousUserPeerId(peerId) {
        return (peerId >= RANGES_IDS.ANONYMOUS_USER_PEER_ID_LOWER_BOUND &&
            peerId < RANGES_IDS.ANONYMOUS_USER_PEER_ID_UPPER_BOUND);
    },
    getAnonymousCallUserByShift(shift) {
        const count = RANGES_IDS.CALLS_PEER_UPPER_BOUND - RANGES_IDS.CALLS_PEER_LOWER_BOUND;
        // обрабатываем отрицательные числа как конец диапазона, а не начало
        // например, -1 так же, как и как count - 1
        const result = ((shift % count) + count) % count;
        return RANGES_IDS.CALLS_PEER_UPPER_BOUND - 1 - result;
    },
    isValidAliExpressOrderUserId(userId) {
        if (userId < RANGES_IDS.ALIEXPRESS_USER_ID_RANGE_START) {
            return false;
        }
        if (userId > RANGES_IDS.ALIEXPRESS_USER_ID_RANGE_START + RANGES_IDS.ALIEXPRESS_USER_ID_RANGE_LENGTH) {
            return false;
        }
        return true;
    },
    generateAliexpressOrderUserId() {
        return random(RANGES_IDS.ALIEXPRESS_USER_ID_RANGE_START, RANGES_IDS.ALIEXPRESS_USER_ID_RANGE_LENGTH);
    },
    isADBot(peerId) {
        return peerId >= RANGES_IDS.AD_BOT_ID_RANGE_START && peerId <= RANGES_IDS.AD_BOT_ID_RANGE_END;
    },
    getMarusiaAudioFakeId(appId) {
        const count = RANGES_IDS.MARUSIA_AUDIO_FAKE_ID_MAX - RANGES_IDS.MARUSIA_AUDIO_FAKE_ID_MIN;
        return RANGES_IDS.MARUSIA_AUDIO_FAKE_ID_MIN + (appId % count);
    },
    isMarusiaAudioFakeId(ownerId) {
        return ownerId >= RANGES_IDS.MARUSIA_AUDIO_FAKE_ID_MIN && ownerId < RANGES_IDS.MARUSIA_AUDIO_FAKE_ID_MAX;
    },
    isOwnerIdTransitional(peerId) {
        if (peerId > RANGES_IDS.USERS_LOWER_BOUND) {
            return Ranges.isUserIdTransitional(peerId);
        }
        else {
            return Ranges.isGroupId(peerId);
        }
    },
    /**
     * @todo Возвращать всегда отрицательное значение: return -Math.abs(groupId);
     * @param {number} groupId положительный или отрицательный
     * @return {number} ownerId отрицательный
     */
    convertGroupIdToOwnerId(groupId) {
        return -groupId;
    },
    /**
     * @deprecated Будут удалено после фикса метода {@link Ranges.convertGroupIdToOwnerId}
     * @todo TODO: перенести в метод {@link Ranges.convertGroupIdToOwnerId}
     *
     * @param {number} groupId положительный или отрицательный
     * @return {number} ownerId отрицательный
     */
    convertGroupIdToOwnerIdStrict(groupId) {
        return -Math.abs(groupId);
    },
    /**
     * @param {number} ownerId положительный или отрицательный
     * @return {number} groupId положительный
     */
    convertOwnerIdToGroupId(ownerId) {
        return Math.abs(ownerId);
    },
});
/**
 * Проверяет вхождение value в интервал (min, max)
 */
function inRange(value, min, max) {
    return min < value && value < max;
}
/**
 * Проверяет вхождение value в отрезок [min, max]
 */
function inRangeInclusive(value, min, max) {
    return min <= value && value <= max;
}
/**
 * Выдает случайное целое число на полуинтервале [from, to)
 */
function random(from, to) {
    return from + Math.floor(Math.random() * (to - from));
}
//# sourceMappingURL=Ranges.js.map