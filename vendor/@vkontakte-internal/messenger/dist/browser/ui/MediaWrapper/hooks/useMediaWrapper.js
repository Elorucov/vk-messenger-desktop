import { useCallback, useRef, useState } from 'react';
import { useBrowserEnv } from '../../../hooks/misc';
import { FETCH_COUNT_MAP, FETCH_OFFSET_MAP, } from '../../../ui/MediaWrapper/utils';
export const useMediaWrapper = ({ modal, getModalContextId, changeRoute, fetchAttachments, getMediaIndex, getMediaIndexByModal, insertToMediaViewerCache, }) => {
    const { router } = useBrowserEnv();
    const [mediaViewerItems, setMediaViewerItems] = useState([]);
    const mediaViewerItemsRef = useRef(mediaViewerItems);
    mediaViewerItemsRef.current = mediaViewerItems;
    const [mediaViewerIndex, setMediaViewerIndex] = useState(0);
    const mediaViewerIndexRef = useRef(mediaViewerIndex);
    mediaViewerIndexRef.current = mediaViewerIndex;
    // Только для того, чтобы не обновлять зависимости на каждое изменение modal
    const modalRef = useRef(modal);
    modalRef.current = modal;
    const [isMediaViewerLoading, _setIsMediaViewerLoading] = useState(false);
    const isMediaViewerLoadingRef = useRef(isMediaViewerLoading);
    const setIsMediaViewerLoading = useCallback((value) => {
        // К актуальному значению isMediaViewerLoading иногда нужно иметь доступ до перерендера,
        // поэтому создана обертка, которая сразу устанавливает State + Ref
        _setIsMediaViewerLoading(value);
        isMediaViewerLoadingRef.current = value;
    }, []);
    // Не вызывайте _setHasNext. Только через setPrevWithDispatch
    const [hasNext, _setHasNext] = useState(true);
    // Не вызывайте _setHasPrev. Только через setNextWithDispatch
    const [hasPrev, _setHasPrev] = useState(true);
    const hasNextRef = useRef(hasNext);
    const hasPrevRef = useRef(hasPrev);
    hasNextRef.current = hasNext;
    hasPrevRef.current = hasPrev;
    const isFetching = useRef(false);
    const defferedMoveRef = useRef(null);
    const closeMediaViewer = useCallback(() => router.pop(), [router]);
    /**
     * Устанавливает mediaViewerItems & mediaViewerIndex
     */
    const setMediaViewer = useCallback((loadedItems, direction = 'both') => {
        let media = loadedItems; // direction = 'both'
        if (direction === 'prev') {
            // При direction === 'prev' текущий элемент уже есть в loadedItems
            media = loadedItems.concat(mediaViewerItems.slice(1));
        }
        if (direction === 'next') {
            media = mediaViewerItems.concat(loadedItems);
        }
        if (!modalRef.current.source) {
            return closeMediaViewer();
        }
        const mediaIndex = getMediaIndexByModal(media, modalRef.current);
        if (mediaIndex === -1) {
            return closeMediaViewer();
        }
        setMediaViewerItems(media);
        setMediaViewerIndex(mediaIndex);
        return media;
    }, [closeMediaViewer, mediaViewerItems, getMediaIndexByModal]);
    const setPrevWithDispatch = useCallback((value, cacheKey) => {
        _setHasPrev(value);
        if (cacheKey) {
            insertToMediaViewerCache({ hasPrev: value }, cacheKey);
        }
    }, [insertToMediaViewerCache]);
    const setNextWithDispatch = useCallback((value, cacheKey) => {
        _setHasNext(value);
        if (cacheKey) {
            insertToMediaViewerCache({ hasNext: value }, cacheKey);
        }
    }, [insertToMediaViewerCache]);
    const fetchAttachmentsWrapper = useCallback(async (pivotItem, modal, direction) => {
        const count = FETCH_COUNT_MAP[direction];
        const offset = FETCH_OFFSET_MAP[direction];
        try {
            isFetching.current = direction;
            const mediaViewerItems = await fetchAttachments(pivotItem, modal, count, offset);
            if (!mediaViewerItems) {
                return null;
            }
            const mediaIndex = getMediaIndex(mediaViewerItems, pivotItem);
            const contextId = getModalContextId(modalRef.current);
            // Если вернулось меньше чем запросили, обновляем hasPrev / hasNext
            if (mediaViewerItems.length < count) {
                if (direction === 'both') {
                    setPrevWithDispatch(mediaIndex + 1 - count / 2 >= 0, contextId);
                    setNextWithDispatch(mediaIndex + count / 2 <= mediaViewerItems.length - 1, contextId);
                }
                if (direction === 'prev') {
                    setPrevWithDispatch(false, contextId);
                }
                if (direction === 'next') {
                    setNextWithDispatch(false, contextId);
                }
            }
            return mediaViewerItems;
        }
        catch {
            return null;
        }
        finally {
            isFetching.current = false;
        }
    }, [
        fetchAttachments,
        getMediaIndex,
        setPrevWithDispatch,
        setNextWithDispatch,
        getModalContextId,
    ]);
    const onFetchAttachmentsResolve = useCallback((direction, media) => {
        if (media) {
            const mediaItems = setMediaViewer(media, direction);
            // Добавляем данные в кеш
            mediaItems &&
                insertToMediaViewerCache({ items: mediaItems }, getModalContextId(modalRef.current));
        }
        defferedMoveRef.current?.();
        setIsMediaViewerLoading(false);
    }, [
        setMediaViewer,
        setIsMediaViewerLoading,
        insertToMediaViewerCache,
        getModalContextId,
    ]);
    const handleMediaViewerMove = useCallback((direction) => {
        if (!modal.source)
            return;
        const mediaViewerItemsCur = mediaViewerItemsRef.current;
        const moveToIndex = getMoveIndex(mediaViewerIndexRef.current, direction);
        // Всегда очищаем отложенный handleMediaViewerMove
        defferedMoveRef.current = null;
        /**
         * Пользователь уходит за границы загруженных элементов:
         * - Устанавливаем визуальный Loading
         * - Создаем отложенный переход (в данный момент мы не можем сделать переход, так как ничего не знаем о будущем элементе)
         */
        if ((moveToIndex === -1 && hasPrevRef.current) ||
            (moveToIndex === mediaViewerItemsCur.length && hasNextRef.current)) {
            setIsMediaViewerLoading(true);
            defferedMoveRef.current = handleMediaViewerMove.bind(null, direction);
        }
        try {
            /**
             * Этот блок упадет с ошибкой, если пользователю еще некуда переходить – значит элементы еще не загружены
             */
            const mediaItem = getMediaItemByIndex(mediaViewerItemsCur, moveToIndex);
            changeRoute(mediaItem);
            setMediaViewerIndex(moveToIndex);
        }
        catch {
            // pass
        }
        const fetchDirection = shouldFetch(moveToIndex, mediaViewerItemsCur.length, direction, hasNextRef.current, hasPrevRef.current, isFetching.current);
        if (fetchDirection) {
            const pivotItem = getFetchPivotItem(mediaViewerItemsCur, fetchDirection);
            fetchAttachmentsWrapper(pivotItem, modalRef.current, fetchDirection).then(onFetchAttachmentsResolve.bind(null, fetchDirection));
        }
    }, [
        modal,
        changeRoute,
        fetchAttachmentsWrapper,
        setIsMediaViewerLoading,
        onFetchAttachmentsResolve,
    ]);
    const handlePrev = useCallback(() => {
        handleMediaViewerMove('prev');
    }, [handleMediaViewerMove]);
    const handleNext = useCallback(() => {
        handleMediaViewerMove('next');
    }, [handleMediaViewerMove]);
    const hidePrev = mediaViewerIndex === 0 && !hasPrev;
    const hideNext = mediaViewerIndex === mediaViewerItems.length - 1 && !hasNext;
    return {
        mediaViewerItems,
        mediaViewerIndex,
        fetchAttachmentsWrapper,
        onFetchAttachmentsResolve,
        setMediaViewer,
        setPrevWithDispatch,
        setNextWithDispatch,
        closeMediaViewer,
        handlePrev,
        handleNext,
        hidePrev,
        hideNext,
        isMediaViewerLoading,
    };
};
const getMoveIndex = (currentIndex, direction) => {
    return direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
};
const getMediaItemByIndex = (items, index) => {
    const item = items[index];
    if (!item) {
        throw new Error('Передан некорректный индекс медиа');
    }
    return item;
};
const shouldFetch = (moveToIndex, mediaViewerItemsLength, direction, hasNext, hasPrev, isFetching) => {
    // Если moveToIndex предпоследний слева и ниже
    if (moveToIndex <= 1 && direction === 'prev' && hasPrev && !isFetching) {
        return 'prev';
    }
    // Если moveToIndex предпоследний справа и выше
    if (moveToIndex >= mediaViewerItemsLength &&
        direction === 'next' &&
        hasNext &&
        !isFetching) {
        return 'next';
    }
    return null;
};
/**
 * Возвращает опорный элемент для подгрузки – это всегда первый или последний, в зависимости от направления
 */
const getFetchPivotItem = (mediaViewerItems, direction) => getMediaItemByIndex(mediaViewerItems, direction === 'prev' ? 0 : mediaViewerItems.length - 1);
//# sourceMappingURL=useMediaWrapper.js.map