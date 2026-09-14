import { thumbHashToDataURL } from 'thumbhash';
import * as Attach from '../../core/model/Attach';
import * as Peer from '../../core/model/Peer';
import * as Message from '../../core/model/Message';
import * as TextChunk from '../../core/model/TextChunk';
import { exhaustivenessCheck, toNonEmpty } from '../../core/utils/misc';
import { fromApiSticker, fromApiUgcSticker, } from '../converter/StickerConverter';
import { fromApiCommunityChannelPost, fromApiDonutDuration, } from './PostConverter';
import { getChatJoinHash } from '../../core/utils/links';
import { fromApiPicture } from '../converter/PictureConverter';
import { isGroupPeerId, isUserPeerId } from '../../core/model/Peer';
const DEFAULT_PHOTO_SIZE = 200;
/**
 * Иногда апи может не успеть обработать видео, вместо него будем отображать
 * черный квадрат, вместо сломанной картинки
 */
export const emptyPreview = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAA1JREFUGFdjYGBg+A8AAQQBAHAgZQsAAAAASUVORK5CYII=';
export const UNKNOWN_SHAPE_ID = -1;
function getCoownerPeerIds(owners) {
    return (owners
        ?.filter((owner) => owner.status === 'approved' || owner.status === undefined)
        .map((owner) => {
        const peerId = Peer.resolveId(owner.owner_id);
        return isUserPeerId(peerId) || isGroupPeerId(peerId)
            ? peerId
            : undefined;
    })
        .filter((peerId) => peerId !== undefined) || []);
}
export function fromApiAttach({ apiAttaches, messageAccessKey, attachPositionOffset, }) {
    if (apiAttaches.length === 0) {
        return {};
    }
    const result = {};
    const unknown = (apiAttach) => {
        result.unknown = [
            ...(result.unknown || []),
            { data: apiAttach, kind: 'Unknown' },
        ];
    };
    let position = attachPositionOffset;
    for (const apiAttach of apiAttaches) {
        if (position !== undefined) {
            position++;
        }
        switch (apiAttach.type) {
            case 'photo': {
                if (!apiAttach.photo) {
                    unknown(apiAttach);
                    break;
                }
                const photo = fromApiPhoto({
                    apiPhoto: apiAttach.photo,
                    messageAccessKey,
                    position,
                });
                if (!photo) {
                    unknown(apiAttach);
                    break;
                }
                result.photos = [...(result.photos || []), photo];
                break;
            }
            case 'audio': {
                if (!apiAttach.audio) {
                    unknown(apiAttach);
                    break;
                }
                const audio = fromApiAudio(apiAttach.audio);
                result.audios = [...(result.audios || []), audio];
                break;
            }
            case 'video':
                if (!apiAttach.video) {
                    unknown(apiAttach);
                    break;
                }
                const video = fromApiVideo({
                    apiVideo: apiAttach.video,
                    messageAccessKey,
                    position,
                });
                if (!video) {
                    unknown(apiAttach);
                    break;
                }
                result.videos = [...(result.videos || []), video];
                break;
            case 'doc': {
                if (!apiAttach.doc) {
                    unknown(apiAttach);
                    break;
                }
                const doc = fromApiDoc(apiAttach.doc);
                if (!doc) {
                    unknown(apiAttach);
                    break;
                }
                result.docs = [...(result.docs || []), doc];
                break;
            }
            case 'link': {
                if (!apiAttach.link) {
                    unknown(apiAttach);
                    break;
                }
                const link = fromApiLink(apiAttach.link);
                if (!link) {
                    unknown(apiAttach);
                    break;
                }
                const toInviteLink = (link) => link.image && {
                    ...link,
                    image: link.image,
                    kind: 'InviteLink',
                };
                if (getChatJoinHash(link.url) && link.image) {
                    result.inviteLink = toInviteLink(link);
                    break;
                }
                result.link = link;
                break;
            }
            case 'market': {
                if (!apiAttach.market) {
                    unknown(apiAttach);
                    break;
                }
                result.market = fromApiMarket(apiAttach.market);
                break;
            }
            case 'market_album': {
                if (!apiAttach.market_album) {
                    unknown(apiAttach);
                    break;
                }
                result.marketAlbum = fromApiMarketAlbum(apiAttach.market_album);
                break;
            }
            case 'gift':
                if (!apiAttach.gift) {
                    unknown(apiAttach);
                    break;
                }
                const gift = fromApiGift(apiAttach.gift);
                if (!gift) {
                    unknown(apiAttach);
                    break;
                }
                result.gift = gift;
                break;
            case 'event':
                if (!apiAttach.event) {
                    unknown(apiAttach);
                    break;
                }
                const event = fromApiEvent(apiAttach.event);
                result.event = event;
                break;
            case 'ugc_sticker': {
                if (!apiAttach.ugc_sticker) {
                    unknown(apiAttach);
                    break;
                }
                const ugcSticker = fromApiUgcSticker(apiAttach.ugc_sticker);
                if (!ugcSticker) {
                    unknown(apiAttach);
                    break;
                }
                result.ugcSticker = ugcSticker;
                break;
            }
            case 'sticker_pack_preview': {
                if (!apiAttach.sticker_pack_preview) {
                    unknown(apiAttach);
                    break;
                }
                const stickerPack = fromApiStickerPack(apiAttach.sticker_pack_preview);
                if (!stickerPack) {
                    unknown(apiAttach);
                    break;
                }
                result.stickerPack = stickerPack;
                break;
            }
            case 'sticker': {
                if (!apiAttach.sticker) {
                    unknown(apiAttach);
                    break;
                }
                const sticker = fromApiSticker(apiAttach.sticker);
                if (!sticker) {
                    unknown(apiAttach);
                    break;
                }
                result.sticker = sticker;
                break;
            }
            case 'wall': {
                if (!apiAttach.wall || !apiAttach.wall.from_id || !apiAttach.wall.id) {
                    unknown(apiAttach);
                    break;
                }
                if (apiAttach.wall.geo) {
                    apiAttach.wall.attachments = [
                        ...(apiAttach.wall.attachments || []),
                        {
                            type: 'geo',
                            geo: apiAttach.wall.geo,
                        },
                    ];
                }
                const ownerId = apiAttachWallOwnerId(apiAttach.wall);
                if (!ownerId) {
                    unknown(apiAttach);
                    break;
                }
                let isVisibleFor = 'all';
                if (apiAttach.wall.friends_only === 1) {
                    isVisibleFor = 'friends';
                }
                if (apiAttach.wall.best_friends_only === 1) {
                    isVisibleFor = 'best_friends';
                }
                let coownerPeerIds;
                if ('wall' in apiAttach) {
                    coownerPeerIds =
                        apiAttach.wall.coowners &&
                            getCoownerPeerIds(apiAttach.wall.coowners?.list).filter((coownerId) => coownerId !== Peer.resolveId(ownerId));
                }
                result.wall = {
                    kind: 'Wall',
                    authorId: Peer.resolveId(apiAttach.wall.from_id),
                    ownerId: Peer.resolveId(ownerId),
                    coownerPeerIds,
                    id: apiAttach.wall.id,
                    date: (apiAttach.wall.date || 0) * 1000,
                    chunks: TextChunk.fromServerText(apiAttach.wall.text || ''),
                    attaches: fromApiWallAttach(apiAttach.wall),
                    isAds: apiAttach.wall.post_type === 'post_ads',
                    views: apiAttach?.wall?.views?.count || 0,
                    isDeleted: apiAttach.wall.is_deleted || false,
                    donut: {
                        isDonut: apiAttach?.wall?.donut?.is_donut,
                        placeholder: apiAttach?.wall?.donut?.placeholder
                            ? {
                                text: apiAttach?.wall?.donut.placeholder?.text,
                                button: apiAttach?.wall?.donut.placeholder?.button,
                            }
                            : undefined,
                        duration: fromApiDonutDuration(apiAttach?.wall?.donut?.paid_duration),
                    },
                    isVisibleFor,
                    trackCode: apiAttach.wall.track_code,
                };
                break;
            }
            case 'channel_message': {
                if (!apiAttach.channel_message ||
                    !apiAttach.channel_message.author_id ||
                    !apiAttach.channel_message.channel_id) {
                    unknown(apiAttach);
                    break;
                }
                const ownerId = apiAttach.channel_message.cm_payload?.owner_id ||
                    apiAttach.channel_message.author_id;
                if (!ownerId) {
                    unknown(apiAttach);
                    break;
                }
                result.channelMessage = fromApiCommunityChannelPost(apiAttach.channel_message).post;
                break;
            }
            case 'wall_reply': {
                if (!apiAttach.wall_reply ||
                    !apiAttach.wall_reply.from_id ||
                    !apiAttach.wall_reply.id ||
                    !apiAttach.wall_reply.post_id) {
                    unknown(apiAttach);
                    break;
                }
                const ownerId = apiAttachWallOwnerId(apiAttach.wall_reply);
                if (!ownerId) {
                    unknown(apiAttach);
                    break;
                }
                result.wallReply = {
                    kind: 'WallReply',
                    id: apiAttach.wall_reply.id,
                    postId: apiAttach.wall_reply.post_id,
                    authorId: Peer.resolveId(apiAttach.wall_reply.from_id),
                    ownerId: Peer.resolveId(ownerId),
                    parentsStack: apiAttach.wall_reply.parents_stack,
                    date: (apiAttach.wall_reply.date || 0) * 1000,
                    chunks: TextChunk.fromServerText(apiAttach.wall_reply.text || ''),
                    attaches: fromApiWallReplyAttach(apiAttach.wall_reply.attachments || []),
                };
                break;
            }
            case 'article': {
                if (!apiAttach.article) {
                    unknown(apiAttach);
                    break;
                }
                result.article = fromApiArticle(apiAttach.article);
                break;
            }
            case 'poll': {
                if (!apiAttach.poll) {
                    unknown(apiAttach);
                    break;
                }
                result.poll = fromApiPoll(apiAttach.poll);
                break;
            }
            case 'graffiti': {
                if (!apiAttach.graffiti) {
                    unknown(apiAttach);
                    break;
                }
                result.graffiti = {
                    kind: 'Graffiti',
                    imageUrl: apiAttach.graffiti.url,
                    width: apiAttach.graffiti.width,
                    height: apiAttach.graffiti.height,
                };
                break;
            }
            case 'audio_message': {
                if (!apiAttach.audio_message) {
                    unknown(apiAttach);
                    break;
                }
                result.voice = fromApiVoice(apiAttach.audio_message);
                break;
            }
            case 'audio_playlist': {
                if (!apiAttach.audio_playlist) {
                    unknown(apiAttach);
                    break;
                }
                const audioPlaylist = fromApiAudioPlaylist(apiAttach.audio_playlist);
                result.audioPlaylists = [
                    ...(result.audioPlaylists || []),
                    audioPlaylist,
                ];
                break;
            }
            case 'artist': {
                if (!apiAttach.artist) {
                    unknown(apiAttach);
                    break;
                }
                /**
                 * Бэк не смог положить audios внутрь artust, так как не получилось договориться с музыкой (это их объект),
                 * так как там есть риски словить рекурсию на связках "артист-трек".
                 */
                const artistAudios = apiAttach.audios;
                result.artist = fromApiArtist(apiAttach.artist, artistAudios);
                break;
            }
            case 'podcast': {
                if (!apiAttach.podcast) {
                    unknown(apiAttach);
                    break;
                }
                result.podcast = fromApiPodcast(apiAttach.podcast);
                break;
            }
            case 'money_transfer': {
                if (!apiAttach.money_transfer) {
                    unknown(apiAttach);
                    break;
                }
                result.moneyTransfer = fromApiMoneyTransfer(apiAttach.money_transfer);
                break;
            }
            case 'money_request': {
                if (!apiAttach.money_request) {
                    unknown(apiAttach);
                    break;
                }
                result.moneyRequest = fromApiMoneyRequest(apiAttach.money_request);
                break;
            }
            case 'story':
                if (!apiAttach.story) {
                    unknown(apiAttach);
                    break;
                }
                result.story = fromApiStory(apiAttach.story);
                break;
            case 'geo':
                if (!apiAttach.geo || !apiAttach.geo.coordinates) {
                    unknown(apiAttach);
                    break;
                }
                result.geo = {
                    kind: 'Geo',
                    coordinates: apiAttach.geo.coordinates,
                    place: apiAttach.geo.place,
                };
                break;
            case 'call': {
                if (!apiAttach.call) {
                    unknown(apiAttach);
                    break;
                }
                const finishedCall = fromApiFinishedCall(apiAttach.call);
                if (!finishedCall) {
                    unknown(apiAttach);
                    break;
                }
                result.finishedCall = finishedCall;
                break;
            }
            case 'group_call_in_progress':
                if (!apiAttach.group_call_in_progress) {
                    unknown(apiAttach);
                    break;
                }
                result.activeCall = fromApiActiveCall(apiAttach.group_call_in_progress);
                break;
            case 'mini_app':
                if (!apiAttach.mini_app) {
                    unknown(apiAttach);
                    break;
                }
                const miniApp = fromApiMiniApp(apiAttach.mini_app);
                if (!miniApp) {
                    unknown(apiAttach);
                    break;
                }
                result.miniApps = [...(result.miniApps || []), miniApp];
                break;
            case 'app_action':
                if (!apiAttach.app_action) {
                    unknown(apiAttach);
                    break;
                }
                const miniAppWidget = fromApiMiniAppWidget(apiAttach.app_action);
                if (!miniAppWidget) {
                    unknown(apiAttach);
                    break;
                }
                result.miniAppWidgets = [
                    ...(result.miniAppWidgets || []),
                    miniAppWidget,
                ];
                break;
            case 'donut_link':
                if (!apiAttach.donut_link) {
                    unknown(apiAttach);
                    break;
                }
                const donutLink = fromApiDonutLink(apiAttach.donut_link);
                if (!donutLink) {
                    unknown(apiAttach);
                    break;
                }
                result.donutLink = donutLink;
                break;
            case 'video_message': {
                if (!apiAttach.video_message) {
                    unknown(apiAttach);
                    break;
                }
                result.videoMessage = fromApiVideoMessage(apiAttach.video_message);
                break;
            }
            case 'widget':
                if (!apiAttach.widget) {
                    unknown(apiAttach);
                    break;
                }
                result.widget = fromApiWidget(apiAttach.widget);
                break;
            case 'narrative':
                if (!apiAttach.narrative) {
                    unknown(apiAttach);
                    break;
                }
                const narrative = fromApiNarrative(apiAttach.narrative);
                if (!narrative) {
                    unknown(apiAttach);
                    break;
                }
                result.narratives = [...(result.narratives || []), narrative];
                break;
            case 'question':
                if (!apiAttach.question) {
                    unknown(apiAttach);
                    break;
                }
                result.question = fromApiQuestion(apiAttach.question);
                break;
            case 'album':
                if (!apiAttach.album) {
                    unknown(apiAttach);
                    break;
                }
                result.album = fromApiAlbum(apiAttach.album);
                break;
            case 'curator': {
                const apiCurator = apiAttach.curator;
                const apiCuratorUrl = apiCurator?.url;
                const apiCuratorId = apiCurator?.id;
                if (apiCurator && apiCuratorUrl && apiCuratorId) {
                    const curator = fromApiCurator({
                        ...apiCurator,
                        url: apiCuratorUrl,
                        id: apiCuratorId,
                    });
                    result.curator = [...(result.curator || []), curator];
                    break;
                }
                else {
                    unknown(apiAttach);
                    break;
                }
            }
            case 'channel_stub': {
                const apiChannelStub = apiAttach.channel_stub;
                if (!apiChannelStub || !apiChannelStub.type) {
                    unknown(apiAttach);
                    break;
                }
                switch (apiChannelStub.type) {
                    case 'photo': {
                        const channelStubPhoto = fromApiChannelStubPhoto(apiChannelStub);
                        if (!channelStubPhoto) {
                            unknown(apiAttach);
                            break;
                        }
                        result.channelStubPhoto = [
                            ...(result.channelStubPhoto || []),
                            channelStubPhoto,
                        ];
                        break;
                    }
                    case 'video': {
                        const channelStubVideo = fromApiChannelStubVideo(apiChannelStub);
                        if (!channelStubVideo) {
                            unknown(apiAttach);
                            break;
                        }
                        result.channelStubVideo = [
                            ...(result.channelStubVideo || []),
                            channelStubVideo,
                        ];
                        break;
                    }
                    case 'audio': {
                        const channelStubAudio = fromApiChannelStubAudio(apiChannelStub);
                        if (!channelStubAudio) {
                            unknown(apiAttach);
                            break;
                        }
                        result.channelStubAudio = [
                            ...(result.channelStubAudio || []),
                            channelStubAudio,
                        ];
                        break;
                    }
                    case 'doc': {
                        const channelStubDoc = fromApiChannelStubDoc(apiChannelStub);
                        if (!channelStubDoc) {
                            unknown(apiAttach);
                            break;
                        }
                        result.channelStubDoc = [
                            ...(result.channelStubDoc || []),
                            channelStubDoc,
                        ];
                        break;
                    }
                    case 'audio_message':
                    case 'channel_message':
                    case 'default':
                    case 'link':
                    case 'poll':
                    case 'video_message':
                    case 'wall':
                    case 'wall_reply':
                        break;
                    default:
                        exhaustivenessCheck(apiChannelStub.type);
                }
                break;
            }
            case 'group':
            case 'link_curator':
            case 'podcasts':
            case 'video_playlist':
            case 'vkpay':
                unknown(apiAttach);
                break;
            default: {
                /**
                 * По дефолту будем возвращать unknown,
                 * чтобы если вдруг список расширится,
                 * для нас это не стало брейкинг чейнджем.
                 *
                 * Но все равно проверим на экзостивнесс, чтобы
                 * получать ошибки компиляции.
                 */
                const _typeguard = apiAttach.type;
                unknown(apiAttach);
                break;
            }
        }
    }
    return result;
}
export function fromApiConvoAttach(apiAttaches) {
    const result = {};
    for (const apiAttach of apiAttaches) {
        switch (apiAttach.attachment.type) {
            case 'photo': {
                if (!apiAttach.attachment.photo) {
                    break;
                }
                const photo = fromApiPhoto({
                    apiPhoto: apiAttach.attachment.photo,
                    messageAccessKey: apiAttach.attachment.photo.access_key,
                    position: apiAttach.position,
                });
                if (!photo) {
                    break;
                }
                const item = {
                    attach: photo,
                    cmid: Message.resolveCmid(apiAttach.cmid),
                    authorId: Peer.resolveId(apiAttach.from_id),
                    date: apiAttach.date,
                };
                result.photos = (result.photos || []).concat(item);
                break;
            }
            case 'audio': {
                if (!apiAttach.attachment.audio) {
                    break;
                }
                const audio = fromApiAudio(apiAttach.attachment.audio);
                const item = {
                    attach: audio,
                    cmid: Message.resolveCmid(apiAttach.cmid),
                    authorId: Peer.resolveId(apiAttach.from_id),
                    date: apiAttach.date,
                };
                result.audios = (result.audios || []).concat(item);
                break;
            }
            case 'video': {
                if (!apiAttach.attachment.video) {
                    break;
                }
                const video = fromApiVideo({
                    apiVideo: apiAttach.attachment.video,
                    messageAccessKey: apiAttach.attachment.video.access_key,
                    position: apiAttach.position,
                });
                if (!video) {
                    break;
                }
                const item = {
                    attach: video,
                    cmid: Message.resolveCmid(apiAttach.cmid),
                    authorId: Peer.resolveId(apiAttach.from_id),
                    date: apiAttach.date,
                };
                result.videos = (result.videos || []).concat(item);
                break;
            }
            case 'doc': {
                if (!apiAttach.attachment.doc) {
                    break;
                }
                const doc = fromApiDoc(apiAttach.attachment.doc);
                if (!doc) {
                    break;
                }
                const item = {
                    attach: doc,
                    cmid: Message.resolveCmid(apiAttach.cmid),
                    authorId: Peer.resolveId(apiAttach.from_id),
                    date: apiAttach.date,
                };
                result.docs = (result.docs || []).concat(item);
                break;
            }
            case 'link': {
                if (!apiAttach.attachment.link) {
                    break;
                }
                const link = fromApiLink(apiAttach.attachment.link);
                if (!link) {
                    break;
                }
                const item = {
                    attach: link,
                    cmid: Message.resolveCmid(apiAttach.cmid),
                    authorId: Peer.resolveId(apiAttach.from_id),
                    date: apiAttach.date,
                };
                result.links = (result.links || []).concat(item);
                break;
            }
            case 'mini_app': {
                if (!apiAttach.attachment.mini_app) {
                    break;
                }
                const miniApp = fromApiMiniApp(apiAttach.attachment.mini_app);
                if (!miniApp) {
                    break;
                }
                const item = {
                    attach: miniApp,
                    cmid: Message.resolveCmid(apiAttach.cmid),
                    authorId: Peer.resolveId(apiAttach.from_id),
                    date: apiAttach.date,
                };
                result.links = (result.links || []).concat(item);
                break;
            }
            case 'app_action': {
                if (!apiAttach.attachment.app_action) {
                    break;
                }
                const miniAppWidget = fromApiMiniAppWidget(apiAttach.attachment.app_action);
                if (!miniAppWidget) {
                    break;
                }
                const item = {
                    attach: miniAppWidget,
                    cmid: Message.resolveCmid(apiAttach.cmid),
                    authorId: Peer.resolveId(apiAttach.from_id),
                    date: apiAttach.date,
                };
                result.miniAppWidgets = (result.miniAppWidgets || []).concat(item);
                break;
            }
            case 'audio_message': {
                // скоро будем обрабатывать голосовые
                break;
            }
            case 'video_message':
            case 'video_playlist':
            case 'graffiti':
            case 'market':
            case 'wall': {
                // пока не используем
                break;
            }
            default: {
                const _typeguard = apiAttach.attachment.type;
            }
        }
    }
    return result;
}
export function fromApiWallAttach(wall) {
    const { geo, attachments: apiWallAttaches, copy_history: copyHistory, access_key: accessKey, } = wall;
    const acc = [];
    if (geo) {
        apiWallAttaches?.push({ type: 'geo', geo });
    }
    for (const apiWallAttach of apiWallAttaches || [])
        switch (apiWallAttach.type) {
            case 'photo':
            case 'audio':
            case 'video':
            case 'doc':
            case 'link':
            case 'mini_app':
            case 'sticker':
            case 'market':
            case 'curator':
            case 'article':
            case 'poll':
            case 'audio_playlist':
            case 'album':
            case 'artist':
            case 'podcast':
            case 'narrative':
            case 'event':
            case 'market_album':
            case 'donut_link':
            case 'graffiti': {
                acc.push({
                    type: apiWallAttach.type,
                    [apiWallAttach.type]: apiWallAttach[apiWallAttach.type],
                });
                break;
            }
            case 'geo': {
                if (!apiWallAttach.geo) {
                    break;
                }
                const coordinates = apiWallAttach.geo.coordinates
                    ?.split(' ')
                    .map((cord) => parseFloat(cord));
                acc.push({
                    type: 'geo',
                    geo: {
                        ...apiWallAttach.geo,
                        place: {
                            title: apiWallAttach.geo.place?.title,
                            address: apiWallAttach.geo.place?.address,
                        },
                        coordinates: coordinates && coordinates[0] && coordinates[1]
                            ? {
                                latitude: coordinates[0],
                                longitude: coordinates[1],
                            }
                            : undefined,
                    },
                });
                break;
            }
            case 'textlive':
            case 'textpost':
            case 'textpost_publish':
            case 'posted_photo':
            case 'note':
            case 'app':
            case 'page':
            case 'situational_theme':
            case 'group':
            case 'photos_list':
            case 'pretty_cards':
            case 'video_playlist':
            case 'clip':
            case 'online_booking':
            case 'market_link':
            case 'message_to_bc':
            case 'action_button':
                // TODO: Добавить поддержку
                break;
            default:
                /**
                 * По дефолту будем возвращать unknown,
                 * чтобы если вдруг список расширится,
                 * для нас это не стало брейкинг чейнджем.
                 *
                 * Но все равно проверим на экзостивнесс, чтобы
                 * получать ошибки компиляции.
                 */
                const _typeguard = apiWallAttach.type;
                break;
        }
    const result = fromApiAttach({
        apiAttaches: acc,
        messageAccessKey: accessKey,
    });
    if (copyHistory?.[0] && copyHistory?.[0].from_id !== 0) {
        const copyOwnerId = apiAttachWallOwnerId(copyHistory[0]);
        result.wallHistory = {
            kind: 'WallHistory',
            id: copyHistory[0].id || 0,
            authorId: Peer.resolveId(copyHistory[0].from_id),
            ownerId: Peer.resolveId(copyOwnerId),
            date: (copyHistory[0].date || 0) * 1000,
            text: copyHistory[0].text || '',
            attaches: fromApiWallReplyAttach(copyHistory[0].attachments || []),
            chunks: TextChunk.fromServerText(copyHistory[0].text || ''),
        };
    }
    return result;
}
export function fromApiChannelMessageAttach(post) {
    const { attachments: apiCommunityChannelAttachments } = post;
    const accessKey = undefined;
    const acc = [];
    for (const apiCommunityChannelAttachment of apiCommunityChannelAttachments ||
        [])
        switch (apiCommunityChannelAttachment.type) {
            case 'photo':
            case 'audio':
            case 'audio_message':
            case 'video':
            case 'video_message':
            case 'doc':
            case 'link':
            case 'poll':
            case 'channel_stub':
                acc.push({
                    type: apiCommunityChannelAttachment.type,
                    [apiCommunityChannelAttachment.type]: apiCommunityChannelAttachment[apiCommunityChannelAttachment.type],
                });
                break;
            //TODO: пока не умеем в форварды контентом. будет сделано в рамках postmvp блока
            case 'wall':
            case 'wall_reply':
            case 'channel_message':
                break;
            default:
                /**
                 * По дефолту будем возвращать unknown,
                 * чтобы если вдруг список расширится,
                 * для нас это не стало брейкинг чейнджем.
                 *
                 * Но все равно проверим на экзостивнесс, чтобы
                 * получать ошибки компиляции.
                 */
                const _typeguard = apiCommunityChannelAttachment.type;
                break;
        }
    const result = fromApiAttach({
        apiAttaches: acc,
        messageAccessKey: accessKey,
    });
    return result;
}
export function fromApiWallReplyAttach(apiWallReplyAttaches) {
    const acc = [];
    for (const apiWallAttach of apiWallReplyAttaches)
        switch (apiWallAttach.type) {
            case 'photo':
            case 'audio':
            case 'audio_playlist':
            case 'artist':
            case 'video':
            case 'doc':
            case 'curator':
            case 'link':
            case 'album':
            case 'event':
            case 'narrative':
            case 'mini_app':
            case 'sticker':
            case 'market':
            case 'graffiti':
            case 'market_album':
            case 'geo': {
                acc.push({
                    type: apiWallAttach.type,
                    [apiWallAttach.type]: apiWallAttach[apiWallAttach.type],
                });
                break;
            }
            case 'note':
            case 'page':
            case 'app':
            case 'article':
            case 'donut_link':
            case 'group':
            case 'photos_list':
            case 'poll':
            case 'posted_photo':
            case 'pretty_cards':
            case 'video_playlist':
            case 'situational_theme':
            case 'textlive':
            case 'textpost':
            case 'textpost_publish':
            case 'podcast':
            case 'clip':
            case 'online_booking':
            case 'market_link':
            case 'message_to_bc':
            case 'action_button':
                // TODO: Добавить поддержку
                break;
            default:
                /**
                 * По дефолту будем возвращать unknown,
                 * чтобы если вдруг список расширится,
                 * для нас это не стало брейкинг чейнджем.
                 *
                 * Но все равно проверим на экзостивнесс, чтобы
                 * получать ошибки компиляции.
                 */
                const _typeguard = apiWallAttach.type;
                break;
        }
    return fromApiAttach({ apiAttaches: acc });
}
function fromApiLink(apiLink) {
    let url = apiLink.url;
    /**
     * АПИ возвращает ссылки на m.vk.com, нам это не всегда нужно.
     * Поэтому мы переделываем пути на относительные,
     * чтобы приложение потом могло само принять решение что и где открывать
     */
    const re = /^https:\/\/m\.vk\.com(.+)/;
    if (re.test(apiLink.url)) {
        const match = apiLink.url.match(re);
        url = match && match[1] ? match[1] : url;
    }
    let meta;
    if (apiLink.seller_product?.owner_name ||
        apiLink.rating?.stars ||
        apiLink.rating?.reviews_count ||
        apiLink.seller_product?.favicon_link) {
        meta = {
            ownerName: apiLink.seller_product?.owner_name,
            rating: apiLink.rating?.stars,
            reviews: apiLink.rating?.reviews_count,
            favicon: apiLink.seller_product?.favicon_link,
        };
    }
    return {
        kind: 'Link',
        url,
        meta,
        title: apiLink.title ?? '',
        subtitle: apiLink.caption || url,
        image: apiLink.photo
            ? fromApiPhotoSizes(apiLink.photo.sizes || [])
            : undefined,
    };
}
function fromApiStickerPack(apiStickerPack) {
    if (!apiStickerPack.url) {
        return null;
    }
    const iconBaseUrl = apiStickerPack.icon?.base_url;
    const iconName = 'square.png';
    const iconUrl = iconBaseUrl ? `${iconBaseUrl}/${iconName}` : undefined;
    const stickerPack = {
        kind: 'StickerPack',
        packId: apiStickerPack.id,
        url: apiStickerPack.url,
        title: apiStickerPack.title,
        subtitle: apiStickerPack.description || '',
        iconUrl,
    };
    return stickerPack;
}
function fromApiMarket(apiMarket) {
    return {
        kind: 'Market',
        id: apiMarket.id,
        ownerId: apiMarket.owner_id,
        isService: !!apiMarket.is_price_list_service,
        title: apiMarket.title,
        price: apiMarket.price.text,
        priceOld: apiMarket.price.old_amount_text,
        photo: apiMarket.thumb_photo,
    };
}
function fromApiMarketAlbum(apiMarketAlbum) {
    const sizes = apiMarketAlbum.photo?.sizes
        ? fromApiPhotoSizes(apiMarketAlbum.photo.sizes)
        : undefined;
    return {
        kind: 'MarketAlbum',
        id: apiMarketAlbum.id,
        ownerId: apiMarketAlbum.owner_id,
        title: apiMarketAlbum.title,
        count: apiMarketAlbum.count,
        image: sizes,
        isMain: apiMarketAlbum.is_main,
        isHidden: apiMarketAlbum.is_hidden,
    };
}
export function fromApiDoc(apiDoc) {
    if (!apiDoc.url) {
        return;
    }
    const previewPhotos = !!apiDoc.preview?.photo?.sizes?.length &&
        fromApiPhotoSizes(
        // DocsDocPreviewPhotoSizes[] => PhotosPhotoSizes[]
        apiDoc.preview.photo.sizes.map((docPreviewPhotoSize) => ({
            ...docPreviewPhotoSize,
            url: docPreviewPhotoSize.src,
        })));
    return {
        kind: 'Doc',
        id: apiDoc.id,
        ownerId: apiDoc.owner_id,
        accessKey: apiDoc.access_key,
        title: apiDoc.title,
        size: apiDoc.size,
        ext: apiDoc.ext,
        type: getDocumentType(apiDoc.ext, apiDoc.type),
        date: apiDoc.date,
        url: apiDoc.url,
        isUnsafe: Boolean(apiDoc.is_unsafe),
        ...(previewPhotos && { image: previewPhotos }),
    };
}
const getDocumentType = (extension, type) => {
    switch (extension) {
        case 'csv':
        case 'dat':
        case 'ecsv':
        case 'ods':
        case 'tsv':
        case 'xar':
        case 'xl':
        case 'xlr':
        case 'xls':
        case 'xlsb':
        case 'xlsm':
        case 'xlsx':
        case 'xlt':
        case 'xltm':
        case 'xltx':
        case 'xlw':
            return 'spreadsheet';
        case 'ppt':
        case 'ppta':
        case 'pptm':
        case 'pptx':
            return 'default';
        default:
            switch (type) {
                case 1:
                    return 'text';
                case 2:
                    return 'archive';
                case 3:
                    return 'gif';
                case 4:
                    return 'image';
                case 5:
                    return 'audio';
                case 6:
                    return 'video';
                case 7:
                    return 'ebook';
                case 8:
                default:
                    return 'default';
            }
    }
};
function fromApiMediaRestriction(apiRestriction) {
    return {
        title: apiRestriction.title,
        alwaysShown: Boolean(apiRestriction.always_shown),
        button: apiRestriction.button,
        canPlay: Boolean(apiRestriction.can_play),
        canPreview: Boolean(apiRestriction.can_preview),
        cardIcon: apiRestriction.card_icon,
        disclaimerType: apiRestriction.disclaimer_type,
        isBlur: Boolean(apiRestriction.blur),
        listIcon: apiRestriction.list_icon,
        iconName: apiRestriction.icon_name,
        text: apiRestriction.text,
    };
}
export function fromApiPhoto({ apiPhoto, messageAccessKey, position, }) {
    if (!apiPhoto.sizes) {
        return;
    }
    return {
        kind: 'Photo',
        accessKey: apiPhoto.access_key,
        albumId: apiPhoto.album_id,
        id: apiPhoto.id,
        ownerId: apiPhoto.owner_id,
        hasTags: apiPhoto.has_tags,
        thumbhashUrl: apiPhoto.thumb_hash &&
            thumbHashToDataURL(Uint8Array.from(atob(apiPhoto.thumb_hash), (c) => c.charCodeAt(0))),
        sizes: fromApiPhotoSizes(apiPhoto.sizes),
        // Берем бейзурл из оригинала, возможно, для этого сделают отдельное поле
        photo: fromApiPicture({
            baseUrl: apiPhoto.orig_photo?.url,
            thumbhashUrl: apiPhoto.thumb_hash,
        }),
        originalImage: apiPhoto.orig_photo?.url,
        messageAccessKey,
        uploadDate: apiPhoto.date * 1000,
        vkcomWebViewToken: apiPhoto.web_view_token,
        restriction: apiPhoto.restrictions
            ? fromApiMediaRestriction(apiPhoto.restrictions)
            : undefined,
        ...(position && { position }),
    };
}
export function fromApiVideo({ apiVideo, messageAccessKey, position, useFirstFrame, }) {
    if (!apiVideo.id || !apiVideo.owner_id) {
        return;
    }
    const image = apiVideo.type === 'short_video' || useFirstFrame
        ? apiVideo.first_frame
        : apiVideo.image;
    let coownerPeerIds;
    if ('short_video_info' in apiVideo) {
        coownerPeerIds =
            apiVideo.short_video_info &&
                getCoownerPeerIds(apiVideo.short_video_info?.co_owners);
    }
    const videoPreviewSizes = fromApiVideoImage(
    /* если не пришло изображение, вероятно видео удалено,
     * поэтому добавляем пустую заглушку чтобы отобразить
     * черный фон для видео, а не пустое сообщение
     */
    image || [{ url: emptyPreview, height: 1, width: 1 }]);
    if (!videoPreviewSizes) {
        return;
    }
    return {
        kind: 'Video',
        accessKey: apiVideo.access_key,
        id: apiVideo.id,
        ownerId: apiVideo.owner_id,
        coownerPeerIds,
        duration: apiVideo.duration,
        width: apiVideo.width,
        height: apiVideo.height,
        image: videoPreviewSizes,
        title: apiVideo.title,
        views: apiVideo.views || 0,
        restriction: apiVideo.restriction
            ? fromApiMediaRestriction(apiVideo.restriction)
            : undefined,
        files: 'files' in apiVideo ? apiVideo.files : undefined,
        type: apiVideo.type,
        messageAccessKey,
        player: apiVideo.player,
        platform: apiVideo.platform,
        canDownload: apiVideo.can_download,
        canComment: apiVideo.can_comment,
        uploadDate: apiVideo.date && apiVideo.date * 1000,
        addingDate: apiVideo.adding_date && apiVideo.adding_date * 1000,
        isFromMessage: Boolean(apiVideo.is_from_message) || false,
        mainArtists: apiVideo.main_artists?.map((apiArtist) => fromApiArtist(apiArtist)),
        timelineThumbs: 'timeline_thumbs' in apiVideo
            ? convertTimelineThumbs(apiVideo.timeline_thumbs)
            : undefined,
        videoEpisode: 'episodes' in apiVideo ? convertEpisods(apiVideo.episodes) : undefined,
        oneVideoId: apiVideo.ov_id || '',
        trackCode: apiVideo.track_code || '',
        videoIdFull: `${apiVideo.owner_id}_${apiVideo.id}`,
        liveStartTime: apiVideo.live_start_time,
        liveStatus: apiVideo.live_status,
        ...(position && { position }),
    };
}
function convertEpisods(apiEpisods) {
    if (!apiEpisods) {
        return undefined;
    }
    return apiEpisods.map((episod) => {
        return {
            time: episod.time || 0,
            text: episod.text || '',
        };
    });
}
function convertTimelineThumbs(apiTimelineThumbs) {
    if (!apiTimelineThumbs) {
        return undefined;
    }
    return {
        countPerImage: apiTimelineThumbs.count_per_image || 0,
        countPerRow: apiTimelineThumbs.count_per_row || 0,
        countTotal: apiTimelineThumbs.count_total || 0,
        frameHeight: apiTimelineThumbs.frame_height || 0,
        frameWidth: apiTimelineThumbs.frame_width || 0,
        frequency: apiTimelineThumbs.frequency || 0,
        isUV: apiTimelineThumbs.is_uv || false,
        links: apiTimelineThumbs.links || [],
    };
}
function fromApiStory(apiStory) {
    return {
        kind: 'Story',
        id: apiStory.id,
        ownerId: apiStory.owner_id,
        date: typeof apiStory.date !== 'undefined' ? apiStory.date * 1000 : undefined,
        restricted: !!apiStory.is_restricted,
        expired: !!apiStory.is_expired,
        expiresAt: typeof apiStory.expires_at !== 'undefined'
            ? apiStory.expires_at * 1000
            : undefined,
        available: !!apiStory.can_see,
        narrativesCount: apiStory.narratives_count,
        photo: apiStory.photo && fromApiPhoto({ apiPhoto: apiStory.photo }),
        video: apiStory.video && fromApiVideo({ apiVideo: apiStory.video }),
    };
}
function fromApiArticle(apiArticle) {
    let state;
    switch (apiArticle.state) {
        case 'available':
        case 'banned':
        case 'deleted':
        case 'paid':
        case 'protected':
            state = apiArticle.state;
            break;
        case undefined:
            state = 'unknown';
            break;
        default:
            /**
             * По дефолту будем возвращать unknown,
             * чтобы если вдруг список расширится,
             * для нас это не стало брейкинг чейнджем.
             *
             * Но все равно проверим на экзостивнесс, чтобы
             * получать ошибки компиляции.
             */
            const _typeguard = apiArticle.state;
            state = 'unknown';
    }
    let image;
    if (apiArticle.photo) {
        image = fromApiPhotoSizes(apiArticle.photo.sizes || []);
    }
    else if (apiArticle.owner_photo) {
        image = fromApiPhotoSizes([
            {
                type: 'o',
                width: 0,
                height: 0,
                url: apiArticle.owner_photo,
            },
        ]);
    }
    return {
        kind: 'Article',
        id: apiArticle.id || 0,
        ownerId: apiArticle.owner_id || 0,
        state,
        url: apiArticle.url || '',
        viewUrl: apiArticle.view_url,
        title: apiArticle.title || '',
        author: apiArticle.owner_name || '',
        meta: apiArticle.subtitle || '',
        image,
        accessKey: apiArticle.access_key || '',
    };
}
const PREVIEW_SIZES = {
    /**
     * Возможные размеры превью подарков
     */
    thumb: [48, 96, 256, 512],
    /**
     * Возможные размеры превью плейлистов
     */
    photo: [34, 68, 135, 270, 300, 600, 1200],
    /**
     * Фолбек
     */
    unknown: [],
};
function fromApiPreviews(apiAttach, key) {
    if (!apiAttach) {
        return;
    }
    const [head, ...tail] = PREVIEW_SIZES[key].reduce((acc, it) => {
        const image = apiAttach[`${key}_${it}`];
        if (!image) {
            return acc;
        }
        acc.push({
            url: image,
            width: it,
            height: it,
        });
        return acc;
    }, []);
    return head ? [head, ...tail] : undefined;
}
function fromApiGift(apiGift) {
    const image = fromApiPreviews(apiGift, 'thumb');
    if (!image) {
        return;
    }
    return {
        kind: 'Gift',
        id: apiGift.id,
        type: apiGift.type,
        isStickerPack: !!apiGift.stickers_product_id,
        isStickerStyle: !!apiGift.is_stickers_style,
        image,
        randomStickerPackAttemptId: apiGift.random_sticker_pack_attempt_id,
        animation: apiGift.animation,
        backgrounds: apiGift.backgrounds,
        rarity: apiGift.rarity,
        status: apiGift.image_status,
        statusPack: apiGift.image_status_pack,
    };
}
function fromApiEvent(apiEvent) {
    return {
        kind: 'Event',
        id: Peer.resolveRealId('Group', apiEvent.id),
        text: apiEvent.text,
        time: apiEvent.time && apiEvent.time * 1000,
        address: apiEvent.address,
        isFavorite: apiEvent.is_favorite,
    };
}
export function fromApiAudio(apiAudio) {
    return {
        kind: 'Audio',
        id: apiAudio.id,
        ownerId: apiAudio.owner_id,
        artist: apiAudio.artist,
        title: apiAudio.title,
        subtitle: apiAudio.subtitle,
        url: apiAudio.url,
        duration: apiAudio.duration,
        albumId: apiAudio.album_id,
        trackCode: apiAudio.track_code,
        contentRestricted: apiAudio.content_restricted,
        albumPartNumber: apiAudio.album_part_number,
        thumb: apiAudio.album?.thumb,
        isExplicit: apiAudio?.is_explicit,
        accessKey: apiAudio.access_key,
        rightholderMarks: apiAudio.rightholder_marks,
    };
}
export function fromApiVoice(apiVoice) {
    return {
        kind: 'Voice',
        duration: apiVoice.duration,
        id: apiVoice.id,
        linkMp3: apiVoice.link_mp3,
        linkOgg: apiVoice.link_ogg,
        ownerId: apiVoice.owner_id,
        waveform: apiVoice.waveform,
        isTranscriptPossible: apiVoice.duration / 60 / 60 < 1,
        transcription: fromApiVoiceTranscription(apiVoice),
    };
}
function fromApiVoiceTranscription(apiVoice) {
    switch (apiVoice.transcript_state) {
        case 'done': {
            return {
                state: 'done',
                text: apiVoice.transcript?.trim(),
                updatedAt: apiVoice.transcript_update_time
                    ? apiVoice.transcript_update_time * 1000
                    : undefined,
            };
        }
        case 'error':
        case 'in_progress': {
            return {
                state: apiVoice.transcript_state,
            };
        }
        case undefined: {
            return;
        }
        default:
            const _typeguard = apiVoice.transcript_state;
            return;
    }
}
/**
 * Типы плейлистов.
 * Мы пока обрабатываем только альбомы и плейлисты
 */
const PLAYLIST_TYPE_FROM_API_TYPE = {
    generated: 'playlist',
    album: 'album',
    ugc: 'playlist',
    chat: 'playlist',
};
export function fromApiAudioPlaylist(apiAudioPlaylist) {
    return {
        kind: 'AudioPlaylist',
        id: apiAudioPlaylist.id,
        ownerId: apiAudioPlaylist.owner_id,
        type: PLAYLIST_TYPE_FROM_API_TYPE[apiAudioPlaylist.type],
        title: apiAudioPlaylist.title,
        count: apiAudioPlaylist.count,
        accessKey: apiAudioPlaylist.access_key,
        plays: apiAudioPlaylist.plays,
        year: apiAudioPlaylist.year,
        photo: apiAudioPlaylist.photo,
        thumbs: apiAudioPlaylist.thumbs,
        mainArtists: apiAudioPlaylist.main_artists?.map((apiArtist) => fromApiArtist(apiArtist)),
        featuredArtists: apiAudioPlaylist.featured_artists?.map((apiArtist) => fromApiArtist(apiArtist)),
        audios: apiAudioPlaylist.audios?.map((apiAudio) => fromApiAudio(apiAudio)),
    };
}
export function fromApiArtist(apiArtist, apiArtistAudios) {
    return {
        kind: 'Artist',
        id: apiArtist.id,
        blockId: apiArtist.popular_audios_block_id,
        name: apiArtist.name,
        photo: apiArtist.photo,
        domain: apiArtist.domain,
        audios: apiArtistAudios?.map((apiAudio) => fromApiAudio(apiAudio)),
    };
}
export function fromApiPodcast(apiPodcast) {
    const sizes = apiPodcast.podcast_info?.cover?.sizes;
    const images = sizes && fromApiPhotoSizes(sizes).values();
    const image = (images && toNonEmpty([...images])) || undefined;
    return {
        kind: 'Podcast',
        id: apiPodcast.id,
        ownerId: apiPodcast.owner_id,
        title: apiPodcast.title,
        image,
    };
}
export function fromApiMoneyTransfer(apiMoneyTransfer) {
    if (!apiMoneyTransfer.amount) {
        return;
    }
    return {
        kind: 'MoneyTransfer',
        id: apiMoneyTransfer.id,
        toId: Peer.resolveId(apiMoneyTransfer.to_id),
        fromId: Peer.resolveId(apiMoneyTransfer.from_id),
        amount: +apiMoneyTransfer.amount.amount / 100,
        currencySign: apiMoneyTransfer.amount.currency.title,
    };
}
export function fromApiMoneyRequest(apiMoneyRequest) {
    const moneyAmountToNumber = (amount) => !!amount && !isNaN(Number(amount)) ? +amount / 100 : undefined;
    const urlSearchParams = new URLSearchParams(apiMoneyRequest.init_url);
    return {
        kind: 'MoneyRequest',
        id: apiMoneyRequest.id,
        toId: Peer.resolveId(apiMoneyRequest.to_id),
        fromId: Peer.resolveId(apiMoneyRequest.from_id),
        isUserOwner: Boolean(apiMoneyRequest.user_is_owner),
        amount: +apiMoneyRequest.amount.amount / 100,
        totalAmount: moneyAmountToNumber(apiMoneyRequest.total_amount?.amount),
        transferredAmount: moneyAmountToNumber(apiMoneyRequest.transferred_amount?.amount),
        userCount: apiMoneyRequest.users_count,
        currencyCode: apiMoneyRequest.amount.currency.name,
        currencySign: apiMoneyRequest.amount.currency.title,
        hash: urlSearchParams.get('hash') || undefined,
    };
}
function fromApiPhotoSizes(sizes) {
    return (sizes
        /**
         * Сортировка нужна для последующего поиска наименьшего подходящего изображения
         * См. Attach.photoSize()
         */
        .sort((a, b) => {
        return a.width - b.width;
    })
        .reduce((acc, { type, src, url, ...data }) => {
        if (url !== undefined &&
            (type === 's' ||
                type === 'm' ||
                type === 'x' ||
                type === 'o' ||
                type === 'p' ||
                type === 'q' ||
                type === 'r' ||
                type === 'y' ||
                type === 'z' ||
                type === 'w')) {
            if (data.width && data.height) {
                acc.set(type, { url, ...data });
            }
            else {
                // Фолбек на случай, когда АПИ возвращает нулевые размеры
                acc.set(type, {
                    ...data,
                    url,
                    width: DEFAULT_PHOTO_SIZE,
                    height: DEFAULT_PHOTO_SIZE,
                });
            }
        }
        return acc;
    }, new Map()));
}
function fromApiVideoImage(videoImage) {
    const videoPreviewSizes = videoImage
        /**
         * Сортировка нужна для последующего поиска наименьшего подходящего изображения
         * См. Attach.photoSize()
         */
        .sort((a, b) => a.width - b.width)
        .map((preview) => ({
        width: preview.width,
        height: preview.height,
        url: preview.url,
        isBase: preview.is_base,
    }));
    const [head, ...tail] = videoPreviewSizes;
    if (!head) {
        return;
    }
    return [head, ...tail];
}
function fromApiVideoMessageImage(videoImage) {
    const videoPreviewSizes = videoImage
        /**
         * Для видеосообщений нам нужны только квадратные превью(как и сами видео),
         * а в списке превью могут попадаться широкоформатные с черными полосами по бокам
         * Поэтому обрабатываем видеосообщения отдельно и берём только квадратные картинки.
         * Сравнивать width === height не стоит, в ЛП бэк врёт о размере картинок
         */
        .filter((image) => !image.with_padding)
        /**
         * Сортировка нужна для последующего поиска наименьшего подходящего изображения
         * См. Attach.photoSize()
         */
        .sort((a, b) => a.width - b.width)
        .map((preview) => ({
        width: preview.width,
        height: preview.height,
        url: preview.url,
    }));
    const [head, ...tail] = videoPreviewSizes;
    if (!head) {
        return;
    }
    return [head, ...tail];
}
function fromApiCallCoverList(apiActiveCall) {
    const participantList = apiActiveCall.participants?.list;
    if (!participantList) {
        return [];
    }
    const list = participantList.reduce((acc, id) => {
        const peerId = Peer.resolveAnyId(id);
        if (Peer.isUserPeerId(peerId) || Peer.isGroupPeerId(peerId)) {
            acc.push(peerId);
        }
        return acc;
    }, []);
    return list.slice(0, 3);
}
function fromApiActiveCall(apiActiveCall) {
    return {
        kind: 'ActiveCall',
        initiatorId: apiActiveCall.initiator_id,
        joinLink: apiActiveCall.join_link,
        vkJoinLink: apiActiveCall.vk_join_link,
        participants: {
            list: apiActiveCall.participants.list?.map(Peer.resolveId),
            count: apiActiveCall.participants.count || 0,
            coverList: fromApiCallCoverList(apiActiveCall),
        },
    };
}
function fromApiFinishedCall(apiCall) {
    const callState = fromApiCallState(apiCall);
    if (!callState) {
        return;
    }
    return {
        kind: 'FinishedCall',
        initiatorId: apiCall.initiator_id,
        duration: apiCall.duration,
        state: callState,
        participants: {
            list: apiCall.participants?.list?.map(Peer.resolveId),
            count: apiCall.participants?.count || 0,
            coverList: fromApiCallCoverList(apiCall),
        },
    };
}
function fromApiCallState(apiCall) {
    switch (apiCall.state) {
        case 'reached':
            return 'reached';
        case 'canceled_by_initiator':
            return 'canceledByInitiator';
        case 'canceled_by_receiver':
            return 'canceledByReceiver';
        default:
            return;
    }
}
function fromApiMiniApp(apiMiniApp) {
    if (!apiMiniApp.app || !apiMiniApp.app.share_url) {
        return;
    }
    const images = toNonEmpty(apiMiniApp.images.map(({ url, height, width }) => {
        return {
            width,
            height,
            url,
        };
    }));
    if (!images) {
        return;
    }
    images.sort((a, b) => a.width - b.width);
    /**
     * Пока мы открываем миниаппы через ссылку на веб мессенджер.
     * В этой ссылке нам нужен только айдишник приложения вида app1234.
     * Пока самый простой способ его получить - отрезав хостнейм от ссылки.
     */
    const appLink = apiMiniApp.app.share_url.replace(/https:\/\/[a-z0-9_\-.]+\//, '');
    /**
     * Отрезаем хеш от appLink, чтобы прокинуть в линку для аттача.
     * Здесь нельзя использовать URL() constructor, так как в share_url может быть не валидный URL (например "://vk.me/app7582168?ref=snippet_im#ref=2")
     * https://sentry.mvk.com/organizations/vkcom/issues/26967267/
     */
    const hash = appLink.split('#').slice(1).join('#');
    return {
        kind: 'MiniApp',
        title: apiMiniApp.title,
        appLink,
        images,
        id: Attach.resolveMiniAppId(apiMiniApp.app.id),
        url: apiMiniApp.app.webview_url,
        shareUrl: apiMiniApp.app.share_url,
        hash,
        type: apiMiniApp.app.type,
        status: Attach.resolveMiniAppStatus(apiMiniApp.app.app_status),
        description: apiMiniApp.description,
        buttonText: apiMiniApp.button_text,
    };
}
function fromApiMiniAppWidgetFooterUser(miniAppWidgetFooterUser) {
    const { object_id, items } = miniAppWidgetFooterUser;
    if (!object_id || !items || items.length === 0) {
        return;
    }
    return {
        id: object_id,
        icon50: items[0]?.url || '',
    };
}
function fromApiMiniAppWidgetFooterUsers(apiMiniAppWidgetFooterUsers) {
    const users = [];
    apiMiniAppWidgetFooterUsers.forEach((apiFooterUser) => {
        const widgetFooterUser = fromApiMiniAppWidgetFooterUser(apiFooterUser);
        if (widgetFooterUser) {
            users.push(widgetFooterUser);
        }
    });
    return users;
}
function fromApiMiniAppWidget(apiMiniAppWidget) {
    const { type, title, icons, description, footer, button_text, application } = apiMiniAppWidget;
    if (!application || !application.webview_url || icons.length === 0) {
        return;
    }
    const images = icons.reduce((obj, { width, url }) => ({
        ...obj,
        [`icon${width}`]: url || '',
    }), { icon75: icons[0]?.url || '' });
    const app = {
        ...images,
        id: Attach.resolveMiniAppId(application.id),
        title: application.title,
        webviewUrl: application.webview_url,
    };
    const widgetFooter = footer
        ? {
            description: footer.description,
            items: footer.items
                ? fromApiMiniAppWidgetFooterUsers(footer.items)
                : [],
        }
        : null;
    const appUrl = new URL(app.webviewUrl);
    const possibleQueryParams = ['vk_chat_id', 'vk_message_id', 'vk_ref'];
    const hash = appUrl.hash ?? '';
    let appLink = `app${app.id}?`;
    let messageId = 0;
    possibleQueryParams.forEach((queryParam) => {
        const queryParamValue = appUrl.searchParams.get(queryParam);
        if (queryParam === 'vk_message_id') {
            messageId = Number(queryParamValue || 0);
        }
        if (queryParamValue) {
            appLink = `${appLink}${queryParam}=${queryParamValue}`;
        }
    });
    return {
        kind: 'MiniAppWidget',
        type,
        title,
        description,
        buttonText: button_text,
        app,
        appLink,
        hash,
        cmid: Message.resolveCmid(messageId),
        footer: widgetFooter ? widgetFooter : undefined,
    };
}
function fromApiDonutLink(apiDonutLink) {
    const ownerId = Peer.resolveId(apiDonutLink.owner_id);
    if (!Peer.isGroupPeerId(ownerId)) {
        return;
    }
    if (!apiDonutLink.action?.url ||
        !apiDonutLink.button.action?.url ||
        !apiDonutLink.button.title) {
        return;
    }
    return {
        kind: 'DonutLink',
        ownerId,
        button: {
            action: {
                target: 'internal',
                type: 'open_url',
                url: apiDonutLink.button.action.url,
            },
            title: apiDonutLink.button.title,
        },
        donorsCount: apiDonutLink.donors.count,
        text: apiDonutLink.text,
        action: {
            target: 'internal',
            type: 'open_url',
            url: apiDonutLink.action.url,
        },
    };
}
export function fromApiPoll(apiPoll) {
    return {
        kind: 'Poll',
        id: apiPoll.id,
        ownerId: Peer.resolveId(apiPoll.owner_id),
        authorId: apiPoll.author_id !== undefined
            ? Peer.resolveId(apiPoll.author_id)
            : Peer.resolveId(apiPoll.owner_id),
        title: apiPoll.question,
        anonymous: !!apiPoll.anonymous,
        endDate: apiPoll.end_date * 1000,
        answers: apiPoll.answers.map((answer) => ({
            id: answer.id,
            text: answer.text,
            votes: answer.votes,
            rate: answer.rate,
            selected: !!apiPoll.answer_ids?.includes(answer.id),
        })),
        voted: !!apiPoll.answer_ids?.length,
        canVote: apiPoll.can_vote,
        canChangeVote: !apiPoll.disable_unvote,
        canEdit: apiPoll.can_edit,
        multiple: apiPoll.multiple,
        votes: apiPoll.votes,
        friends: apiPoll.friends?.map((user) => Peer.resolveId(user.id)) || [],
        backgroundGradient: fromApiPollBackgroundGradient(apiPoll.background),
        backgroundPhoto: fromApiPollBackgroundPhoto(apiPoll.photo),
    };
}
export function fromApiPollBackgroundGradient(background) {
    if (!background || background.type !== 'gradient') {
        return;
    }
    const { points, angle } = background;
    if (points === undefined || angle === undefined) {
        return;
    }
    return {
        id: background.id || 0,
        points: points.map((point) => '#' + point.color),
        angle,
    };
}
function fromApiPollBackgroundPhoto(photo) {
    if (!photo || !photo.color || !photo.images) {
        return;
    }
    const images = toNonEmpty(photo.images.map((image) => ({
        url: image.url,
        width: image.width,
        height: image.height,
    })));
    if (!images) {
        return;
    }
    return {
        kind: 'PollBackgroundPhoto',
        image: images,
        color: '#' + photo.color,
    };
}
export function apiAttachWallOwnerId({ owner_id, source_id, to_id, }) {
    return owner_id ?? source_id ?? to_id;
}
export function fromApiVideoMessage(apiVideoMessage) {
    if (!apiVideoMessage.id || !apiVideoMessage.owner_id) {
        return;
    }
    const videoPreviewSizes = fromApiVideoMessageImage(
    /* если не пришло изображение, вероятно видео удалено,
            поэтому добавляем пустую заглушку чтобы отобразить черный фон для видео, а не пустое сообщение */
    apiVideoMessage.image || [{ url: '', height: 0, width: 0 }]);
    if (!videoPreviewSizes) {
        return;
    }
    return {
        kind: 'VideoMessage',
        id: apiVideoMessage.id,
        ownerId: apiVideoMessage.owner_id,
        duration: apiVideoMessage.duration,
        shapeId: apiVideoMessage.shape_id || UNKNOWN_SHAPE_ID,
        image: videoPreviewSizes,
        files: apiVideoMessage.files,
        transcription: fromApiVideoMessageTranscription(apiVideoMessage),
    };
}
function fromApiVideoMessageTranscription(apiVideoMessage) {
    switch (apiVideoMessage.transcript_state) {
        case 'done': {
            return {
                state: 'done',
                text: apiVideoMessage.transcript?.trim(),
                updatedAt: apiVideoMessage.transcript_update_time
                    ? apiVideoMessage.transcript_update_time * 1000
                    : undefined,
            };
        }
        case 'error':
        case 'in_progress':
        case 'uninitialized': {
            return {
                state: apiVideoMessage.transcript_state,
            };
        }
        case undefined: {
            return;
        }
        default:
            exhaustivenessCheck(apiVideoMessage.transcript_state);
    }
}
function fromApiWidget(apiWidget) {
    if (!apiWidget.item.widget_id) {
        return;
    }
    return {
        kind: 'Widget',
        id: apiWidget.item.widget_id,
        data: apiWidget,
    };
}
function fromApiNarrative(apiNarrative) {
    const images = (apiNarrative.cover?.cropped_sizes &&
        toNonEmpty(apiNarrative.cover.cropped_sizes.map((image) => ({
            url: image.url,
            width: image.width,
            height: image.height,
        })))) ||
        undefined;
    return {
        kind: 'Narrative',
        id: apiNarrative.id,
        title: apiNarrative.title,
        ownerId: Peer.resolveId(apiNarrative.owner_id),
        isDeleted: apiNarrative.is_delete,
        isFavorite: apiNarrative.is_favorite,
        canSee: apiNarrative.can_see,
        storyIds: apiNarrative.story_ids,
        image: images,
    };
}
function fromApiQuestion(apiQuestion) {
    return {
        kind: 'Question',
        id: apiQuestion.id,
        question: apiQuestion.question,
        url: apiQuestion.url || '#',
        ownerId: Peer.resolveId(apiQuestion.owner_id),
    };
}
function fromApiAlbum(apiAlbum) {
    const sizes = apiAlbum.thumb?.sizes
        ? fromApiPhotoSizes(apiAlbum.thumb.sizes)
        : undefined;
    return {
        kind: 'Album',
        id: apiAlbum.id,
        ownerId: Peer.resolveId(apiAlbum.owner_id),
        created: apiAlbum.created,
        description: apiAlbum.description,
        size: apiAlbum.size,
        image: sizes,
        title: apiAlbum.title,
        updated: apiAlbum.updated,
    };
}
function fromApiCurator(
// обязательно url, так как мы не умеем самостоятельно обрабатывать этот аттач
apiCurator) {
    return {
        kind: 'Curator',
        id: apiCurator.id,
        url: apiCurator.url,
        title: apiCurator.name,
        subtitle: apiCurator.description,
        image: apiCurator.photo,
    };
}
function fromApiChannelStubPhoto(apiChannelStub) {
    if (apiChannelStub.type !== 'photo' ||
        !apiChannelStub.height ||
        !apiChannelStub.width) {
        return undefined;
    }
    return {
        kind: 'ChannelStubPhoto',
        height: apiChannelStub.height,
        width: apiChannelStub.width,
    };
}
function fromApiChannelStubVideo(apiChannelStub) {
    if (apiChannelStub.type !== 'video' ||
        !apiChannelStub.height ||
        !apiChannelStub.width) {
        return undefined;
    }
    return {
        kind: 'ChannelStubVideo',
        height: apiChannelStub.height,
        width: apiChannelStub.width,
    };
}
function fromApiChannelStubAudio(apiChannelStub) {
    if (apiChannelStub.type !== 'audio' ||
        !apiChannelStub.title ||
        !apiChannelStub.artist) {
        return undefined;
    }
    return {
        kind: 'ChannelStubAudio',
        title: apiChannelStub.title,
        artist: apiChannelStub.artist,
    };
}
function fromApiChannelStubDoc(apiChannelStub) {
    if (apiChannelStub.type !== 'doc') {
        return undefined;
    }
    const sizes = apiChannelStub.height && apiChannelStub.width
        ? { height: apiChannelStub.height, width: apiChannelStub.width }
        : {};
    return {
        kind: 'ChannelStubDoc',
        title: apiChannelStub.title,
        size: apiChannelStub.size,
        ext: apiChannelStub.ext,
        ...sizes,
    };
}
//# sourceMappingURL=AttachConverter.js.map