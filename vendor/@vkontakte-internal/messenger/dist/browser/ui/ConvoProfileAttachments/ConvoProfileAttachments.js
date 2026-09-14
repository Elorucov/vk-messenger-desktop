import '../../ui/ConvoProfileAttachments/ConvoProfileAttachments.css';
import React, { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { useBrowserEnv } from '../../hooks/misc';
import { useConvoAttaches, } from '../../hooks/useConvoAttaches';
import { ConvoAttachesLinks } from '../../ui/ConvoAttachesLinks/ConvoAttachesLinks';
import { ConvoAttachesPhotos } from '../../ui/ConvoAttachesPhotos/ConvoAttachesPhotos';
import { ConvoAttachesVideos } from '../../ui/ConvoAttachesVideos/ConvoAttachesVideos';
import { OptimizedSpinner } from '../../ui/OptimizedSpinner/OptimizedSpinner';
import { ConvoAttachesAudios } from '../../ui/ConvoAttachesAudios/ConvoAttachesAudios';
import { useStatsOnMount } from '../../hooks/useStatsOnMount';
import { Spinner } from '@vkontakte/vkui';
import { ConvoAttachesDocs } from '../../ui/ConvoAttachesDocs/ConvoAttachesDocs';
import { ConvoAttachesMiniAppWidgets } from '../../ui/ConvoAttachesMiniAppWidgets/ConvoAttachesMiniAppWidgets';
export const ConvoProfileAttachments = memo(({ convo, activeTab, goToMessage }) => {
    const { attaches, getNextPage } = useConvoAttaches(convo.peerId);
    const getNextPageRef = useRef(getNextPage);
    getNextPageRef.current = getNextPage;
    useStatsOnMount({
        type: 'type_navgo',
        type_navgo: {
            subtype: 'tab_open',
            screen: 'im_chat_attachments',
            destination_item: {
                type: 'profile',
                id: convo.peerId,
            },
        },
    });
    const { lang } = useBrowserEnv();
    useEffect(() => {
        if (!attaches || !attaches?.[activeTab]) {
            getNextPageRef.current(activeTab);
        }
    }, [activeTab, attaches]);
    const activeTabRef = useRef(activeTab);
    activeTabRef.current = activeTab;
    const handleInView = useCallback((inView) => {
        if (!inView) {
            return;
        }
        getNextPageRef.current(activeTabRef.current);
    }, []);
    const intersectionOptions = useMemo(() => ({
        onChange: handleInView,
        skip: attaches?.[activeTab]?.isLoading,
    }), [activeTab, attaches, handleInView]);
    if (!attaches) {
        return null;
    }
    const list = attaches[activeTab];
    const isInitialLoading = !list || (list.items.length === 0 && list.isLoading);
    const loadMoreAvailable = !isInitialLoading && list && list.items.length > 0 && !list.isAllLoaded;
    const isEmptyList = list && !list.isLoading && list.items.length === 0;
    return (React.createElement("div", { className: "ConvoProfileAttachments" }, attaches && (React.createElement(React.Fragment, null,
        (() => {
            if (!list?.items || list?.items.length === 0) {
                return null;
            }
            switch (activeTab) {
                case 'audios': {
                    const audios = attaches[activeTab]?.items;
                    if (!audios) {
                        return null;
                    }
                    return (React.createElement(ConvoAttachesAudios, { attaches: audios, goToMessage: goToMessage }));
                }
                case 'docs':
                    const docs = attaches[activeTab]?.items;
                    if (!docs) {
                        return null;
                    }
                    return (React.createElement(ConvoAttachesDocs, { attaches: docs, goToMessage: goToMessage }));
                case 'links':
                    const links = attaches[activeTab];
                    if (!links) {
                        return null;
                    }
                    return (React.createElement(ConvoAttachesLinks, { items: links.items, goToMessage: goToMessage }));
                case 'photos':
                    /* Заново вытаскиваем список, чтобы TS мог вывести тип исходя из
                     * кейса свитча */
                    const photos = attaches[activeTab]?.items;
                    if (!photos) {
                        return null;
                    }
                    return (React.createElement(ConvoAttachesPhotos, { withDateSeparator: true, photos: photos, goToMessage: goToMessage }));
                case 'videos':
                    const videos = attaches[activeTab]?.items;
                    if (!videos) {
                        return null;
                    }
                    return (React.createElement(ConvoAttachesVideos, { videos: videos, goToMessage: goToMessage }));
                case 'miniAppWidgets':
                    const miniAppWidgets = attaches[activeTab]?.items;
                    if (!miniAppWidgets) {
                        return null;
                    }
                    return (React.createElement(ConvoAttachesMiniAppWidgets, { miniAppWidgets: miniAppWidgets, goToMessage: goToMessage }));
                default:
                    return null;
            }
        })(),
        isInitialLoading && (React.createElement(Spinner, { size: "s", className: "ConvoProfileAttachments__loader ConvoProfileAttachments__loader--empty" })),
        loadMoreAvailable && (React.createElement(OptimizedSpinner, { className: "ConvoProfileAttachments__loader", intersectionOptions: intersectionOptions })),
        isEmptyList && (React.createElement("div", { className: "ConvoProfileAttachments__empty" },
            React.createElement("p", { className: "ConvoProfileAttachments__emptyText" },
                activeTab === 'photos' &&
                    lang.use('me_convo_attaches_empty_photos'),
                activeTab === 'videos' &&
                    lang.use('me_convo_attaches_empty_videos'),
                activeTab === 'audios' &&
                    lang.use('me_convo_attaches_empty_audios'),
                activeTab === 'docs' &&
                    lang.use('me_convo_attaches_empty_docs'),
                activeTab === 'links' &&
                    lang.use('me_convo_attaches_empty_links'),
                activeTab === 'miniAppWidgets' &&
                    lang.use('me_convo_attaches_empty_miniapp_widgets'))))))));
});
//# sourceMappingURL=ConvoProfileAttachments.js.map