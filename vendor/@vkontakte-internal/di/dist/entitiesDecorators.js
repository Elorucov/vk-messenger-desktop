import { scopes } from './scope';
import { scoped } from './internal/decorators';
/* При добавлении/изменении имен поправить build-tools/commands/import-type-protector */
export const scope = {
    container: (options = {}) => scoped(scopes.CONTAINER, options),
    global: (options = {}) => scoped(scopes.GLOBAL, options),
    platform: (options = {}) => scoped(scopes.PLATFORM, options),
    transient: (options = {}) => scoped(scopes.TRANSIENT, options),
};
//# sourceMappingURL=entitiesDecorators.js.map