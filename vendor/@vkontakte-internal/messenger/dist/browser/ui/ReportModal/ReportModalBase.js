import './ReportModal.css';
import React from 'react';
import { useBrowserEnv, usePeers, useUrlFromBaseUrl, useViewer, } from '../../hooks/misc';
import * as Peer from '../../../core/model/Peer';
import * as Attach from '../../../core/model/Attach';
import * as Viewer from '../../../core/model/Viewer';
import { PeerTitle } from '../../ui/PeerTitle/PeerTitle';
import { Emoji } from '../../ui/Emoji/Emoji';
import { exhaustivenessCheck } from '../../../core/utils/misc';
import { getAttachText } from '../../ui/AttachText/AttachText';
import { ExternalLink } from '../../ui/Link/Link';
import { ContentSnippet, SpacedList } from '@vkontakte-internal/vkcom-kit';
import { Cell, RadioGroup, Radio } from '@vkontakte/vkui';
import { ModalInterface } from '../../ui/ModalInterface/ModalInterface';
import { Icon24ChevronCompactLeft, Icon24ChevronCompactRight, } from '@vkontakte/icons';
import { CodeBlock } from '../../ui/CodeBlock/CodeBlock';
import { useNow } from '../../hooks/useNow';
export const ReportModal = ({ header, subHeader, preview, list, level = 0, footer, buttons, onClose, onBack, }) => {
    const { lang } = useBrowserEnv();
    const getTitle = () => {
        if (!level) {
            return lang.use('me_report_channel_post_modal_title');
        }
        return (React.createElement("button", { "aria-label": lang.use('me_report_channel_post_modal_back'), className: "ReportModal__backButton", onClick: onBack },
            React.createElement(Icon24ChevronCompactLeft, { className: "ReportModal__backButtonIcon" }),
            React.createElement("span", { className: "ReportModal__backButtonText" }, lang.use('me_report_channel_post_modal_back'))));
    };
    return (React.createElement(ModalInterface, { contextClass: "MEConfig", panelClass: "ReportModal", title: getTitle(), closeLabel: lang.use('me_close'), onClose: onClose, buttons: buttons, withCustomLayout: true },
        React.createElement("div", { className: "ReportModal__wrapper" },
            preview,
            header && React.createElement("span", { className: "ReportModal__header" }, header),
            subHeader && (React.createElement("span", { className: "ReportModal__subHeader" }, subHeader)),
            list,
            footer)));
};
const ATTACH_PREVIEW_SIZE = 64;
export const ReportContentPreview = ({ chunks, peerId, attaches, date, }) => {
    const { lang } = useBrowserEnv();
    const now = useNow();
    const peers = usePeers();
    const peer = Peer.safeGet(peers, peerId);
    const photoUrl = useUrlFromBaseUrl(peer.photo, 24, 24);
    const attachByKey = Object.values(attaches)[0];
    const attach = Array.isArray(attachByKey) ? attachByKey[0] : attachByKey;
    const hasAttach = !!attach;
    let attachCanPlay = false;
    let attachType = undefined;
    let attachPreviewUrl = undefined;
    if (attach) {
        switch (attach.kind) {
            case 'Photo': {
                attachType = 'photo';
                attachPreviewUrl = getMediaPreviewSrc(attach, ATTACH_PREVIEW_SIZE);
                break;
            }
            case 'Video': {
                attachType = 'video';
                attachCanPlay = true;
                attachPreviewUrl = getMediaPreviewSrc(attach, ATTACH_PREVIEW_SIZE);
                break;
            }
            case 'Doc': {
                break;
            }
            case 'Poll': {
                attachType = 'poll';
                break;
            }
            case 'Article': {
                attachType = 'article';
                break;
            }
            case 'Audio': {
                attachType = 'audio';
                break;
            }
            case 'AudioPlaylist': {
                break;
            }
            case 'Geo': {
                break;
            }
            case 'Link': {
                attachType = 'link';
                break;
            }
            case 'MiniApp': {
                attachType = 'app';
                break;
            }
            case 'Market': {
                attachType = 'market';
                break;
            }
            case 'Podcast': {
                break;
            }
            case 'Sticker': {
                attachType = 'sticker';
                break;
            }
            case 'Wall': {
                attachType = 'wall';
                break;
            }
            case 'WallReply': {
                attachType = 'wall_comment';
                break;
            }
            // Для этих типов аттачей ничего не рендерим
            case 'ActiveCall':
            case 'Artist':
            case 'DonutLink':
            case 'Event':
            case 'FinishedCall':
            case 'Gift':
            case 'Graffiti':
            case 'InviteLink':
            case 'MarketAlbum':
            case 'MoneyRequest':
            case 'MoneyTransfer':
            case 'Narrative':
            case 'Story':
            case 'UgcSticker':
            case 'VideoMessage':
            case 'Voice':
            case 'WallHistory':
            case 'Album':
            case 'Widget':
            case 'Curator':
            case 'MiniAppWidget':
            case 'Question':
            case 'StickerPack':
            case 'ChannelStubPhoto':
            case 'ChannelStubVideo':
            case 'ChannelStubAudio':
            case 'ChannelStubDoc':
            case 'Normal':
            case 'Unknown': {
                break;
            }
            default:
                exhaustivenessCheck(attach);
        }
    }
    return (React.createElement(ContentSnippet, { ownerPhotoUrl: photoUrl, size: 64, text: React.createElement(ReportPreviewText, { chunks: chunks, attaches: attaches }), ownerName: React.createElement(PeerTitle, { className: "ReportContentPreview__peerTitle", peer: peer }), date: lang.use('global_short_date_time', {
            date,
            now,
        }), hasAttach: hasAttach, attachType: attachType, attachPreviewUrl: attachPreviewUrl, attachCanPlay: attachCanPlay }));
};
export const ReportCategoriesList = ({ reasonCategories, onCategorySelect, withChevron, }) => {
    return (React.createElement(SpacedList, { spacing: 2 }, reasonCategories.map((reasonCategory) => (React.createElement(Cell, { key: reasonCategory.label, multiline: true, subtitle: React.createElement("span", { className: "ReportCategoriesList__itemDesc" }, reasonCategory.description), onClick: () => onCategorySelect(reasonCategory), after: withChevron && (React.createElement(Icon24ChevronCompactRight, { className: "ReportCategoriesList__iconChevron" })) },
        React.createElement("span", { className: "ReportCategoriesList__itemTitle" }, reasonCategory.label))))));
};
export const ReportReasonsList = ({ reasons, selectedReasonId, onReasonSelect, }) => {
    return (React.createElement(RadioGroup, null, reasons.map((reason) => (React.createElement(Radio, { key: reason.id, value: reason.id, checked: reason.id === selectedReasonId, description: React.createElement("span", { className: "ReportReasonsList__itemDesc" }, reason.description), onChange: () => onReasonSelect(reason) },
        React.createElement("span", { className: "ReportReasonsList__itemTitle" }, reason.label))))));
};
export const ReportModalFooter = ({ chunks }) => {
    const { profileType } = useViewer();
    const isEdu = Viewer.isEdu(profileType);
    /**
     * Для образовательных профилей не нужно показывать дополнительную информацию со ссылками поскольку
     * они ведут на ВКонтакте из Сферума что недопустимо из соображений позиционирования продукта
     *
     * @see https://jira.mvk.com/browse/ME-55037
     */
    const data = isEdu ? [] : chunks;
    return (React.createElement("div", { className: "ReportModal__footer" }, data.map((chunk, index) => {
        if (chunk.kind === 'Text') {
            return React.createElement(React.Fragment, { key: index }, chunk.text);
        }
        return (React.createElement(ExternalLink, { key: index, href: chunk.href, target: "_blank" }, chunk.caption));
    })));
};
const ReportPreviewText = ({ attaches, chunks, }) => {
    const { lang } = useBrowserEnv();
    const renderText = () => {
        const attachmentKindsCount = Attach.kindsCount(attaches);
        const attachmentsCount = Attach.count(attaches);
        if (chunks.length !== 0) {
            return (React.createElement(React.Fragment, null, chunks.map((chunk, i, self) => {
                switch (chunk.kind) {
                    case 'Text':
                        return React.createElement(React.Fragment, { key: i }, chunk.text);
                    case 'Emoji':
                        return React.createElement(Emoji, { emoji: chunk.text, key: i });
                    case 'Code':
                        return React.createElement(CodeBlock, { code: chunk, key: i });
                    case 'Mention':
                    case 'MassMention':
                    case 'ScreenNameMention':
                        return (React.createElement(React.Fragment, { key: i }, chunk.displayName));
                    case 'Email':
                        return React.createElement(React.Fragment, { key: i }, chunk.email);
                    case 'Url':
                        return React.createElement(React.Fragment, { key: i }, chunk.caption);
                    case 'Hashtag':
                    case 'HashtagMention':
                        const screenName = chunk.kind === 'HashtagMention' ? `@${chunk.screenName}` : '';
                        return (React.createElement(React.Fragment, { key: i },
                            chunk.tag,
                            screenName));
                    case 'LineBreak':
                        return self[i - 1]?.kind === 'LineBreak' ? '' : React.createElement("br", { key: i });
                    default:
                        return exhaustivenessCheck(chunk);
                }
            })));
        }
        if (attachmentsCount === 0) {
            return;
        }
        if (attachmentKindsCount > 1) {
            return lang.use('me_attaches_attaches', {
                num: attachmentsCount,
            });
        }
        const attach = Object.values(attaches)[0];
        if (!attach) {
            return;
        }
        return getAttachText(attach, lang);
    };
    return React.createElement("span", { className: "ReportContentPreview__text" }, renderText());
};
const getMediaPreviewSrc = (attach, targetSize) => {
    let denseSrc;
    switch (attach.kind) {
        case 'Photo': {
            denseSrc = Attach.preview(attach, targetSize * 2, targetSize * 2, true)?.url;
            break;
        }
        case 'Video': {
            denseSrc = Attach.preview(attach, targetSize * 2, targetSize * 2)?.url;
            break;
        }
        default:
            exhaustivenessCheck(attach);
    }
    return denseSrc;
};
//# sourceMappingURL=ReportModalBase.js.map