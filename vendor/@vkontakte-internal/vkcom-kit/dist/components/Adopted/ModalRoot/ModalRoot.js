import { jsx as _jsx } from "react/jsx-runtime";
import { ModalRoot as VKUIModalRoot } from '@vkontakte/vkui';
import { Children, isValidElement, useEffect, useState } from 'react';
/**
 * В VKUI v7 `ModalRoot` теперь создаёт лишь контекст с параметром `activeModal`, а сами
 * `ModalPage` и `ModalCard` относительно своего `id` и `activeModal` монтируются / размонитруются.
 *
 * Здесь мы возвращаем старую логику, когда `ModalRoot` через `React.Children.toArray`
 * монитровал / размонтировал своих потомков по их `id`, т.к. в проекте много обёрток над
 * `ModalPage` / `ModalCard`, всё ещё усложняется тем, что некоторые из них обёрнуты в `createWidget()`.
 *
 * Вместе с этим у `ModalPage` / `ModalCard`:
 *
 * - исключаем из типов `keepMounted`, т.к. теперь не будет работать;
 * - оборачиваем в локильный провайдер `ModalRootContext` с вызовом `onClosed` из свойства и из
 *   родительского контекста, т.к. `onClosed` на `ModalPage` / `ModalCard` перебивает `onClosed` на
 *   `ModalRoot`.
 *
 * > ⚠️ NOTE
 * >
 * > По опыту миграции `@vk-ecosystem/mini-app`, есть подозрение, что в `ModalRoot` могут класть
 * > и `Alert`, но из-за огромной кодовой базы, по факту не смог найти такое применение.
 * >
 * > Если такое найдётся, то нужно вызывать `onClosed(id: string)` из `ModalRootContext` при
 * > `<Alert onClose={...} />`, чтобы сработал этот Workaround.
 * >
 * > @see https://gitlab.mvk.com/vk-ecosystem/shared/mini-app/-/merge_requests/218
 */
export const ModalRoot = ({ activeModal, children, onClosed, ...restProps }) => {
    const [activeModals, setActiveModals] = useState(activeModal !== null ? [activeModal] : []);
    useEffect(function handleActiveModalChange() {
        setActiveModals((prev) => activeModal === null || prev.includes(activeModal) ? prev : [...prev, activeModal]);
    }, [activeModal]);
    /**
     * Для компонентов не использующих `ModalPage` / `ModalCard` нужно вызывать `onClosed(id: string)`
     * из `ModalRootContext` если их `id` не совпадает с `activeModal`.
     */
    const handleModalPageOrModalCardClosed = (modalId) => {
        setActiveModals((prev) => (prev.includes(modalId) ? prev.filter((i) => i !== modalId) : prev));
        if (onClosed) {
            onClosed(modalId);
        }
    };
    const modals = Children.toArray(children).map((child) => isValidElement(child) && activeModals.includes(getNavId(child.props)) ? child : null);
    return (_jsx(VKUIModalRoot, { activeModal: activeModal, onClosed: handleModalPageOrModalCardClosed, ...restProps, children: modals }));
};
function getNavId({ nav, id }) {
    return nav || id;
}
//# sourceMappingURL=ModalRoot.js.map