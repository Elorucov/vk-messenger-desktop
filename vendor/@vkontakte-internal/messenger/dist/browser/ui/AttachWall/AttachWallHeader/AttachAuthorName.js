import React from 'react';
import { Link } from '../../../ui/Link/Link';
import { PeerTitle } from '../../../ui/PeerTitle/PeerTitle';
export const AttachAuthorName = ({ author, link, skipImageStatus = true }) => {
    return (React.createElement(Link, { to: link, className: "AttachWallNew__authorLink" },
        React.createElement(PeerTitle, { peer: author, skipImageStatus: skipImageStatus })));
};
//# sourceMappingURL=AttachAuthorName.js.map