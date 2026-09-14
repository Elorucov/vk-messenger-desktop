import { useMemo } from 'react';
import { useLang } from '../../hooks/useLang';
import { useFormSelectValue } from '../../hooks/useFormSelectValue';
import { ETranslationPrivacy } from '@vkontakte-internal/calls-core';
export const useTranslationPrivacyOptions = (config, isAvailableByLink = false) => {
    const shouldLimitPrivacyOptions = Boolean(config?.sferum);
    const { getLang } = useLang();
    const userOptions = useMemo(() => {
        const result = [
            {
                value: ETranslationPrivacy.OnlyMe,
                label: getLang('calls_translation_privacy_only_me_and_chat'),
            },
            ...(shouldLimitPrivacyOptions
                ? []
                : [
                    {
                        value: ETranslationPrivacy.Friends,
                        label: getLang('calls_translation_privacy_friends_and_chat'),
                    },
                ]),
            { value: ETranslationPrivacy.All, label: getLang('calls_translation_privacy_all_users') },
        ];
        if (isAvailableByLink) {
            result.push({
                value: ETranslationPrivacy.ByLink,
                label: getLang('calls_those_who_have_link'),
            });
        }
        return result;
    }, [isAvailableByLink]);
    const groupOptions = [
        { value: ETranslationPrivacy.Members, label: getLang('calls_call_community_members') },
    ];
    const userOptionsSelect = useFormSelectValue({
        ...(!isAvailableByLink && shouldLimitPrivacyOptions ? { initialValue: ETranslationPrivacy.All } : {}),
        options: userOptions,
    });
    const groupOptionsSelect = useFormSelectValue({
        options: groupOptions,
    });
    return {
        userOptionsSelect,
        groupOptionsSelect,
    };
};
//# sourceMappingURL=useTranslationPrivacyOptions.js.map