import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"img":["global",{"className":1}],"div":["global",{"className":7,"style":1}]} */
import { classNames, noop } from '@vkontakte/vkjs';
import { useState } from 'react';
import Link from '../Link/Link';
import { decodeHTMLEntities } from '../helpers';
const CAMERA_THUMB_URL = '/images/camera_c.gif';
const Entity = ({ size = null, photo = '', title = '', description = '', href = '', linkClassName, target, ignoreDecodeHTML, onLinkClick = noop, className, style, onClick, }) => {
    const [errored, setErrored] = useState(false);
    const errorHandler = () => {
        setErrored(true);
    };
    const getPhotoImage = () => (
    // eslint-disable-next-line react/forbid-elements
    _jsx("img", { src: errored ? CAMERA_THUMB_URL : photo, alt: title, onError: errorHandler, className: "Entity__photo" }));
    const componentTitle = ignoreDecodeHTML ? title : decodeHTMLEntities(title);
    return (_jsxs("div", { className: classNames('Entity', className, Boolean(size) && `Entity--size${size}`), style: style, onClick: onClick, children: [_jsx("div", { className: "Entity__aside", children: typeof photo === 'string' ? (href ? ( // Image with link
                // TODO: Поменять a на Link
                // eslint-disable-next-line react/forbid-elements
                _jsx("a", { href: href, target: target, children: getPhotoImage() })) : (getPhotoImage()) // Image without link
                ) : (photo) // Custom markup
             }), _jsxs("div", { className: "Entity__main", children: [title && href ? (_jsx("div", { className: "Entity__title", children: _jsx(Link, { onClick: onLinkClick, className: linkClassName, href: href, target: target, children: componentTitle }) })) : (_jsx("div", { className: "Entity__title", children: componentTitle })), typeof description !== 'string' ? (_jsx("div", { className: "Entity__description", children: description })) : (_jsx("div", { className: "Entity__description", children: decodeHTMLEntities(description) }))] })] }));
};
export default Entity;
//# sourceMappingURL=Entity.js.map