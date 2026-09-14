import '../../ui/ChannelPostHighlightWrapper/ChannelPostHighlightWrapper.css';
import React, { useMemo } from 'react';
import cx from 'classnames';
import { useMessageBlockHighlight } from '../../hooks/useMessageBlockHighlight';
export const ChannelPostHighlightWrapper = ({ isActive, role = 'presentation', className, ...otherProps }) => {
    const shouldHighlight = useMemo(() => ({
        value: isActive ?? false,
    }), [isActive]);
    const isHighlighted = useMessageBlockHighlight(shouldHighlight);
    return (React.createElement("div", { ...otherProps, role: role, className: cx('ChannelPostHighlightWrapper', className, {
            'ChannelPostHighlightWrapper--active': isHighlighted,
        }) }));
};
//# sourceMappingURL=ChannelPostHighlightWrapper.js.map