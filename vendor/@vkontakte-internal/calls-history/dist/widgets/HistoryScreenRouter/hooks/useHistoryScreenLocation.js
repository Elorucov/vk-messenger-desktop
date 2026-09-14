import { useMemo, useState } from 'react';
import { HistoryScreenSections } from '@vkontakte-internal/calls-core';
export const useHistoryScreenLocation = (location, startedSection) => {
    const { urlSection } = useMemo(() => {
        const params = new URLSearchParams(location.search);
        if (startedSection && Object.values(HistoryScreenSections).includes(startedSection)) {
            return {
                urlSection: startedSection,
            };
        }
        return {
            urlSection: params.get('section') || '',
        };
    }, [location, startedSection]);
    const [section, setSection] = useState(urlSection);
    return {
        section,
        setSection,
    };
};
//# sourceMappingURL=useHistoryScreenLocation.js.map