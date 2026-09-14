import '../../ui/ConvoHistoryPlaceholderContactInfo/ConvoHistoryPlaceholderContactInfo.css';
import React, { Fragment } from 'react';
import * as Peer from '../../../core/model/Peer';
import cx from 'classnames';
import { PeerAvatar } from '../../ui/PeerAvatar/PeerAvatar';
import { useBrowserEnv } from '../../hooks/misc';
export const ConvoHistoryPlaceholderContactInfo = ({ peer, isCompactView, isEdu }) => {
    const { lang } = useBrowserEnv();
    const contactDescription = lang.use('me_convo_empty_history_contact_call_to_write');
    return (React.createElement("div", { className: cx('ConvoHistoryPlaceholderContactInfo', {
            'ConvoHistoryPlaceholderContactInfo--s': isCompactView,
        }) },
        React.createElement("div", { className: "ConvoHistoryPlaceholderContactInfo__photoWrap" },
            React.createElement(PeerAvatar, { peer: peer, size: isCompactView ? 64 : 80 })),
        React.createElement("div", { className: "ConvoHistoryPlaceholderContactInfo__name" }, Peer.name(peer)),
        !isEdu && (React.createElement("div", { className: "ConvoHistoryPlaceholderContactInfo__description" }, contactDescription.split('\n').map((item, index) => (React.createElement(Fragment, { key: index },
            item,
            " ",
            React.createElement("br", null))))))));
};
//# sourceMappingURL=ConvoHistoryPlaceholderContactInfo.js.map