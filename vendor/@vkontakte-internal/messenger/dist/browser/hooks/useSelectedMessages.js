import { useCallback, useRef, useState } from 'react';
import * as Message from '../../core/model/Message';
import * as History from '../../core/model/History';
import { useFeatureFlags, useOnChange } from './misc';
import { isNonEmptyArray } from '../../core/utils/misc';
export const useSelectedMessages = (convoHistory) => {
    const featureFlags = useFeatureFlags();
    const [selected, setSelected] = useState([]);
    const convoHistorRef = useRef(convoHistory);
    convoHistorRef.current = convoHistory;
    const handleSelectMessage = useCallback((message, trigger = 'via-click', selectMany = false) => {
        if (message.kind !== 'Normal') {
            return;
        }
        if (!featureFlags.me_message_selecting) {
            return;
        }
        /* Не выделяем сообщение, если юзер пытается выделить текст */
        if (!selectMany &&
            window.getSelection()?.toString() &&
            trigger === 'via-click') {
            return;
        }
        /* В противном случае сбрасываем любые выделения, иначе если мы решим зажать shift и выбрать несколько сообщений у нас ещё и выделение текста произойдёт */
        document.getSelection()?.removeAllRanges();
        setSelected((selected) => {
            if (selected.find((s) => s.cmid === message.cmid)) {
                return selected.filter((s) => s.cmid !== message.cmid);
            }
            if (selectMany && isNonEmptyArray(selected)) {
                const history = convoHistorRef.current.confirmed;
                const alreadySelectedCmids = new Set(selected.map((msg) => msg.cmid));
                let candidates = [];
                let canStart = false;
                let canEnd = false;
                for (const node of history) {
                    /**
                     * Если в истории встретили гэп, то вся последовательность становится невалидной.
                     */
                    if (node.kind !== 'Node') {
                        candidates = [];
                        canStart = false;
                        canEnd = false;
                        continue;
                    }
                    const isNodeAlreadySelected = alreadySelectedCmids.has(node.item.cmid);
                    const isNodeCurrentMessage = node.item.cmid === message.cmid;
                    if (isNodeCurrentMessage) {
                        canEnd = true;
                        if (canStart && canEnd) {
                            break;
                        }
                        canStart = true;
                        candidates = [];
                        continue;
                    }
                    if (isNodeAlreadySelected) {
                        if (canStart && canEnd) {
                            break;
                        }
                        canStart = true;
                        candidates = [];
                        continue;
                    }
                    const msg = node.item;
                    const isSelectable = Message.isMessageNormal(msg) &&
                        isMessageCanBeSelected(msg, featureFlags);
                    if (isSelectable && canStart) {
                        candidates.push(msg);
                    }
                }
                return [...selected, ...candidates, message];
            }
            return [...selected, message];
        });
    }, [featureFlags]);
    useOnChange(() => {
        /** При выделении проверяем, что сообщения не являются удаленными / исчезающими / сервисными,
         *  но если сообщение перестают быть таковыми, то у них необходимо снимать выделение.
         */
        const canBeSelected = (message) => {
            const { status, node } = History.findNodeByCmid(convoHistory, message.cmid);
            return (
            /**
             * Для бага: https://jira.mvk.com/browse/ME-37845 ,
             * если сообщение не загружено, то ничего не делаем с ним.
             */
            status === 'NotLoaded' ||
                (status === 'Node' && node.item.kind === 'Normal'));
        };
        setSelected((selected) => {
            const newSelected = selected.filter((message) => canBeSelected(message));
            if (newSelected.length === selected.length) {
                return selected;
            }
            return newSelected;
        });
    }, [convoHistory]);
    const handleCancelSelecting = useCallback(() => {
        setSelected([]);
    }, []);
    return {
        selected,
        handleSelectMessage,
        handleCancelSelecting,
    };
};
export const isMessageCanBeSelected = (message, featureFlags) => {
    if (Message.isCall(message)) {
        return false;
    }
    if (!featureFlags.me_message_selecting) {
        return false;
    }
    return true;
};
//# sourceMappingURL=useSelectedMessages.js.map