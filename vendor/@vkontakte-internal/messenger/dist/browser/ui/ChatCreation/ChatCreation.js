import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useBrowserEnv, useFeatureFlags, useOwner, useViewer, usePeers, } from '../../hooks/misc';
import { AvatarSelector } from '../../ui/AvatarSelector/AvatarSelector';
import { Button, FormItem, IconButton, Input } from '@vkontakte/vkui';
import { Icon16Clear, Icon20UserOutline, Icon24PhoneAddOutline, Icon28ErrorOutline, } from '@vkontakte/icons';
import { PeersPicker } from '../../ui/PeersPicker/PeersPicker';
import '../../ui/ChatCreation/ChatCreation.css';
import * as Peer from '../../../core/model/Peer';
import * as Viewer from '../../../core/model/Viewer';
import { useModal } from '../../hooks/useModal';
import { ModalInterface } from '../../ui/ModalInterface/ModalInterface';
import { ChatSettings } from '../../ui/ChatSettings/ChatSettings';
import { useCreateNewChat } from '../../hooks/useCreateNewChat';
import { FormattedLangKey } from '../../ui/FormattedLangKey/FormattedLangKey';
import { PhoneInviteModal } from '../../ui/PhoneInviteModal/PhoneInviteModal';
import { PeersPickerButton } from '../../ui/PeersPickerButton/PeersPickerButton';
import { formatPhoneNumber, preparePhoneNumber } from '../../utils/misc';
import { BasicAvatar } from '../../ui/BasicAvatar/BasicAvatar';
import { API_ERROR_FLOOD, API_ERROR_MESSAGES_SPAM_RESTRICTION, } from '@vkontakte-internal/api-schema-typescript';
import { useSnackbar } from '../../hooks/useSnackbar';
import { IApi } from '../../../data/env/IApi';
export const MAX_CHAT_NAME_LENGTH = 100;
export const ChatCreation = ({ onCreate, onFailPhoneNumbers, initialPeerIds, modalGroupId, fromConvo, }) => {
    const { lang } = useBrowserEnv();
    const { id: ownerId } = useOwner();
    const featureFlags = useFeatureFlags();
    const phoneModal = useModal(modalGroupId || undefined);
    const { profileType, viewer: { isVerified }, } = useViewer();
    const peers = usePeers();
    const isEdu = Viewer.isEdu(profileType);
    const isRegularOrTeacherUser = !isEdu || isVerified;
    const snackbar = useSnackbar();
    const onError = useCallback((error) => {
        let message = lang.use('me_chat_creation_generic_error');
        if (error instanceof IApi.RequestError) {
            if (error.code === API_ERROR_FLOOD ||
                error.code === API_ERROR_MESSAGES_SPAM_RESTRICTION) {
                message = lang.use('me_chat_creation_spamblock_and_floodcontrol_error');
            }
        }
        snackbar({
            before: React.createElement(Icon28ErrorOutline, { fill: "var(--vkui--color_text_negative)" }),
            message,
        });
    }, [lang, snackbar]);
    const { name, failedPhoneNumbers, peerIds, phoneNumbers, permissions, isValidForm, isCreatingChat, nameBeyondLimit, setFile, setPhoto, clearName, setPeerIds, setPhoneNumbers, createChat, clearImage, onNameChange, onPermissionsChange, } = useCreateNewChat(onCreate, onError, initialPeerIds);
    const settingsModal = useModal(modalGroupId || undefined);
    const [searchQuery, setSearchQuery] = useState('');
    const [phoneNumberFromSearch, setPhoneNumberFromSearch] = useState(null);
    useEffect(() => {
        async function isPhoneNumber() {
            try {
                if (searchQuery.length > 5) {
                    const formattedPhoneNumber = await formatPhoneNumber(preparePhoneNumber(searchQuery));
                    if (formattedPhoneNumber.isValid) {
                        setPhoneNumberFromSearch(formattedPhoneNumber.international);
                    }
                    else {
                        setPhoneNumberFromSearch(null);
                    }
                }
                else {
                    setPhoneNumberFromSearch(null);
                }
            }
            catch {
                setPhoneNumberFromSearch(null);
            }
        }
        isPhoneNumber();
    }, [searchQuery]);
    useEffect(() => {
        if (failedPhoneNumbers.length && onFailPhoneNumbers) {
            onFailPhoneNumbers(failedPhoneNumbers);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [failedPhoneNumbers]);
    const addPhoneNumber = useCallback((phone) => {
        setPhoneNumbers(Array.from(new Set([...phoneNumbers, phone])));
    }, [phoneNumbers, setPhoneNumbers]);
    const handlePhoneSubmit = useCallback(async (phone) => {
        addPhoneNumber(phone);
        phoneModal.close();
    }, [addPhoneNumber, phoneModal]);
    const handleAddPhoneFromSearch = useCallback(() => {
        if (phoneNumberFromSearch) {
            addPhoneNumber(phoneNumberFromSearch);
            setPhoneNumberFromSearch(null);
        }
    }, [addPhoneNumber, phoneNumberFromSearch]);
    const listFilter = useCallback((peerId) => peerId !== ownerId, [ownerId]);
    const checkDisabledItem = (peerId) => {
        const peer = Peer.safeGet(peers, peerId);
        return !(peer?.kind === 'User' && peer.canInviteToChats);
    };
    const buttons = useMemo(() => {
        const buttons = [];
        if (isRegularOrTeacherUser && featureFlags.vkm_add_phone_in_chat_creation) {
            if (phoneNumberFromSearch) {
                buttons.push({
                    id: 'phone-from-search',
                    node: (React.createElement(PeersPickerButton, { icon: React.createElement(BasicAvatar, { size: 40, content: React.createElement(Icon20UserOutline, null), color: "contact", className: "ChatCreation__phoneFromSearchAvatarBack" }), onClick: handleAddPhoneFromSearch }, phoneNumberFromSearch)),
                });
            }
            else {
                buttons.push({
                    id: 'phone',
                    node: (React.createElement(PeersPickerButton, { icon: React.createElement(Icon24PhoneAddOutline, null), onClick: phoneModal.open }, lang.use('me_chat_invite_sms_phone_action'))),
                });
            }
        }
        return buttons;
    }, [
        handleAddPhoneFromSearch,
        isRegularOrTeacherUser,
        lang,
        phoneModal.open,
        phoneNumberFromSearch,
        featureFlags.vkm_add_phone_in_chat_creation,
    ]);
    return (React.createElement("div", { className: "ChatCreation" },
        React.createElement("div", { className: "ChatCreation__form" },
            React.createElement("div", { className: "ChatCreation__image" },
                React.createElement(AvatarSelector, { size: 72, onSelection: setFile, onUpload: setPhoto, onRemove: clearImage })),
            React.createElement("div", { className: "ChatCreation__fieldset" },
                React.createElement("form", { onSubmit: (e) => {
                        // Не даем странице перегружаться.
                        e.preventDefault();
                        if (!isValidForm) {
                            return;
                        }
                        createChat();
                    } },
                    React.createElement(FormItem, { className: "ChatCreation__row", status: nameBeyondLimit ? 'error' : 'default', bottom: nameBeyondLimit ? (React.createElement(FormattedLangKey, { langkey: "me_chat_channel_name_error_limit", values: {
                                number: React.createElement("span", null, MAX_CHAT_NAME_LENGTH),
                            } })) : (lang.use('me_chat_creation_input_footnote')) },
                        React.createElement(Input, { placeholder: lang.use('me_chat_creation_input_placeholder'), onChange: onNameChange, value: name, after: name && (React.createElement(IconButton, { hoverMode: "opacity", onClick: clearName, "aria-label": lang.use('me_chat_creation_input_clear_aria_label') },
                                React.createElement(Icon16Clear, null))) }))))),
        React.createElement("div", { className: "ChatCreation__selector" },
            React.createElement("div", { className: "ChatCreation__picker" },
                React.createElement(PeersPicker, { strategy: "multiple", selectedPeerIds: peerIds, phoneNumbers: phoneNumbers, onPeersSelectionChange: setPeerIds, onPhoneNumbersChange: setPhoneNumbers, onQueryChange: setSearchQuery, className: "ChatCreation__picker", buttons: buttons, fromConvo: fromConvo, listFilter: listFilter, checkDisabledItem: checkDisabledItem, controlSide: "right", autoFocus: false }))),
        settingsModal.isActive && (React.createElement(ModalInterface, { onClose: settingsModal.close, closeLabel: lang.use('me_close'), title: lang.use('me_chat_settings_modal_title'), withCustomLayout: true, withFocusTrap: true },
            React.createElement(ChatSettings, { onClose: settingsModal.close, onSave: onPermissionsChange, permissions: permissions, withPresets: true, isService: false, canChangeService: false }))),
        phoneModal.isActive && (React.createElement(PhoneInviteModal, { onClose: phoneModal.close, onSubmit: handlePhoneSubmit, title: lang.use('me_phone_invite_title'), subtitle: isEdu
                ? lang.use('me_phone_invite_subtitle_edu')
                : lang.use('me_phone_invite_subtitle'), action: lang.use('me_phone_invite_action'), focusOnMount: true })),
        React.createElement("div", { className: "ChatCreation__footer" },
            React.createElement(Button, { mode: "tertiary", className: "ChatCreation__settingsButton", onClick: settingsModal.open }, lang.use('me_chat_creation_settings')),
            React.createElement(Button, { disabled: !isValidForm || isCreatingChat, onClick: createChat, loading: isCreatingChat }, lang.use('me_chat_creation_button')))));
};
//# sourceMappingURL=ChatCreation.js.map