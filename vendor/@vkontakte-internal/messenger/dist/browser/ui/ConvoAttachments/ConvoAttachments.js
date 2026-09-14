import '../../ui/ConvoAttachments/ConvoAttachments.css';
import React, { useCallback, useEffect, useMemo, useRef, useState, } from 'react';
import { HorizontalScroll, Tabs, TabsItem } from '@vkontakte/vkui';
import { AttachAudio } from '../../ui/AttachAudio/AttachAudio';
import { AttachDoc } from '../../ui/AttachDoc/AttachDoc';
import { Spinner } from '@vkontakte/vkui';
import { OptimizedSpinner } from '../../ui/OptimizedSpinner/OptimizedSpinner';
import { useConvoAttaches, } from '../../hooks/useConvoAttaches';
import { useBrowserEnv } from '../../hooks/misc';
import { ConvoAttachesPhotos } from '../../ui/ConvoAttachesPhotos/ConvoAttachesPhotos';
import { ConvoAttachesVideos } from '../../ui/ConvoAttachesVideos/ConvoAttachesVideos';
import { Dropdown } from '../../ui/Dropdown/Dropdown';
import { ConvoAttachDocActionsMenu } from '../../ui/ConvoAttachDocActionsMenu/ConvoAttachDocActionsMenu';
import { Icon24MoreHorizontal } from '@vkontakte/icons';
import { ConvoAttachAudioActionsMenu } from '../../ui/ConvoAttachAudioActionsMenu/ConvoAttachAudioActionsMenu';
import { ConvoAttachesLinks } from '../../ui/ConvoAttachesLinks/ConvoAttachesLinks';
import cx from 'classnames';
export const ConvoAttachments = ({ peerId, goToMessage, className, }) => {
    const [activeType, setActiveType] = useState('photos');
    const { attaches, getNextPage } = useConvoAttaches(peerId);
    const { lang } = useBrowserEnv();
    const handleTabClick = (type) => {
        if (type === activeType) {
            return;
        }
        if (attaches && !attaches[type]) {
            getNextPage(type);
        }
        setActiveType(type);
    };
    useEffect(() => {
        if (attaches !== null) {
            return;
        }
        getNextPage(activeType);
    });
    const activeTypeRef = useRef(activeType);
    activeTypeRef.current = activeType;
    const getNextPageRef = useRef(getNextPage);
    getNextPageRef.current = getNextPage;
    const handleInView = useCallback((inView) => {
        if (!inView) {
            return;
        }
        getNextPageRef.current(activeTypeRef.current);
    }, []);
    const intersectionOptions = useMemo(() => ({
        onChange: handleInView,
        skip: attaches?.[activeType]?.isLoading,
    }), [activeType, attaches, handleInView]);
    if (!attaches) {
        return null;
    }
    const list = attaches[activeType];
    const isInitialLoading = !list || (list.items.length === 0 && list.isLoading);
    const loadMoreAvailable = !isInitialLoading && list && list.items.length > 0 && !list.isAllLoaded;
    const isEmptyList = list && !list.isLoading && list.items.length === 0;
    return (React.createElement("div", { className: cx('ConvoAttachments', className) },
        React.createElement(Tabs, { className: "ConvoAttachments_tabs" },
            React.createElement(HorizontalScroll, { arrowSize: "m" },
                React.createElement(TabsItem, { onClick: () => handleTabClick('photos'), selected: activeType === 'photos' }, lang.use('me_convo_attaches_type_photo')),
                React.createElement(TabsItem, { onClick: () => handleTabClick('videos'), selected: activeType === 'videos' }, lang.use('me_convo_attaches_type_video')),
                React.createElement(TabsItem, { onClick: () => handleTabClick('audios'), selected: activeType === 'audios' }, lang.use('me_convo_attaches_type_music')),
                React.createElement(TabsItem, { onClick: () => handleTabClick('docs'), selected: activeType === 'docs' }, lang.use('me_convo_attaches_type_doc')),
                React.createElement(TabsItem, { onClick: () => handleTabClick('links'), selected: activeType === 'links' }, lang.use('me_convo_attaches_type_links')))),
        attaches && (React.createElement("div", { className: "ConvoAttachments__block" },
            (() => {
                if (!list?.items || list?.items.length === 0) {
                    return null;
                }
                switch (activeType) {
                    case 'audios':
                        return (React.createElement("ul", { className: "ConvoAttachments__list" }, list?.items.map((attachment) => {
                            const attach = attachment.attach;
                            if (attach.kind !== 'Audio') {
                                return null;
                            }
                            return (React.createElement("li", { key: `${attachment.cmid}-${attach.id}` },
                                React.createElement("div", { className: "ConvoAttachments__itemContainer" },
                                    React.createElement("div", { className: "ConvoAttachments__item" },
                                        React.createElement(AttachAudio, { audio: attach, isOut: false, isInBubble: false })),
                                    React.createElement(Dropdown, { hideOnClick: true, content: React.createElement(ConvoAttachAudioActionsMenu, { cmid: attachment.cmid, goToMessage: goToMessage }), align: "right", position: "bottom" },
                                        React.createElement("button", { className: "ConvoAttachments__itemMenuButton" },
                                            React.createElement(Icon24MoreHorizontal, null))))));
                        })));
                    case 'docs':
                        return (React.createElement("ul", { className: "ConvoAttachments__list" }, list?.items.map((attachment) => {
                            const attach = attachment.attach;
                            if (attach.kind !== 'Doc') {
                                return null;
                            }
                            return (React.createElement("li", { className: "ConvoAttachments__listItem ConvoAtachments__docItem", key: `${attachment.cmid}-${attach.id}` },
                                React.createElement("div", { className: "ConvoAttachments__itemContainer" },
                                    React.createElement("div", { className: "ConvoAttachments__item" },
                                        React.createElement(AttachDoc, { doc: attach })),
                                    React.createElement(Dropdown, { hideOnClick: true, content: React.createElement(ConvoAttachDocActionsMenu, { cmid: attachment.cmid, goToMessage: goToMessage }), align: "center", position: "left" },
                                        React.createElement("button", { className: "ConvoAttachments__itemMenuButton" },
                                            React.createElement(Icon24MoreHorizontal, null))))));
                        })));
                    case 'links':
                        const links = attaches[activeType];
                        if (!links) {
                            return null;
                        }
                        return (React.createElement(ConvoAttachesLinks, { items: links.items, goToMessage: goToMessage }));
                    case 'photos':
                        /* Заново вытаскиваем список, чтобы TS мог вывести тип исходя из
                         * кейса свитча */
                        const photos = attaches[activeType]?.items;
                        if (!photos) {
                            return null;
                        }
                        return (React.createElement(ConvoAttachesPhotos, { photos: photos, goToMessage: goToMessage }));
                    case 'videos':
                        const videos = attaches[activeType]?.items;
                        if (!videos) {
                            return null;
                        }
                        return (React.createElement(ConvoAttachesVideos, { videos: videos, goToMessage: goToMessage }));
                    default:
                        return null;
                }
            })(),
            isInitialLoading && (React.createElement(Spinner, { size: "s", className: "ConvoAttachments__loader" })),
            loadMoreAvailable && (React.createElement(OptimizedSpinner, { size: "s", className: "ConvoAttachments__loader", intersectionOptions: intersectionOptions })),
            isEmptyList && (React.createElement("div", { className: "ConvoAttachments__empty" }, lang.use('me_convo_attaches_empty_type')))))));
};
//# sourceMappingURL=ConvoAttachments.js.map