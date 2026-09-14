import '../../ui/ConvoAttachesDocs/ConvoAttachesDocs.css';
import { useState } from 'react';
import { Icon20More } from '@vkontakte/icons';
import React from 'react';
import { AttachDoc } from '../../ui/AttachDoc/AttachDoc';
import { ConvoAttachDocActionsMenu } from '../../ui/ConvoAttachDocActionsMenu/ConvoAttachDocActionsMenu';
import { Dropdown } from '../../ui/Dropdown/Dropdown';
import { useBrowserEnv } from '../../hooks/misc';
import cx from 'classnames';
import { ContextMenu } from '../../ui/ContextMenu/ContextMenu';
import { useFastActionsState } from '../../hooks/useFastActionsState';
import { useFastActionsTrigger } from '../../hooks/useFastActionsTrigger';
export const ConvoAttachesDocs = ({ attaches, goToMessage, }) => {
    return (React.createElement("ul", { className: "ConvoAttachesDocs" }, attaches.map((doc) => {
        return (React.createElement(ConvoAttachesDocsItem, { key: `${doc.cmid}-${doc.attach.id}`, doc: doc, goToMessage: goToMessage }));
    })));
};
const ConvoAttachesDocsItem = ({ doc, goToMessage }) => {
    const { lang } = useBrowserEnv();
    const fastActionsTrigger = useFastActionsTrigger();
    const { isDropdownFastActionsOpened, isContextMenuFastActionsOpened, openDropdownFastActions, openContextMenuFastActions, closeDropdownFastActions, closeContextMenuFastActions, } = useFastActionsState();
    const [itemElement, setItemElement] = useState(null);
    return (React.createElement("li", { ref: (node) => {
            setItemElement(node);
        }, className: "ConvoAttachesDocs__itemContainer" },
        React.createElement(AttachDoc, { doc: doc.attach, className: "ConvoAttachesDocs__item" }),
        fastActionsTrigger.button && (React.createElement(Dropdown, { hideOnClick: true, adaptive: true, enableFocusTrap: true, open: isDropdownFastActionsOpened, onOpen: openDropdownFastActions, onClose: closeDropdownFastActions, classNames: {
                wrapper: cx('ConvoAttachesDocs__dropdown', {
                    'ConvoAttachesDocs__dropdown--open': fastActionsTrigger.button === 'tap',
                }),
                wrapperOpened: 'ConvoProfileAttachmentsItem__dropdown--open',
            }, content: React.createElement(ConvoAttachDocActionsMenu, { id: "convo_attach_doc_actions", cmid: doc.cmid, goToMessage: goToMessage }), align: "center", position: "bottom" }, (isOpened) => (React.createElement("button", { className: "ConvoProfileAttachments__action", "aria-label": lang.use('me_actions_more'), "aria-haspopup": "menu", "aria-controls": "convo_attach_doc_actions", "aria-expanded": isOpened },
            React.createElement(Icon20More, null),
            fastActionsTrigger.button === 'tap' && (React.createElement("div", { className: "ConvoProfileAttachments__actionTapArea" })))))),
        fastActionsTrigger.rightClick && (React.createElement(ContextMenu, { ref: { current: itemElement }, open: isContextMenuFastActionsOpened, onOpen: openContextMenuFastActions, onClose: closeContextMenuFastActions, allowNativeContextMenu: true, content: React.createElement(ConvoAttachDocActionsMenu, { cmid: doc.cmid, goToMessage: goToMessage }) }))));
};
//# sourceMappingURL=ConvoAttachesDocs.js.map