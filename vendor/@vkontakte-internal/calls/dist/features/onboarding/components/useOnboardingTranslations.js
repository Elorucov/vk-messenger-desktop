import { useLang } from '../../../hooks/useLang';
import { OnboardingFeature } from '@vkontakte-internal/calls-core';
export const useOnboardingTranslations = (type) => {
    const { getLang } = useLang();
    switch (type) {
        case OnboardingFeature.WATCH_TOGETHER: {
            return {
                title: getLang('calls_watch_together_onboarding_title'),
                subTitle: getLang('calls_watch_together_onboarding_sub_title'),
            };
        }
        case OnboardingFeature.REACTIONS: {
            return {
                title: getLang('calls_reactions_onboarding_title'),
                subTitle: getLang('calls_reactions_onboarding_sub_title'),
            };
        }
        case OnboardingFeature.VMOJI: {
            return {
                title: getLang('calls_vmoji_onboarding_title'),
                subTitle: getLang('calls_vmoji_onboarding_sub_title'),
            };
        }
        case OnboardingFeature.ASR: {
            return {
                title: getLang('intro_hint_title_voip_call_feature_onboarding_subtitles'),
                subTitle: getLang('intro_hint_description_voip_call_feature_onboarding_subtitles'),
                primaryBtnText: getLang('calls_asr_onboarding_enable_subtitles'),
                secondaryBtnText: getLang('calls_asr_onboarding_start_asr'),
            };
        }
    }
};
//# sourceMappingURL=useOnboardingTranslations.js.map