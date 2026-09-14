import { jsx as _jsx } from "react/jsx-runtime";
// eslint-disable-next-line no-restricted-imports
import QRCodeGenerator from '@vkontakte/vk-qr';
import { classNames } from '@vkontakte/vkjs';
import { useExternRef, useObjectMemo } from '@vkontakte-internal/react-utils';
import { useLayoutEffect, useMemo } from 'react';
import { useAppearance } from '../Adopted';
import { InnerHTML } from '../InnerHTML/InnerHTML';
import styles from './QRCodeBase.module.css';
export const QRCodeBase = ({ getRootRef, text, size, options, className, mode = 'transparent', style, ...restProps }) => {
    const innerHTMLRef = useExternRef(getRootRef);
    const appearance = useAppearance();
    const qrCodeOptionsMemo = useObjectMemo(options);
    const paddingAndRadius = Math.round(size / 10); // 10%
    const actualSize = mode === 'contrast' ? size - paddingAndRadius * 2 : size;
    const containerStyle = useMemo(() => {
        return mode === 'contrast'
            ? {
                padding: paddingAndRadius,
                borderRadius: paddingAndRadius,
                backgroundColor: '#FFFFFF',
            }
            : null;
    }, [mode, paddingAndRadius]);
    const qrCode = useMemo(() => {
        const qrOverrideOptions = {};
        if (mode !== 'contrast') {
            qrOverrideOptions.foregroundColor =
                qrCodeOptionsMemo?.foregroundColor ?? (appearance === 'dark' ? '#FFFFFF' : '#000000');
        }
        return QRCodeGenerator.createQR(text, { qrSize: actualSize, ...qrCodeOptionsMemo, ...qrOverrideOptions });
    }, [text, actualSize, qrCodeOptionsMemo, appearance, mode]);
    useLayoutEffect(() => {
        const innerHTML = innerHTMLRef.current;
        if (!innerHTML)
            return;
        // @vkontakte/vk-qr не использует числа с плавающей точкой, из-за этого получается отступ справа и снизу, растягиваем
        const g = innerHTML.querySelector('defs + g');
        if (!g) {
            return;
        }
        const { width, height } = g.getBoundingClientRect();
        g.style.transformOrigin = `${width / 2}px ${height / 2}px`;
        g.style.transform = `scale(${actualSize / Math.max(width, height)})`;
    }, [actualSize, innerHTMLRef]);
    return (_jsx(InnerHTML, { ...restProps, getRootRef: innerHTMLRef, Component: "div", className: classNames(styles.root, className), style: {
            ...containerStyle,
            ...style,
            width: size,
            height: size,
        }, children: qrCode }));
};
//# sourceMappingURL=QRCodeBase.js.map