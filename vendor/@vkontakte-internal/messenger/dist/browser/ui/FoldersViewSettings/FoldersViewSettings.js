import '../../ui/FoldersViewSettings/FoldersViewSettings.css';
import React from 'react';
import cx from 'classnames';
import { useBrowserEnv, useDispatch, useViewer } from '../../hooks/misc';
import { FoldersViewSettingsSkeleton } from '../../ui/FoldersViewSettings/FoldersViewSettingsSkeleton';
export const FoldersViewSettings = () => {
    const { settings } = useViewer();
    const dispatch = useDispatch();
    const { lang } = useBrowserEnv();
    const selectFolderView = (mode) => {
        dispatch({
            type: 'UserChangedSetting',
            setting: 'verticalFoldersView',
            value: mode === 'vertical',
        });
    };
    return (React.createElement("div", { className: "FoldersViewSettings__variants", role: "radiogroup", "aria-label": lang.use('me_folders_view_settings_title') },
        React.createElement("button", { className: cx('FoldersViewSettings__variant', {
                'FoldersViewSettings__variant--active': !settings.verticalFoldersView,
            }), onClick: () => selectFolderView('horizontal'), role: "radio", "aria-checked": !settings.verticalFoldersView, "aria-label": lang.use('me_folders_view_settings_horizontal') },
            React.createElement("div", { className: "FoldersViewSettings__variantSkeleton" },
                React.createElement(FoldersViewSettingsSkeleton, { mode: "horizontal" })),
            React.createElement("div", { className: "FoldersViewSettings__variantTitle" }, lang.use('me_folders_view_settings_horizontal'))),
        React.createElement("button", { className: cx('FoldersViewSettings__variant', {
                'FoldersViewSettings__variant--active': settings.verticalFoldersView,
            }), onClick: () => selectFolderView('vertical'), role: "radio", "aria-checked": settings.verticalFoldersView, "aria-label": lang.use('me_folders_view_settings_vertical') },
            React.createElement("div", { className: "FoldersViewSettings__variantSkeleton" },
                React.createElement(FoldersViewSettingsSkeleton, { mode: "vertical" })),
            React.createElement("div", { className: "FoldersViewSettings__variantTitle" }, lang.use('me_folders_view_settings_vertical')))));
};
//# sourceMappingURL=FoldersViewSettings.js.map