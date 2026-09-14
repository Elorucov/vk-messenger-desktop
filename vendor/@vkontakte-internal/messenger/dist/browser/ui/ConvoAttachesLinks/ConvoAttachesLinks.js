import React, { useState } from 'react';
import { Icon20More } from '@vkontakte/icons';
import { useBrowserEnv } from '../../hooks/misc';
import '../../ui/ConvoAttachesLinks/ConvoAttachesLinks.css';
import cx from 'classnames';
import { Dropdown } from '../../ui/Dropdown/Dropdown';
import { ConvoAttachLinkActionsMenu } from '../../ui/ConvoAttachLinkActionsMenu/ConvoAttachLinkActionsMenu';
import { ContextMenu } from '../../ui/ContextMenu/ContextMenu';
import { AttachLink } from '../../ui/AttachLink/AttachLink';
import { AttachMiniApp } from '../../ui/AttachMiniApp/AttachMiniApp';
import { useFastActionsState } from '../../hooks/useFastActionsState';
import { useFastActionsTrigger } from '../../hooks/useFastActionsTrigger';
export const ConvoAttachesLinks = ({ items, goToMessage, }) => {
    const render = () => {
        const keys = new Set();
        return (React.createElement("ul", { className: "ConvoAttachesLinks" }, items.map((item, index) => {
            const key = `${item.cmid}_${item.attach.url}`;
            // С BE может прийти две одинаковые ссылки в одном сообщении, поэтому делаем ключи уникальными в этом случае
            const uniqueKey = keys.has(key) ? `${key}_${index}` : key;
            keys.add(key);
            /*
              Генерация ключа в форме не покрывает все кейсы, потому что
              возможны ситуации когда у одного сообщения есть две идентичные ссылки.
             */
            return (React.createElement(ConvoAttachesLinkItem, { key: uniqueKey, item: item, goToMessage: goToMessage }));
        })));
    };
    return render();
};
const ConvoAttachesLinkItem = ({ item, goToMessage }) => {
    const fastActionsTrigger = useFastActionsTrigger();
    const { isDropdownFastActionsOpened, isContextMenuFastActionsOpened, openDropdownFastActions, openContextMenuFastActions, closeDropdownFastActions, closeContextMenuFastActions, } = useFastActionsState();
    const [itemElement, setItemElement] = useState(null);
    const { lang } = useBrowserEnv();
    const { attach } = item;
    return (React.createElement("li", { ref: (node) => {
            setItemElement(node);
        }, className: "ConvoAttachesLinks__itemContainer" },
        React.createElement("div", { className: "ConvoAttachesLinks__item" },
            attach.kind === 'Link' && (React.createElement(AttachLink, { link: attach, isOut: false, isInBubble: false })),
            attach.kind === 'MiniApp' && (React.createElement(AttachMiniApp, { miniApp: attach, isOut: false, isInBubble: false }))),
        fastActionsTrigger.button && (React.createElement(Dropdown, { open: isDropdownFastActionsOpened, onOpen: openDropdownFastActions, onClose: closeDropdownFastActions, classNames: {
                wrapper: cx('ConvoAttachesLinkItem__dropdown', {
                    'ConvoAttachesLinkItem__dropdown--open': fastActionsTrigger.button === 'tap',
                }),
                wrapperOpened: 'ConvoAttachesLinkItem__dropdown--open',
            }, content: React.createElement(ConvoAttachLinkActionsMenu, { id: "convo_attach_link_actions", cmid: item.cmid, goToMessage: goToMessage }), align: "center", position: "bottom", adaptive: true, hideOnClick: true, openType: fastActionsTrigger.button === 'tap' ? 'click' : 'hover' }, (isOpened) => (React.createElement("button", { className: "ConvoProfileAttachments__action", "aria-label": lang.use('me_actions_more'), "aria-haspopup": "menu", "aria-controls": "convo_attach_link_actions", "aria-expanded": isOpened },
            React.createElement(Icon20More, null),
            fastActionsTrigger.button === 'tap' && (React.createElement("div", { className: "ConvoProfileAttachments__actionTapArea" })))))),
        fastActionsTrigger.rightClick && (React.createElement(ContextMenu, { ref: { current: itemElement }, open: isContextMenuFastActionsOpened, onOpen: openContextMenuFastActions, onClose: closeContextMenuFastActions, allowNativeContextMenu: true, content: React.createElement(ConvoAttachLinkActionsMenu, { cmid: item.cmid, goToMessage: goToMessage }) }))));
};
//# sourceMappingURL=ConvoAttachesLinks.js.map