import React, { useEffect, useState } from 'react';
import cx from 'classnames';
import * as Convo from '../../../core/model/Convo';
import * as Peer from '../../../core/model/Peer';
import { useBrowserEnv, useOwner, usePeers, useViewer, } from '../../hooks/misc';
import { Icon20ArticleOutline, Icon20CopyOutline, Icon20GlobeOutline, Icon20MentionOutline, Icon20PhoneOutline, Icon20UserCircleOutline, Icon28CopyOutline, } from '@vkontakte/icons';
import { InfoCell } from '../../ui/InfoCell/InfoCell';
import { CopyText } from '../../ui/CopyText/CopyText';
import '../../ui/ConvoProfileInformation/ConvoProfileInformation.css';
import { ClampText, ClampTextTrigger } from '../../ui/ClampText/ClampText';
import { ExternalLink } from '../../ui/Link/Link';
import { useSnackbar } from '../../hooks/useSnackbar';
import { formatPhoneNumber } from '../../utils/misc';
import { Separator } from '@vkontakte/vkui';
import { ConvoGroupProfileInvitationLink } from '../../ui/ConvoGroupProfileInvitationLink/ConvoGroupProfileInvitationLink';
import * as Viewer from '../../../core/model/Viewer';
import { SFERUM_INTEGRATIONS_DOMAIN } from '../../../core/config/config';
/**
 * @todo Переименовать ConvoProfileInformation в что-то попроще, поскольку сейчас название ConvoProfileInfo занято
 */
export const ConvoProfileInformation = ({ convo, className, openConvo, }) => {
    const { lang } = useBrowserEnv();
    const owner = useOwner();
    const peers = usePeers();
    const { viewer, profileType } = useViewer();
    const [phone, setPhone] = useState(null);
    const isEdu = Viewer.isEdu(profileType);
    useEffect(() => {
        const peer = Peer.safeGet(peers, convo.peerId);
        const phone = Peer.phone(peer);
        if (!phone) {
            return;
        }
        switch (convo.kind) {
            case 'UserConvo':
                setPhone(phone);
                break;
            case 'ContactConvo':
                setPhone(phone);
                formatPhoneNumber(phone)
                    .then((result) => {
                    setPhone(result.international);
                })
                    .catch(() => {
                    // В случае ошибки форматирования выводим телефон как есть
                });
                break;
            default:
        }
    }, [convo, peers]);
    const renderContent = () => {
        const items = [];
        switch (convo.kind) {
            case 'UserConvo': {
                const isFavorites = Peer.isFavorites(convo.peerId, owner.id);
                if (isFavorites) {
                    break;
                }
                const user = Peer.safeGet(peers, convo.peerId);
                const description = Convo.description(convo);
                if (user.screenName && !user.isService) {
                    items.push(React.createElement(InfoCell, { left: React.createElement(ConvoProfileInformationIcon, null,
                            React.createElement(Icon20MentionOutline, null)), right: React.createElement(ConvoProfileInformationCopyButton, { text: `@${user.screenName}`, notification: lang.use('me_convo_profile_screen_name_copied') },
                            React.createElement("button", { className: "ConvoProfileInformationCopyButton" },
                                React.createElement(Icon20CopyOutline, null))), key: "screenName", className: "ConvoProfileInformation__infoCellText" },
                        React.createElement(ConvoProfileInformationCopyButton, { text: `@${user.screenName}`, notification: lang.use('me_convo_profile_screen_name_copied') },
                            React.createElement("div", { className: "ConvoProfileInformation__screenName" }, user.screenName))));
                }
                if (Peer.isEmployee(viewer) && user.id) {
                    items.push(React.createElement(InfoCell, { left: React.createElement(ConvoProfileInformationIcon, null,
                            React.createElement(Icon20UserCircleOutline, null)), right: React.createElement(ConvoProfileInformationCopyButton, { text: user.id.toString(), notification: lang.use('me_convo_profile_id_copied') },
                            React.createElement("button", { className: "ConvoProfileInformationCopyButton" },
                                React.createElement(Icon20CopyOutline, null))), key: "userId", className: "ConvoProfileInformation__infoCellText" },
                        React.createElement(ConvoProfileInformationCopyButton, { text: user.id.toString(), notification: lang.use('me_convo_profile_id_copied') },
                            React.createElement("div", { className: "ConvoProfileInformation__id" }, user.id))));
                }
                if (phone) {
                    items.push(React.createElement(InfoCell, { left: React.createElement(ConvoProfileInformationIcon, null,
                            React.createElement(Icon20PhoneOutline, null)), right: React.createElement(ConvoProfileInformationCopyButton, { text: phone, notification: lang.use('me_convo_profile_phone_copied') },
                            React.createElement("button", { className: "ConvoProfileInformationCopyButton" },
                                React.createElement(Icon20CopyOutline, null))), key: "phone", className: "ConvoProfileInformation__infoCellText" }, phone));
                }
                if (description) {
                    items.push(React.createElement(InfoCell, { left: React.createElement(ConvoProfileInformationIcon, null,
                            React.createElement(Icon20ArticleOutline, null)), className: "ConvoProfileInformation__description", key: "description" },
                        React.createElement(ClampText, { trigger: React.createElement(ClampTextTrigger, { className: "ConvoProfileInformation__descriptionButtonText" }, lang.use('me_convo_profile_information_show_more')), className: "ConvoProfileInformation__descriptionText" }, description)));
                }
                break;
            }
            case 'ChatConvo': {
                const description = Convo.description(convo);
                if (description) {
                    items.push(React.createElement(InfoCell, { left: React.createElement(ConvoProfileInformationIcon, null,
                            React.createElement(Icon20ArticleOutline, null)), className: "ConvoProfileInformation__description", key: "description" },
                        React.createElement(ClampText, { trigger: React.createElement(ClampTextTrigger, { className: "ConvoProfileInformation__descriptionButtonText" }, lang.use('me_convo_profile_information_show_more')), className: "ConvoProfileInformation__descriptionText" }, description)));
                }
                break;
            }
            case 'GroupConvo': {
                const group = Peer.safeGet(peers, convo.peerId);
                const description = Convo.description(convo);
                if (group.screenName) {
                    if (isEdu) {
                        const link = `https://${SFERUM_INTEGRATIONS_DOMAIN}/?p=messages&peerId=${group.id}`;
                        items.push(React.createElement(ConvoGroupProfileInvitationLink, { link: link, openConvo: openConvo, key: "screenName", className: "ConvoProfileInformation__infoCellText" }));
                    }
                    else {
                        items.push(React.createElement(InfoCell, { left: React.createElement(ConvoProfileInformationIcon, null,
                                React.createElement(Icon20MentionOutline, null)), right: React.createElement(ConvoProfileInformationCopyButton, { text: group.screenName, notification: lang.use('me_convo_profile_screen_name_copied') },
                                React.createElement("button", { className: "ConvoProfileInformationCopyButton" },
                                    React.createElement(Icon20CopyOutline, null))), key: "screenName", className: "ConvoProfileInformation__infoCellText" }, group.screenName));
                    }
                }
                if (group.site) {
                    items.push(React.createElement(InfoCell, { left: React.createElement(ConvoProfileInformationIcon, null,
                            React.createElement(Icon20GlobeOutline, null)), right: React.createElement(ConvoProfileInformationCopyButton, { text: group.site, notification: lang.use('me_convo_profile_link_copied') },
                            React.createElement("button", { "aria-label": lang.use('me_aria_group_site_copy'), className: "ConvoProfileInformationCopyButton" },
                                React.createElement(Icon20CopyOutline, null))), key: "site", className: "ConvoProfileInformation__infoCellText" },
                        React.createElement(ExternalLink, { href: group.site, target: "_blank", "aria-label": lang.use('me_aria_group_site_link'), className: "ConvoProfileInformation__link" }, group.site)));
                }
                if (description) {
                    items.push(React.createElement(InfoCell, { left: React.createElement(ConvoProfileInformationIcon, null,
                            React.createElement(Icon20ArticleOutline, null)), className: "ConvoProfileInformation__description", key: "description" },
                        React.createElement(ClampText, { trigger: React.createElement(ClampTextTrigger, null, lang.use('me_convo_profile_information_show_more')) }, description)));
                }
                break;
            }
            case 'ContactConvo': {
                if (phone) {
                    items.push(React.createElement(InfoCell, { left: React.createElement(ConvoProfileInformationIcon, null,
                            React.createElement(Icon20PhoneOutline, null)), right: React.createElement(ConvoProfileInformationCopyButton, { text: phone, notification: lang.use('me_convo_profile_phone_copied') },
                            React.createElement("button", { className: "ConvoProfileInformationCopyButton" },
                                React.createElement(Icon20CopyOutline, null))), key: "phone", className: "ConvoProfileInformation__infoCellText" }, phone));
                }
                break;
            }
            // @todo Отображение информации для всех видов пиров
            default:
        }
        return items;
    };
    const render = () => {
        const items = renderContent();
        if (items.length === 0) {
            return null;
        }
        return (React.createElement(React.Fragment, null,
            React.createElement(Separator, null),
            React.createElement("div", { className: cx('ConvoProfileInformation', className) }, items)));
    };
    return render();
};
const ConvoProfileInformationCopyButton = ({ text, notification, children }) => {
    const snackbar = useSnackbar();
    const onCopy = () => {
        snackbar({
            message: notification,
            before: (React.createElement(Icon28CopyOutline, { className: "ConvoProfileInformationCopyButton__icon" })),
        });
    };
    return (React.createElement(CopyText, { text: text, onCopyDone: onCopy }, children));
};
const ConvoProfileInformationIcon = ({ children }) => {
    return React.createElement("div", { className: "ConvoProfileInformationIcon" }, children);
};
//# sourceMappingURL=ConvoProfileInformation.js.map