import { useCallback, useState } from 'react';
import { useDispatch } from './misc';
const MAX_STEP_NUMBER = {
    hasChannels: 2,
    hasNotChannels: 4,
};
export function useChannelsOnboarding({ type, onFinish }) {
    const [step, setStep] = useState(null);
    const dispatch = useDispatch();
    const incrementStep = useCallback(() => {
        setStep((step) => Math.min((step || 0) + 1, MAX_STEP_NUMBER[type]));
    }, [type]);
    const decrementStep = useCallback(() => {
        setStep((step) => Math.max((step || 0) - 1, 1));
    }, []);
    const submit = useCallback((pickedChannelsIds) => {
        onFinish();
        const idsNormalized = Array.isArray(pickedChannelsIds)
            ? pickedChannelsIds
            : [];
        dispatch({
            type: 'ChannelsOnboardingDone',
            pickedChannelsIds: idsNormalized,
            onboardingType: type,
        });
        setStep(null);
    }, [dispatch, type, onFinish]);
    return {
        type,
        step,
        incrementStep,
        decrementStep,
        submit,
    };
}
//# sourceMappingURL=useChannelsOnboarding.js.map