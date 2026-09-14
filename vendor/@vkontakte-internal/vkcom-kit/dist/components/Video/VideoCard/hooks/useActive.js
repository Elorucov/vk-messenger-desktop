import { useState } from 'react';
export const useActive = (initialValue = false) => {
    const [isActive, setIsActive] = useState(initialValue);
    const activate = () => setIsActive(true);
    const deactivate = () => setIsActive(false);
    return { activate, deactivate, isActive };
};
//# sourceMappingURL=useActive.js.map