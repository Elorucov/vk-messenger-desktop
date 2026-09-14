import '../../ui/SpaceRoomUpsertForm/SpaceRoomUpsertFormWrapper.css';
import React from 'react';
import cx from 'classnames';
export const SpaceRoomUpsertFormWrapper = ({ className, children }) => {
    return (React.createElement("div", { className: cx(className, 'SpaceRoomUpsertFormWrapper') }, children));
};
export const SpaceRoomFormInputLabel = ({ label, right }) => {
    return (React.createElement("div", { className: "SpaceRoomFormInputLabel" },
        React.createElement("span", null, label),
        right && React.createElement("span", null, right)));
};
//# sourceMappingURL=SpaceRoomUpsertFormWrapper.js.map