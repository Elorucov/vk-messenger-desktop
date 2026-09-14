import '../../ui/SpacesNavbar/SpacesNavbar.css';
import React, { useMemo } from 'react';
import { SpaceAvatar } from '../../ui/SpaceAvatar/SpaceAvatar';
import { Icon24Chats } from '@vkontakte/icons';
import { Icon24Spaces } from '@vkontakte-internal/icons-private';
import { useBrowserEnv, useViewer } from '../../hooks/misc';
import { BasicAvatar } from '../../ui/BasicAvatar/BasicAvatar';
import { useRouter } from '../../ui/Router/Router';
import cx from 'classnames';
import { Tooltip } from '../../ui/Tooltip/Tooltip';
import { Link } from '../../ui/Link/Link';
export const SpacesNavbar = ({ spacesCache, totalUnreadCount, menu, }) => {
    const { lang } = useBrowserEnv();
    const { viewer } = useViewer();
    const { screenRoute } = useRouter();
    const selectedSpaceId = screenRoute.kind === 'SpaceRoute' || screenRoute.kind === 'SpaceRoomRoute'
        ? screenRoute.spaceId
        : undefined;
    const sortedSpaces = useMemo(() => Array.from(spacesCache.values())
        .reduce((acc, space) => {
        if (space) {
            acc.push(space);
        }
        return acc;
    }, [])
        .filter((space) => space.viewerData.isMember)
        .sort((a, b) => (a.position < b.position ? -1 : 1)), [spacesCache]);
    const userAvatar = useMemo(() => {
        if (!viewer.hasDefaultPhoto && viewer.photo) {
            return (React.createElement(BasicAvatar, { size: 36, picture: viewer.photo, content: "", alt: lang.use('me_spaces_navbar_all_chats'), className: "SpacesNavbar__userAvatar" }));
        }
        return React.createElement(Icon24Chats, null);
    }, [lang, viewer.photo, viewer.hasDefaultPhoto]);
    // SPC-TODO Добавить обработку открытия каталога
    const handleOpenCatalog = () => { };
    return (React.createElement("div", { className: "SpacesNavbar" },
        React.createElement("div", { className: "SpacesNavbar__menuButton" }, menu),
        React.createElement("div", { className: "SpacesNavbar__chatsButton" },
            React.createElement(Link, { className: cx('SpacesNavbar__itemLink', {
                    'SpacesNavbar__itemLink--selected': !selectedSpaceId,
                }), to: { kind: 'MainRoute' } },
                React.createElement("div", { className: "SpacesNavbar__itemCell SpacesNavbar__itemCell--withBorder" },
                    userAvatar,
                    totalUnreadCount > 0 && (React.createElement(SpacesNavbarCounter, { counter: totalUnreadCount, isMuted: false }))))),
        React.createElement("div", { className: "SpacesNavbar__listWrapper" },
            React.createElement("ul", { className: "SpacesNavbar__list" }, sortedSpaces.map((space, i) => (React.createElement(Tooltip, { delay: 700, position: "right", align: "center", content: space.name, key: i },
                React.createElement("li", { className: "SpacesNavbar__item" },
                    React.createElement(Link, { className: cx('SpacesNavbar__itemLink', {
                            'SpacesNavbar__itemLink--selected': selectedSpaceId === space.id,
                        }), to: { kind: 'SpaceRoute', spaceId: space.id } },
                        React.createElement("div", { className: "SpacesNavbar__itemCell" },
                            React.createElement(SpaceAvatar, { image: space.avatar, alt: space.name, size: 36 }),
                            space.unreadCount > 0 && (React.createElement(SpacesNavbarCounter, { counter: space.unreadCount, isMuted: Boolean(space.viewerData.notificationSettings?.muteTill) })))))))))),
        React.createElement("div", { className: "SpacesNavbar__catalogButton" },
            React.createElement("button", { className: "SpacesNavbar__itemLink", onClick: handleOpenCatalog },
                React.createElement("div", { className: "SpacesNavbar__itemCell SpacesNavbar__itemCell--withBorder" },
                    React.createElement(Icon24Spaces, null))))));
};
const SpacesNavbarCounter = ({ counter, isMuted, }) => {
    // SPC-TODO уточнить поведение каунтера
    const count = counter > 99 ? '99+' : counter;
    return (React.createElement("div", { className: cx('SpacesNavbarCounter__counter', {
            'SpacesNavbarCounter__counter--muted': isMuted,
        }) }, count));
};
//# sourceMappingURL=SpacesNavbar.js.map