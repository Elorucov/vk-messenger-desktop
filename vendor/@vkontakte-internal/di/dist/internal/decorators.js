// eslint-disable-next-line no-restricted-imports
import { Lifecycle } from 'tsyringe';
import { constructorWrapper, containerScopeRegistrations, globalScopeRegistrations, platformScopeRegistrations, transientScopeRegistrations, } from './construction-interceptor';
import { scopes } from '../scope';
import { mapScopeToTsyringeScoped } from '../utils';
export const scoped = (scope, options = {}) => (Target) => {
    // @ts-expect-error TS2345: Argument of type 'AnyConstructor<InstanceType>' is not assignable to parameter of type 'Constructor<any>'.
    const wrappedConstructor = constructorWrapper(scope, Target, { abstract: options.abstract });
    const tsyringeScoped = mapScopeToTsyringeScoped(scope);
    switch (scope) {
        case scopes.CONTAINER:
            containerScopeRegistrations.add(wrappedConstructor);
            break;
        case scopes.GLOBAL:
            globalScopeRegistrations.add(wrappedConstructor);
            break;
        case scopes.PLATFORM:
            platformScopeRegistrations.add(wrappedConstructor);
            break;
        case scopes.TRANSIENT:
            transientScopeRegistrations.add(wrappedConstructor);
            break;
    }
    tsyringeScoped(wrappedConstructor);
    return wrappedConstructor;
};
export function mapScopeToTsyringeLifecycleType(scope) {
    switch (scope) {
        case 'GLOBAL':
            return Lifecycle.Singleton;
        case 'PLATFORM':
            return Lifecycle.Singleton;
        case 'CONTAINER':
            return Lifecycle.ContainerScoped;
        case 'TRANSIENT':
            return Lifecycle.Transient;
    }
    throw new Error('Unknown scope');
}
//# sourceMappingURL=decorators.js.map