import '../../ui/SpaceSection/SpaceSection.css';
import React, { useRef, useState } from 'react';
import { Icon20More, Icon24ChevronDown, Icon24ChevronUp, } from '@vkontakte/icons';
import { useBrowserEnv } from '../../hooks/misc';
import cx from 'classnames';
import { Dropdown } from '../../ui/Dropdown/Dropdown';
import { ActionsMenu, ActionsMenuAction, } from '../../ui/ActionsMenu/ActionsMenu';
import { Link } from '../../ui/Link/Link';
import { useFastActionsState } from '../../hooks/useFastActionsState';
import { ContextMenu } from '../../ui/ContextMenu/ContextMenu';
import { useFastActionsTrigger } from '../../hooks/useFastActionsTrigger';
export const SpaceSection = ({ children, title, sectionId, spaceId, isAdmin, }) => {
    const { storage } = useBrowserEnv();
    const fastActionsTrigger = useFastActionsTrigger();
    const { isDropdownFastActionsOpened, isContextMenuFastActionsOpened, openDropdownFastActions, openContextMenuFastActions, closeDropdownFastActions, closeContextMenuFastActions, } = useFastActionsState();
    const $ref = useRef(null);
    const collapsedSections = storage.get('spaces-sections-collapsed');
    const [isOpened, setIsOpened] = useState(!collapsedSections?.includes(sectionId));
    const handleToggleClick = () => {
        const collapsedSections = storage.get('spaces-sections-collapsed') || [];
        storage.set('spaces-sections-collapsed', isOpened
            ? collapsedSections.concat(sectionId)
            : collapsedSections.filter((i) => i !== sectionId));
        setIsOpened(!isOpened);
    };
    const dropDownOpenParams = fastActionsTrigger.button === 'tap'
        ? {
            openType: 'click',
        }
        : {
            openType: 'hover',
            delay: 100,
        };
    return (React.createElement("div", { className: "SpaceSection" },
        React.createElement("div", { ref: $ref, className: "SpaceSection__header", onClick: handleToggleClick, title: title },
            React.createElement("span", { className: "SpaceSection__title" }, title),
            fastActionsTrigger.button && isAdmin && (React.createElement(Dropdown, { hideOnClick: true, content: React.createElement(SpaceSectionActionsMenu, { spaceId: spaceId, sectionId: sectionId }), align: "center", position: "bottom", open: isDropdownFastActionsOpened, onOpen: openDropdownFastActions, onClose: closeDropdownFastActions, ...dropDownOpenParams },
                React.createElement("span", { className: "SpaceSection__icon SpaceSection__icon--onHover" },
                    React.createElement(Icon20More, null)))),
            React.createElement("span", { className: "SpaceSection__icon" }, isOpened ? React.createElement(Icon24ChevronUp, null) : React.createElement(Icon24ChevronDown, null))),
        React.createElement("div", { className: cx('SpaceSection__rooms', {
                'SpaceSection__rooms--hidden': !isOpened,
            }) }, children),
        fastActionsTrigger.rightClick && isAdmin && (React.createElement(ContextMenu, { ref: $ref, allowNativeContextMenu: true, open: isContextMenuFastActionsOpened, onOpen: openContextMenuFastActions, onClose: closeContextMenuFastActions, content: React.createElement(SpaceSectionActionsMenu, { spaceId: spaceId, sectionId: sectionId }) }))));
};
const SpaceSectionActionsMenu = ({ spaceId, sectionId, }) => {
    const { lang } = useBrowserEnv();
    return (React.createElement(ActionsMenu, null,
        React.createElement(Link, { role: "button", className: "SpaceSection__link", to: {
                kind: 'SpaceRoomCreateModal',
                spaceId,
                sectionId,
            }, stopPropagation: false },
            React.createElement(ActionsMenuAction, { title: lang.use('me_space_section_dropdown_create_room') }))));
};
//# sourceMappingURL=SpaceSection.js.map