import { constructorScope, isAbstract } from '../symbols';
import { resolveInterceptor } from './resolve-interceptor';
import { resolveTransformer } from './resolve-transformer';
export const platformScopeRegistrations = new Set();
export const globalScopeRegistrations = new Set();
export const containerScopeRegistrations = new Set();
export const transientScopeRegistrations = new Set();
/**
 * Функция для оборачивания конструкторов классов
 * Позволяет синхронно перехватывать инстанцирование классов в процессе резолва зависимостей через DI
 * */
export const constructorWrapper = (type, Target, options) => {
    const proxy = new Proxy(Target, {
        construct(Ctor, args, newTarget) {
            for (let arg of args) {
                if (arg?.constructor?.[isAbstract]) {
                    throw new Error(`Cannot inject abstract class ${arg.constructor.toString()}`);
                }
            }
            resolveTransformer.run(proxy, args);
            const instance = Reflect.construct(Ctor, args, newTarget);
            resolveInterceptor.run({
                type,
                instance,
                ctor: proxy,
                args,
            });
            return instance;
        },
    });
    // @ts-expect-error TS7053: Element implicitly has an any type because expression of type unique symbol can't be used to index type Constructor<any>
    Target[constructorScope] = type;
    // @ts-expect-error TS7053: Element implicitly has an any type because expression of type unique symbol can't be used to index type Constructor<any>
    Target[isAbstract] = options?.abstract;
    Reflect.defineMetadata('design:paramtypes', Reflect.getMetadata('design:paramtypes', Target) || [], proxy);
    return proxy;
};
//# sourceMappingURL=construction-interceptor.js.map