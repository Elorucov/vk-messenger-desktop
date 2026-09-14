import { useCallback, useLayoutEffect } from 'react';
import { useDispatch } from '../../hooks/misc';
export const useConvoComposerDraft = ({ peerId, composerDraft, focusEditor, getEditorText, getEditorHtml, resetEditorText, isDraftEmpty, isFocused, isPostponed, }) => {
    const dispatch = useDispatch();
    const { editing, forward, reply, html, text } = composerDraft;
    const cancelEditing = useCallback(() => {
        dispatch({
            type: 'UserClearedComposerDraft',
            peerId: peerId,
            isPostponed,
        });
    }, [dispatch, peerId, isPostponed]);
    const removeReply = useCallback(() => {
        dispatch({
            type: 'UserChangedComposerDraft',
            kind: 'reply',
            reply: undefined,
            peerId,
            isPostponed,
        });
    }, [dispatch, peerId, isPostponed]);
    const removeForward = useCallback(() => {
        dispatch({
            type: 'UserChangedComposerDraft',
            kind: 'forward',
            forward: undefined,
            peerId,
            isPostponed,
        });
    }, [dispatch, peerId, isPostponed]);
    const deleteEditingMessage = useCallback((isDeletingForAll) => {
        if (!editing) {
            return;
        }
        if (editing.isPostponed) {
            dispatch({
                type: 'UserDeletedPostponedMessage',
                messages: [editing],
                peerId: peerId,
                userAction: 'deletePostponed',
            });
        }
        else {
            dispatch({
                type: 'UserDeleteMessage',
                userAction: 'delete',
                messages: [editing],
                peerId: peerId,
                deleteType: isDeletingForAll ? 'for_all' : 'local',
            });
        }
        cancelEditing();
    }, [editing, peerId, cancelEditing, dispatch]);
    // Автофокус при редактировании, реплае, форварде
    useLayoutEffect(() => {
        if (!editing && !reply && !forward) {
            return;
        }
        try {
            /**
             * В Safari здесь возникает ошибка
             * "InvalidStateError: The object is in an invalid state",
             * если инпут недоступен (например, при записи ГС)
             */
            focusEditor?.();
        }
        catch { }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editing, reply, forward]);
    // Замена текста при изменении драфта
    useLayoutEffect(() => {
        if (html) {
            if (getEditorHtml?.() !== html) {
                resetEditorText?.(html, true);
            }
        }
        else {
            if (getEditorText?.() !== text) {
                resetEditorText?.(text);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [text, html]);
    const saveDraftText = useCallback((updateIsDraftedConvoFlag) => {
        if (!getEditorText || !getEditorHtml) {
            return;
        }
        dispatch({
            type: 'UserChangedComposerDraft',
            kind: 'text',
            text: getEditorText(),
            html: getEditorHtml(),
            peerId,
            updateIsDraftedFlag: updateIsDraftedConvoFlag,
            isPostponed,
        });
    }, [peerId, getEditorText, getEditorHtml, dispatch, isPostponed]);
    useLayoutEffect(() => {
        /**
         * В случае опустошения черновика продуктовое требование - сразу на это реагировать в интерфейсе:
         * снимать с чата в списке пометку "Черновик: " и возвращать его на свое место в сортировке */
        if (isDraftEmpty) {
            saveDraftText(true);
        }
    }, [isDraftEmpty, saveDraftText]);
    /**
     * При блюре поля ввода необходимо сохранить текст черновика, так как
     * за этим может последовать добавления черновика на редактирование.
     * Но изменять сортировку чатов из-за наличия черновика не нужно.
     * См. https://jira.mvk.com/browse/ME-71270 .
     */
    useLayoutEffect(() => {
        if (isFocused) {
            return;
        }
        saveDraftText(false);
        /**
         * Сохраненяем черновик при потере фокуса.
         */
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isFocused]);
    // Сохранение написанного текста при смене беседы
    useLayoutEffect(() => () => saveDraftText(true), [saveDraftText]);
    // Сохранение написанного текста при перезагрузке страницы или переключении вкладки
    useLayoutEffect(() => {
        const handler = () => saveDraftText(true);
        window.addEventListener('beforeunload', handler);
        window.addEventListener('blur', handler);
        return () => {
            window.removeEventListener('beforeunload', handler);
            window.removeEventListener('blur', handler);
        };
    }, [saveDraftText]);
    return {
        cancelEditing,
        removeReply,
        removeForward,
        deleteEditingMessage,
    };
};
//# sourceMappingURL=useConvoComposerDraft.js.map