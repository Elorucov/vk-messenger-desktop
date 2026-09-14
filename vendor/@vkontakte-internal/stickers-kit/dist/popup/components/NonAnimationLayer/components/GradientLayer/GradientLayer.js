import { jsx as _jsx } from "react/jsx-runtime";
import { Appearance, useAppearanceDetector } from '@vkontakte-internal/vkcom-kit';
import styles from './GradientLayer.module.css';
export const GradientLayer = ({ popUpLayerStyle, popUpLayerStyleData }) => {
    const appearance = useAppearanceDetector();
    const style = {
        ...popUpLayerStyle,
        ['--gradient-color']: appearance === Appearance.DARK ? 'rgba(0, 0, 0, 0.40)' : 'var(--white_alpha40)',
    };
    return (_jsx("div", { style: style, className: popUpLayerStyleData?.isRadialGradient
            ? styles.wrapperWithRadialGradient
            : styles.wrapperWithLinearGradient }));
};
//# sourceMappingURL=GradientLayer.js.map