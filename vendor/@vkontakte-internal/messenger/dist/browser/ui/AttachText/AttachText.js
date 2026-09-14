import React from 'react';
import { GIFTS_RANDOM_STICKER_PACK_GIFT_ID } from '../../../core/config/config';
import * as Attach from '../../../core/model/Attach';
import { useBrowserEnv } from '../../hooks/misc';
import { exhaustivenessCheck } from '../../../core/utils/misc';
/**
 * Компонент для вывода конкретного вида аттача текстом
 * Например, «2 фотографии» или «Опрос»
 */
export const AttachText = ({ attach }) => {
    const { lang } = useBrowserEnv();
    const attachText = getAttachText(attach, lang);
    return React.createElement(React.Fragment, null, attachText);
};
export function getAttachText(attach, lang) {
    if (Array.isArray(attach)) {
        switch (attach[0].kind) {
            case 'Photo':
            case 'ChannelStubPhoto':
                return lang.use('me_attaches_photos', {
                    num: attach.length,
                });
            case 'Audio':
            case 'ChannelStubAudio':
                return lang.use('me_attaches_audios', {
                    num: attach.length,
                });
            case 'Video':
                if (attach[0].type === 'short_video') {
                    return lang.use('me_attaches_clips', {
                        num: attach.length,
                    });
                }
                return lang.use('me_attaches_videos', {
                    num: attach.length,
                });
            case 'ChannelStubVideo':
                return lang.use('me_attaches_videos', {
                    num: attach.length,
                });
            case 'Doc':
            case 'ChannelStubDoc':
                return lang.use('me_attaches_docs', {
                    num: attach.length,
                });
            case 'MiniApp':
                if (Attach.isGame(attach[0])) {
                    return lang.use('me_attaches_games', {
                        num: attach.length,
                    });
                }
                return lang.use('me_attaches_miniapps', {
                    num: attach.length,
                });
            case 'MiniAppWidget':
                return `${Attach.isGame(attach[0])
                    ? lang.use('me_fc_add_game')
                    : lang.use('me_fc_add_miniapp')} «${attach[0].title}»`;
            case 'AudioPlaylist':
                if (attach.length === 1) {
                    return lang.use(`me_attaches_audio_playlist_${attach[0].type}`);
                }
                else {
                    return lang.use('me_attaches_audio_playlists', {
                        num: attach.length,
                    });
                }
            case 'Narrative':
                return lang.use('me_attaches_narratives', {
                    num: attach.length,
                });
            case 'Curator':
                return lang.use('me_attaches_curator');
            case 'Unknown':
                return lang.use('me_attaches_unknown');
            default:
                return exhaustivenessCheck(attach[0]);
        }
    }
    else {
        switch (attach.kind) {
            case 'Artist':
                return lang.use('me_attaches_artist');
            case 'Geo':
                return lang.use('me_attaches_geo');
            case 'UgcSticker':
                return lang.use('me_attaches_ugc_sticker');
            case 'Sticker':
                return lang.use('me_attaches_sticker');
            case 'Story':
                return lang.use('me_attaches_story');
            case 'Link':
            case 'InviteLink':
                return lang.use('me_attaches_link');
            case 'Voice':
                return lang.use('me_attaches_audio_message');
            case 'Market':
                return attach.isService
                    ? lang.use('me_attaches_service')
                    : lang.use('me_attaches_market');
            case 'MarketAlbum':
                return lang.use('me_attaches_market_album');
            case 'Gift':
                if (attach.id === GIFTS_RANDOM_STICKER_PACK_GIFT_ID) {
                    return lang.use('me_attaches_gift_random_sticker_pack');
                }
                if (attach.rarity?.title) {
                    return attach.rarity.title;
                }
                if (attach.isStickerPack) {
                    return lang.use('me_attaches_sticker_pack');
                }
                if (attach.type === 'image_status') {
                    return lang.use('me_attaches_gift_image_status');
                }
                if (attach.type === 'image_status_pack') {
                    return lang.use('me_attaches_gift_image_status_pack');
                }
                return lang.use(`me_attaches_gift${attach.isStickerStyle ? '_sticker_style' : ''}`);
            case 'Wall':
            case 'WallHistory':
            case 'Normal':
                return lang.use('me_attaches_wall');
            case 'WallReply':
                return lang.use('me_attaches_wall_reply');
            case 'Article':
                return lang.use('me_attaches_article');
            case 'FinishedCall':
                return lang.use('me_attaches_call');
            case 'Graffiti':
                return lang.use('me_attaches_graffiti');
            case 'Poll':
                return lang.use('me_attaches_poll');
            case 'Podcast':
                return lang.use('me_attaches_podcast');
            case 'MoneyTransfer':
                return lang.use('me_attaches_money_transfer');
            case 'MoneyRequest':
                return attach.userCount !== undefined
                    ? lang.use('me_attaches_money_request_group')
                    : lang.use('me_attaches_money_request');
            case 'ActiveCall':
                return lang.use('me_attaches_call');
            case 'DonutLink':
                return lang.use('me_attaches_donut_link');
            case 'VideoMessage':
                return lang.use('me_attaches_video_message');
            case 'Widget':
                return lang.use('me_attaches_widget');
            case 'Event':
                return lang.use('me_attaches_event');
            case 'Album':
                return lang.use('me_attaches_album');
            case 'Question':
                return lang.use('me_attaches_question');
            case 'StickerPack':
                return lang.use('me_attaches_sticker_pack');
            default:
                return exhaustivenessCheck(attach);
        }
    }
}
//# sourceMappingURL=AttachText.js.map