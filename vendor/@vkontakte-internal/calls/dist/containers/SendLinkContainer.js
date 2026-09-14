import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { ModalSendMessage } from '../components/ModalSendMessage/ModalSendMessage';
import { mapConversations, mapUserProfiles, mapMessageConversation, } from '../components/ModalSendMessage/utils';
import { messagesGetConversations, messagesSend, friendsSearch, messagesSearch } from '../services/backend';
import { useIsMounted } from '@vkontakte-internal/react-utils';
import { useCloseModal } from '../hooks/useCloseModal';
import { useTypedSelector } from '../hooks/useTypedSelector';
import { usePromiseError } from '../hooks/usePromiseError';
import { INBOX_MESSAGE_MAX_LENGTH } from '../constants';
import { useNotifier, peerIdToVkId } from '@vkontakte-internal/calls-core';
import { useLang } from '../hooks/useLang';
export const SendLinkContainer = ({ title, initialText, attachment, onClose, onSendFinish, }) => {
    const { getLang } = useLang();
    const { showText, showErrorMessage } = useNotifier();
    const { handleError } = usePromiseError();
    const [submitDisabled, setSubmitDisabled] = useState(false);
    const { conversations, fetchSearchFriends, loading } = useUserConversations();
    const { getId } = useRandomId();
    const handleClose = useCloseModal(onClose);
    const handleSendFinish = useCloseModal(onSendFinish);
    const isMounted = useIsMounted();
    const handleSubmit = useCallback((formData) => {
        if (!formData) {
            return;
        }
        setSubmitDisabled(true);
        return Promise.allSettled(formData.ids.map((id) => {
            return messagesSend({
                peer_id: peerIdToVkId(id),
                message: formData.text,
                random_id: getId(),
                attachment: formData.attachment,
            });
        }))
            .then((result) => {
            if (result.every((promise) => promise.status === 'fulfilled')) {
                showText(getLang('calls_message_sent'));
                handleSendFinish();
            }
            else {
                showErrorMessage({
                    title: getLang('calls_error_internal_title'),
                    text: getLang('calls_error_internal_desc'),
                });
                throw Error(getLang('calls_error_internal_title'));
            }
        })
            .catch(handleError)
            .finally(() => {
            if (isMounted()) {
                setSubmitDisabled(false);
            }
        });
    }, []);
    return (_jsx(ModalSendMessage, { onClose: handleClose, onSubmit: handleSubmit, options: conversations, title: title, submitDisabled: submitDisabled, initialText: initialText, attachment: attachment, onChangeInput: fetchSearchFriends, loading: loading, maxLength: INBOX_MESSAGE_MAX_LENGTH }));
};
/** получает список чатов пользователя */
function useUserConversations() {
    const { handleError } = usePromiseError();
    const emptyList = useRef([]);
    const conversationsCashed = useRef([]);
    const [conversations, setConversations] = useState([]);
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(false);
    const isMounted = useIsMounted();
    const timeout = useRef(null);
    const myId = useTypedSelector((state) => +(state.externalId?.id || state.me));
    const ajaxId = useRandomId(); // для сетевых вызовов
    const changeId = useRandomId(); // для апдейта списков
    /** ищем друзей и чаты по строке поиска */
    const fetchSearchFriends = useCallback((query) => {
        if (timeout.current) {
            clearTimeout(timeout.current);
        }
        const queryId = changeId.getId();
        if (!query || query.length <= 2) {
            setFriends(emptyList.current);
            setConversations(conversationsCashed.current);
            return;
        }
        const requestId = ajaxId.getId();
        timeout.current = setTimeout(() => {
            setLoading(true);
            Promise.allSettled([messagesSearch({ q: query }), friendsSearch(myId, query, 20)])
                .then(([messagesResult, friendsResult]) => {
                if (!isMounted() || queryId !== changeId.prevId.current) {
                    return;
                }
                if (messagesResult.status === 'fulfilled') {
                    const data = messagesResult.value;
                    if (data.count && data.conversations) {
                        setConversations(mapMessageConversation(data.conversations));
                    }
                    else {
                        setConversations(conversationsCashed.current);
                    }
                }
                if (friendsResult.status === 'fulfilled') {
                    const data = friendsResult.value;
                    if (data.count) {
                        setFriends(mapUserProfiles(data.items));
                    }
                    else {
                        setFriends(emptyList.current);
                    }
                }
            })
                .catch(handleError)
                .finally(() => {
                if (isMounted() && requestId === ajaxId.prevId.current) {
                    setLoading(false);
                }
            });
        }, 300);
    }, []);
    /** загружаем изначальный список чатов */
    useEffect(() => {
        setLoading(true);
        messagesGetConversations()
            .then((data) => {
            if (!isMounted()) {
                return;
            }
            const mappedConversations = mapConversations(data.items, data.profiles);
            conversationsCashed.current = mappedConversations;
            setConversations(mappedConversations);
        })
            .catch(handleError)
            .finally(() => {
            if (isMounted()) {
                setLoading(false);
            }
        });
    }, []);
    const rows = useMemo(() => {
        return [...friends, ...conversations];
    }, [conversations, friends]);
    return {
        conversations: rows,
        loading,
        fetchSearchFriends,
    };
}
/** получаем уникальное айди для отправки сообщений */
function useRandomId() {
    const prevId = useRef(0);
    if (!prevId.current) {
        prevId.current = Date.now();
    }
    const getId = useCallback(() => {
        prevId.current = Date.now();
        return prevId.current;
    }, []);
    return {
        getId,
        prevId,
    };
}
//# sourceMappingURL=SendLinkContainer.js.map