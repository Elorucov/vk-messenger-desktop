import { useMemo, useState } from 'react';
import * as Filters from '../../core/model/Filters';
import * as Convo from '../../core/model/Convo';
export function useFilters(convosCache, filters, initial) {
    const [selectedFilterKind, setSelectedFilterKind] = useState(initial);
    const selectedFilter = useMemo(() => {
        const filter = filters[selectedFilterKind];
        const convos = Array.from(filter.ids.convos, (peerId) => Convo.safeGet(convosCache, peerId)).sort((a, b) => Filters.sorter(a, b));
        return {
            convos,
            filter,
        };
    }, [filters, selectedFilterKind, convosCache]);
    return {
        selectedFilter,
        setSelectedFilter: setSelectedFilterKind,
    };
}
//# sourceMappingURL=useFilters.js.map