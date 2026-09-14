import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"video":["global",{"className":1}]} */
import { EVideoOptionType } from '@vkontakte-internal/calls-core';
import { useVideoOptions } from '../../../../hooks/useVideoOptions';
import { classNames } from '@vkontakte/vkjs';
import styles from './JoinScreenVideo.module.css';
export const JoinScreenVideo = ({ isDisabled, videoElRef }) => {
    const { videoOptions } = useVideoOptions();
    return (_jsx("video", { className: classNames(styles.root, isDisabled && styles.disabled, videoOptions[EVideoOptionType.IS_VIDEO_MIRRORED] && styles.mirrored), ref: videoElRef, "data-testid": "calls_preview_cam_video", controls: false, crossOrigin: "anonymous", playsInline: true }));
};
//# sourceMappingURL=JoinScreenVideo.js.map