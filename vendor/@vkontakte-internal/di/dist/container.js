// eslint-disable-next-line no-restricted-imports
import { container, Lifecycle } from 'tsyringe';
import { resolveInterceptor } from './internal/resolve-interceptor';
import { resolveTransformer } from './internal/resolve-transformer';
import { scopes } from './scope';
import { constructorScope, destroy, isRegisteredByValue } from './symbols';
import { mapScopeToTsyringeLifecycleType } from './internal/decorators';
import { isDestroyable } from './internal/guards';
import { containerScopeRegistrations, globalScopeRegistrations, platformScopeRegistrations, transientScopeRegistrations, } from './internal/construction-interceptor';
import { expectNever } from './internal/utils';
export class DIContainer {
    constructor(parent, name) {
        this.name = name;
        this.isIsolated = false;
        this.isDestroyed = false;
        this.children = new Map();
        this.instances = new Map();
        this.parent = parent;
        if (this.parent) {
            this.container = this.parent.container.createChildContainer();
        }
        else {
            this.container = container;
            this.isIsolated = true;
        }
        this.handleConstruction = this.handleConstruction.bind(this);
    }
    /**
     * Позволяет получить инстанс любой декорированной сущности
     * */
    resolve(ClassConstructor) {
        const unapply = resolveInterceptor.apply(this.handleConstruction);
        // @ts-expect-error TS2769: No overload matches this call
        const instance = this.container.resolve(ClassConstructor);
        unapply();
        return instance;
    }
    /**
     * Возвращает true если существует дочерный контейнер с таким именем
     */
    childrenExists(name) {
        return this.children.has(name);
    }
    /**
     * Позволяет получить инстанс любой декорированной сущности.
     * Но при этом произвести манипуляции над зависимостями этой сущности (только на первом уровне)
     * */
    resolveWithTransforms(ClassConstructor, transform) {
        const unapply = resolveTransformer.apply(ClassConstructor, transform);
        const instance = this.resolve(ClassConstructor);
        unapply();
        return instance;
    }
    getConstructorScope(Ctor) {
        if (constructorScope in Ctor) {
            return Ctor[constructorScope];
        }
        return null;
    }
    /**
     * Метод для подмены зависимости.
     * Стоит использовать для замены абстрактных классов на их имплементацию.
     * */
    replace(token, ClassConstructor) {
        const scope = this.getConstructorScope(ClassConstructor);
        if (scope !== this.getConstructorScope(token)) {
            throw new Error('token и constructor должны иметь одинаковый scope');
        }
        // @ts-expect-error TS2769: No overload matches this call.
        this.container.register(token, ClassConstructor, {
            lifecycle: scope ? mapScopeToTsyringeLifecycleType(scope) : Lifecycle.Transient,
        });
    }
    /**
     * @deprecated
     * */
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __internal_replaceToValue(token, value) {
        value[isRegisteredByValue] = true;
        // @ts-expect-error TS2769: No overload matches this call.
        this.container.register(token, { useValue: value });
    }
    /**
     * Метод для изоляции сущностей с декоратором scoped(Scope.GLOBAL)
     * */
    isolate() {
        this.isIsolated = true;
        this.isolateRegistrations();
    }
    /**
     * Позволяет удалить контейнер
     * */
    async destroy() {
        if (this.isDestroyed) {
            return;
        }
        if (!this.parent) {
            throw new Error('Cannot destroy root container!');
        }
        Array.from(this.instances.keys()).forEach((instance) => this.destroyInstance(instance));
        await this.container.dispose();
        this.parent.children.delete(this.name);
        this.isDestroyed = true;
    }
    /**
     * Позволяет вызвать деструктор у конкретного инстанса
     * */
    destroyInstance(instance) {
        if (!this.instances.has(instance)) {
            return;
        }
        const deps = this.instances.get(instance);
        if (isDestroyable(instance)) {
            instance[destroy]();
        }
        this.instances.delete(instance);
        deps?.forEach((dep) => this.destroyInstance(dep));
    }
    /**
     * Создаёт потомка контейнера
     * @param {string} name - имя контейнера, используемое для сериализации и десериализации состояния
     * @param {boolean} isIsolated - флаг изоляции сущностей с декораторов scoped(Scope.GLOBAL)
     * */
    child(name, isIsolated) {
        const child = this.createChild(name);
        if (isIsolated) {
            child.isolate();
        }
        return child;
    }
    /** Скоупы регистраций, которые могут быть изолированы */
    get isolatingRegistrationsScopes() {
        return [scopes.GLOBAL];
    }
    /** Создает инстанс потомка контейнера и добавляет его к существующим `children` */
    createChild(name) {
        if (this.children.has(name)) {
            throw new Error(`Container child with same name "${name}" already exists!`);
        }
        const child = new DIContainer(this, name);
        if (this.parent) {
            this.children.set(name, child);
        }
        return child;
    }
    /** Возвращает по указанному скоупу регистрации, которые могут изолированы */
    getScopeRegistrations(scope) {
        switch (scope) {
            case scopes.PLATFORM:
                return platformScopeRegistrations;
            case scopes.GLOBAL:
                return globalScopeRegistrations;
            case scopes.CONTAINER:
                return containerScopeRegistrations;
            case scopes.TRANSIENT:
                return transientScopeRegistrations;
            default:
                expectNever(scope);
        }
    }
    /** Изолирует регистрацию */
    isolateRegistration(token, scope) {
        this.container.register(token, token, { lifecycle: this.toLifecycle(scope) });
    }
    /** Преобразуеет скоуп регистрации в тип жизненного цикла базового контейнера */
    toLifecycle(scope) {
        return mapScopeToTsyringeLifecycleType(scope);
    }
    /** Изолирует регистрации */
    isolateRegistrations() {
        if (this.isolatingRegistrationsScopes.length < 1)
            return;
        this.isolatingRegistrationsScopes.forEach((scope) => {
            this.getScopeRegistrations(scope).forEach((token) => {
                this.isolateRegistration(token, scope);
            });
        });
    }
    /** Обработчик вызова конструктора зависимости */
    handleConstruction(data) {
        const { type, instance, args } = data;
        const shouldSaveInCurrent = (this.isolatingRegistrationsScopes.includes(type) && this.isIsolated) ||
            type === scopes.CONTAINER ||
            type === scopes.TRANSIENT ||
            !this.parent;
        if (shouldSaveInCurrent) {
            const transientArgs = args.filter((arg) => arg.constructor[constructorScope] === scopes.TRANSIENT);
            if (transientArgs.length || isDestroyable(instance)) {
                this.instances.set(instance, transientArgs);
            }
        }
        else {
            this.parent?.handleConstruction(data);
        }
    }
}
export const rootContainer = new DIContainer(null, 'root');
//# sourceMappingURL=container.js.map