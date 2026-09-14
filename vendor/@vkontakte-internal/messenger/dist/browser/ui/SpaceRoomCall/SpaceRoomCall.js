import '../../ui/SpaceRoomCall/SpaceRoomCall.css';
import React, { useEffect, useState } from 'react';
import { SpaceChatMain, } from '../../ui/SpaceChatMain/SpaceChatMain';
import { useBrowserEnv } from '../../hooks/misc';
import { Button, Headline } from '@vkontakte/vkui';
export const SpaceRoomCall = ({ roomId, peerId, call, tribune, roomEntity, callRoomChatAppRenderer, ...props }) => {
    const { calls, storage } = useBrowserEnv();
    const [roomState, setRoomState] = useState('INITIAL');
    async function joinCall({ vkJoinLink, okJoinLink, }) {
        // При присоединении удаляем roomId из spaces-call-rooms-finished
        deleteRoomIdFromStorageCallFinished(storage, props.space.id, roomId);
        try {
            setRoomState('JOIN_PENDING');
            await calls?.joinRoom({
                ownerId: props.convo.ownerId,
                vkJoinLink,
                okJoinLink,
                roomName: props.peer.title,
                mode: call ? 'VOICE_ROOM' : 'TRIBUNE',
                renderChat: () => callRoomChatAppRenderer(peerId, props.space.id),
                isWithVideo: false,
                isWithAudio: false,
            });
            setRoomState('JOIN_SUCCESS');
        }
        catch {
            setRoomState('JOIN_FAILED');
        }
    }
    const handleReturnToCall = () => {
        // Если это трибуна у которой завершился звонок — ничего не делаем
        if (tribune?.status === 'closed') {
            return;
        }
        const { vkJoinLink, okJoinLink } = call ?? tribune;
        joinCall({ vkJoinLink, okJoinLink });
    };
    /**
     * Room enter effect
     */
    useEffect(() => {
        if (!calls) {
            return;
        }
        // Если это трибуна у которой завершился звонок — просто показываем чат
        if (tribune?.status === 'closed') {
            setRoomState('JOIN_SUCCESS');
            return;
        }
        const { vkJoinLink, okJoinLink } = call ?? tribune;
        const activeCall = calls.getActiveCall();
        if (!activeCall) {
            const isCallRoomFinished = storage
                .get('spaces-call-rooms-finished')
                ?.get(props.space.id)
                ?.has(roomId);
            // Нет активного звонка, но пользователь ранее отключился от звонка этой комнаты — показываем плашку
            if (isCallRoomFinished) {
                setRoomState('CALL_FINISHED');
                return;
            }
            // Нет активного звонка — покдлючаемся
            joinCall({ vkJoinLink, okJoinLink });
            return;
        }
        // Есть активный звонок и это звонок текущей комнаты — всегда восстанавливаем успешный стейт
        if (isActiveCallInCurrentRoom(activeCall, roomEntity)) {
            setRoomState('JOIN_SUCCESS');
            return;
        }
        // Есть активный звонок и это не звонок текущей комнаты — показываем плашку
        if (!isActiveCallInCurrentRoom(activeCall, roomEntity)) {
            setRoomState('IS_IN_ANOTHER_CALL');
            return;
        }
        // Выполняем только при входе в комнату
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roomEntity]);
    useEffect(() => {
        const unsubscribe = calls?.subscribe('onCallFinished', () => {
            /**
             * Если пользователь отключился от звонка, но находится в комнате
             */
            const activeCall = calls?.getActiveCall();
            if (activeCall && isActiveCallInCurrentRoom(activeCall, roomEntity)) {
                setRoomState('CALL_FINISHED');
                addRoomIdToStorageCallFinished(storage, props.space.id, roomId);
            }
        });
        return unsubscribe;
    }, [calls, storage, roomEntity, roomId, props.space.id]);
    // SPC-TODO: Пока все без макетов и без текстов
    if (roomState === 'CALL_FINISHED') {
        return (React.createElement("div", { className: "SpaceRoomCall" },
            React.createElement(Headline, { level: "1", weight: "3", Component: "h4", useAccentWeight: true }, "\u0412\u044B \u043E\u0442\u043A\u043B\u044E\u0447\u0438\u043B\u0438\u0441\u044C \u043E\u0442 \u0437\u0432\u043E\u043D\u043A\u0430"),
            React.createElement(Button, { onClick: handleReturnToCall, size: "m" }, "\u0412\u0435\u0440\u043D\u0443\u0442\u044C\u0441\u044F")));
    }
    // SPC-TODO: Пока все без макетов и без текстов
    if (roomState === 'IS_IN_ANOTHER_CALL') {
        return (React.createElement("div", { className: "SpaceRoomCall" },
            React.createElement(Headline, { level: "1", weight: "3", Component: "h4", useAccentWeight: true }, "\u0412\u044B \u043D\u0430\u0445\u043E\u0434\u0438\u0442\u0435\u0441\u044C \u0432 \u0434\u0440\u0443\u0433\u043E\u043C \u0437\u0432\u043E\u043D\u043A\u0435")));
    }
    return React.createElement(SpaceChatMain, { ...props });
};
function addRoomIdToStorageCallFinished(storage, spaceId, roomId) {
    const spacesCallRoomsFinished = storage.get('spaces-call-rooms-finished') ?? new Map([[spaceId, new Set()]]);
    const spaceCallRoomsFinished = spacesCallRoomsFinished.get(spaceId);
    if (spaceCallRoomsFinished) {
        spaceCallRoomsFinished.add(roomId);
    }
    else {
        spacesCallRoomsFinished.set(spaceId, new Set([roomId]));
    }
    storage.set('spaces-call-rooms-finished', spacesCallRoomsFinished);
}
function deleteRoomIdFromStorageCallFinished(storage, spaceId, roomId) {
    const spacesCallRoomsFinished = storage.get('spaces-call-rooms-finished');
    if (!spacesCallRoomsFinished)
        return;
    spacesCallRoomsFinished.get(spaceId)?.delete(roomId);
    storage.set('spaces-call-rooms-finished', spacesCallRoomsFinished);
}
function isActiveCallInCurrentRoom({ callId }, { callId: roomCallId }) {
    return roomCallId && callId === roomCallId;
}
//# sourceMappingURL=SpaceRoomCall.js.map