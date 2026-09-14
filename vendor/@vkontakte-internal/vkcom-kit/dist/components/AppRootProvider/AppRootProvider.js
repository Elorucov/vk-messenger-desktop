import { jsx as _jsx } from "react/jsx-runtime";
import { classNames } from '@vkontakte/vkjs';
import { useAppearanceDetector } from '../../hooks/useAppearanceDetector/useAppearanceDetector';
import { AdaptivityProvider, AppRoot, ConfigProvider, Platform, SizeType, } from '../Adopted';
import { AppEnvironmentProvider } from '../AppEnvironmentProvider/AppEnvironmentProvider';
export const AppRootProvider = ({ appEnvironment, platform = Platform.ANDROID, sizeX = SizeType.REGULAR, sizeY = SizeType.COMPACT, viewWidth, mode = 'partial', scroll, portalRoot, disablePortal, disableParentTransformForPositionFixedElements, locale, children, className, ...restProps }) => {
    const appearance = useAppearanceDetector();
    return (_jsx(ConfigProvider, { locale: locale, platform: platform, appearance: appearance, children: _jsx(AdaptivityProvider, { sizeX: sizeX, sizeY: sizeY, viewWidth: viewWidth, children: _jsx(AppEnvironmentProvider, { appEnvironment: appEnvironment, children: _jsx(AppRoot, { mode: mode, scroll: scroll, portalRoot: portalRoot, disablePortal: disablePortal, disableParentTransformForPositionFixedElements: disableParentTransformForPositionFixedElements, children: mode === 'partial' ? (_jsx("div", { className: classNames('vkui__root', className), ...restProps, children: children })) : (children) }) }) }) }));
};
//# sourceMappingURL=AppRootProvider.js.map