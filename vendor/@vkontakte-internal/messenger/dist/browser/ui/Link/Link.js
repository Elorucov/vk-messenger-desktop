import React, { forwardRef } from 'react';
import { useBrowserEnv, useFeatureFlags } from '../../hooks/misc';
import { IRouter } from '../../../data/env/IRouter';
import { checkLeadsOut, prepareLink } from '../../../core/utils/links';
import { isMouseEventWithModifier } from '../../utils/misc';
import { useConfirmExternalLink } from '../../hooks/useConfirmExternalLink';
export const Link = forwardRef(({ to, children, onNavigate, stopPropagation = true, preventDefault = true, disabled = false, ...rest }, ref) => {
    const props = { ...rest, ref };
    const { router } = useBrowserEnv();
    const { route, url } = router.fromEntity(to, IRouter.Action.Push);
    const handleClick = (e) => {
        if (stopPropagation) {
            e.stopPropagation();
        }
        if (isMouseEventWithModifier(e)) {
            return;
        }
        if (preventDefault) {
            e.preventDefault();
        }
        router.push(to);
        onNavigate?.();
    };
    if (IRouter.isRuntimeRoute(route) && !disabled) {
        return (React.createElement("span", { ...props, onClick: handleClick }, children));
    }
    if (!url || disabled) {
        return React.createElement("span", { ...props }, children);
    }
    if (!route) {
        // Для кейса со ссылками на аттачи, которые не умеем обрабатывать в рефе
        return (React.createElement(ExternalLink, { ...props, href: url, onClick: handleClick }, children));
    }
    return (React.createElement("a", { ...props, href: url, onClick: handleClick }, children));
});
export const ExternalLink = forwardRef(({ children, href, target, disabled, onClick, stopPropagation = true, withWarningModal, ...props }, $ref) => {
    const { vkDomain } = useBrowserEnv();
    const { vkm_domain_whitelist } = useFeatureFlags();
    const { handleConfirmExternalLink, renderConfirmExternalLinkModal } = useConfirmExternalLink();
    const handleClick = (e) => {
        if (stopPropagation) {
            e.stopPropagation();
        }
        if (withWarningModal) {
            const needToConfirm = checkLeadsOut(vkDomain, href, vkm_domain_whitelist);
            if (needToConfirm) {
                handleConfirmExternalLink(href);
                e.preventDefault();
            }
        }
        if (isMouseEventWithModifier(e)) {
            return;
        }
        onClick?.(e);
    };
    if (disabled) {
        return (React.createElement("span", { ...props, ref: $ref }, children));
    }
    return (React.createElement(React.Fragment, null,
        React.createElement("a", { ...props, ref: $ref, onClick: handleClick, href: props.download ? href : prepareLink(vkDomain, href), target: target || '_blank', rel: "noopener noreferrer" }, children),
        renderConfirmExternalLinkModal({})));
});
//# sourceMappingURL=Link.js.map