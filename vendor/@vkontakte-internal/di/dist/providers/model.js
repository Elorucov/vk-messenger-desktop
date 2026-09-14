import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, Suspense, useContext, useEffect, useRef, useState, } from 'react';
import { runInAction } from 'mobx';
import { init, shouldInitOnSsr, update, constructorScope, pageModel } from '../symbols';
import { isInitable, isUpdatable } from '../internal/guards';
import { ModelEventsHandlers } from './modelEvents';
import { useContainer } from './container';
import { useMemoizeProps, usePostponedEffect } from '../internal/utils';
import { propsAttribute } from './props';
import { scopes } from '../scope';
import { useDIReactConfig } from './di-react-config';
const MainModelContext = createContext(null);
/**
 * Обращаемся к ручке так, потому что тут нет доступа к плагинам.
 * Имя 'partConfigEnabled' необходимо для автоматической сборки ключей через плагин webpack
 */
const partConfigEnabled = (key) => {
    // @ts-expect-error TS2339: описывать тип ручек не нужно, удалить после раскатки
    // eslint-disable-next-line no-restricted-syntax
    return typeof window !== 'undefined' && Boolean(window.vk?.pe?.[key]);
};
/**
 * Создаёт провайдер для вью модели
 * Переданный сервис может быть только scope.transient
 */
export const createProvider = (ModelClass, config) => {
    const { isolatedContext, onlyTransient, ...restConfig } = config || {
        isolatedContext: true,
        onlyTransient: true,
    };
    const isActiveRules = partConfigEnabled('webinf_di_provider_one_context');
    const ModelContext = isActiveRules && isolatedContext ? MainModelContext : createContext(null);
    /**
     * Проверяем, что ViewModel является transient
     */
    if (isActiveRules &&
        onlyTransient &&
        (!(constructorScope in ModelClass) || ModelClass[constructorScope] !== scopes.TRANSIENT)) {
        throw new Error('[DI]: ViewModel can be only TRANSIENT');
    }
    const Provider = (props) => {
        const container = useContainer();
        const { children, ...restProps } = props;
        // TODO [react@>=19.0.0]: Заменить дженерик `T | undefined` на `T`
        const propsRef = useRef(undefined);
        const { isSsr } = useDIReactConfig();
        const initPromiseRef = useRef({});
        const [instance] = useState(() => {
            const res = container.resolveWithTransforms(ModelClass, (args) => {
                const propsInstance = args.find((arg) => arg.constructor[propsAttribute]);
                if (propsInstance) {
                    propsInstance.set(restProps);
                    propsRef.current = propsInstance;
                }
            });
            const modelEventHandlers = container.resolve(ModelEventsHandlers);
            const modelInfo = {
                isPage: Boolean(restConfig[pageModel]),
            };
            if (isInitable(res)) {
                if (isSsr) {
                    if (res[shouldInitOnSsr]) {
                        modelEventHandlers.onStartInit(modelInfo);
                        const initResult = res[init](restProps);
                        if (initResult instanceof Promise) {
                            const initPromise = (async () => {
                                try {
                                    await initResult;
                                    modelEventHandlers.onFinishInit(modelInfo);
                                }
                                finally {
                                    initPromiseRef.current.isPending = false;
                                }
                            })();
                            initPromiseRef.current = { promise: initPromise, isPending: true };
                        }
                        else {
                            modelEventHandlers.onFinishInit(modelInfo);
                        }
                    }
                }
                else {
                    modelEventHandlers.onStartInit(modelInfo);
                    const initResult = res[init](restProps);
                    if (initResult instanceof Promise) {
                        (async () => {
                            await initResult;
                            modelEventHandlers.onFinishInit(modelInfo);
                        })();
                    }
                    else {
                        modelEventHandlers.onFinishInit(modelInfo);
                    }
                }
            }
            return res;
        });
        usePostponedEffect(() => {
            runInAction(() => {
                propsRef.current?.set(restProps);
                if (isUpdatable(instance)) {
                    instance[update](restProps);
                }
            });
        }, useMemoizeProps(restProps));
        useEffect(() => () => {
            container.destroyInstance(instance);
        }, []);
        if (isSsr) {
            return (_jsx(ModelContext.Provider, { value: instance, children: _jsx(Suspense, { fallback: null, children: _jsx(PromiseWaiter, { promiseWithStatus: initPromiseRef.current, children: children }) }) }));
        }
        return _jsx(ModelContext.Provider, { value: instance, children: children });
    };
    const useModel = () => {
        const model = useContext(ModelContext);
        if (!model) {
            throw new Error(`[DI]: The "useModel" hook expects an instance of ${ModelClass.name}, but it looks like no context is provided.`);
        }
        /**
         * Проверяем, что ViewModel используется в пределах своего контекста
         */
        if (isActiveRules && isolatedContext && !(model instanceof ModelClass)) {
            throw new Error(`[DI]: ViewModel ${ModelClass.name} cannot be used in adjacent widgets`);
        }
        return model;
    };
    Object.defineProperty(Provider, 'name', {
        configurable: true,
        value: `${ModelClass.name}Provider`,
    });
    return {
        Provider,
        useModel,
    };
};
function PromiseWaiter(props) {
    const { promiseWithStatus: { promise, isPending }, children, } = props;
    if (promise != null && isPending) {
        throw promise;
    }
    return children;
}
//# sourceMappingURL=model.js.map