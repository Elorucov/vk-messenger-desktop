import React, { useRef, useState } from 'react';
import { Button, SimpleCell } from '@vkontakte-internal/vkcom-kit';
import { Icon20DeleteOutline, Icon20WriteOutline, Icon24MoreHorizontal, } from '@vkontakte/icons';
import { useBrowserEnv } from '../../hooks/misc';
import { useLayoutData } from '../../ui/LayoutDataProvider/LayoutDataProvider';
import { Dropdown } from '../../ui/Dropdown/Dropdown';
import { ActionsMenu, ActionsMenuAction, } from '../../ui/ActionsMenu/ActionsMenu';
export const TemplateItem = ({ template, onDelete, onEdit, onInsert, }) => {
    return (React.createElement(SimpleCell, { overTitle: template.name, onClick: () => onInsert(template), after: React.createElement(ActionSheet, { template: template, onDelete: onDelete, onEdit: onEdit }), className: "Templates__listItem" }, template.text));
};
const ActionSheet = ({ template, onDelete, onEdit, }) => {
    const { lang } = useBrowserEnv();
    const toggleRef = useRef(null);
    const [isOpened, setIsOpened] = useState(false);
    const { isMobileLayout } = useLayoutData();
    const content = (React.createElement(ActionsMenu, null,
        React.createElement(ActionsMenuAction, { title: lang.use('me_templates_list_item_edit'), leftIcon: React.createElement(Icon20WriteOutline, null), onClick: () => {
                onEdit(template.id);
            }, "aria-label": lang.use('me_templates_list_item_edit') }),
        React.createElement(ActionsMenuAction, { title: lang.use('me_templates_list_item_delete'), leftIcon: React.createElement(Icon20DeleteOutline, { className: "Templates__icon--negative" }), onClick: () => {
                onDelete(template);
            }, "aria-label": lang.use('me_templates_list_item_delete') })));
    return (React.createElement(Dropdown, { disableInert: true, enableFocusTrap: true, open: isOpened, onOpen: () => setIsOpened(true), onClose: () => setIsOpened(false), content: content, align: "center", adaptive: true, hideOnClick: true, hideOnWheel: true, hideOnMouseLeave: true, openType: "click", ...(isMobileLayout
            ? {
                position: 'bottom',
                adaptation: 'horizontal',
            }
            : {
                align: 'center',
                adaptation: 'vertical',
                position: 'right',
            }) },
        React.createElement(Button, { mode: "link", size: "s", getRootRef: toggleRef, "aria-label": lang.use('me_actions_more') },
            React.createElement(Icon24MoreHorizontal, null))));
};
//# sourceMappingURL=TemplateItem.js.map