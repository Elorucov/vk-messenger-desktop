import { useEffect } from 'react';
export function useDocumentKeyDown({ isDisabled, onKeyDown }) {
    useEffect(() => {
        if (!isDisabled && onKeyDown) {
            document.body.addEventListener('keydown', onKeyDown);
            return () => document.body.removeEventListener('keydown', onKeyDown);
        }
    }, [isDisabled, onKeyDown]);
}
//# sourceMappingURL=useDocumentKeyDown.js.map