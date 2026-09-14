import { useStore } from 'effector-react';
import { $api } from '../model/api';
export function useAPI() {
    return useStore($api);
}
//# sourceMappingURL=api.js.map