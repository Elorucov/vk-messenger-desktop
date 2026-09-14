import { useMessageBlockHighlight } from '../../hooks/useMessageBlockHighlight';
import React, { useMemo } from 'react';
import cx from 'classnames';
import '../../ui/HighlightHOC/withHighlight.css';
/**
 * HOC для добавления функционала подсветки обёрнутому компоненту при изменении св-ва isActive в значение true.
 *
 * @template P - Пропсы, передаваемые оборачиваемому компоненту.
 * @param WrappedComponent - Компонент, который будет обёрнут и получит функционал подсветки.
 * @returns Компонент, обёрнутый в контейнер с возможностью подсветки.
 *
 * @example
 * ```tsx
 * const HighlightedComponent = withHighlight(MyComponent);
 * <HighlightedComponent isActive={true} />;
 * ```
 */
export function withHighlight(WrappedComponent) {
    return ({ isActive, role = 'presentation', className, ...props }) => {
        const shouldHighlight = useMemo(() => ({
            value: isActive ?? false,
        }), [isActive]);
        const isHighlighted = useMessageBlockHighlight(shouldHighlight);
        return (React.createElement("div", { role: role, className: cx('HighlightWrapper', className, {
                'HighlightWrapper--active': isHighlighted,
            }) },
            React.createElement(WrappedComponent, { ...props })));
    };
}
//# sourceMappingURL=withHighlight.js.map