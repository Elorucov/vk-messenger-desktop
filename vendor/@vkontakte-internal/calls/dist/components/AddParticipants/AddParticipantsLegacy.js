import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":1}]} */
import { ETabName } from './interfaces';
import { AppRootProvider, Tabs, TabsItem } from '@vkontakte-internal/vkcom-kit';
import { usePersonCache } from './hooks/usePersonCache';
import { Tab } from './Tab';
import { EMembersType } from './constants';
import { classNames as cx } from '@vkontakte/vkjs';
import { getChatMembers, getFriends, getGroupMembers } from '../../selectors';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { useEffect, useState } from 'react';
import { normalizeContact } from '../../helpers/user';
import { createWidget } from '@vkontakte-internal/di';
import { observer } from 'mobx-react-lite';
import { loadContacts } from '../../services/backend';
import { AddParticipantsProvider, useAddParticipantsModel } from './AddParticipantsModel';
const AddParticipants = observer(function AddParticipants() {
    // redux
    const storeFriends = useTypedSelector(getFriends);
    const storeChatMembers = useTypedSelector(getChatMembers);
    const storeGroupMembers = useTypedSelector(getGroupMembers);
    const { onChange, onChangeTab, tab, tabs, selected, getTokens } = useAddParticipantsModel();
    // мапа вообще всех участников чата, кроме participants
    const { personCache } = usePersonCache();
    /** токены выбранных в списке участников */
    const tokens = getTokens(personCache);
    const [availableContacts, setAvailableContacts] = useState([]);
    // TODO CALL-21471 REMOVE TEMPORARY CONTACTS
    const isCallsToContactsDebug = useTypedSelector((state) => state.config.debugCallsToContacts);
    useEffect(() => {
        isCallsToContactsDebug &&
            loadContacts({
                extended: 1,
            }).then((response) => {
                setAvailableContacts((response.contacts ?? []).map(normalizeContact).sort((m1, m2) => {
                    if (m1.name < m2.name) {
                        return -1;
                    }
                    if (m1.name > m2.name) {
                        return 1;
                    }
                    return 0;
                }));
            });
    }, [isCallsToContactsDebug]);
    return (_jsxs(_Fragment, { children: [_jsx(AppRootProvider, { children: _jsx(Tabs, { children: tabs.map(({ id, label, counter }) => (_jsx(TabsItem, { onClick: () => onChangeTab(id), selected: id === tab, after: _jsx("div", { className: cx('AddParticipants__count', {
                                ['AddParticipants__count--inactive']: id !== tab,
                            }), children: counter }), children: label }, id))) }) }), tab === ETabName.Participants && (_jsx(Tab, { onChange: onChange, personCache: personCache, selected: selected, tokens: tokens, initMembers: storeChatMembers, memberType: EMembersType.Members }, ETabName.Participants)), tab === ETabName.Friends && (_jsx(Tab, { onChange: onChange, personCache: personCache, selected: selected, tokens: tokens, initMembers: storeFriends, memberType: EMembersType.Friends }, ETabName.Friends)), tab === ETabName.Community && (_jsx(Tab, { onChange: onChange, personCache: personCache, selected: selected, tokens: tokens, initMembers: storeGroupMembers, memberType: EMembersType.CommunityMembers }, ETabName.Community)), tab === ETabName.Contacts && (_jsx(Tab, { onChange: onChange, personCache: personCache, selected: selected, tokens: tokens, initMembers: availableContacts, memberType: EMembersType.Members }, ETabName.Contacts))] }));
});
export const AddParticipantsLegacy = createWidget(AddParticipantsProvider, AddParticipants);
//# sourceMappingURL=AddParticipantsLegacy.js.map