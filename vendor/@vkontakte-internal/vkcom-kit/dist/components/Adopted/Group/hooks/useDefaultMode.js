import { ModalRootContext, SizeType, useAdaptivityWithJSMediaQueries, } from '@vkontakte/vkui';
import { useContext } from 'react';
export function useDefaultMode() {
    const { isInsideModal } = useContext(ModalRootContext);
    const { sizeX } = useAdaptivityWithJSMediaQueries();
    return {
        computedMode: sizeX === SizeType.COMPACT || isInsideModal ? 'plain' : 'card',
        sizeX,
    };
}
//# sourceMappingURL=useDefaultMode.js.map