import { useEffect } from 'react';
import { createNavGoListener } from './navGoListener';
import { isLocationCallsStandalone } from './url';
export const isFastChatActive = () => {
    /** тк коллбек монтируется и возвращает позитивные ответы раньше ui,
     * то нужно еще проверить, что приложение появилось в dom */
    return !!(
    // eslint-disable-next-line
    // @ts-ignore
    (window.reforgedME?.selectPeer && document.querySelector('.FCApp')));
};
/** проверяет наличие fastchat на ui и метода вызова чата */
export const isFastChatMounted = () => {
    /** проверяем, что находимся на лендосе */
    if (isLocationCallsStandalone()) {
        return false;
    }
    return isFastChatActive();
};
/** хук хелпер для работы с `createNavGoListener` */
export const useNavGoListener = (
/** будет вызван при смене урла */
callback, 
/** можно передать внешний фича флаг для отключения */
isDisabled) => {
    useEffect(() => {
        if (isDisabled ||
            // если нет фастчатов - нет смысла использовать
            !isFastChatActive()) {
            return;
        }
        const listener = createNavGoListener(callback);
        listener.init();
        return () => {
            listener.destroy();
        };
    }, [callback, isDisabled]);
};
/**
 * подписывается на обновления `window.boxLayer` - глобального
 * слоя "аттачей" (фото, видео и тп) для коллапса активного звонка
 */
export const useBoxLayerObserver = (
/** коллбек будет вызван при добавлении `child node` в контейнер `boxLayer` */
callback, 
/** можно передать внешний фича флаг для отключения */
isDisabled) => {
    useEffect(() => {
        if (isDisabled ||
            // если нет фастчатов - нет смысла использовать
            !isFastChatActive() ||
            !window.hasOwnProperty('MutationObserver') ||
            !window.hasOwnProperty('boxLayer') ||
            !window.boxLayer) {
            return;
        }
        const mutationCallback = (mutationRecord) => {
            // достаточно вызвать 1 раз
            let wasCalled = false;
            for (const record of mutationRecord) {
                switch (record.type) {
                    case 'childList': {
                        if (record.addedNodes.length) {
                            callback();
                            wasCalled = true;
                        }
                        break;
                    }
                }
                if (wasCalled) {
                    break;
                }
            }
        };
        const observer = new MutationObserver(mutationCallback);
        observer.observe(window.boxLayer, { childList: true });
        return () => {
            observer.disconnect();
        };
    }, [callback, isDisabled]);
};
//# sourceMappingURL=fastchat.js.map