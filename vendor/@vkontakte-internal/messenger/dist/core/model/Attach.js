import { exhaustivenessCheck, toNonEmpty, } from '../utils/misc';
import { getIdentityAccessRawId } from '@vkontakte-internal/vk-utils';
import * as Peer from './Peer';
import { GIFTS_RANDOM_STICKER_PACK_GIFT_ID } from '../config/config';
export const resolveMiniAppId = (id) => id;
/**
 * Известные статусы мини-приложений.
 */
const miniAppStatuses = [-1, 0, 1, 2];
export function preview(media, expectedWidth = 0, expectedHeight = 0, crop = false) {
    const croppedKeys = ['o', 'p', 'q', 'r'];
    if (media.kind === 'Curator') {
        return (media.image?.find((img) => img.height > expectedHeight && img.width) ||
            null);
    }
    if (media.kind === 'Story') {
        if (media.photo) {
            media = media.photo;
        }
        else if (media.video) {
            media = media.video;
        }
        else {
            return null;
        }
    }
    if (media.kind === 'Video' ||
        media.kind === 'Gift' ||
        media.kind === 'PollBackgroundPhoto' ||
        media.kind === 'VideoMessage' ||
        media.kind === 'Narrative' ||
        media.kind === 'MiniApp') {
        const images = media.kind === 'MiniApp' ? media.images : media.image;
        if (!images) {
            return null;
        }
        return (
        // Если есть BaseImage, возвращаем её
        getBaseImage(images, expectedWidth * window.devicePixelRatio) ||
            // Находим первую картинку, размер которой >= expectedWidth
            images.find(({ width, height }) => {
                return width >= expectedWidth && height >= expectedHeight;
            }) ||
            // Или отдаём самую большую картинку из имеющихся
            images.reduce((acc, cur) => {
                if (!acc || cur.width * cur.height > acc.width * acc.height) {
                    return cur;
                }
                return acc;
            }) ||
            // Нет ни одной подходящей картинки
            null);
    }
    const sizes = media.kind === 'Photo' ? media.sizes : media.image;
    if (!sizes) {
        return null;
    }
    if (crop) {
        return (
        // Находим первую картинку, размер которой >= expectedWidth
        Array.from(sizes.entries()).find(([type, { width, height }]) => {
            return (croppedKeys.includes(type) &&
                width >= expectedWidth &&
                height >= expectedHeight);
        })?.[1] ||
            // Или отдаём самую большую картинку из имеющихся
            sizes.get('r') ||
            sizes.get('q') ||
            sizes.get('p') ||
            sizes.get('o') ||
            // Нет ни одной подходящей картинки
            null);
    }
    return (
    // Находим первую картинку, размер которой >= expectedWidth
    Array.from(sizes.entries()).find(([type, { width, height }]) => {
        return (!croppedKeys.includes(type) &&
            width >= expectedWidth &&
            height >= expectedHeight);
    })?.[1] ||
        // Или отдаём самую большую картинку из имеющихся
        sizes.get('w') ||
        sizes.get('z') ||
        sizes.get('y') ||
        sizes.get('x') ||
        sizes.get('m') ||
        sizes.get('s') ||
        // Нет ни одной подходящей картинки
        null);
}
const IMAGE_ASPECT_RATIO = 16 / 9;
function getBaseImage(images, width, height = width / IMAGE_ASPECT_RATIO) {
    const baseImage = images.find((image) => image.isBase);
    if (baseImage) {
        return {
            ...baseImage,
            url: `${baseImage.url}&cs=${Math.floor(width)}x${Math.floor(height)}`,
        };
    }
    return null;
}
export function ids(attaches, featureFlagCleanAttachment) {
    const result = [];
    for (const photo of attaches.photos || []) {
        result.push(featureFlagCleanAttachment
            ? `photo${getIdentityAccessRawId(photo)}`
            : `photo${photo.ownerId}_${photo.id}`);
    }
    for (const video of attaches.videos || []) {
        result.push(featureFlagCleanAttachment
            ? `video${getIdentityAccessRawId(video)}`
            : `video${video.ownerId}_${video.id}`);
    }
    for (const audio of attaches.audios || []) {
        result.push(featureFlagCleanAttachment
            ? `audio${getIdentityAccessRawId(audio)}`
            : `audio${audio.ownerId}_${audio.id}`);
    }
    for (const audioPlaylist of attaches.audioPlaylists || []) {
        result.push(`audio_playlist${audioPlaylist.ownerId}_${audioPlaylist.id}`);
    }
    if (attaches.artist) {
        result.push(`artist${attaches.artist.id}`);
    }
    if (attaches.podcast) {
        result.push(`podcast${attaches.podcast.ownerId}_${attaches.podcast.id}`);
    }
    if (attaches.market) {
        result.push(`market${attaches.market.ownerId}_${attaches.market.id}`);
    }
    if (attaches.marketAlbum) {
        result.push(
        // TODO убедиться в корректности работы после выполнения задачи ME-56997
        `market_album${attaches.marketAlbum.ownerId}_${attaches.marketAlbum.id}`);
    }
    for (const doc of attaches.docs || []) {
        result.push(`doc${doc.ownerId}_${doc.id}`);
    }
    if (attaches.voice) {
        result.push(`doc${attaches.voice.ownerId}_${attaches.voice.id}`);
    }
    if (attaches.event) {
        result.push(`event${Peer.toRealId(attaches.event.id)}`);
    }
    if (attaches.wall) {
        result.push(`wall${attaches.wall.ownerId}_${attaches.wall.id}`);
    }
    if (attaches.channelMessage) {
        result.push(
        // убираем "-" У channelId
        `channel_message${Math.abs(attaches.channelMessage.channelId)}_${attaches.channelMessage.cmid}`);
    }
    for (const narrative of attaches.narratives || []) {
        result.push(`narrative${narrative.ownerId}_${narrative.id}`);
    }
    if (attaches.wallReply) {
        result.push(`wall_reply${attaches.wallReply.ownerId}_${attaches.wallReply.id}`);
    }
    if (attaches.poll) {
        result.push(`poll${attaches.poll.ownerId}_${attaches.poll.id}`);
    }
    if (attaches.story) {
        result.push(`story${attaches.story.ownerId}_${attaches.story.id}`);
    }
    if (attaches.link) {
        result.push(`${attaches.link.url}`);
    }
    if (attaches.stickerPack) {
        result.push(`${attaches.stickerPack.url}`);
    }
    if (attaches.inviteLink) {
        result.push(`invite_link${attaches.inviteLink.url}`);
    }
    if (attaches.donutLink) {
        result.push(`donut_link${attaches.donutLink.ownerId}`);
    }
    if (attaches.widget) {
        result.push(`widget${attaches.widget.id}`);
    }
    if (attaches.ugcSticker) {
        result.push(`ugc_sticker${attaches.ugcSticker.item.owner_id}_${attaches.ugcSticker.id}`);
    }
    for (const curator of attaches.curator || []) {
        result.push(`curator${curator.id}`);
    }
    if (attaches.question) {
        result.push(`question${attaches.question.ownerId}_${attaches.question.id}`);
    }
    if (attaches.album) {
        result.push(`album${attaches.album.ownerId}_${attaches.album.id}`);
    }
    if (attaches.article) {
        result.push(`article${attaches.article.ownerId}_${attaches.article.id}_${attaches.article.accessKey}`);
    }
    if (attaches.wallHistory) {
        result.push(`wall${attaches.wallHistory.ownerId}_${attaches.wallHistory.id}`);
    }
    for (const miniApp of attaches.miniApps || []) {
        result.push(`mini_app${miniApp.id}`);
    }
    return result;
}
/**
 * Определяем вложение, отображаемое последним в сообщении.
 */
export function last(attaches) {
    if (Object.keys(attaches).length === 0) {
        return null;
    }
    /**
     * Порядок перечисления ниже через оператор "||" должен быть
     * противоположным порядку следования в компоненте ConvoMessage.
     */
    return (attaches.widget ||
        attaches.wallReply ||
        attaches.channelMessage ||
        attaches.wall ||
        attaches.poll ||
        attaches.donutLink ||
        attaches.moneyTransfer ||
        attaches.moneyRequest ||
        attaches.miniApps?.slice(-1)?.[0] ||
        attaches.miniAppWidgets?.slice(-1)?.[0] ||
        attaches.article ||
        attaches.artist ||
        attaches.audioPlaylists?.slice(-1)?.[0] ||
        attaches.podcast ||
        attaches.audios?.slice(-1)?.[0] ||
        attaches.voice ||
        docsWithoutPreview(attaches.docs)?.slice(-1)?.[0] ||
        attaches.narratives?.slice(-1)?.[0] ||
        attaches.event ||
        attaches.geo ||
        attaches.story ||
        attaches.marketAlbum ||
        attaches.market ||
        attaches.album ||
        attaches.inviteLink ||
        attaches.link ||
        attaches.stickerPack ||
        attaches.curator?.slice(-1)?.[0] ||
        attaches.graffiti ||
        attaches.videoMessage ||
        attaches.ugcSticker ||
        attaches.sticker ||
        attaches.finishedCall ||
        attaches.activeCall ||
        attaches.gift ||
        // медиа аттачи, которые рендерятся над текстом сообщения
        attaches.question ||
        docsWithPreview(attaches.docs)?.slice(-1)?.[0] ||
        attaches.videos?.slice(-1)?.[0] ||
        attaches.photos?.slice(-1)?.[0] ||
        null);
}
export function isAddableAttach(attachItem) {
    switch (attachItem.kind) {
        case 'Artist':
        case 'Audio':
        case 'Doc':
        case 'Geo':
        case 'Link':
        case 'Photo':
        case 'Poll':
        case 'Video':
        case 'Voice':
        case 'StickerPack':
            return true;
        case 'ActiveCall':
        case 'Article':
        case 'AudioPlaylist':
        case 'Album':
        case 'DonutLink':
        case 'Event':
        case 'FinishedCall':
        case 'Gift':
        case 'Graffiti':
        case 'InviteLink':
        case 'Market':
        case 'MarketAlbum':
        case 'MiniApp':
        case 'MiniAppWidget':
        case 'MoneyRequest':
        case 'MoneyTransfer':
        case 'Narrative':
        case 'Podcast':
        case 'Question':
        case 'Sticker':
        case 'Story':
        case 'UgcSticker':
        case 'VideoMessage':
        case 'Wall':
        case 'WallHistory':
        case 'WallReply':
        case 'Widget':
        case 'Curator':
        case 'ChannelStubPhoto':
        case 'ChannelStubVideo':
        case 'ChannelStubAudio':
        case 'ChannelStubDoc':
        case 'Normal':
        case 'Unknown':
            return false;
        default:
            exhaustivenessCheck(attachItem);
    }
}
function isSingleAddableAttach(attachItem) {
    switch (attachItem.kind) {
        case 'Artist':
        case 'Geo':
        case 'Link':
        case 'Poll':
        case 'Voice':
        case 'Market':
        case 'Wall':
        case 'Normal':
            return true;
        case 'Audio':
        case 'Doc':
        case 'Photo':
        case 'Video':
            return false;
        default:
            exhaustivenessCheck(attachItem);
    }
}
function getAddableAttachItemKey(attachItem) {
    switch (attachItem.kind) {
        case 'Photo': {
            return 'photos';
        }
        case 'Video': {
            return 'videos';
        }
        case 'Artist': {
            return 'artist';
        }
        case 'Audio': {
            return 'audios';
        }
        case 'Doc': {
            return 'docs';
        }
        case 'Geo': {
            return 'geo';
        }
        case 'Link': {
            return 'link';
        }
        case 'Poll': {
            return 'poll';
        }
        case 'Voice': {
            return 'voice';
        }
        case 'Market': {
            return 'market';
        }
        case 'Wall': {
            return 'wall';
        }
        case 'Normal': {
            return 'channelMessage';
        }
        default:
            exhaustivenessCheck(attachItem);
    }
}
export function fromAddableAttach(attach) {
    const isArray = Array.isArray(attach);
    const attachItem = isArray ? attach[0] : attach;
    return {
        [getAddableAttachItemKey(attachItem)]: isSingleAddableAttach(attachItem) || isArray ? attach : [attach],
    };
}
export function addAttach(draft, attaches) {
    if (attaches.photos) {
        draft.photos = [...(draft.photos || []), ...attaches.photos];
    }
    if (attaches.videos) {
        draft.videos = [...(draft.videos || []), ...attaches.videos];
    }
    if (attaches.audios) {
        draft.audios = [...(draft.audios || []), ...attaches.audios];
    }
    if (attaches.docs) {
        draft.docs = [...(draft.docs || []), ...attaches.docs];
    }
    if (attaches.voice) {
        draft.voice = attaches.voice;
    }
    if (attaches.wall) {
        draft.wall = attaches.wall;
    }
    if (attaches.channelMessage) {
        draft.channelMessage = attaches.channelMessage;
    }
    if (attaches.geo) {
        draft.geo = attaches.geo;
    }
    if (attaches.poll) {
        draft.poll = attaches.poll;
    }
    if (attaches.market) {
        draft.market = attaches.market;
    }
    if (attaches.link) {
        draft.link = attaches.link;
    }
}
export function removeAttach(attaches, attach, index) {
    switch (attach.kind) {
        case 'Audio':
            if (!attaches.audios) {
                break;
            }
            const audios = removeByIdAndIndex(attaches.audios, attach.id, index);
            if (audios) {
                attaches.audios = audios;
            }
            else {
                delete attaches.audios;
            }
            break;
        case 'AudioPlaylist':
            if (!attaches.audioPlaylists) {
                break;
            }
            const audioPlaylists = removeByIdAndIndex(attaches.audioPlaylists, attach.id, index);
            if (audioPlaylists) {
                attaches.audioPlaylists = audioPlaylists;
            }
            else {
                delete attaches.audioPlaylists;
            }
            break;
        case 'Podcast':
            if (attaches.podcast) {
                delete attaches.podcast;
            }
            break;
        case 'Doc':
            if (!attaches.docs) {
                break;
            }
            const docs = removeByIdAndIndex(attaches.docs, attach.id, index);
            if (docs) {
                attaches.docs = docs;
            }
            else {
                delete attaches.docs;
            }
            break;
        case 'Photo':
            if (!attaches.photos) {
                break;
            }
            const photos = removeByIdAndIndex(attaches.photos, attach.id, index);
            if (photos) {
                attaches.photos = photos;
            }
            else {
                delete attaches.photos;
            }
            break;
        case 'Video':
            if (!attaches.videos) {
                break;
            }
            const videos = removeByIdAndIndex(attaches.videos, attach.id, index);
            if (videos) {
                attaches.videos = videos;
            }
            else {
                delete attaches.videos;
            }
            break;
        case 'Voice':
            if (attaches.voice) {
                delete attaches.voice;
            }
            break;
        case 'Poll':
            if (attaches.poll) {
                delete attaches.poll;
            }
            break;
        case 'Wall':
            if (attaches.wall) {
                delete attaches.wall;
            }
            break;
        case 'WallReply':
            if (attaches.wallReply) {
                delete attaches.wallReply;
            }
            break;
        case 'Article':
            if (attaches.article) {
                delete attaches.article;
            }
            break;
        case 'Link':
            if (attaches.link) {
                delete attaches.link;
            }
            break;
        case 'StickerPack':
            if (attaches.stickerPack) {
                delete attaches.stickerPack;
            }
            break;
        case 'InviteLink':
            if (attaches.inviteLink) {
                delete attaches.inviteLink;
            }
            break;
        case 'Geo':
            if (attaches.geo) {
                delete attaches.geo;
            }
            break;
        case 'MiniApp':
            if (!attaches.miniApps) {
                break;
            }
            const miniApps = toNonEmpty(attaches.miniApps.filter((miniApp) => miniApp.id !== attach.id));
            if (miniApps) {
                attaches.miniApps = miniApps;
            }
            else {
                delete attaches.miniApps;
            }
            break;
        case 'MiniAppWidget':
            if (!attaches.miniAppWidgets) {
                break;
            }
            const miniAppsWidgets = toNonEmpty(attaches.miniAppWidgets.filter((miniAppWidget) => miniAppWidget.cmid !== attach.cmid));
            if (miniAppsWidgets) {
                attaches.miniAppWidgets = miniAppsWidgets;
            }
            else {
                delete attaches.miniAppWidgets;
            }
            break;
        case 'Story':
            if (attaches.story) {
                delete attaches.story;
            }
            break;
        case 'Curator':
            if (!attaches.curator) {
                break;
            }
            const curators = toNonEmpty(attaches.curator.filter((curator) => curator.id !== attach.id));
            if (curators) {
                attaches.curator = curators;
            }
            else {
                delete attaches.curator;
            }
            break;
        case 'Market':
            if (attaches.market) {
                delete attaches.market;
            }
            break;
        case 'Narrative':
            if (!attaches.narratives) {
                break;
            }
            const narratives = toNonEmpty(attaches.narratives.filter((narrative) => narrative.id !== attach.id));
            if (narratives) {
                attaches.narratives = narratives;
            }
            else {
                delete attaches.narratives;
            }
            break;
        case 'Event':
            if (attaches.event) {
                delete attaches.event;
            }
            break;
        case 'MarketAlbum':
            if (attaches.marketAlbum) {
                delete attaches.marketAlbum;
            }
            break;
        case 'DonutLink':
            if (attaches.donutLink) {
                delete attaches.donutLink;
            }
            break;
        case 'Artist':
            if (attaches.artist) {
                delete attaches.artist;
            }
            break;
        case 'Album':
            if (attaches.album) {
                delete attaches.album;
            }
            break;
        case 'Normal':
            if (attaches.channelMessage) {
                delete attaches.channelMessage;
            }
            break;
        case 'Question':
        case 'ChannelStubPhoto':
        case 'ChannelStubVideo':
        case 'ChannelStubAudio':
        case 'ChannelStubDoc':
            /**
             * Вопрос, Заглушки нельзя удалять
             */
            break;
        default:
            exhaustivenessCheck(attach);
    }
}
/**
 * Меняет местами два элемента определенного типа
 */
export function rearrangeAttaches(draft, { currentPosition, newPosition, }, key) {
    switch (key) {
        case 'photos':
            const photos = draft[key];
            if (!photos) {
                return;
            }
            const photo = photos[currentPosition];
            if (!photo) {
                return;
            }
            photos.splice(currentPosition, 1);
            photos.splice(newPosition, 0, photo);
            draft[key] = photos;
            break;
        case 'videos':
            const videos = draft[key];
            if (!videos) {
                return;
            }
            const video = videos[currentPosition];
            if (!video) {
                return;
            }
            videos.splice(currentPosition, 1);
            videos.splice(newPosition, 0, video);
            draft[key] = videos;
            break;
        case 'audios':
            const audios = draft[key];
            if (!audios) {
                return;
            }
            const audio = audios[currentPosition];
            if (!audio) {
                return;
            }
            audios.splice(currentPosition, 1);
            audios.splice(newPosition, 0, audio);
            draft[key] = audios;
            break;
        case 'audioPlaylists':
            const audioPlaylists = draft[key];
            if (!audioPlaylists) {
                return;
            }
            const audioPlaylist = audioPlaylists[currentPosition];
            if (!audioPlaylist) {
                return;
            }
            audioPlaylists.splice(currentPosition, 1);
            audioPlaylists.splice(newPosition, 0, audioPlaylist);
            draft[key] = audioPlaylists;
            break;
        case 'docs':
            const docs = draft[key];
            if (!docs) {
                return;
            }
            const doc = docs[currentPosition];
            if (!doc) {
                return;
            }
            docs.splice(currentPosition, 1);
            docs.splice(newPosition, 0, doc);
            draft[key] = docs;
            break;
        case 'narratives':
            const narratives = draft[key];
            if (!narratives) {
                return;
            }
            const narrative = narratives[currentPosition];
            if (!narrative) {
                return;
            }
            narratives.splice(currentPosition, 1);
            narratives.splice(newPosition, 0, narrative);
            draft[key] = narratives;
            break;
        default:
            exhaustivenessCheck(key);
    }
}
export function generatePollBackgroundGradientStyle(gradient) {
    const angle = gradient.angle - 90;
    const { points } = gradient;
    const colors = [];
    for (let i = 0; i < points.length; i++) {
        const color = points[i];
        const percent = (i * 100) / (points.length - 1);
        colors.push(`${color} ${percent}%`);
    }
    return `linear-gradient(${angle}deg, ${colors.join(', ')})`;
}
export function kindsCount(attaches) {
    return Object.keys(attaches).length;
}
export function count(attaches) {
    return Object.values(attaches).reduce((count, attach) => {
        const attachItemsLength = Array.isArray(attach) ? attach.length : 1;
        return count + attachItemsLength;
    }, 0);
}
/**
 * Валидирует статус мини-приложения. Для неизвестного возвращает `-1`.
 */
export function resolveMiniAppStatus(status) {
    return isValidMiniAppStatus(status) ? status : -1;
}
function isValidMiniAppStatus(status) {
    return miniAppStatuses.includes(status);
}
// При переходе по ссылке бекенд по квери параметрам понимает, открывать
// просмотрщик документа или начинать скачивание (no_preview=1&api=1)
// Однако это работает только для веба вкком/рефа;
// в адаптиве/десктопе/виджете должно быть скачивание
export function overrideUrlForPreview(doc, isAdaptive) {
    const location = new URL(doc.url);
    location.searchParams.delete('api_preview');
    location.searchParams.delete('no_preview');
    location.searchParams.delete('api');
    if (isAdaptive) {
        location.searchParams.set('no_preview', '1');
        location.searchParams.set('api', '1');
    }
    else {
        location.searchParams.set('from_module', 'vkmsg_desktop');
    }
    return location.toString();
}
/**
 * Проверяет доступность аттача мини-приложения.
 */
export function isMiniAppAvailable(miniApp) {
    return miniApp.status === 1;
}
export function isGame(miniApp) {
    if ('type' in miniApp) {
        return miniApp.type === 'game' || miniApp.type === 'html5_game';
    }
    return false;
}
/**
 * Удаляет из массива прикреплённых аттачей подходящий и по id, и по индексу
 * для случаев, когда было добавлено несколько одинаковых (одинаковые id) файлов
 */
function removeByIdAndIndex(attaches, id, index) {
    return toNonEmpty(attaches.filter((item, idx) => !(idx === index && id === item.id)));
}
export function hasPublicVideo(attaches) {
    const lastAttach = last(attaches);
    const attachesCount = count(attaches);
    return Boolean(attachesCount === 1 &&
        lastAttach?.kind === 'Video' &&
        lastAttach.type !== 'short_video' &&
        (!lastAttach.isFromMessage || lastAttach.files?.external));
}
export function docsWithPreview(docs) {
    return docs ? toNonEmpty(docs.filter((doc) => doc.image)) : null;
}
export function docsWithoutPreview(docs) {
    return docs ? toNonEmpty(docs.filter((doc) => !doc.image)) : null;
}
export function channelStubDocsWithPreview(docs) {
    return docs ? toNonEmpty(docs.filter((doc) => doc.width)) : null;
}
export function channelStubDocsWithoutPreview(docs) {
    return docs ? toNonEmpty(docs.filter((doc) => !doc.width)) : null;
}
export function triggerPopupStickerAutoplayOnReceive(message) {
    if (!('attaches' in message) || !message.attaches.sticker) {
        return;
    }
    message.attaches.sticker.isPopupAutoplayed = false;
    message.attaches.sticker.popupStickerAutoplayTrigger = 'receive';
}
export function toggleStickerIsPopupAutoplayed(message, isAutoplayed) {
    if (!('attaches' in message) || !message.attaches.sticker) {
        return;
    }
    message.attaches.sticker.isPopupAutoplayed = isAutoplayed;
}
/**
 * Проверяет наличие аттачей, которые рендерятся в компоненте Attachments.
 * Не учитывает медиа аттачи и некоторые другие вложения, которые рендерятся в сообщении отдельно,
 * например стикеры, истории, подарки и видеосообщения
 */
export function hasAttaches(attaches) {
    return Boolean(attaches.activeCall ||
        attaches.finishedCall ||
        attaches.graffiti ||
        attaches.link ||
        attaches.inviteLink ||
        attaches.market ||
        attaches.marketAlbum ||
        attaches.geo ||
        attaches.event ||
        attaches.narratives ||
        docsWithoutPreview(attaches.docs) ||
        attaches.voice ||
        attaches.audios ||
        attaches.podcast ||
        attaches.audioPlaylists ||
        attaches.album ||
        attaches.artist ||
        attaches.curator ||
        attaches.article ||
        attaches.miniApps ||
        attaches.miniAppWidgets ||
        attaches.moneyRequest ||
        attaches.moneyTransfer ||
        attaches.donutLink ||
        attaches.poll ||
        attaches.wall ||
        attaches.channelMessage ||
        attaches.wallReply ||
        attaches.widget ||
        attaches.stickerPack);
}
/**
 * Проверяет наличие медиа аттачей.
 * Сюда входят аттачи, которые могут быть показаны в сетке, а так же вопрос
 */
export function hasMediaAttaches(attaches) {
    return Boolean(attaches.photos ||
        attaches.videos ||
        docsWithPreview(attaches.docs) ||
        attaches.question);
}
export function mediaAttachesCount(attaches) {
    const photosCount = attaches.photos?.filter((photo) => preview(photo)).length ?? 0;
    const videoCount = attaches.videos?.filter((video) => preview(video)).length ?? 0;
    const docsCount = attaches.docs?.filter((doc) => preview(doc)).length ?? 0;
    return photosCount + videoCount + docsCount;
}
export function getSingleMediaAttach(attaches) {
    const count = mediaAttachesCount(attaches);
    if (count !== 1) {
        return null;
    }
    if (attaches.photos) {
        return attaches.photos[0];
    }
    if (attaches.videos) {
        return attaches.videos[0];
    }
    if (attaches.docs) {
        return attaches.docs[0];
    }
    return null;
}
export function isRandomPackGift(attaches) {
    return attaches.gift?.id === GIFTS_RANDOM_STICKER_PACK_GIFT_ID;
}
export function isVideoOrAudioOnly(attaches) {
    return ((Object.keys(attaches).length === 1 &&
        attaches.videos?.length === 1 &&
        attaches.videos[0].type === 'video') ||
        (Object.keys(attaches).length === 1 && attaches.audios?.length === 1));
}
//# sourceMappingURL=Attach.js.map