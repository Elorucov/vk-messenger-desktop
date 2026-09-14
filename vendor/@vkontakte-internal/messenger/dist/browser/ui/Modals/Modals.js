import React, { createContext, useCallback, useContext, useLayoutEffect, useMemo, useState, } from 'react';
import { exhaustivenessCheck } from '../../../core/utils/misc';
import { produce } from 'immer';
export const ModalContext = createContext(null);
/**
 * Provider для системы модалок.
 * Создает историю и систему с созданными модалками.
 * Позволяет использовать хуки useModal и его производные.
 */
export const ModalsProvider = ({ children, stacks }) => {
    const closeGroup = useCallback((groupId) => {
        let alreadyDeleted = true;
        Object.values(stacks).forEach((stack) => {
            const lastElement = stack.currentElement;
            let numberOfGroupElements = 0;
            // Удаляем модалки из группы, находящиеся наверху стека, не понятно, может ли
            // в одном из стеков модалка из группы оказаться под модалками не из группы,
            // но если этот кейс и выполнимый, то ее пользователь сможет закрыть отдельно от группы.
            if (lastElement?.groupId === groupId) {
                alreadyDeleted = false;
                while (stack.currentElement?.groupId === groupId) {
                    numberOfGroupElements += 1;
                    stack.goBack();
                }
                stack.pop(numberOfGroupElements);
            }
        });
        if (alreadyDeleted) {
            throw Error('Пытаетесь закрыть группу модалок, которая закрыта');
        }
    }, [stacks]);
    const openModal = useCallback(({ modalId, groupId, isSubModal }, stackName) => {
        const stack = stacks[stackName];
        const isOpened = stack.findIndex(modalId) !== null;
        if (isOpened) {
            throw new Error('Пытаетесь открыть модалку, которая открыта');
        }
        stack.push({ modalId, groupId, isSubModal });
    }, [stacks]);
    const closeModal = useCallback((modalId, stackName) => {
        const stack = stacks[stackName];
        const lastElement = stack.currentElement;
        if (lastElement?.modalId === modalId) {
            stack.pop();
        }
    }, [stacks]);
    const closeModalForced = useCallback((modalId, stackName) => {
        const stack = stacks[stackName];
        stack.forcedRemove((item) => item.modalId === modalId);
    }, [stacks]);
    const findIndexInStack = useCallback((modalId, stackName) => {
        return stacks[stackName].findIndex(modalId);
    }, [stacks]);
    const [openedModals, setOpenedModals] = useState({
        rightPanel: [],
        popup: [],
    });
    useLayoutEffect(() => {
        const cancelSubscribes = 
        /**
         * В данном случае нам можно воспользоваться кастом,
         * так как тип stacks определен в этом же модуле.
         */
        Object.keys(stacks).map((stackName) => stacks[stackName].subscribe((update) => {
            const { action, payload } = update;
            switch (action) {
                case 'add': {
                    setOpenedModals(produce((draft) => {
                        draft[stackName] = update.payload.isSubModal
                            ? draft[stackName].filter(({ modalId }) => modalId !== payload.modalId)
                            : [];
                        draft[stackName].push(payload);
                    }));
                    break;
                }
                case 'remove': {
                    setOpenedModals(produce((draft) => {
                        const newStackValue = draft[stackName].filter(({ modalId }) => {
                            return !payload.find((payloadModal) => modalId === payloadModal.modalId);
                        });
                        // Оптимизация обновления стека модалок, чтобы избежать лишних перерендеров.
                        // Нужно для кейса, когда компоненты, использующие useModal часто размонтируются.
                        // Так как на анмаунте внутри useModal вызываем remove.
                        if (newStackValue.length < draft[stackName].length) {
                            draft[stackName] = newStackValue;
                        }
                    }));
                    break;
                }
                default:
                    exhaustivenessCheck(action);
            }
        }));
        return () => cancelSubscribes.forEach((cb) => cb());
    }, [stacks]);
    const getStackSize = useCallback((stackName) => {
        return stacks[stackName].size;
    }, [stacks]);
    const value = useMemo(() => ({
        openedModals,
        openModal,
        closeModal,
        closeModalForced,
        closeGroup,
        getStackSize,
        findIndexInStack,
    }), [
        openedModals,
        openModal,
        closeModal,
        closeModalForced,
        closeGroup,
        getStackSize,
        findIndexInStack,
    ]);
    return React.createElement(ModalContext.Provider, { value: value }, children);
};
export function useModalContext() {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error('ModalContext не добавлен в дерево Реакта!');
    }
    return context;
}
//# sourceMappingURL=Modals.js.map