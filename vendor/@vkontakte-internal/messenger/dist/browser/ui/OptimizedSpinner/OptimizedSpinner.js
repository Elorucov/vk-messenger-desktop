import '../../ui/OptimizedSpinner/OptimizedSpinner.css';
import React, { useEffect } from 'react';
import cx from 'classnames';
import { Spinner } from '@vkontakte/vkui';
import { useInView } from 'react-intersection-observer';
export const OptimizedSpinner = ({ className, spinnerClassName, size = 's', intersectionOptions, onIntersection, }) => {
    const { ref, inView } = useInView({
        ...intersectionOptions,
        threshold: 0.01,
    });
    useEffect(() => {
        if (inView && onIntersection) {
            onIntersection();
        }
        // Не вызывать коллбэк при изменении onIntersection
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inView]);
    return (React.createElement("div", { role: "presentation", ref: ref, className: cx('OptimizedSpinner', className) },
        React.createElement(Spinner, { size: size, disableAnimation: !inView, className: spinnerClassName })));
};
//# sourceMappingURL=OptimizedSpinner.js.map