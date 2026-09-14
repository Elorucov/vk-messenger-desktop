import '../../ui/ConvoTitle/ConvoTitle.css';
import React from 'react';
import { Icon16Education, Icon16LogoVk, Icon16MessageCross, Icon16Muted, Icon16Verified, Icon24LogoVkColor, } from '@vkontakte/icons';
import * as Peer from '../../../core/model/Peer';
import * as Viewer from '../../../core/model/Viewer';
import cx from 'classnames';
import { useBrowserEnv, useOwner, useViewer } from '../../hooks/misc';
import { CasperIcon } from '../../ui/CasperIcon/CasperIcon';
import { Tooltip } from '../../ui/Tooltip/Tooltip';
import { StatusIcon } from '../../ui/StatusIcon/StatusIcon';
import { useColorScheme } from '@vkontakte/vkui';
import { DeferredRendering } from '../../ui/DeferredRendering/DeferredRendering';
/**
 * Компонент для вывода имени беседы: с пользователем, группой или чатом.
 * Поддерживает галочку верификации, отображение иконки замьюченной беседы, умеет сокращать имя в многоточие.
 *
 * Похож на PeerTitle, но предназначен именно для бесед.
 *
 * Можем позволить себе React.memo, потому что peer и значение замученности
 * меняются редко.
 */
export const ConvoTitle = React.memo(function ConvoTitle({ peer, isMuted, isCasper, title, isShortened = false, isMultiline = false, showEmployeeMark = false, className, isForbidedWritingForAll, TitleComponent = 'h3', ImportantMarker, deferMarkersRendering = false, }) {
    const { lang } = useBrowserEnv();
    const owner = useOwner();
    const viewer = useViewer();
    const isEdu = Viewer.isEdu(viewer.profileType);
    const isPeerEmployee = !Peer.isFavorites(peer.id, owner.id) &&
        peer.kind === 'User' &&
        Peer.isEmployee(peer);
    const peerName = isShortened ? Peer.firstName(peer) : Peer.name(peer);
    let convoTitle = owner.kind !== 'Group' && Peer.isFavorites(peer.id, owner.id)
        ? lang.use('me_favorites')
        : peerName;
    convoTitle = title ? title : convoTitle;
    const isDarkTheme = useColorScheme() === 'dark';
    const classNames = cx('ConvoTitle', className, {
        'ConvoTitle--singleLine': !isMultiline,
        'ConvoTitle--multiLine': isMultiline,
    });
    const employeeIcon = showEmployeeMark && isPeerEmployee && (React.createElement(Tooltip, { align: "center", content: lang.use('me_employees_vk_employee'), delay: 1000, position: "bottom" },
        React.createElement("span", { className: "ConvoTitle__icon ConvoTitle__employeeIcon" }, isDarkTheme ? (React.createElement(Icon16LogoVk, null)) : (React.createElement(Icon24LogoVkColor, { width: 16, height: 16 })))));
    const verifiedIcon = peer.kind !== 'Chat' &&
        peer.kind !== 'Contact' &&
        peer.isVerified && (React.createElement("span", { className: "ConvoTitle__icon ConvoTitle__verifiedIcon" }, isEdu && peer.kind === 'User' ? (React.createElement(Icon16Education, null)) : (React.createElement(Icon16Verified, null))));
    const statusIcon = !Peer.isFavorites(peer.id, owner.id) && (React.createElement(StatusIcon, { peer: peer, size: 14, className: "ConvoTitle__icon" }));
    const markers = (React.createElement(React.Fragment, null,
        statusIcon,
        employeeIcon,
        verifiedIcon,
        ImportantMarker,
        isCasper && React.createElement(CasperIcon, { className: "ConvoTitle__icon" }),
        isForbidedWritingForAll && (React.createElement("span", { className: "ConvoTitle__icon ConvoTitle__forbidedWritingIcon" },
            React.createElement(Icon16MessageCross, { "aria-hidden": false, "aria-label": lang.use('me_convo_title_forbided_writing') }))),
        isMuted && (React.createElement("span", { className: "ConvoTitle__icon ConvoTitle__mutedIcon" },
            React.createElement(Icon16Muted, { "aria-hidden": false, "aria-label": lang.use('me_convo_title_muted') })))));
    const deferredMarkers = deferMarkersRendering ? (React.createElement(DeferredRendering, null, markers)) : (markers);
    return (React.createElement("div", { className: classNames }, isMultiline ? (React.createElement("div", { className: "ConvoTitle__title" },
        React.createElement(TitleComponent, { className: "ConvoTitle__author", title: convoTitle }, convoTitle),
        deferredMarkers)) : (React.createElement(React.Fragment, null,
        React.createElement("div", { className: "ConvoTitle__title" },
            React.createElement(TitleComponent, { className: "ConvoTitle__author", title: convoTitle }, convoTitle)),
        deferredMarkers))));
});
//# sourceMappingURL=ConvoTitle.js.map