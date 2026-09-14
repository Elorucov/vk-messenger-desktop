import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"ScreenSpinner":["@vkontakte-internal/vkcom-kit",{"className":1}]} */
import { useCallback, useEffect, useState } from 'react';
import { Button, ScreenSpinner } from '@vkontakte-internal/vkcom-kit';
import { useTypedDispatch } from '../../hooks/useTypedDispatch';
import { CallByNameModal } from '../../components/CallByNameModal/CallByNameModal';
import { CallChangeNameModal } from '../../components/CallChangeNameModal/CallChangeNameModal';
import { CallByNameProfileType, E_ACTION, NAME_REGEX } from '../../constants';
import { Mode, peerIdToVkId, useIndexer, useCallsBridge, } from '@vkontakte-internal/calls-core';
import { callsCheckParticipantName, getGroupsForCall } from '../../services/backend';
import { handlePromiseError } from '../../helpers/logger';
import { useChangeNameOptions } from '../../hooks/useChangeNameOptions';
import { decode } from '../../utils/textUtils';
import { isUndefined, noop } from '@vkontakte/vkjs';
import { useFetchData } from '../../hooks/useFetchData';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { useLang } from '../../hooks/useLang';
import { getCallByName, getMyId, getParticipants } from '../../selectors';
const groupToListItem = (group) => {
    return {
        id: -group.id,
        name: decode(group.name),
        link: `/${group.screen_name}`,
        photo: group.photo_100 ?? '',
        isNFT: false,
        type: CallByNameProfileType.GROUP,
    };
};
const participantToListItem = (participant) => {
    return {
        id: participant.id,
        name: decode(participant.name),
        link: participant.link ?? '',
        photo: participant.photo ?? '',
        isNFT: participant.is_nft ?? false,
        type: CallByNameProfileType.PROFILE,
    };
};
export const CallByNameContainer = () => {
    const me = useTypedSelector(getMyId);
    const participants = useTypedSelector(getParticipants);
    const callByName = useTypedSelector(getCallByName);
    const bridge = useCallsBridge();
    const participantMe = participants[me];
    /*  Изменяемое имя для звонка */
    const { nameOptions, changeNameOptions } = useChangeNameOptions(participantMe);
    const dispatch = useTypedDispatch();
    const [items, setItems] = useState([]);
    const [selectedId, setSelectedId] = useState(() => !isUndefined(nameOptions.id) && Number.isInteger(nameOptions.id) ? nameOptions.id : peerIdToVkId(me));
    const { getLang } = useLang();
    const [searchQuery, setSearchQuery] = useState('');
    const nameGetter = useCallback((item) => item.name, []);
    const idGetter = useCallback((item) => item.id, []);
    const searchIndex = useIndexer([], nameGetter, idGetter);
    const checkParticipantName = useFetchData({ cb: callsCheckParticipantName });
    const isCallCreating = !callByName?.callId;
    const [changedName, setChangedName] = useState(decode(nameOptions?.name || participantMe.name));
    const [errorName, setErrorName] = useState(false);
    const itemsForRender = searchQuery ? searchIndex.search(searchQuery) : items;
    const selectedProfile = items.find((item) => item.id === selectedId);
    const onSearchChange = useCallback((e) => {
        setSearchQuery(e.target.value);
    }, []);
    useEffect(() => {
        let items = [participantToListItem(participantMe)];
        getGroupsForCall()
            .then((response) => {
            if (response.count > 0) {
                response.items.forEach((group) => {
                    items.push(groupToListItem(group));
                });
            }
        })
            .catch(handlePromiseError)
            .finally(() => {
            // На бэке не поддержано пока, а вручную в каждом методе переписывать access_token пока долго
            // if (false) {
            /* Для модалки смены имени добавляем анонима */
            // items.push({
            //   // Аноним
            //   name: getLang('calls_anonymous'),
            //   id: 0,
            //   photo: '',
            //   type: CallByNameProfileType.ANONYM,
            //   link: '',
            // });
            // }
            setItems(items);
            items.forEach((item) => searchIndex.add(item));
        });
    }, []);
    const isGroup = selectedProfile?.type === CallByNameProfileType.GROUP;
    const isAllowToChange = !isGroup;
    const onJoinClick = useCallback((isWithVideo) => {
        if (!callByName) {
            return;
        }
        const { peerId, entryPoint, joinLink } = callByName;
        if (joinLink) {
            bridge
                .joinCallByLink({
                joinLink,
                isWithVideo,
                entryPoint,
                groupId: isGroup ? selectedId : 0,
            })
                .catch(noop);
        }
        else if (peerId) {
            bridge.call({ vkId: peerId, isWithVideo, entryPoint, groupId: isGroup ? selectedId : 0 });
        }
        else {
            bridge.startCall(isWithVideo, entryPoint, true, isGroup ? selectedId : 0);
        }
    }, [selectedProfile]);
    const onListItemClick = (selectedId) => {
        setSelectedId(selectedId);
        /* Для модалки смены имени */
        const selectedProfile = items.find((item) => item.id === selectedId);
        if (selectedProfile?.type === CallByNameProfileType.ANONYM) {
            setChangedName('');
        }
        else {
            setChangedName(selectedProfile?.name || '');
        }
        setErrorName(false);
    };
    const onClose = () => {
        const backToModal = callByName?.withPopup;
        if (backToModal) {
            dispatch({ type: E_ACTION.CHANGE_MODE, mode: Mode.JOIN });
        }
        else {
            dispatch({ type: E_ACTION.CHANGE_MODE, mode: Mode.READY });
        }
    };
    const onSaveClick = async () => {
        const isNeedToCheckName = selectedProfile?.name !== changedName && !isGroup;
        const isValid = isNeedToCheckName &&
            // eslint-disable-next-line @vkontakte-internal/vkcom-plugins/async-mix-syntax
            (await checkParticipantName
                .fetchData({ name: changedName })
                .then((response) => {
                if (!response.is_valid) {
                    setErrorName(true);
                }
                return response.is_valid;
            })
                .catch(handlePromiseError));
        if (!isValid && isNeedToCheckName) {
            return;
        }
        changeNameOptions({ ...selectedProfile, name: changedName });
        onClose();
    };
    const onNameChange = useCallback((e) => {
        const value = e.target.value;
        setChangedName(value);
        setErrorName(!!value.length && !NAME_REGEX.test(value));
    }, []);
    const onClearName = useCallback(() => {
        setChangedName('');
        setErrorName(false);
    }, []);
    if (!items.length) {
        return _jsx(ScreenSpinner, { className: "CallByNameContainer__screenSpinner", mode: "overlay" });
    }
    const actionButtons = [
        _jsx(Button, { "data-testid": "calls_call_by_name_audiocall", size: "m", onClick: () => onJoinClick(false), mode: "secondary", children: getLang('calls_call_by_name_audio_button') }, "callByNameByAudio"),
        _jsx(Button, { "data-testid": "calls_call_by_name_videocall", size: "m", onClick: () => onJoinClick(true), children: getLang('calls_call_by_name_video_button') }, "callByNameByVideo"),
    ];
    if (isCallCreating) {
        return (_jsx(CallByNameModal, { items: itemsForRender, actionButtons: actionButtons, selectedId: selectedId, onListItemClick: onListItemClick, onClose: onClose, participantMe: participantMe, onSearchChange: onSearchChange }));
    }
    return (_jsx(CallChangeNameModal, { items: items, onSaveClick: onSaveClick, selectedId: selectedId, onListItemClick: onListItemClick, onClose: onClose, participantMe: participantMe, onNameChange: onNameChange, onClearName: onClearName, changedName: changedName, error: errorName, disabled: !isAllowToChange }));
};
//# sourceMappingURL=CallByNameContainer.js.map