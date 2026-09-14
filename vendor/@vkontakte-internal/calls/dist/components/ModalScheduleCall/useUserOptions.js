import { useRef, useMemo } from 'react';
import { useFormSelectValue } from '../../hooks/useFormSelectValue';
import { useLang } from '../../hooks/useLang';
export const useUserOptions = ({ options, myUserId, forceShow }) => {
    const { getLang } = useLang();
    const optionsStub = useRef([]);
    const select = useFormSelectValue({
        options: options || optionsStub.current,
    });
    const isShow = !!(forceShow || (options && options.length > 1));
    const displayName = useMemo(() => {
        if (select.value === myUserId) {
            return getLang('calls_from_myself');
        }
        return select.label;
    }, [select.value, select.options, select.label]);
    const avatarUrl = useMemo(() => {
        const profile = options?.find((item) => item.value === select.value);
        if (!profile) {
            return '';
        }
        return profile.profile.photo_100 || profile.profile.photo_50 || profile.profile.photo_200 || '';
    }, [select.value, options]);
    return {
        isShow,
        select,
        displayName,
        avatarUrl,
    };
};
//# sourceMappingURL=useUserOptions.js.map