import { jsx as _jsx } from "react/jsx-runtime";
import { SeparatorSpacing } from '../../SeparatorSpacing/SeparatorSpacing';
import { useRoundedGroupContext } from '../RoundedGroupContext';
import styles from './RoundedGroupSeparatorSpacing.module.css';
const modeModifiersMap = {
    'vertical': styles.rootVertical,
    'vertical-left': styles.rootVertical,
    'vertical-right': styles.rootVertical,
    'horizontal': styles.rootHorizontal,
    'horizontal-left': styles.rootHorizontal,
    'horizontal-center': styles.rootHorizontal,
    'horizontal-right': styles.rootHorizontal,
};
const separatorModeModifiersMap = {
    'vertical': 'horizontal',
    'vertical-left': 'horizontal',
    'vertical-right': 'horizontal',
    'horizontal': 'vertical',
    'horizontal-left': 'vertical',
    'horizontal-center': 'vertical',
    'horizontal-right': 'vertical',
};
export const RoundedGroupSeparatorSpacing = (props) => {
    const { direction } = useRoundedGroupContext();
    return (_jsx(SeparatorSpacing, { className: modeModifiersMap[direction], mode: separatorModeModifiersMap[direction], direction: separatorModeModifiersMap[direction], ...props }));
};
//# sourceMappingURL=RoundedGroupSeparatorSpacing.js.map