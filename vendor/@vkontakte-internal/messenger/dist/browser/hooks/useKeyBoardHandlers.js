import { isDev } from '../../core/utils/misc';
import { useCallback, useLayoutEffect } from 'react';
import { getKeyCombo, isCharKey, getGlobalKeyCombo, } from '../utils/keyBoardCombos';
import { getActiveElement, isInputElementActive, isInteractiveElementActive, } from '../utils/misc';
import { onElementKeyDownFactory, } from '../utils/elementKeyDown';
export const Module = [
    'MediaViewer',
    'Modal',
    'Dropdown',
    'FCComposer',
    'FCWindow',
    'RightPanel',
    'Composer',
    'ConvoMain',
    'ChannelMain',
    'ConvoList',
];
class KeyBoardHandlersManager {
    globalHandlers = new Map();
    moduleHandlers = new Map();
    activeModules = new Array();
    charKeysHandlerContainer = null;
    constructor() {
        /**
         * Используем фазу перехвата, чтобы обработка события не зависела
         * от прерывания всплытия в других обработчиках.
         */
        document.addEventListener('keydown', this.globalKeyDownHandler, true);
        document.addEventListener('keydown', this.moduleKeyDownHandler);
    }
    activateModule(activeModule) {
        this.activeModules = [
            activeModule,
            ...this.activeModules.filter((module) => module !== activeModule),
        ];
    }
    subscribeCharKeysHandler = (handler) => {
        const eventHandler = this.getCharKeyHandler(handler);
        /**
         * Используем фазу перехвата, чтобы обработка события не зависела
         * от прерывания всплытия в других обработчиках.
         */
        document.addEventListener('keydown', eventHandler, true);
        return () => document.removeEventListener('keydown', eventHandler, true);
    };
    setCharKeysHandlerContainer = (el) => {
        this.charKeysHandlerContainer = el;
    };
    subscribeModuleKeyDown = (moduleName, blockGlobalHandlers, handler) => {
        if (isDev) {
            if (
            /**
             * Для Dropdown условие не получилось соблюсти, поскольку
             * он может не успевать закрыться раньше открытия нового дропдауна.
             * Модалки могут стэкаться и из одной модалки можно вызвать другую
             * в этом случае отписка не успеет сработать
             */
            !['Dropdown', 'Modal'].includes(moduleName) &&
                this.moduleHandlers.get(moduleName)) {
                throw new Error(`Module ${moduleName} is already subscribed. Unsubscribe it first`);
            }
        }
        this.moduleHandlers.set(moduleName, { handler, blockGlobalHandlers });
        return () => {
            /**
             * Проверка нужна поскольку подспика нового модуля может вызваться
             * раньше отписки предыдущего.
             */
            if (this.moduleHandlers.get(moduleName)?.handler === handler) {
                this.moduleHandlers.delete(moduleName);
            }
        };
    };
    subscribeGlobalKeyDown = (keyCombo, subscription) => {
        const isKeyComboSubscribed = this.globalHandlers.has(keyCombo);
        if (isDev && isKeyComboSubscribed) {
            throw new Error(`Global keyCombo ${keyCombo} is already subscribed. Unsubscribe it first`);
        }
        this.globalHandlers.set(keyCombo, subscription);
        return () => {
            this.globalHandlers.delete(keyCombo);
        };
    };
    getModuleSubscription = () => {
        for (const module of this.activeModules) {
            const subscription = this.moduleHandlers.get(module);
            if (subscription) {
                return subscription;
            }
        }
        return undefined;
    };
    callGlobalSubscription = (keyCombo, preventDefault) => {
        if (this.getModuleSubscription()?.blockGlobalHandlers) {
            return;
        }
        const subscription = this.globalHandlers.get(keyCombo);
        if (!subscription) {
            return;
        }
        if (subscription.autoPreventDefault === false) {
            subscription.handler(preventDefault);
            return;
        }
        preventDefault();
        subscription.handler();
    };
    globalKeyDownHandler = (event) => {
        const keyCombo = getGlobalKeyCombo(event);
        if (keyCombo) {
            const preventDefault = event.preventDefault.bind(event);
            this.callGlobalSubscription(keyCombo, preventDefault);
            return;
        }
    };
    getCharKeyHandler = (handler) => (event) => {
        if (!isCharKey(event)) {
            return;
        }
        if (isInputElementActive()) {
            return;
        }
        const activeEl = getActiveElement();
        if (this.hasActiveElement() &&
            activeEl &&
            !this.charKeysHandlerContainer?.contains(activeEl)) {
            return;
        }
        const keyCombo = getKeyCombo(event);
        if (keyCombo?.code === 'Space' && isInteractiveElementActive()) {
            return;
        }
        handler(event);
    };
    moduleKeyDownHandler = (event) => {
        if (!this.hasActiveElement()) {
            this.getModuleSubscription()?.handler(event);
        }
    };
    hasActiveElement = () => {
        const activeEl = getActiveElement();
        return (activeEl !== null &&
            /**
             * Фокус перемещается на body, если произошел анмаунт элемента,
             * который был в фокусе последним.
             * Например, элемент закрывшегося дропдауна / модалки.
             */
            activeEl !== document.body);
    };
}
const keyBoardHandlersManager = new KeyBoardHandlersManager();
/**
 * Хук для модульных подписок для обработки горячих клавиш при отсутствии
 * элемента в фокусе на странице.
 * Подробнее:
 * https://confluence.mvk.com/pages/viewpage.action?pageId=143261162
 * Перед обработкой клавиши добавьте ее в moduleKeyCombo.
 *
 * Также необходимо сделать подписку onKeyDown в jsx,
 * создав обработчик через onElementKeyDownFactory.
 * Это нужно, чтобы не нарушался порядок вызова подписок и
 * корректно работало всплытие.
 * (Поскольку подписки из jsx и js-подписки обрабатываются не по порядку всплытия:
 * https://stackoverflow.com/questions/75876058/in-react-why-does-an-onclick-event-listener-on-an-outer-element-execute-before)
 */
export function useModuleKeyBoardHandlers({ moduleName, blockGlobalHandlers = false, handlerElement, handlerElementRef, }) {
    const getHandlerElement = useCallback(() => {
        if (handlerElement) {
            return handlerElement;
        }
        return handlerElementRef?.current;
    }, [handlerElement, handlerElementRef]);
    /**
     * Используем layout эффект, чтобы обработчик успевал добавиться
     * при фокусе через autofocus или в эффекте дочерних компонентов.
     */
    useLayoutEffect(() => {
        const el = getHandlerElement();
        if (!el) {
            return;
        }
        el.dataset.reforgedKeyDownHandler = '1';
        /**
         * Используем фазу перехвата, чтобы самый глубоко вложенный элемент
         * активировал свой модуль последним.
         */
        const focusinHandler = () => {
            keyBoardHandlersManager.activateModule(moduleName);
        };
        el.addEventListener('focusin', focusinHandler, true);
        return () => {
            el.removeEventListener('focusin', focusinHandler, true);
        };
    }, [getHandlerElement, moduleName]);
    const subscribeKeyDown = useCallback((handler) => {
        const eventHandler = onElementKeyDownFactory(handler);
        return keyBoardHandlersManager.subscribeModuleKeyDown(moduleName, blockGlobalHandlers, eventHandler);
    }, [moduleName, blockGlobalHandlers]);
    const focusHandlerElement = useCallback(() => {
        const el = getHandlerElement();
        if (!el) {
            if (isDev) {
                throw new Error(`Фокус-контейнер не определен в модуле ${moduleName}.`);
            }
            return;
        }
        if (isDev) {
            if (!el.getAttribute('tabindex')) {
                throw new Error(`Не установлен tabindex для фокус-контейнера с классом ${el.className}.
          Установите его значение, даже если оно есть по дефолту.`);
            }
            const styles = window.getComputedStyle(el);
            if (styles.display === 'none' || styles.visibility === 'hidden') {
                throw new Error(`Нельзя сфокусироваться на элемент с классом ${el.className}, потому что он скрыт.
          Проверьте стили display и visibility для этого элемента.`);
            }
        }
        if (!el.contains(document.activeElement)) {
            el.focus({
                preventScroll: true,
            });
        }
    }, [getHandlerElement, moduleName]);
    return {
        subscribeKeyDown,
        focusHandlerElement,
    };
}
/**
 * Хук для глобальных подписок, подробнее: https://confluence.mvk.com/pages/viewpage.action?pageId=143261162
 */
export const useGlobalKeyBoardHandlers = () => {
    return {
        subscribeGlobalKeyDown: keyBoardHandlersManager.subscribeGlobalKeyDown,
    };
};
/**
 * Подписка на обработку символьных клавиш, когда элемент в фокусе не
 * имеет дефолтных обработчиков для них.
 */
export const subscribeCharKeysHandler = keyBoardHandlersManager.subscribeCharKeysHandler;
export const setCharKeysHandlerContainer = keyBoardHandlersManager.setCharKeysHandlerContainer;
//# sourceMappingURL=useKeyBoardHandlers.js.map