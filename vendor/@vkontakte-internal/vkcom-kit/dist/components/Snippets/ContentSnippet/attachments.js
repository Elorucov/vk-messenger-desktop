import { Icon24PhotosStackOutline, Icon28ArticleOutline, Icon28CameraOutline, Icon28CommentOutline, Icon28LinkOutline, Icon28LogoClipsOutline, Icon28MarketOutline, Icon28MusicOutline, Icon28NarrativeOutline, Icon28NewsfeedOutline, Icon28PollSquareOutline, Icon28ServicesOutline, Icon28StickerOutline, Icon28StoryOutline, Icon28TextLiveOutline, Icon28VideoOutline, } from '@vkontakte/icons';
import { Icon60UgcChatStickerSquareFillBlue } from '@vkontakte-internal/icons-private';
export function getContentSnippetAttachIcon(type) {
    switch (type) {
        case 'app':
            return Icon28ServicesOutline;
        case 'article':
            return Icon28ArticleOutline;
        case 'audio':
            return Icon28MusicOutline;
        case 'market':
            return Icon28MarketOutline;
        case 'photo':
            return Icon28CameraOutline;
        case 'album':
            return Icon24PhotosStackOutline;
        case 'video':
            return Icon28VideoOutline;
        case 'poll':
        case 'board_poll':
            return Icon28PollSquareOutline;
        case 'story':
            return Icon28StoryOutline;
        case 'narrative':
            return Icon28NarrativeOutline;
        case 'live_comment':
        case 'market_comment':
        case 'photo_comment':
        case 'topic_comment':
        case 'comment':
        case 'video_comment':
        case 'wall_comment':
            return Icon28CommentOutline;
        case 'post':
        case 'situational_post':
        case 'wall':
            return Icon28NewsfeedOutline;
        case 'textlive':
        case 'textpost':
            return Icon28TextLiveOutline;
        case 'link':
            return Icon28LinkOutline;
        case 'sticker':
            return Icon28StickerOutline;
        case 'ugc_sticker_pack':
        case 'ugc_sticker':
            return Icon60UgcChatStickerSquareFillBlue;
        case 'clip':
            return Icon28LogoClipsOutline;
        default:
            return Icon28LinkOutline;
    }
}
//# sourceMappingURL=attachments.js.map