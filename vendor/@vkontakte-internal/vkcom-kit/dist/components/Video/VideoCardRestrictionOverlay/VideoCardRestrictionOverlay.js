import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"HeaderComponent":["Adopted",{"className":1}]} */
import { Icon20BlockOutline, Icon20CancelCircleOutline, Icon20ClockOutline, Icon20DeleteOutline, Icon20DonateOutline, Icon20HideOutline, Icon20InfoCircleOutline, Icon20LockOutline, Icon20PictureOutline, Icon20ReportOutline, Icon20Users3Outline, Icon20UsersOutline, Icon24BlockOutline, Icon24CancelCircleOutline, Icon24ClockOutline, Icon24DeleteOutline, Icon24DonateOutline, Icon24HideOutline, Icon24InfoCircleOutline, Icon24LiveClockBadgeOutline, Icon24LockOutline, Icon24PictureOutline, Icon24ReportOutline, Icon24Users3Outline, Icon24UsersOutline, Icon28BlockOutline, Icon28CancelCircleOutline, Icon28DeleteOutline, Icon28DonateOutline, Icon28HideOutline, Icon28InfoOutline, Icon28LiveClockBadgeOutline, Icon28LockOutline, Icon28PictureOutline, Icon28RecentOutline, Icon28ReportOutline, Icon28Users3Outline, Icon28UsersOutline, Icon48PictureOutline, Icon56BlockOutline, Icon56CancelCircleOutline, Icon56DeleteOutline, Icon56DonateOutline, Icon56HideOutline, Icon56InfoOutline, Icon56LiveClockBadgeOutline, Icon56LockOutline, Icon56RecentOutline, Icon56ReportOutline, Icon56Users3Outline, Icon56UsersOutline, } from '@vkontakte/icons';
import { classNames } from '@vkontakte/vkjs';
import { Button, Caption, ColorSchemeProvider, Div, Subhead, Text, TextTooltip, } from '../../Adopted';
import { Overlay } from '../../Overlay/Overlay';
import styles from './VideoCardRestrictionOverlay.module.css';
/* 'liveClockBadge' этой иконки нет и не будет в 20px, в целом до конца не ясно, используется ли эта иконка, но, чтобы ничего не сломать, решили не убирать. */
const iconsSizeXS = {
    delete: Icon20DeleteOutline,
    hide: Icon20HideOutline,
    recent: Icon20ClockOutline,
    info: Icon20InfoCircleOutline,
    lock: Icon20LockOutline,
    picture: Icon20PictureOutline,
    liveClockBadge: Icon24LiveClockBadgeOutline,
    doNotDisturb: Icon20BlockOutline,
    users3: Icon20Users3Outline,
    donate: Icon20DonateOutline,
    users: Icon20UsersOutline,
    cancelCircle: Icon20CancelCircleOutline,
    report: Icon20ReportOutline,
    block: Icon20BlockOutline,
};
const iconsSizeS = {
    delete: Icon24DeleteOutline,
    hide: Icon24HideOutline,
    recent: Icon24ClockOutline,
    info: Icon24InfoCircleOutline,
    lock: Icon24LockOutline,
    picture: Icon24PictureOutline,
    liveClockBadge: Icon24LiveClockBadgeOutline,
    doNotDisturb: Icon24BlockOutline,
    users3: Icon24Users3Outline,
    donate: Icon24DonateOutline,
    users: Icon24UsersOutline,
    cancelCircle: Icon24CancelCircleOutline,
    report: Icon24ReportOutline,
    block: Icon24BlockOutline,
};
const iconsSizeM = {
    delete: Icon28DeleteOutline,
    hide: Icon28HideOutline,
    recent: Icon28RecentOutline,
    info: Icon28InfoOutline,
    lock: Icon28LockOutline,
    picture: Icon28PictureOutline,
    liveClockBadge: Icon28LiveClockBadgeOutline,
    doNotDisturb: Icon28BlockOutline, // залита дизайном под другим именем, это все еще do_not_disturb_28
    users3: Icon28Users3Outline,
    donate: Icon28DonateOutline,
    users: Icon28UsersOutline,
    cancelCircle: Icon28CancelCircleOutline,
    report: Icon28ReportOutline,
    block: Icon28BlockOutline,
};
const iconsStretched = {
    delete: Icon56DeleteOutline,
    hide: Icon56HideOutline,
    recent: Icon56RecentOutline,
    info: Icon56InfoOutline,
    lock: Icon56LockOutline,
    picture: Icon48PictureOutline,
    liveClockBadge: Icon56LiveClockBadgeOutline,
    doNotDisturb: Icon56BlockOutline,
    users3: Icon56Users3Outline,
    donate: Icon56DonateOutline,
    users: Icon56UsersOutline,
    cancelCircle: Icon56CancelCircleOutline,
    report: Icon56ReportOutline,
    block: Icon56BlockOutline,
};
const modeModifiersMap = {
    hidden: styles.restrictionBackground,
    blurred: styles.restrictionLayoutLight,
    dark: styles.restrictionLayoutDark,
    secondary: styles.restrictionLayoutSecondary,
    muted: undefined,
};
const VideoCardRestrictionOverlayButton = ({ mode, buttonTitle, buttonNode, onRestrictionButtonClick, }) => {
    if (buttonNode) {
        return buttonNode;
    }
    if (!onRestrictionButtonClick || !buttonTitle || mode === 'blurred') {
        return null;
    }
    const button = (_jsx(Div, { mode: "horizontal", spacing: 8, children: _jsx(Button, { mode: "secondary", appearance: mode === 'dark' ? 'accent' : 'neutral', size: "s", onClick: onRestrictionButtonClick, children: buttonTitle }) }));
    if (mode === 'dark') {
        return _jsx(ColorSchemeProvider, { value: "dark", children: button });
    }
    return button;
};
const VideoCardRestrictionOverlayTitle = ({ title, titleNode, size, stretched, }) => {
    const HeaderComponent = size === 's' || size === 'xs' ? Caption : stretched ? Text : Subhead;
    const sizeMap = {
        s: styles.titleSmall,
        xs: styles.titleXSmall,
    };
    if (titleNode) {
        return titleNode;
    }
    if (!title) {
        return null;
    }
    return (_jsx(HeaderComponent, { weight: size === 'xs' ? '3' : '2', className: classNames(styles.title, size && sizeMap[size]), level: size === 'xs' ? '2' : '1', "data-testid": "video_card_resctriction_overlay_title", children: title }));
};
const sizeToIconsMap = {
    m: iconsSizeM,
    xs: iconsSizeXS,
    s: iconsSizeS,
};
const getIcon = (size, stretched, iconType) => {
    if (!iconType) {
        return null;
    }
    const icons = stretched ? iconsStretched : sizeToIconsMap[size];
    return icons[iconType];
};
export const VideoCardRestrictionOverlay = ({ title, titleNode, buttonTitle, buttonNode, iconType, mode, size = 'm', stretched = false, showTooltip, tooltipText, tooltipPlacement = 'top', tooltipMaxWidth, onRestrictionButtonClick, }) => {
    const Icon = getIcon(size, stretched, iconType);
    const hasTooltip = showTooltip && Boolean(tooltipText);
    const OverlayContent = (_jsxs(Overlay, { className: classNames(styles.restriction, modeModifiersMap[mode], stretched && mode === 'blurred' && styles.restrictionLayoutDarkBlurred), "data-testid": "video_card_resctriction_overlay", children: [Icon && _jsx(Icon, {}), !hasTooltip && (_jsxs(_Fragment, { children: [_jsx(VideoCardRestrictionOverlayTitle, { size: size, stretched: stretched, title: title, titleNode: titleNode }), _jsx(VideoCardRestrictionOverlayButton, { mode: mode, buttonTitle: buttonTitle, buttonNode: buttonNode, onRestrictionButtonClick: onRestrictionButtonClick })] }))] }));
    if (hasTooltip) {
        return (_jsx(TextTooltip, { maxWidth: tooltipMaxWidth, description: tooltipText, placement: tooltipPlacement, children: OverlayContent }));
    }
    return OverlayContent;
};
//# sourceMappingURL=VideoCardRestrictionOverlay.js.map