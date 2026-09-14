import { useState } from 'react';
import { isEqual } from '@vkontakte/vkjs';
export const useObjectMemo = (object) => {
    const [memo, setMemo] = useState(object);
    // Обновление стейта во время рендера — ОК
    // https://beta.reactjs.org/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
    if (!isEqual(object, memo)) {
        setMemo(object);
    }
    return memo;
};
//# sourceMappingURL=useObjectMemo.js.map