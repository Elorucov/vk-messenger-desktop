import '../../ui/AttachQuestion/AttachQuestion.css';
import React from 'react';
import * as Peer from '../../../core/model/Peer';
import { Icon12Question } from '@vkontakte/icons';
import { ExternalLink, Link } from '../../ui/Link/Link';
import { useBrowserEnv, usePeer } from '../../hooks/misc';
import cx from 'classnames';
export const AttachQuestion = ({ question, peerId, isForwarded = false, isOut, isInBubble, withAuthorName = false, }) => {
    const { lang } = useBrowserEnv();
    const answeredPeer = usePeer(question.ownerId);
    const needShowAuthor = Peer.isGroupPeerId(peerId);
    return (React.createElement("div", { className: cx('AttachQuestion', {
            'AttachQuestion--topRounded': isInBubble && !isForwarded && !withAuthorName,
            'AttachQuestion--outbox': isInBubble && isOut,
            'AttachQuestion--rounded': !isInBubble,
        }) },
        React.createElement("div", { className: "AttachQuestion__heading" },
            React.createElement(Icon12Question, { className: "AttachQuestion__icon" }),
            !needShowAuthor ? (React.createElement(ExternalLink, { href: question.url, className: "AttachQuestion__link" }, lang.use('me_attaches_question_title'))) : (React.createElement(Link, { to: {
                    kind: 'PeerPanel',
                    peerId: question.ownerId,
                    screenName: Peer.screenName(answeredPeer),
                }, className: "AttachQuestion__link" }, Peer.name(answeredPeer)))),
        React.createElement("div", { className: "AttachQuestion__content" }, question.question)));
};
//# sourceMappingURL=AttachQuestion.js.map