// eslint-disable-next-line no-restricted-imports
import { useContainer } from '@vkontakte-internal/di';
import { Langs } from './Langs';
export function useLangs() {
    const diContainer = useContainer();
    return diContainer.resolve(Langs);
}
//# sourceMappingURL=useLangs.js.map