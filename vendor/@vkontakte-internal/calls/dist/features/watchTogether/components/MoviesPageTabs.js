import { jsx as _jsx } from "react/jsx-runtime";
import { AppRootProvider, TabsItem, Tabs } from '@vkontakte-internal/vkcom-kit';
export const MoviesPageTabs = ({ tabs, activeTab, onTabClick, tabsClassnames }) => (_jsx("div", { className: tabsClassnames, children: _jsx(AppRootProvider, { children: _jsx(Tabs, { children: tabs.map(({ id, label }) => (_jsx(TabsItem, { "data-testid": `calls_watch_together_tab_${id.toLowerCase()}`, "aria-controls": id, onClick: () => onTabClick(id), selected: id === activeTab, children: label }, id))) }) }) }));
//# sourceMappingURL=MoviesPageTabs.js.map