import { jsx as _jsx } from "react/jsx-runtime";
import { asyncImportLoader } from '@vkontakte/vkjs';
import { lazy, Suspense } from 'react';
import { Spinner } from '../Adopted';
const QRCodeBase = lazy(() => asyncImportLoader(async () => {
    const module = await import(/* webpackChunkName: "vkcom-kit-qr-code-base" */ './QRCodeBase');
    return {
        default: module.QRCodeBase,
    };
}));
export const QRCode = ({ size, style, getRootRef, ...restProps }) => {
    return (_jsx(Suspense, { fallback: _jsx("div", { ...restProps, style: { ...style, height: size, width: size }, ref: getRootRef, children: _jsx(Spinner, {}) }), children: _jsx(QRCodeBase, { ...restProps, size: size, style: style, getRootRef: getRootRef }) }));
};
//# sourceMappingURL=QRCode.js.map