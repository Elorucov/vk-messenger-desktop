import '../../ui/ConvoHeader/ConvoHeader.css';
import React from 'react';
import cx from 'classnames';
import { Icon24ChevronCompactLeft } from '@vkontakte/icons';
import { Subhead } from '@vkontakte/vkui';
import { useBrowserEnv, useOwner } from '../../hooks/misc';
import * as Peer from '../../../core/model/Peer';
import { Tooltip } from '../../ui/Tooltip/Tooltip';
import { AvatarFavorites } from '../../ui/AvatarFavorites/AvatarFavorites';
import { Avatar } from '../../ui/Avatar/Avatar';
import { ConvoTitle } from '../../ui/ConvoTitle/ConvoTitle';
export const ConvoPostponedHeader = ({ convo, peer, onBack, }) => {
    const { lang } = useBrowserEnv();
    const owner = useOwner();
    const isFavorites = owner.kind !== 'Group' && Peer.isFavorites(peer.id, owner.id);
    const subtitle = (() => {
        switch (true) {
            case isFavorites: {
                return lang.use('me_postponed_convo_header_desc', {
                    values: { title: lang.use('me_favorites') },
                });
            }
            case convo.kind === 'UserConvo':
            case convo.kind === 'ContactConvo': {
                return lang.use('me_postponed_user_header_desc', {
                    values: { name: Peer.firstName(peer, 'ins') },
                });
            }
            default: {
                return lang.use('me_postponed_convo_header_desc', {
                    values: { title: Peer.firstName(peer) },
                });
            }
        }
    })();
    return (React.createElement("header", { className: cx('ConvoHeader') },
        React.createElement(Tooltip, { position: "bottom", align: "center", content: lang.use('me_route_back') },
            React.createElement("button", { "aria-label": lang.use('me_route_back'), className: "ConvoHeader__action ConvoHeader__back", onClick: onBack },
                React.createElement(Icon24ChevronCompactLeft, null))),
        React.createElement("div", { className: "ConvoHeader__avatar", role: "img", "aria-hidden": true }, isFavorites ? (React.createElement(AvatarFavorites, { size: 32 })) : (React.createElement(Avatar, { peer: peer, size: 32, withOnline: true, withBirthday: true }))),
        React.createElement("div", { className: "ConvoHeader__infoContainer" },
            React.createElement(ConvoTitle, { peer: peer, title: lang.use('me_postponed_convo_header_title'), 
                /**
                 * Не показываем никаких иконок индикаторов чата
                 */
                isMuted: false, isCasper: false, className: "ConvoHeader__title", TitleComponent: "h2" }),
            React.createElement("div", { className: "ConvoHeader__statusContainer" },
                React.createElement(Subhead, { weight: "3", className: "ConvoHeader__PostponedStatus ConvoHeader__status", useAccentWeight: true }, subtitle)))));
};
//# sourceMappingURL=ConvoPostponedHeader.js.map