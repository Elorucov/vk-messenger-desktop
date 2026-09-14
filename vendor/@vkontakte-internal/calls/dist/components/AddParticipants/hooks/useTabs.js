import { useState, useCallback, useMemo } from 'react';
import { useLang } from '../../../hooks/useLang';
import { ETabName } from '../interfaces';
export const useTabs = ({ friendsCount, membersCount, defaultTab, groupMembersCount, displayTabs, }) => {
    const { getLang } = useLang();
    /** текущий выбранный таб для отображения */
    const [tab, setTab] = useState(defaultTab || ETabName.Participants);
    const getTab = (type) => {
        switch (type) {
            case ETabName.Participants:
                return {
                    id: ETabName.Participants,
                    // Attention: misspelled key
                    label: getLang('calls_call_patricipants'),
                    counter: membersCount,
                };
            case ETabName.Friends:
                return {
                    id: ETabName.Friends,
                    label: getLang('calls_call_friends'),
                    counter: friendsCount,
                };
            case ETabName.Community:
                return {
                    id: ETabName.Community,
                    label: getLang('calls_call_community_members'),
                    counter: groupMembersCount,
                };
            // TODO CALL-21471 REMOVE TEMPORARY CONTACTS
            case ETabName.Contacts:
                return {
                    id: ETabName.Contacts,
                    label: 'CONTACTS',
                    counter: 0,
                };
        }
    };
    const tabs = useMemo(() => {
        const result = [];
        for (const tabType of displayTabs) {
            if (!tabType) {
                continue;
            }
            result.push(getTab(tabType));
        }
        return result;
    }, [getLang, membersCount, friendsCount, tab, groupMembersCount, displayTabs]);
    const onChangeTab = useCallback((id) => {
        setTab(id);
    }, []);
    return {
        tab,
        tabs,
        onChangeTab,
    };
};
export { ETabName };
//# sourceMappingURL=useTabs.js.map