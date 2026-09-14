// eslint-disable-next-line no-restricted-imports
import { injectable, Lifecycle, scoped, singleton } from 'tsyringe';
import { scopes } from '../scope';
/** Преобразует скоуп в декоратору tsyringe, регистрирующему зависимости в контейнере  */
export function mapScopeToTsyringeScoped(scope) {
    switch (scope) {
        case scopes.CONTAINER:
            return scoped(Lifecycle.ContainerScoped);
        case scopes.GLOBAL:
        case scopes.PLATFORM:
            return singleton();
        case scopes.TRANSIENT:
            return injectable();
    }
}
//# sourceMappingURL=mapScopeToTsyringeScoped.js.map