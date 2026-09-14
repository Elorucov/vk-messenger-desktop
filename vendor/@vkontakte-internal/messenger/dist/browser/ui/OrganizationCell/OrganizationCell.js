import React, { useCallback, useLayoutEffect, useMemo, useRef, useState, } from 'react';
import cx from 'classnames';
import * as Peer from '../../../core/model/Peer';
import * as Attach from '../../../core/model/Attach';
import { Tappable, Footnote, Headline, Image } from '@vkontakte/vkui';
import { Icon24BankOutline, Icon24ChevronCompactRight } from '@vkontakte/icons';
import { useFeatureFlags, useViewer, useViewport } from '../../hooks/misc';
import { useRouter } from '../../ui/Router/Router';
import { EDU_LK_SFERUM_MINI_APP_ID } from '../../../core/config/config';
import '../../ui/OrganizationCell/OrganizationCell.css';
/**
 * Примерная высота двух строк
 */
const APPROXIMATE_TWO_LINES_HEIGHT = 65;
export const OrganizationCell = ({ organization, isCompact = false, skipCanNavigate, }) => {
    const { viewer } = useViewer();
    const featureFlags = useFeatureFlags();
    const { navigate } = useRouter();
    const $container = useRef(null);
    const [isExtended, setExtended] = useState(() => organization.roles.length > 1);
    const viewport = useViewport({ debounced: true });
    const canNavigate = useMemo(() => featureFlags.vkm_edu_org_navigation &&
        (skipCanNavigate || Peer.canOpenSferumMiniApp(viewer, organization)), [
        featureFlags.vkm_edu_org_navigation,
        organization,
        skipCanNavigate,
        viewer,
    ]);
    // при превышении двух строк, смещаем иконки и шеврон в начало
    useLayoutEffect(() => {
        if (!$container.current) {
            return;
        }
        if ($container.current.clientHeight > APPROXIMATE_TWO_LINES_HEIGHT) {
            setExtended(true);
        }
        // на ресайз тоже проверяем
    }, [viewport]);
    const onNavigate = useCallback(() => {
        navigate({
            kind: 'MiniAppModal',
            miniAppId: Attach.resolveMiniAppId(EDU_LK_SFERUM_MINI_APP_ID),
            hash: `/organizations/${organization.id}`,
        });
    }, [navigate, organization.id]);
    return (React.createElement(Tappable, { className: cx('OrganizationCell', {
            'OrganizationCell--extended': isExtended,
            'OrganizationCell--compact': isCompact,
        }), hasActive: canNavigate, hasHover: canNavigate, onClick: canNavigate ? onNavigate : undefined },
        React.createElement("div", { className: "OrganizationCell__before" },
            React.createElement(Image, { noBorder: true, size: 36 },
                React.createElement(Icon24BankOutline, null))),
        React.createElement("div", { className: "OrganizationCell__middle", ref: $container },
            React.createElement(Headline, { className: "OrganizationCell__name", weight: "3", useAccentWeight: true }, organization.name),
            React.createElement(Footnote, { normalize: false, className: "OrganizationCell__text" },
                React.createElement("ul", null, organization.roles.map((role) => (React.createElement("li", { key: role.name }, role.name)))))),
        canNavigate && (React.createElement("div", { className: "OrganizationCell__after" },
            React.createElement(Icon24ChevronCompactRight, { className: 'OrganizationCell__chevronIcon' })))));
};
//# sourceMappingURL=OrganizationCell.js.map