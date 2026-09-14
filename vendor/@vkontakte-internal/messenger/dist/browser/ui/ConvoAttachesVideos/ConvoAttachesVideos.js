import '../../ui/ConvoAttachesVideos/ConvoAttachesVideos.css';
import React, { useState, useRef, useLayoutEffect, useCallback, useMemo, } from 'react';
import * as Attach from '../../../core/model/Attach';
import * as Peer from '../../../core/model/Peer';
import { exhaustivenessCheck } from '../../../core/utils/misc';
import { useBrowserEnv, usePeers, useViewer } from '../../hooks/misc';
import { Dropdown } from '../../ui/Dropdown/Dropdown';
import { Icon20MessageArrowRightOutline, Icon20More } from '@vkontakte/icons';
import { Link } from '../../ui/Link/Link';
import { ActionsMenu, ActionsMenuAction, } from '../../ui/ActionsMenu/ActionsMenu';
import cx from 'classnames';
import { ContextMenu } from '../../ui/ContextMenu/ContextMenu';
import { useFastActionsState } from '../../hooks/useFastActionsState';
import { getVideoDuration } from '../../utils/attach';
import { useFastActionsTrigger } from '../../hooks/useFastActionsTrigger';
export const ConvoAttachesVideos = ({ videos, goToMessage, }) => {
    const [width, setWidth] = useState(0);
    const { api, lang } = useBrowserEnv();
    const measuredElRef = useRef(null);
    const [deletedVideosIds, setDeletedVideosIds] = useState([]);
    const { viewer } = useViewer();
    useLayoutEffect(() => {
        if (!window.IntersectionObserver) {
            return;
        }
        /* Не реагируем на рендер, если уже измерили ширину,
         * на изменение отреагирует запущенный ранее обзервер */
        if (width !== 0) {
            return;
        }
        if (!measuredElRef.current) {
            return;
        }
        const resizeObserver = new ResizeObserver((entries) => {
            if (entries[0]) {
                setWidth(entries[0].contentRect.width);
            }
            /* По верстке элемент не может иметь нулевую ширину,
             * поэтому считаем, что это срабатывание обзервера
             * на анмануте компонента и отключаем его */
            if (entries[0]?.contentRect.width === 0) {
                resizeObserver.disconnect();
            }
        });
        resizeObserver.observe(measuredElRef.current);
        return () => {
            resizeObserver.disconnect();
        };
        // Нет зависимостей
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const doAction = useCallback((type, video) => {
        switch (type) {
            case 'go_to_message':
                goToMessage(video.cmid);
                break;
            case 'delete_from_own': // api -> video.delete: Сделать возможность вернуть; Удаляет видеозапись со страницы пользователя.
                api
                    .fetch('video.delete', {
                    video_id: video.attach.id,
                    owner_id: video.attach.ownerId,
                    target_id: viewer.id,
                })
                    .then(() => {
                    setDeletedVideosIds((deletedVideosIds) => [
                        ...deletedVideosIds,
                        video.attach.id,
                    ]);
                });
                break;
            case 'restore':
                api
                    .fetch('video.restore', {
                    video_id: video.attach.id,
                    owner_id: video.attach.ownerId,
                })
                    .then(() => {
                    setDeletedVideosIds((deletedVideosIds) => deletedVideosIds.filter((id) => id !== video.attach.id));
                });
                break;
            case 'copy_link':
            case 'download':
            case 'report': // api -> video.report: Нужно сделать модалку с причиной (0-6)
            case 'share':
            case 'add': // api -> video.add: Добавляет видеозапись в список пользователя.
            case 'add_to_playlist': // api -> video.addToAlbum: Сделать модалку с альбомами (video.getAlbums) и мб с их созданием?
                break;
            default: {
                exhaustivenessCheck(type);
            }
        }
    }, [goToMessage, api, viewer.id]);
    const now = Date.now();
    /**
     * Текущий отображаемый месяц аттачей
     */
    let month = null;
    return (React.createElement("ul", { className: "ConvoAttachesVideos" }, videos.map((video, i) => {
        const isFirst = i === 0;
        const date = new Date(video.date * 1000);
        const attachMonth = date.getMonth();
        const shouldDisplayDate = month === null || attachMonth !== month;
        month = attachMonth;
        const videoSource = width !== 0 ? getVideoSource(video.attach, width) : undefined;
        return (React.createElement(React.Fragment, { key: `${video.cmid}-${video.attach.id}` },
            shouldDisplayDate && (React.createElement("div", { className: "ConvoAttachesVideos__separator" }, lang.use('me_month_year_date', {
                now,
                date: video.date * 1000,
                genMonths: false,
            }))),
            React.createElement(ConvoAttachesVideoItem, { measuredElRef: isFirst ? measuredElRef : undefined, isDeleted: deletedVideosIds.includes(video.attach.id), onActionClick: doAction, video: video, videoSource: videoSource || undefined })));
    })));
};
const ConvoAttachesVideoItem = ({ video, videoSource, isDeleted, measuredElRef, onActionClick }) => {
    const fastActionsTrigger = useFastActionsTrigger();
    const { isDropdownFastActionsOpened, isContextMenuFastActionsOpened, openDropdownFastActions, openContextMenuFastActions, closeDropdownFastActions, closeContextMenuFastActions, } = useFastActionsState();
    /**
     * Так как компонент не перерендеривается, прокидывание рефа здесь
     * не сработает, так как forwardRef отработает на второй рендер
     */
    const [itemElement, setItemElement] = useState(null);
    const { lang } = useBrowserEnv();
    const peers = usePeers();
    const author = Peer.safeGet(peers, video.authorId);
    // const isBlur = video.attach.restriction?.blur === 1
    // const canNotPlay = video.attach.restriction?.can_play === 0
    /**
     * Переменная в которой может быть длительность, платформа, или не быть ничего.
     * Поэтому называем previewInfo, но формально это блок длительности + обработка сценариев когда нет данных.
     */
    const previewInfo = getVideoDuration(video.attach.duration, !!video.attach.files?.external) ||
        video.attach.platform;
    const actionsList = useMemo(() => (React.createElement(ActionsMenuAction, { key: "action_go_to_message", onClick: () => onActionClick('go_to_message', video), title: lang.use('me_attach_action_go_to_message'), leftIcon: React.createElement(Icon20MessageArrowRightOutline, null), type: "secondary" })), [lang, video, onActionClick]);
    const render = () => {
        const hasSource = !!videoSource;
        const isAvailableVideo = hasSource && !isDeleted;
        const content = (React.createElement(React.Fragment, null,
            isAvailableVideo && (React.createElement("div", { className: "ConvoAttachesVideoItem__preview" },
                !!previewInfo && (React.createElement("div", { className: "ConvoAttachesVideos__previewInfo" }, previewInfo)),
                React.createElement("img", { src: videoSource.src, srcSet: videoSource.srcSet, alt: "" }))),
            React.createElement("div", { className: "ConvoAttachesVideoItem__content" },
                React.createElement("div", { className: "ConvoAttachesVideoItem__title" }, video.attach.title),
                React.createElement("div", { className: "ConvoAttachesVideoItem__info" },
                    React.createElement("div", { className: "ConvoAttachesVideoItem__infoSide" },
                        React.createElement(Link, { to: {
                                kind: 'PeerPanel',
                                peerId: video.authorId,
                                screenName: Peer.screenName(author),
                            }, className: "ConvoAttachesVideoItem__peer" }, Peer.name(author)),
                        React.createElement("div", { className: "ConvoAttachesVideo__views" }, lang.use('me_convo_attaches_video_views', {
                            num: video.attach.views,
                            formatted: 'short',
                            values: {
                                count: lang.formatNumber(video.attach.views, 'short'),
                            },
                        }))),
                    isAvailableVideo && fastActionsTrigger.button && (React.createElement(Dropdown, { enableFocusTrap: true, open: isDropdownFastActionsOpened, onOpen: openDropdownFastActions, onClose: closeDropdownFastActions, classNames: {
                            wrapper: cx('ConvoAttachVideo__dropdown', {
                                'ConvoAttachVideo__dropdown--open': fastActionsTrigger.button === 'tap',
                            }),
                            wrapperOpened: 'ConvoAttachVideo__dropdown--open',
                        }, content: React.createElement(ActionsMenu, { id: "convo_attach_video_actions", className: "ConvoActionsMenu" }, actionsList), align: "center", position: "bottom", adaptive: true, hideOnClick: true, openType: fastActionsTrigger.button === 'tap' ? 'click' : 'hover' }, (isOpened) => (React.createElement("button", { className: "ConvoAttachVideo__action", "aria-label": lang.use('me_actions_more'), "aria-haspopup": "menu", "aria-controls": "convo_attach_video_actions", "aria-expanded": isOpened, onClick: (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            openDropdownFastActions();
                        } },
                        fastActionsTrigger.button === 'tap' && (React.createElement("div", { className: "ConvoAttachVideo__actionTapArea" })),
                        React.createElement(Icon20More, null))))))),
            isAvailableVideo && fastActionsTrigger.rightClick && (React.createElement(ContextMenu, { ref: { current: itemElement }, open: isContextMenuFastActionsOpened, onOpen: openContextMenuFastActions, onClose: closeContextMenuFastActions, 
                // На случай клика по ссылке автора видео
                allowNativeContextMenu: true, content: React.createElement(ActionsMenu, { className: "ConvoActionsMenu" }, actionsList) }))));
        if (isAvailableVideo) {
            return (React.createElement(Link, { ref: (node) => {
                    setItemElement(node);
                }, to: { kind: 'AttachMediaProxyRoute', attach: video.attach }, className: "ConvoAttachesVideoItem" }, content));
        }
        return React.createElement("div", { className: "ConvoAttachesVideoItem" }, content);
    };
    return React.createElement("li", { ref: measuredElRef }, render());
};
function getVideoSource(video, videoSize) {
    const base = Attach.preview(video, videoSize);
    const dense = Attach.preview(video, videoSize * 2);
    if (!base && !dense) {
        return null;
    }
    if (!base || !dense) {
        return {
            src: base ? base.url : dense ? dense.url : '',
        };
    }
    return {
        srcSet: `${base.url}, ${dense.url} 2x`,
        src: dense.url,
    };
}
//# sourceMappingURL=ConvoAttachesVideos.js.map