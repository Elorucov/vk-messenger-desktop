import React, { useMemo } from 'react';
import cx from 'classnames';
import { OrganizationCell } from '../../ui/OrganizationCell/OrganizationCell';
import { Button, ButtonGroup, Image, Separator, SimpleCell, } from '@vkontakte/vkui';
import { Icon12ErrorCircleFill, Icon24Add, Icon24BankOutline, } from '@vkontakte/icons';
import { useBrowserEnv } from '../../hooks/misc';
import '../../ui/ConvoProfileOrganizations/ConvoProfileOrganizations.css';
const LIMIT = 2;
export const ConvoProfileOrganizations = ({ organizations, onShowMore, className, canAddOrg, onAddToOrg, }) => {
    const { lang } = useBrowserEnv();
    const organizationsSlice = useMemo(() => organizations.slice(0, LIMIT), [organizations]);
    const actions = useMemo(() => {
        const items = [];
        const hasMore = organizationsSlice.length < organizations.length;
        if (hasMore) {
            items.push({
                label: lang.use('me_convo_profile_all_edu_organizations'),
                onClick: onShowMore,
            });
        }
        if (canAddOrg) {
            items.push({
                label: lang.use('me_convo_profile_invite_to_edu_organization'),
                onClick: onAddToOrg,
                before: React.createElement(Icon24Add, null),
            });
        }
        return items;
    }, [
        canAddOrg,
        onAddToOrg,
        lang,
        onShowMore,
        organizations.length,
        organizationsSlice.length,
    ]);
    if (organizations.length === 0 && !canAddOrg) {
        return null;
    }
    const renderContent = () => {
        if (organizations.length === 0 && canAddOrg) {
            return (React.createElement(SimpleCell, { chevron: "always", onClick: onAddToOrg, subtitle: lang.use('me_convo_profile_invite_to_edu_organization_description'), before: React.createElement(Image, { className: "ConvoProfileOrganizations__emptyImage", noBorder: true, size: 36, "aria-hidden": true },
                    React.createElement(Icon24BankOutline, null),
                    React.createElement(Icon12ErrorCircleFill, { className: "ConvoProfileOrganizations__emptyBadge" })), className: "ConvoProfileOrganizations__empty" }, lang.use('me_convo_profile_invite_to_edu_organization')));
        }
        return (React.createElement("div", { className: cx('ConvoProfileOrganizations', className) },
            organizationsSlice.map((organization) => (React.createElement(OrganizationCell, { key: organization.id, organization: organization, isCompact: true }))),
            !!actions.length && (React.createElement(ButtonGroup, { className: "ConvoProfileOrganizations__actions" }, actions.map((action, index) => (React.createElement(Button, { key: action.label, onClick: action.onClick, appearance: "accent", mode: "secondary", size: "l", before: action.before, stretched: index === 0, "aria-label": action.label }, index === 0 ? action.label : null)))))));
    };
    return (React.createElement(React.Fragment, null,
        React.createElement(Separator, null),
        renderContent()));
};
//# sourceMappingURL=ConvoProfileOrganizations.js.map