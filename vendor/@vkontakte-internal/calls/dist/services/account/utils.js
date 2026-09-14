import { OnboardingFeature } from '@vkontakte-internal/calls-core';
import { getHelpHints } from '../backend';
export { hideHelpHint } from '../backend';
export async function fetchHelpHintByFeature() {
    const availableHelpHints = await getHelpHints(Object.values(OnboardingFeature));
    return availableHelpHints.reduce((result, helpHint) => {
        result[helpHint.id] = helpHint;
        return result;
    }, {});
}
//# sourceMappingURL=utils.js.map