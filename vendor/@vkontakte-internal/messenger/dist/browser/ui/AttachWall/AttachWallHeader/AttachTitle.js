import { AttachAuthorName } from '../../../ui/AttachWall/AttachWallHeader/AttachAuthorName';
import React, { useRef, useState } from 'react';
import { useBrowserEnv, useFeatureFlags } from '../../../hooks/misc';
import { Interpolate } from '@vkontakte-internal/vkcom-kit';
const AttachTitleRestAuthors = ({ author, authorLink, coownersLength, onRestClick, }) => {
    const { lang } = useBrowserEnv();
    return (React.createElement(Interpolate, { values: {
            name: React.createElement(AttachAuthorName, { author: author, link: authorLink }),
            span: ({ children }) => (React.createElement("span", { className: "AttachWallNew__authorsLink", onClick: onRestClick }, children)),
        } }, lang.use('me_attaches_name_more_authors', {
        num: coownersLength,
        values: {
            name: '<name />',
            span: (children) => `<span>${children}</span>`,
        },
    })));
};
export const AttachTitle = ({ coownerPeers, author, peersCached, getRoute, onRestAuthorsClick, }) => {
    const { vkm_coauthors_posts_and_clips } = useFeatureFlags();
    const { lang } = useBrowserEnv();
    const containerRef = useRef(null);
    const [fits, setFits] = useState(null);
    const getTitle = () => {
        if (!coownerPeers.length || !vkm_coauthors_posts_and_clips) {
            return (React.createElement(AttachAuthorName, { author: author, link: getRoute(author), skipImageStatus: false }));
        }
        return (React.createElement(React.Fragment, null, coownerPeers.length === 1 && peersCached && (fits || fits === null) ? (React.createElement("div", { ref: (ref) => {
                if (fits === null && ref && containerRef.current) {
                    setFits(ref.clientWidth < containerRef.current.clientWidth);
                }
            } }, coownerPeers[0] && (React.createElement(Interpolate, { values: {
                name1: (React.createElement(AttachAuthorName, { author: author, link: getRoute(author) })),
                name2: (React.createElement(AttachAuthorName, { author: coownerPeers[0], link: getRoute(coownerPeers[0]) })),
            } }, lang.use('me_attaches_authors_title_and_name', {
            values: {
                name1: '<name1 />',
                name2: '<name2 />',
            },
        }))))) : (React.createElement(AttachTitleRestAuthors, { author: author, authorLink: getRoute(author), coownersLength: coownerPeers.length, onRestClick: onRestAuthorsClick }))));
    };
    return (React.createElement("div", { className: "AttachWallNew__titleLink", ref: containerRef }, getTitle()));
};
//# sourceMappingURL=AttachTitle.js.map