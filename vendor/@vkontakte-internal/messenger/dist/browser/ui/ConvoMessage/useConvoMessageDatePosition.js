import * as Message from '../../../core/model/Message';
import * as Attach from '../../../core/model/Attach';
export const useConvoMessageDatePosition = (message, isCompact, hasReactions, hasKeyboard) => {
    const attaches = message.attaches;
    const lastAttach = Attach.last(attaches);
    const hasText = Message.hasText(message);
    const hasAttaches = Attach.hasAttaches(message.attaches);
    const hasMediaAttaches = Attach.hasMediaAttaches(message.attaches);
    /**
     * Для большинства вложений можно уменьшить отступ между датой и вложением,
     * чтобы дата смотрелась красивее
     */
    const smallerDateTopMargin = (() => {
        if (message.forwardedMessages) {
            return true;
        }
        if (!lastAttach) {
            return false;
        }
        // Вложения без собственного отступа снизу
        if (lastAttach.kind === 'Wall' ||
            lastAttach.kind === 'WallReply' ||
            lastAttach.kind === 'Video' ||
            lastAttach.kind === 'Question') {
            return false;
        }
        // Фотки и гифки это медиа аттачи, которые рендерится над текстом сообщения,
        // то есть они не соприкасаются с датой сообщения,
        // поэтому отступ уменьшать не нужно
        if ((lastAttach.kind === 'Photo' && hasText) ||
            (lastAttach.kind === 'Doc' && lastAttach.image && hasText)) {
            return false;
        }
        // При наличии истории с текстовым комментарием сама история рендерится
        // над сообщением, а дата находится в облачке с обычным сообщением,
        // поэтому уменьшать отступ не нужно
        if (attaches.story && hasText) {
            return false;
        }
        return true;
    })();
    const floatDate = (() => {
        if (message.forwardedMessages || !lastAttach) {
            return false;
        }
        if (attaches.story && !hasText) {
            return true;
        }
        const withShortVideo = attaches.videos?.some((video) => video.type === 'short_video');
        if (withShortVideo && !hasText) {
            return true;
        }
        if (!hasText &&
            Attach.count(attaches) === 1 &&
            lastAttach.kind === 'Audio') {
            return true;
        }
        if (Attach.count(attaches) === 1 &&
            ['AudioPlaylist', 'Artist'].includes(lastAttach.kind)) {
            return true;
        }
        if (!isCompact &&
            !hasText &&
            Attach.count(attaches) === 1 &&
            ['MiniApp', 'MiniAppWidget'].includes(lastAttach.kind)) {
            return true;
        }
        // Медиа аттачи располагаются над текстом
        if ((lastAttach.kind === 'Photo' && !hasText) ||
            (lastAttach.kind === 'Doc' && lastAttach.image && !hasText)) {
            return true;
        }
        if (lastAttach.kind === 'Sticker' ||
            lastAttach.kind === 'UgcSticker' ||
            lastAttach.kind === 'Geo' ||
            lastAttach.kind === 'Graffiti' ||
            lastAttach.kind === 'Poll' ||
            lastAttach.kind === 'VideoMessage' ||
            lastAttach.kind === 'Article') {
            return true;
        }
        return false;
    })();
    /**
     * Отображаем дату без темного облачка под ней,
     * если вложение позволяет так сделать
     */
    const floatDateWithoutBackground = floatDate &&
        !!lastAttach &&
        [
            'Audio',
            'AudioPlaylist',
            'Artist',
            'Poll',
            ...(!isCompact ? ['MiniApp', 'MiniAppWidget'] : []),
        ].includes(lastAttach.kind);
    const floatDateWithWhiteColor = floatDateWithoutBackground &&
        lastAttach.kind === 'Poll' &&
        !!(lastAttach.backgroundPhoto || lastAttach.backgroundGradient);
    /**
     * Некоторые вложения не имеют видимых границ (в отличие от фоток, например),
     * поэтому для более красивого положения облачка с датой мы смещаем его
     * ближе к правому нижнему углу баббла сообщения
     */
    const floatDateWithSmallMargin = (() => {
        if (!floatDate || !lastAttach) {
            return false;
        }
        if (lastAttach.kind === 'Sticker' ||
            lastAttach.kind === 'UgcSticker' ||
            lastAttach.kind === 'Graffiti' ||
            lastAttach.kind === 'VideoMessage') {
            return true;
        }
        // У медиа вложений уменьшенный отступ до границ сообщения,
        // поэтому нужно так же отодвинуть облачко с датой
        if (hasMediaAttaches && !hasAttaches && !hasReactions && !hasKeyboard) {
            return true;
        }
        return false;
    })();
    return {
        smallerDateTopMargin,
        floatDate,
        floatDateWithoutBackground,
        floatDateWithWhiteColor,
        floatDateWithSmallMargin,
    };
};
//# sourceMappingURL=useConvoMessageDatePosition.js.map