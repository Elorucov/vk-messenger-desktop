import React, { Fragment } from 'react';
export function nl2br(text) {
    return text.split('\\n').map((item, index) => (React.createElement(Fragment, { key: index },
        item,
        " ",
        React.createElement("br", null))));
}
//# sourceMappingURL=format.js.map