import '../../ui/SpaceProfileTabs/SpaceProfileTabs.css';
import React, { memo, useEffect, useMemo, useState } from 'react';
import cx from 'classnames';
import { HorizontalScroll } from '@vkontakte/vkui';
import { Tabs, TabsItem } from '@vkontakte-internal/vkcom-kit';
import { useBrowserEnv } from '../../hooks/misc';
import { SpaceProfileMembers } from '../../ui/SpaceProfileMembers/SpaceProfileMembers';
import { Icon20UsersOutline } from '@vkontakte/icons';
export const SpaceProfileTabs = memo(({ space, onTabChange, className }) => {
    const { lang } = useBrowserEnv();
    const tabs = useMemo(() => {
        return [
            {
                value: 'members',
                label: lang.use('me_spaces_profile_members'),
                count: space.membersCount,
                icon: React.createElement(Icon20UsersOutline, null),
            },
        ];
    }, [lang, space.membersCount]);
    const [activeTab, setActiveTab] = useState(tabs[0].value);
    useEffect(() => {
        onTabChange(activeTab);
    }, [onTabChange, activeTab]);
    return (React.createElement("div", { className: cx('SpaceProfileTabs', className) },
        React.createElement(Tabs, { mode: "accent", className: "SpaceProfileTabs__tabs" },
            React.createElement(HorizontalScroll, { arrowSize: "m" }, tabs.map(({ label, value, count, icon }) => (React.createElement(TabsItem, { key: value, id: `tab-${value}`, "aria-controls": `tab-content-${value}`, before: icon, after: !!count && (React.createElement("span", { className: "SpaceProfileTabs__tabCount" }, count)), onClick: () => setActiveTab(value), selected: value === activeTab, className: "SpaceProfileTabs__tab" }, label))))),
        React.createElement("div", { className: "SpaceProfileTabs__tabContent" }, activeTab === 'members' && React.createElement(SpaceProfileMembers, null))));
});
//# sourceMappingURL=SpaceProfileTabs.js.map