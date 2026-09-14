import { isString } from '@vkontakte/vkjs';
export const collapsedCallPositionStorage = {
    key: 'calls_collapsed_call_position',
    getPosition: () => {
        const value = sessionStorage.getItem(collapsedCallPositionStorage.key);
        return isString(value) ? JSON.parse(value) : undefined;
    },
    setPosition: (next) => {
        sessionStorage.setItem(collapsedCallPositionStorage.key, JSON.stringify(next));
    },
};
//# sourceMappingURL=sessionStorage.js.map