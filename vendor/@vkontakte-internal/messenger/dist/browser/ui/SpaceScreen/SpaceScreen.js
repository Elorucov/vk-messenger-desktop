import '../../ui/SpaceScreen/SpaceScreen.css';
import React, { useEffect, useRef } from 'react';
import { useRouter } from '../../ui/Router/Router';
import { useBrowserEnv, useDispatch } from '../../hooks/misc';
import { ReImage } from '../../ui/ReImage/ReImage';
import { SpaceHeader, SpaceHeaderSkeleton, } from '../../ui/SpaceHeader/SpaceHeader';
import { SpaceSectionsList } from '../../ui/SpaceSectionsList/SpaceSectionsList';
import { exhaustivenessCheck } from '../../../core/utils/misc';
import { ScrollbarProvider } from '@vkontakte-internal/scrollbar';
import { SkeletonLoader } from '../../ui/SkeletonLoader/SkeletonLoader';
import { SpaceJoinButton } from '../../ui/SpaceJoinButton/SpaceJoinButton';
export const SpaceScreen = ({ isReconnecting, spacesCache, screenRoute, renderRoom, }) => {
    const dispatch = useDispatch();
    const space = spacesCache.get(screenRoute.spaceId);
    useEffect(() => {
        dispatch({
            type: 'UserOpenedSpace',
            spaceId: screenRoute.spaceId,
        });
        return () => {
            dispatch({ type: 'UserClosedSpace', spaceId: screenRoute.spaceId });
        };
    }, [dispatch, screenRoute.spaceId]);
    const renderMain = () => {
        if (!space) {
            return null;
        }
        switch (space.kind) {
            case 'Incomplete':
                return null;
            case 'Space': {
                const room = screenRoute.roomId && space.rooms.get(screenRoute.roomId);
                if (!room) {
                    return null;
                }
                return renderRoom(space, room);
            }
            default:
                return exhaustivenessCheck(space);
        }
    };
    if (space === null) {
        return React.createElement(RedirectSpaceNotFound, null);
    }
    return (React.createElement("div", { className: "SpaceScreen" },
        React.createElement("div", { className: "SpaceScreen__list" }, !space ? (React.createElement(React.Fragment, null,
            React.createElement(SpaceHeaderSkeleton, null),
            React.createElement(SkeletonLoader, { width: "100%", height: 128 }),
            React.createElement(SpaceScreenSkeleton, null),
            React.createElement(SpaceScreenSkeleton, null),
            React.createElement(SpaceScreenSkeleton, null))) : (React.createElement(React.Fragment, null,
            space.kind === 'Space' && (React.createElement(RoomRedirect, { space: space, openedRoomId: screenRoute.roomId })),
            React.createElement(SpaceHeader, { space: space, isReconnecting: isReconnecting }),
            React.createElement(ScrollbarProvider, { style: { width: '100%', height: '100%' }, overflowX: "hidden" },
                space.cover && (React.createElement("div", { className: "SpaceScreen__cover" },
                    React.createElement(ReImage, { alt: space.name, image: space.cover, 
                        // Ширина по стилям респонсивная,
                        // поэтому указываем максимальную ширину из возможных,
                        // чтобы в любом варианте смотрелось красиво
                        width: 400, height: 128 }))),
                space.kind === 'Incomplete' ? (React.createElement(React.Fragment, null,
                    React.createElement(SpaceScreenSkeleton, null),
                    React.createElement(SpaceScreenSkeleton, null),
                    React.createElement(SpaceScreenSkeleton, null))) : (React.createElement(React.Fragment, null,
                    !space.viewerData.isMember && (React.createElement("div", { className: "SpaceScreen__guest" },
                        React.createElement(SpaceJoinButton, { space: space, variant: "header" }))),
                    React.createElement(SpaceSectionsList, { space: space, openedRoomId: screenRoute.roomId }))))))),
        React.createElement("div", { className: "SpaceScreen__main" }, renderMain())));
};
const RoomRedirect = ({ space, openedRoomId }) => {
    const { storage } = useBrowserEnv();
    const { replace } = useRouter();
    // Мы не хотим, чтобы useEffect ниже триггерился на изменение спейса,
    // важно лишь, чтобы он запускался при изменении айдишника открытой комнаты.
    // Можно было бы игнорировать ошибку через eslint, но тогда добавление
    // любых новых зависимостей не отлавливалось бы eslint'ом. Поэтому такой небольшой хак.
    const spaceRef = useRef(space);
    spaceRef.current = space;
    useEffect(() => {
        const space = spaceRef.current;
        const prevOpenedRooms = storage.get('spaces-prev-opened-rooms') || new Map();
        const openedRoom = openedRoomId && space.rooms.get(openedRoomId);
        if (openedRoom) {
            // Если комната была найдена, то мы можем безопасно запомнить ее открытие,
            // чтобы в будущем переоткрывать ее снова
            prevOpenedRooms.set(space.id, openedRoom.id);
            storage.set('spaces-prev-opened-rooms', prevOpenedRooms);
            return;
        }
        for (const roomId of [
            prevOpenedRooms?.get(space.id),
            space.defaultRoomId,
        ]) {
            const room = roomId && space.rooms.get(roomId);
            if (!room) {
                continue;
            }
            replace({
                kind: 'SpaceRoomRoute',
                spaceId: space.id,
                roomId: room.id,
            });
            return;
        }
        prevOpenedRooms.delete(space.id);
        storage.set('spaces-prev-opened-rooms', prevOpenedRooms);
        if (openedRoomId) {
            replace({
                kind: 'SpaceRoute',
                spaceId: space.id,
            });
        }
    }, [storage, replace, spaceRef, openedRoomId]);
    return null;
};
const SpaceScreenSkeleton = () => {
    return (React.createElement("div", { className: "SpaceScreen__skeleton" },
        React.createElement(SkeletonLoader, { width: 200, height: 12, rounded: true, roundedRadius: 4 }),
        Array(3)
            .fill(null)
            .map((_, i) => (React.createElement("div", { className: "SpaceScreen__skeletonItem", key: i },
            React.createElement(SkeletonLoader, { className: "SpaceScreen__skeletonAvatar", width: 20, height: 20, rounded: true, roundedRadius: 10 }),
            React.createElement(SkeletonLoader, { className: "SpaceScreen__skeletonTitle", width: 120, height: 12, rounded: true, roundedRadius: 4 }),
            React.createElement(SkeletonLoader, { className: "SpaceScreen__skeletonSubtitle", width: "90%", height: 8, rounded: true, roundedRadius: 2 }),
            React.createElement(SkeletonLoader, { className: "SpaceScreen__skeletonCounter", width: 16, height: 16, rounded: true, roundedRadius: 8 }))))));
};
export const RedirectSpaceNotFound = () => {
    const { replace } = useRouter();
    useEffect(() => {
        replace({ kind: 'MainRoute' });
    }, [replace]);
    return null;
};
//# sourceMappingURL=SpaceScreen.js.map