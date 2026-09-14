import { useCallback, useState } from 'react';
import { produce } from 'immer';
/**
 * Хук, позволяющий синхронизировать состояние взаимоисключающих попперов.
 * Нужен, например, в случае, если один поппер должен закрываться при открытии
 * другого.
 *
 * @example
 * const { registerPopper, isPopperOpen } = useSyncPoppers()
 *
 * const dropdown = useMemo(
 *   () => registerPopper({ id: 'dropdown', locks: true }),
 *   [registerPopper],
 * )
 *
 * const popper = useMemo(
 *   () => registerPopper({ id: 'popper' }),
 *   [registerPopper],
 * )
 *
 * return (
 *   <Dropdown
 *      open={isPopperOpen('dropdown')}
 *      {...dropdown}
 *   >
 *     <Popper
 *       open={isPopperOpen('popper')}
 *       {...popper}
 *     >
 *       <button />
 *     </Popper>
 *   </Dropdown>
 * )
 */
export function useSyncPoppers() {
    const [poppers, setPoppers] = useState(new Map());
    const register = useCallback(({ id, locks = false }) => {
        setPoppers(produce((draft) => {
            if (locks) {
                const keys = getPoppersKeys(draft, locks);
                keys.forEach((popperId) => {
                    if (popperId === id) {
                        return;
                    }
                    draft.set(popperId, { lock: true, open: false });
                });
            }
            draft.set(id, { open: false });
        }));
        return {
            onOpen: () => setPoppers(produce((draft) => {
                if (locks) {
                    const keys = getPoppersKeys(draft, locks);
                    keys.forEach((popperId) => {
                        if (popperId === id) {
                            return;
                        }
                        draft.set(popperId, { lock: true, open: false });
                    });
                }
                draft.set(id, { open: true, lock: false });
            })),
            onClose: () => setPoppers(produce((draft) => {
                if (locks) {
                    const keys = getPoppersKeys(draft, locks);
                    keys.forEach((popperId) => {
                        if (popperId === id) {
                            return;
                        }
                        draft.set(popperId, { lock: false, open: false });
                    });
                }
                const prev = draft.get(id) || {};
                draft.set(id, { ...prev, open: false });
            })),
        };
    }, []);
    const isLocked = useCallback((id) => !!poppers.get(id)?.lock, [poppers]);
    const isOpen = useCallback((id) => !!poppers.get(id)?.open, [poppers]);
    return {
        registerPopper: register,
        isPopperLocked: isLocked,
        isPopperOpen: isOpen,
    };
}
function getPoppersKeys(draft, matches) {
    const keys = Array.from(draft.keys());
    if (Array.isArray(matches)) {
        return keys.filter((key) => matches.includes(key));
    }
    return keys;
}
//# sourceMappingURL=useSyncPoppers.js.map