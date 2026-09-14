import { useCallback, useMemo, useRef, useState } from 'react';
import * as ComposerDraft from '../../core/model/ComposerDraft';
import { useDispatch } from '../hooks/misc';
import { isNonEmptyArray } from '../../core/utils/misc';
/**
 * Никак в ui нельзя переслать сразу в отложки (у отложек нет своего пир айди).
 * Можно переслать в беседу, а потом уже в композере выбрать "отложенные сообщения".
 * Форварды в отложках могут присутствовать, а вот отложки в качестве форвардов нет.
 * Поэтому все действия с 'UserChangedComposerDraft' должны быть isPostponed: false.
 */
export const useMessagesForward = ({ draft, peerId }) => {
    const dispatch = useDispatch();
    // Сохраняем выбранные для перессылки сообщения, пока пользователь выберает Convo в forwardToConvoPickerModal
    const [forwardBuffer, setForwardBuffer] = useState(null);
    const prevTargetPeerId = useRef(null);
    const onRemove = useCallback((targetPeerId) => {
        dispatch({
            type: 'UserChangedComposerDraft',
            kind: 'forward',
            isPostponed: false,
            forward: undefined,
            peerId: targetPeerId,
        });
    }, [dispatch]);
    const onRemoveExt = useCallback(() => {
        onRemove(peerId);
    }, [onRemove, peerId]);
    const onTargetSelected = useCallback((targetPeerId, messages) => {
        const fromBuffer = messages === undefined;
        // Сортируем сообщения в порядке их следования в истории сообщений.
        const orderedMessages = [
            ...((fromBuffer ? forwardBuffer?.messages : messages) ?? []),
        ].sort((a, b) => a.cmid - b.cmid);
        if (prevTargetPeerId.current !== null) {
            onRemove(prevTargetPeerId.current);
            prevTargetPeerId.current = null;
        }
        if (!isNonEmptyArray(orderedMessages)) {
            return;
        }
        dispatch({
            type: 'UserChangedComposerDraft',
            kind: 'forward',
            peerId: targetPeerId,
            isPostponed: false,
            forward: {
                kind: "message" /* ComposerDraft.ForwardKind.Message */,
                items: orderedMessages,
            },
            isForwardAuthorHidden: fromBuffer
                ? forwardBuffer?.isForwardAuthorHidden
                : undefined,
        });
        if (forwardBuffer !== null) {
            setForwardBuffer(null);
        }
    }, [dispatch, setForwardBuffer, forwardBuffer, onRemove]);
    const onChangeTarget = useCallback(() => {
        // Cменить получателя можно, если мы не редактируем сообщение.
        // То есть если есть пересылаемые Normal сообщения.
        const normalForward = ComposerDraft.getNormalForward(draft, "message" /* ComposerDraft.ForwardKind.Message */);
        if (normalForward === undefined) {
            return;
        }
        prevTargetPeerId.current = peerId;
        setForwardBuffer({
            messages: normalForward,
            isForwardAuthorHidden: draft.isForwardAuthorHidden,
        });
    }, [draft, setForwardBuffer, peerId]);
    const setBufferMessages = useCallback((messages) => {
        setForwardBuffer({ messages });
    }, [setForwardBuffer]);
    const { forward, isForwardAuthorHidden } = draft;
    const setIsForwardAuthorHidden = useCallback((value) => {
        if (forwardBuffer !== null) {
            setForwardBuffer((buffer) => {
                if (buffer === null || value === buffer.isForwardAuthorHidden) {
                    return buffer;
                }
                return {
                    ...buffer,
                    isForwardAuthorHidden: value,
                };
            });
            return;
        }
        if (forward !== undefined && value !== isForwardAuthorHidden) {
            dispatch({
                type: 'UserChangedComposerDraft',
                peerId,
                kind: 'forward',
                isPostponed: false,
                forward,
                isForwardAuthorHidden: value,
            });
        }
    }, [forward, isForwardAuthorHidden, forwardBuffer, peerId, dispatch]);
    return useMemo(() => ({
        messages: forwardBuffer?.messages || [],
        setBufferMessages,
        onTargetSelected,
        onRemove: onRemoveExt,
        onChangeTarget,
        setIsForwardAuthorHidden,
    }), [
        forwardBuffer,
        setBufferMessages,
        onTargetSelected,
        onRemoveExt,
        onChangeTarget,
        setIsForwardAuthorHidden,
    ]);
};
//# sourceMappingURL=useMessagesForward.js.map