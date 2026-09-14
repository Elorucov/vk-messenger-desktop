import { expectNever } from '@vkontakte-internal/utils';
import { useAdaptivityWithJSMediaQueries, ViewWidth } from '../../Adopted';
/**
 * Хук для определения является ли платформа десктопом.
 * @return true если это десктопная платформа и false - если мобильная
 */
export function useIsDesktop() {
    let { viewWidth } = useAdaptivityWithJSMediaQueries();
    switch (viewWidth) {
        case ViewWidth.DESKTOP:
            return true;
        case ViewWidth.TABLET:
        case ViewWidth.SMALL_TABLET:
        case ViewWidth.MOBILE:
        case ViewWidth.SMALL_MOBILE:
            return false;
        default:
            return expectNever(viewWidth);
    }
}
//# sourceMappingURL=useIsDesktop.js.map