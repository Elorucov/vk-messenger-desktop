import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useModalContext } from '../ui/Modals/Modals';
import { createGroupId, createModalId, resolveModalId } from '../../data/env/Modals';
/**
 * Стандартный хук для использования модалок
 */
export const useModal = (groupId, stackName = 'popup') => {
    return useModalFactory({ groupId, stackName });
};
/**
 * Хук для использования глобальных модалок, которые описаны в GlobalId
 */
export const useGlobalModal = (id) => {
    return useModalFactory({ id });
};
/**
 * Хук для подмодалок, которые не меняют isActive предыдущей модалки
 */
export const useSubModal = (groupId) => {
    return useModalFactory({ groupId, isSubModal: true });
};
/**
 * Хук для создания группы для модалок, в которую можно прикрепить существующие модалки
 */
export const useModalGroup = () => {
    const { closeGroup } = useModalContext();
    const $id = useRef(createGroupId());
    const closeModalGroup = useCallback(() => closeGroup($id.current), [closeGroup]);
    return { id: $id.current, closeGroup: closeModalGroup };
};
/**
 * фабрика для создания хуков получения модалок
 */
const useModalFactory = (params) => {
    const { closeModalForced } = useModalContext();
    const stackName = params?.stackName ?? 'popup';
    const $groupId = useRef(params?.groupId ?? createGroupId());
    const $modalId = useRef(params?.id ? resolveModalId(params?.id) : createModalId());
    useEffect(() => () => {
        // Принудительно закрываем модалку / правую панель при размонтировании
        // содержащего их компонента.
        // Это хак для избежания поломанной системы модалок,
        // если размантируется родительский компонент.
        closeModalForced($modalId.current, stackName);
    }, 
    // Только на анмаунт
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []);
    return useModalData(useMemo(() => ({
        modalId: $modalId.current,
        groupId: $groupId.current,
        isSubModal: params?.isSubModal,
    }), [params?.isSubModal]), stackName);
};
const useModalData = (stackItem, stackName) => {
    const { modalId } = stackItem;
    const { openedModals, openModal, closeModal, findIndexInStack } = useModalContext();
    const open = useCallback(() => openModal(stackItem, stackName), [openModal, stackItem, stackName]);
    const close = useCallback(() => closeModal(modalId, stackName), [closeModal, modalId, stackName]);
    const indexInStack = findIndexInStack(modalId, stackName);
    const result = useMemo(() => ({
        isActive: Boolean(openedModals[stackName].find(({ modalId: id }) => id === modalId)),
        indexInStack,
        isInStack: indexInStack !== null,
        open,
        close,
    }), [close, modalId, open, openedModals, indexInStack, stackName]);
    return result;
};
//# sourceMappingURL=useModal.js.map