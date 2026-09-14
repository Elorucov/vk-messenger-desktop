import { useMemo, useRef } from 'react';
const MAX_REPLIES_CHAIN_COUNT = 5;
export function useConvoReplyChain() {
    const replyCmidsChainRef = useRef([]);
    const pushItem = (cmid) => {
        replyCmidsChainRef.current.push(cmid);
        if (replyCmidsChainRef.current.length > MAX_REPLIES_CHAIN_COUNT) {
            replyCmidsChainRef.current.shift();
        }
    };
    const popItem = (afterCmid) => {
        /**
         * Оставляем в цепочке реплаев сообщения только после afterCmid
         */
        replyCmidsChainRef.current = replyCmidsChainRef.current.filter((cmid) => cmid > afterCmid);
        return replyCmidsChainRef.current.pop();
    };
    const clearItems = () => {
        replyCmidsChainRef.current = [];
    };
    return useMemo(() => ({
        pushItem,
        popItem,
        clearItems,
    }), []);
}
//# sourceMappingURL=useConvoReplyChain.js.map