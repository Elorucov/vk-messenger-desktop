import React from 'react';
import { Button, Separator } from '@vkontakte/vkui';
import { Icon24Add } from '@vkontakte/icons';
import { ScrollbarProvider } from '@vkontakte-internal/scrollbar';
import { OrganizationCell } from '../../ui/OrganizationCell/OrganizationCell';
import { useBrowserEnv } from '../../hooks/misc';
import '../../ui/ConvoProfileOrganizationsModal/ConvoProfileOrganizationsModal.css';
export const ConvoProfileOrganizationsModal = ({ organizations, onAddToOrg, canAdd, }) => {
    const { lang } = useBrowserEnv();
    return (React.createElement("div", { className: "ConvoProfileOrganizationsModal" },
        React.createElement("div", { className: "ConvoProfileOrganizationsModal__list" },
            React.createElement(ScrollbarProvider, { contentProps: {
                    className: 'ConvoProfileOrganizationsModal__scrollContent',
                }, overflowX: "hidden" }, organizations.map((organization) => (React.createElement(OrganizationCell, { key: organization.id, organization: organization, isCompact: true }))))),
        canAdd && (React.createElement(React.Fragment, null,
            React.createElement(Separator, null),
            React.createElement("div", { className: "ConvoProfileOrganizationsModal__actions" },
                React.createElement(Button, { appearance: "accent", mode: "primary", before: React.createElement(Icon24Add, null), stretched: true, size: "l", onClick: onAddToOrg }, lang.use('me_convo_profile_invite_to_edu_organization')))))));
};
//# sourceMappingURL=ConvoProfileOrganizationsModal.js.map