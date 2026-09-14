import React, { createContext, useRef, useState, useCallback, useContext, useMemo, useEffect, } from 'react';
import cx from 'classnames';
import { Icon20ChevronLeft2 } from '@vkontakte/icons';
import { useDispatch, useBrowserEnv, useCommunityMessagingWithToggle, useDidUpdate, useViewer, } from '../../hooks/misc';
import { useRouter } from '../../ui/Router/Router';
import { useLayoutData } from '../../ui/LayoutDataProvider/LayoutDataProvider';
import { Tooltip } from '../../ui/Tooltip/Tooltip';
import * as Viewer from '../../../core/model/Viewer';
import { noop } from '../../../core/utils/misc';
import '../../ui/CollapsibleContainer/CollapsibleContainer.css';
import { useResizeObserver, } from '../../hooks/useResizeObserver';
export const CollapsibleContainerContext = createContext(null);
export const CollapsibleContainerProvider = ({ initialWidthPercent, disabled, children }) => {
    const collapsibleContainerContextValue = useInitCollapsibleContainer(initialWidthPercent, disabled);
    return (React.createElement(CollapsibleContainerContext.Provider, { value: collapsibleContainerContextValue }, children));
};
const DEFAULT_WIDTH_PERCENT = 100;
const MIN_WIDTH_PERCENT = 0;
export const MIN_WIDTH = 72;
export const MIN_DEFAULT_WIDTH = 320;
const subscriberList = new Set();
export const useCollapsibleContainer = (resizeCallback) => {
    const collapsibleContainer = useContext(CollapsibleContainerContext);
    useEffect(() => {
        if (resizeCallback) {
            subscriberList.add(resizeCallback);
        }
        return () => {
            if (resizeCallback && subscriberList.has(resizeCallback)) {
                subscriberList.delete(resizeCallback);
            }
        };
    }, [resizeCallback]);
    if (collapsibleContainer?.disabled || !collapsibleContainer) {
        return {
            isOpen: true,
            isChanging: false,
            width: MIN_DEFAULT_WIDTH,
            disabled: true,
            openContainer: noop,
            closeContainer: noop,
            changeSettings: noop,
        };
    }
    return collapsibleContainer;
};
const useCollapsibleContainerRoot = () => {
    const collapsibleContainer = useContext(CollapsibleContainerContext);
    if (collapsibleContainer?.disabled || !collapsibleContainer) {
        return {
            isOpen: true,
            isChanging: false,
            defaultWidth: MIN_DEFAULT_WIDTH,
            width: MIN_DEFAULT_WIDTH,
            widthPercent: DEFAULT_WIDTH_PERCENT,
            prevWidthPercent: null,
            settings: {
                button: false,
                resize: false,
            },
            disabled: true,
            openContainer: noop,
            closeContainer: noop,
            saveWidthPercent: noop,
            changeWidthPercent: noop,
            changePrevWidthPercent: noop,
            changeSettings: noop,
            changeIsOpen: noop,
            changeIsChanging: noop,
            updateDefaultWidth: noop,
            updateWidth: noop,
            onChangeWidth: noop,
        };
    }
    return collapsibleContainer;
};
const useInitCollapsibleContainer = (initialWidthPercent, disabled) => {
    const dispatch = useDispatch();
    const { stats } = useBrowserEnv();
    const { isTwoColumnLayout } = useLayoutData();
    const isCommunityMessaging = useCommunityMessagingWithToggle();
    const viewer = useViewer();
    const isEdu = Viewer.isEdu(viewer.profileType);
    const _disabled = useMemo(() => disabled || (isCommunityMessaging && !isEdu) || !isTwoColumnLayout, [disabled, isCommunityMessaging, isEdu, isTwoColumnLayout]);
    const [defaultWidth, setDefaultWidth] = useState(MIN_DEFAULT_WIDTH);
    const [widthPercent, setWidthPercent] = useState(_disabled
        ? DEFAULT_WIDTH_PERCENT
        : getPercent(convertPercentToWidth(initialWidthPercent, defaultWidth), defaultWidth));
    const [width, setWidth] = useState(convertPercentToWidth(initialWidthPercent, defaultWidth));
    const [prevWidthPercent, setPrevWidthPercent] = useState(null);
    const [settings, setSettings] = useState({
        button: !_disabled,
        resize: !_disabled,
    });
    const [isOpen, setIsOpen] = useState(getIsOpen(width, defaultWidth));
    const [isChanging, setIsChanging] = useState(false);
    const openContainer = useCallback(() => {
        if (isOpen) {
            return;
        }
        setWidthPercent(prevWidthPercent || DEFAULT_WIDTH_PERCENT);
        setPrevWidthPercent(widthPercent);
    }, [isOpen, widthPercent, prevWidthPercent]);
    const closeContainer = useCallback(() => {
        if (!isOpen || prevWidthPercent !== MIN_WIDTH_PERCENT) {
            return;
        }
        setWidthPercent(MIN_WIDTH_PERCENT);
        setPrevWidthPercent(widthPercent);
    }, [isOpen, prevWidthPercent, widthPercent]);
    const changeSettings = useCallback((newSettings) => {
        setSettings((settings) => ({
            ...settings,
            ...newSettings,
        }));
    }, []);
    const saveWidthPercent = useCallback((value, type) => {
        const savingValue = Math.floor(value);
        let statsLabel = `${savingValue}`;
        if (savingValue === MIN_WIDTH_PERCENT) {
            statsLabel = 'COMPACT';
        }
        else if (savingValue === DEFAULT_WIDTH_PERCENT) {
            statsLabel = 'STANDART';
        }
        dispatch({
            type: 'UserChangedSetting',
            setting: 'convoListWidthPercent',
            value: Math.floor(value),
        });
        stats.logEvent({
            type: 'type_action',
            type_action: {
                type: 'type_messaging_action_item',
                type_messaging_action_item: {
                    action_type: 'BUTTON_RESIZE_CHATS',
                    label: statsLabel,
                    label_type: type,
                },
            },
        });
    }, [dispatch, stats]);
    const onChangeWidth = useCallback((width) => {
        subscriberList.forEach((callback) => callback(width));
    }, []);
    useDidUpdate(() => {
        setSettings({
            button: !_disabled,
            resize: !_disabled,
        });
    }, [_disabled]);
    useEffect(() => {
        setIsOpen(getIsOpen(width, defaultWidth));
    }, [width, defaultWidth]);
    return useMemo(() => ({
        isOpen,
        isChanging,
        defaultWidth,
        width,
        widthPercent,
        prevWidthPercent,
        settings,
        openContainer,
        closeContainer,
        saveWidthPercent,
        updateDefaultWidth: setDefaultWidth,
        updateWidth: setWidth,
        changeWidthPercent: setWidthPercent,
        changePrevWidthPercent: setPrevWidthPercent,
        changeSettings,
        changeIsOpen: setIsOpen,
        changeIsChanging: setIsChanging,
        onChangeWidth,
        disabled: _disabled,
    }), [
        isOpen,
        isChanging,
        defaultWidth,
        width,
        widthPercent,
        prevWidthPercent,
        settings,
        openContainer,
        closeContainer,
        saveWidthPercent,
        changeSettings,
        onChangeWidth,
        _disabled,
    ]);
};
export const CollapsibleContainer = ({ children, defaultWidth, }) => {
    const { isOpen, settings, widthPercent, prevWidthPercent, updateDefaultWidth, updateWidth, saveWidthPercent, changeWidthPercent, changePrevWidthPercent, changeIsChanging, changeIsOpen, onChangeWidth, } = useCollapsibleContainerRoot();
    const { lang } = useBrowserEnv();
    const { screenRoute, replace } = useRouter();
    const containerRef = useRef(null);
    const containerContentRef = useRef(null);
    const { settings: viewerSettings } = useViewer();
    const isInited = defaultWidth !== null;
    const _defaultWidth = useMemo(() => (isInited ? defaultWidth : MIN_DEFAULT_WIDTH), [defaultWidth, isInited]);
    const width = useMemo(() => convertPercentToWidth(widthPercent, _defaultWidth), [widthPercent, _defaultWidth]);
    const isSearching = (screenRoute.kind === 'ConvoRoute' ||
        screenRoute.kind === 'ChannelRoute') &&
        screenRoute.search !== undefined;
    const isChatProfilePanelOpen = !!screenRoute.rp?.find((panel) => panel.kind === 'PeerPanel' || panel.kind === 'ChannelPanel');
    const containerResizingHandler = (initEvent) => {
        const node = containerRef.current;
        const nodeContent = containerContentRef.current;
        changeIsChanging(true);
        if (!node || !nodeContent) {
            return;
        }
        node.style.transition = '';
        if (isSearching) {
            replace({
                ...screenRoute,
                search: undefined,
            });
        }
        if (isChatProfilePanelOpen) {
            replace({
                ...screenRoute,
                rp: undefined,
            });
        }
        const nodeBound = node.getBoundingClientRect();
        const resizeWidthHandler = (event) => {
            const percent = convertWidthToPercent(nodeBound.width + event.clientX - initEvent.clientX, _defaultWidth);
            const width = convertPercentToWidth(percent, _defaultWidth);
            updateContainerSize(width);
        };
        const clearDragHandler = () => {
            window.removeEventListener('mousemove', resizeWidthHandler);
            window.removeEventListener('mouseup', clearDragHandler);
            changeIsChanging(false);
            const newWidthPercent = getPercent(node.getBoundingClientRect().width, _defaultWidth);
            const newWidth = convertPercentToWidth(newWidthPercent, _defaultWidth);
            node.style.transition = '250ms width';
            nodeContent.style.transition = '250ms width';
            setTimeout(() => {
                node.style.transition = '';
                nodeContent.style.transition = '';
            }, 250);
            updateContainerSize(newWidth);
            changeWidthPercent(newWidthPercent);
            changePrevWidthPercent(newWidthPercent === MIN_WIDTH_PERCENT ? widthPercent : null);
            saveWidthPercent(newWidthPercent, 'arrow');
        };
        window.addEventListener('mousemove', resizeWidthHandler);
        window.addEventListener('mouseup', clearDragHandler);
    };
    function toggleCollapse() {
        changeWidthPercent(isOpen ? MIN_WIDTH_PERCENT : prevWidthPercent || DEFAULT_WIDTH_PERCENT);
        changePrevWidthPercent(isOpen ? widthPercent : null);
        saveWidthPercent(isOpen ? MIN_WIDTH_PERCENT : prevWidthPercent || DEFAULT_WIDTH_PERCENT, 'button');
    }
    function updateContainerSize(width) {
        const node = containerRef.current;
        const nodeContent = containerContentRef.current;
        if (!node || !nodeContent) {
            return;
        }
        node.style.width = width + 'px';
        nodeContent.style.width = getIsOpen(width, _defaultWidth)
            ? _defaultWidth + 'px'
            : '';
        changeIsOpen(getIsOpen(width, _defaultWidth));
    }
    const { observe } = useResizeObserver({ throttleInterval: 500 });
    const onContainerResize = useCallback((entity) => {
        onChangeWidth(entity.contentRect.width);
    }, [onChangeWidth]);
    useEffect(() => {
        if (!containerRef.current) {
            return;
        }
        return observe(containerRef.current, onContainerResize);
    }, [observe, onContainerResize]);
    useEffect(() => {
        updateDefaultWidth(_defaultWidth);
    }, [_defaultWidth, updateDefaultWidth]);
    useEffect(() => {
        updateWidth(width);
    }, [width, updateWidth]);
    const containerStyle = useMemo(() => (isInited ? { width: width + 'px' } : undefined), [isInited, width]);
    const contentStyle = useMemo(() => isInited
        ? {
            width: width <= _defaultWidth && width > MIN_WIDTH
                ? _defaultWidth + 'px'
                : '',
        }
        : undefined, [isInited, width, _defaultWidth]);
    return (React.createElement("div", { className: cx('CollapsibleContainer', isInited
            ? 'CollapsibleContainer--inited'
            : 'CollapsibleContainer--uninited', {
            'CollapsibleContainer--collapsed': !isOpen,
        }), ref: containerRef, style: containerStyle },
        React.createElement("div", { className: "CollapsibleContainer__wrapper" },
            React.createElement("div", { className: "CollapsibleContainer__content", ref: containerContentRef, style: contentStyle }, children)),
        viewerSettings.shouldShowCompactModeButton && settings.button && (React.createElement(Tooltip, { key: Number(isOpen), align: "center", content: !isOpen
                ? lang.use('me_chat_list_collapse_open_tooltip')
                : lang.use('me_chat_list_collapse_close_tooltip'), position: "top", delay: 1000 },
            React.createElement("button", { onClick: toggleCollapse, className: "CollapsibleContainer__widthControllerButton", "aria-label": !isOpen
                    ? lang.use('me_chat_list_collapse_open_tooltip')
                    : lang.use('me_chat_list_collapse_close_tooltip') },
                React.createElement("span", { className: "CollapsibleContainer__widthControllerButtonIcon" },
                    React.createElement(Icon20ChevronLeft2, null))))),
        settings.resize && (React.createElement("span", { className: "CollapsibleContainer__widthControllerArea", onMouseDown: containerResizingHandler }))));
};
function getIsOpen(currentWidth, defaultWidth) {
    return currentWidth - MIN_WIDTH > (defaultWidth - MIN_WIDTH) / 4;
}
function getPercent(currentWidth, defaultWidth) {
    return getIsOpen(currentWidth, defaultWidth)
        ? DEFAULT_WIDTH_PERCENT
        : MIN_WIDTH_PERCENT;
}
function convertPercentToWidth(currentWidthPercent, defaultWidth) {
    const width = Math.floor((defaultWidth * currentWidthPercent) / DEFAULT_WIDTH_PERCENT);
    if (width <= MIN_WIDTH) {
        return MIN_WIDTH;
    }
    if (currentWidthPercent >= DEFAULT_WIDTH_PERCENT) {
        return defaultWidth;
    }
    return width;
}
function convertWidthToPercent(currentWidth, defaultWidth) {
    return (currentWidth * DEFAULT_WIDTH_PERCENT) / defaultWidth;
}
//# sourceMappingURL=CollapsibleContainer.js.map