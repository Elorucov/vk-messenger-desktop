import { createPortal } from 'react-dom';
export function ModalPortalToBody({ children }) {
    return createPortal(children, document.body);
}
//# sourceMappingURL=ModalPortalToBody.js.map