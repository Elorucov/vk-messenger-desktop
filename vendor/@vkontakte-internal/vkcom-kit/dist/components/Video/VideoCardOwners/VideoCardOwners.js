import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { classNames } from '@vkontakte/vkjs';
import { Footnote } from '../../Adopted';
import { TextClamp } from '../../TextClamp/TextClamp';
import { VideoCardOwnerItem } from './VideoCardOwnerItem/VideoCardOwnerItem';
import styles from './VideoCardOwners.module.css';
export const VideoCardOwners = ({ owner, secondaryOwners, ownersRelationText, hasOverlay, lines = 1, onClick, Component = Footnote, className, }) => {
    return (_jsxs(TextClamp, { lines: lines, Component: Component, className: classNames(styles.owner, className), "data-testid": "video_card_owner", children: [_jsx(VideoCardOwnerItem, { owner: owner, disabled: hasOverlay, onClick: onClick }), ownersRelationText, secondaryOwners?.map((secondaryOwner, index) => (_jsx(VideoCardOwnerItem, { owner: secondaryOwner, onClick: onClick, disabled: hasOverlay, withComma: index !== secondaryOwners.length - 1 }, index)))] }));
};
//# sourceMappingURL=VideoCardOwners.js.map