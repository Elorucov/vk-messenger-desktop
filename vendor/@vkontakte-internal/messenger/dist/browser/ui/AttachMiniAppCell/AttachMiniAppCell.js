import '../../ui/AttachMiniAppCell/AttachMiniAppCell.css';
import React from 'react';
import cx from 'classnames';
import { RichCell, Image, ButtonGroup, Button } from '@vkontakte/vkui';
import { useViewport } from '../../hooks/misc';
import { Link } from '../../ui/Link/Link';
import { AttachmentCell } from '../../ui/AttachmentCell/AttachmentCell';
export const MINI_APP_BREAKPOINT = 740;
/**
 * Основной вид аттача.
 */
const AttachMiniAppRichCell = ({ isAvailable = true, isCompact, isForwarded, isInBubble, isPrimary, route, imageSrc, imageAlt, className, children, description, buttonIcon, buttonText, after, onNavigate, }) => {
    const [vw] = useViewport({ debounced: true });
    const shouldRenderCompact = isCompact || vw <= MINI_APP_BREAKPOINT;
    const width = getRichMiniAppAttachMinWidth(!isInBubble, shouldRenderCompact, vw);
    return (React.createElement("div", { className: cx('AttachMiniAppCell AttachMiniAppCell--rich', {
            'AttachMiniAppCell--classic': !isInBubble,
            'AttachMiniAppCell--compact': shouldRenderCompact,
            'AttachMiniAppCell--disabled': !isAvailable,
            'AttachMiniAppCell--forwarded': isForwarded,
            'AttachMiniAppCell--primary': isPrimary,
        }, className), style: {
            '--miniappWidth': `${width}px`,
        } },
        React.createElement(RichCell, { multiline: !isAvailable, extraSubtitle: isAvailable && description, before: React.createElement(Image, { size: shouldRenderCompact ? 48 : 80, borderRadius: "m", src: imageSrc, alt: imageAlt }), actions: isAvailable && (React.createElement(ButtonGroup, { mode: "horizontal", gap: "s", stretched: true },
                React.createElement(Link, { to: route, onNavigate: onNavigate },
                    React.createElement(Button, { Component: "span", 
                        // Сбрасываем оставшиеся атрибуты от `<button />`.
                        tabIndex: undefined, role: undefined, appearance: "accent-invariable", mode: "outline", before: buttonIcon }, buttonText)))) }, isAvailable ? children : description),
        after));
};
/**
 * Вспомогательный (компактный) вид аттача.
 */
const AttachMiniAppBasicCell = ({ isAvailable = true, isInBubble, isOut, route, imageSrc, imageAlt, className, children: title, subtitle, onNavigate, }) => (React.createElement(Link, { to: route, disabled: !isAvailable, className: cx('AttachMiniAppCell', className), onNavigate: onNavigate },
    React.createElement(AttachmentCell, { isClickable: isAvailable, isInBubble: isInBubble, isOut: isOut, title: title, 
        // Не показываем строку с пометкой "приложение" в случае, если это
        // приложение недоступно.
        subtitle: isAvailable ? subtitle : undefined, image: imageSrc, alt: imageAlt })));
/**
 * Компонент для унифицированной отрисовки аттача мини-приложений.
 */
export const AttachMiniAppCell = (props) => {
    if (props.isRich) {
        return React.createElement(AttachMiniAppRichCell, { ...props });
    }
    return React.createElement(AttachMiniAppBasicCell, { ...props });
};
export function getRichMiniAppAttachMinWidth(isClassic, isCompact, vw) {
    if (vw < MINI_APP_BREAKPOINT) {
        if (isClassic && isCompact) {
            return 238;
        }
        if (isClassic) {
            return 248;
        }
        if (isCompact) {
            return 218;
        }
        return 228;
    }
    if (isClassic && isCompact) {
        return 310;
    }
    if (isClassic) {
        return 330;
    }
    if (isCompact) {
        return 290;
    }
    return 310;
}
//# sourceMappingURL=AttachMiniAppCell.js.map