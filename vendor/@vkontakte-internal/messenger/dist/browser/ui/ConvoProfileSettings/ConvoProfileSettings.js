import React, { useCallback, useEffect, useId, useMemo, useState, } from 'react';
import * as Peer from '../../../core/model/Peer';
import * as Convo from '../../../core/model/Convo';
import '../../ui/ConvoProfileSettings/ConvoProfileSettings.css';
import { AvatarSelector } from '../../ui/AvatarSelector/AvatarSelector';
import { useUpdateChatPhoto } from '../../hooks/useUpdateChatPhoto';
import { useBrowserEnv, useCommunityMessaging, useDispatch, useFeatureFlags, usePeers, } from '../../hooks/misc';
import { Button, FormItem, IconButton, Input, Switch, Textarea, } from '@vkontakte/vkui';
import { SettingsListItem, SettingsListSelectItem, } from '../../ui/SettingsListItem/SettingsListItem';
import { isDeepEqual } from '../../../core/utils/misc';
import { getLengthWithEmoji } from '../../../core/utils/emoji';
import { NORMAL_CHAT_SETTINGS } from '../../ui/ChatSettings/ChatSettings';
import { MAX_CHAT_NAME_LENGTH } from '../../ui/ChatCreation/ChatCreation';
import { useStatsOnMount } from '../../hooks/useStatsOnMount';
import { Icon16Clear } from '@vkontakte/icons';
import { FormattedLangKey } from '../../ui/FormattedLangKey/FormattedLangKey';
import { FieldGroupItem } from '../../ui/FieldGroup/FieldGroup';
import { useModal } from '../../hooks/useModal';
import { ModalInterface } from '../../ui/ModalInterface/ModalInterface';
const MAX_CHAT_DESCRIPTION_LENGTH = 512;
export const ConvoProfileSettings = ({ convo, }) => {
    const { isChatPhotoUploading, setChatPhoto, saveChatPhoto, removeChatPhoto } = useUpdateChatPhoto(convo);
    const featureFlags = useFeatureFlags();
    const isCommunityMessaging = useCommunityMessaging();
    useStatsOnMount({
        type: 'type_navgo',
        type_navgo: {
            screen: 'im_chat_settings',
            subtype: 'tab_open',
        },
    });
    const isService = convo.kind === 'ChatConvo' && convo.isService;
    const isStickersPopupAutoplayDisabled = convo.isStickersPopupAutoplayDisabledByAdmin;
    const canChangeService = convo.acl.canChangeServiceType;
    const canDisableServiceMessages = featureFlags.vkm_chat_settings_service_msg &&
        Convo.mayHaveDisabledServiceMessages(convo) &&
        convo.acl.canDisableServiceMessages;
    const canDisableMessagesForwarding = featureFlags.vkm_chat_settings_forwarding &&
        convo.acl.canDisableMessagesForwarding;
    const canChangeStickersPopupAutoplay = convo.acl.canChangeStickersPopupAutoplay;
    const dispatch = useDispatch();
    const { lang } = useBrowserEnv();
    const peers = usePeers();
    const peer = Peer.safeGet(peers, convo.peerId);
    const initialName = Peer.name(peer);
    const initialDescription = Convo.description(convo) || '';
    const initialIsServiceMessagesDisabled = Convo.isServiceMessagesDisabled(convo);
    const initialIsMessagesForwardingDisabled = Convo.isMessagesForwardingDisabled(convo);
    const [name, setName] = useState(initialName);
    const [description, setDescription] = useState(initialDescription);
    const [nameBeyondLimit, setNameBeyondLimit] = useState(false);
    const [isServiceMessagesDisabled, setIsServiceMessagesDisabled] = useState(initialIsServiceMessagesDisabled);
    const [isMessagesForwardingDisabled, setIsMessagesForwardingDisabled] = useState(initialIsMessagesForwardingDisabled);
    useEffect(() => {
        setName(initialName);
    }, [initialName]);
    useEffect(() => {
        setDescription(initialDescription);
    }, [initialDescription]);
    const initialPermissions = useMemo(() => {
        return toChatSettings(convo.permissions || NORMAL_CHAT_SETTINGS, isService, isStickersPopupAutoplayDisabled);
    }, [convo.permissions, isService, isStickersPopupAutoplayDisabled]);
    const [currentPermissions, setCurrentPermissions] = useState(initialPermissions);
    const onNameEdit = (event) => {
        const length = getLengthWithEmoji(event.target.value);
        setName(event.target.value);
        setNameBeyondLimit(length > MAX_CHAT_NAME_LENGTH);
    };
    const onNameClear = () => {
        setName('');
        setNameBeyondLimit(false);
    };
    const onDescriptionEdit = (event) => {
        const length = getLengthWithEmoji(event.target.value);
        if (length <= MAX_CHAT_DESCRIPTION_LENGTH) {
            setDescription(event.target.value);
        }
    };
    const onConvoTitleChange = useCallback((value) => {
        const trimmedValue = value.trim();
        if (!trimmedValue || trimmedValue === Peer.name(peer)) {
            return;
        }
        dispatch({
            type: 'UserChangedChatTitle',
            peerId: convo.peerId,
            title: value,
        });
    }, [convo.peerId, dispatch, peer]);
    const onConvoDescriptionChange = useCallback((value) => {
        if (value === Convo.description(convo)) {
            return;
        }
        dispatch({
            type: 'UserChangedChatDescription',
            peerId: convo.peerId,
            description: value,
        });
    }, [convo, dispatch]);
    const handleChangeChatMessagesSettings = useCallback(({ isServiceMessagesDisabled, isMessagesForwardingDisabled, }) => {
        dispatch({
            type: 'UserChangedChatMessagesSettings',
            peerId: convo.peerId,
            isServiceMessagesDisabled,
            isMessagesForwardingDisabled,
        });
    }, [convo, dispatch]);
    const onConvoPermissionsChange = useCallback(({ permissions, chatType, }) => {
        dispatch({
            type: 'UserChangedChatSettings',
            permissions,
            isService: chatType === 'service',
            peerId: convo.peerId,
        });
    }, [convo, dispatch]);
    const onSelect = useCallback((type, value) => {
        setCurrentPermissions((currentPermissions) => ({
            ...currentPermissions,
            [type]: value,
        }));
    }, []);
    const isNameChanged = name !== Peer.name(peer);
    const isDescriptionChanged = description !== Convo.description(convo);
    const isPermissionsChanged = !isDeepEqual(currentPermissions, initialPermissions);
    const isDisableServiceMessagesChanged = initialIsServiceMessagesDisabled !== isServiceMessagesDisabled;
    const isMessagesForwardingDisabledChanged = initialIsMessagesForwardingDisabled !== isMessagesForwardingDisabled;
    const isValidForm = name.trim().length &&
        !nameBeyondLimit &&
        (isNameChanged ||
            isDescriptionChanged ||
            isPermissionsChanged ||
            isDisableServiceMessagesChanged ||
            isMessagesForwardingDisabledChanged);
    const save = () => {
        if (isNameChanged) {
            onConvoTitleChange(name);
        }
        if (isDescriptionChanged) {
            onConvoDescriptionChange(description);
        }
        if (isPermissionsChanged) {
            const { chat_type: chatType, ...permissions } = currentPermissions;
            onConvoPermissionsChange({ permissions, chatType });
        }
        if (isDisableServiceMessagesChanged ||
            isMessagesForwardingDisabledChanged) {
            handleChangeChatMessagesSettings({
                isServiceMessagesDisabled,
                isMessagesForwardingDisabled,
            });
        }
    };
    const chatOptions = ['owner_and_admins', 'all'];
    let chatSettingsInviteAndInfoAndPin = [];
    let chatSettingsCallAndAdmins = [];
    if (!isCommunityMessaging) {
        chatOptions.unshift('owner');
        chatSettingsInviteAndInfoAndPin = [
            {
                options: chatOptions,
                type: 'invite',
            },
            {
                options: chatOptions,
                type: 'change_info',
            },
            {
                options: chatOptions,
                type: 'change_pin',
            },
        ];
        chatSettingsCallAndAdmins = [
            {
                options: chatOptions,
                type: 'call',
            },
            {
                options: ['owner', 'owner_and_admins'],
                type: 'change_admins',
            },
        ];
    }
    const chatSettingsItems = [
        ...chatSettingsInviteAndInfoAndPin,
        {
            options: chatOptions,
            type: 'use_mass_mentions',
        },
        {
            options: chatOptions,
            type: 'see_invite_link',
        },
        ...chatSettingsCallAndAdmins,
        {
            options: chatOptions,
            type: 'change_style',
        },
    ];
    const nameId = useId();
    const descId = useId();
    if (canChangeService) {
        chatSettingsItems.push({
            options: ['regular', 'service'],
            type: 'chat_type',
        });
    }
    if (featureFlags.vkm_stickers_popup && canChangeStickersPopupAutoplay) {
        chatSettingsItems.push({
            options: ['on', 'off'],
            type: 'stickers_popup_autoplay',
        });
    }
    const messagesForwardingDisabledWarningModal = useModal();
    const renderSettings = () => {
        if (!convo.permissions &&
            !canDisableMessagesForwarding &&
            !canDisableServiceMessages) {
            return null;
        }
        return (React.createElement(React.Fragment, null,
            React.createElement("div", { className: "ConvoProfileSettings__permissions" },
                convo.permissions &&
                    chatSettingsItems.map((item) => (React.createElement(ConvoProfileSettingsItem, { key: item.type, item: item, onSelect: onSelect, selected: currentPermissions[item.type] }))),
                canDisableMessagesForwarding && (React.createElement(FormItem, { className: "ConvoProfileSettings__switch" },
                    React.createElement(FieldGroupItem, { subtitle: lang.use('me_chat_settings_messages_forwarding_disabled_description'), after: React.createElement(Switch, { checked: isMessagesForwardingDisabled, onChange: (e) => {
                                if (e.target.checked) {
                                    messagesForwardingDisabledWarningModal.open();
                                }
                                else {
                                    setIsMessagesForwardingDisabled(false);
                                }
                            } }) },
                        React.createElement("span", { className: "SettingsListItem__name" }, lang.use('me_chat_settings_messages_forwarding_disabled'))))),
                canDisableServiceMessages && (React.createElement(FormItem, { className: "ConvoProfileSettings__switch" },
                    React.createElement(FieldGroupItem, { subtitle: lang.use('me_chat_settings_service_messages_description'), after: React.createElement(Switch, { checked: !isServiceMessagesDisabled, onChange: (e) => {
                                setIsServiceMessagesDisabled(!e.target.checked);
                            } }) },
                        React.createElement("span", { className: "SettingsListItem__name" }, lang.use('me_chat_settings_service_messages')))))),
            messagesForwardingDisabledWarningModal.isActive && (React.createElement(ModalInterface, { onClose: messagesForwardingDisabledWarningModal.close, closeLabel: lang.use('me_close'), contextClass: "MEConfig", title: lang.use('me_chat_settings_messages_forwarding_disabled_warning'), buttons: [
                    React.createElement(Button, { key: "cancel", onClick: messagesForwardingDisabledWarningModal.close, mode: "secondary" }, lang.use('me_cancel')),
                    React.createElement(Button, { key: "accept", onClick: () => {
                            setIsMessagesForwardingDisabled(true);
                            messagesForwardingDisabledWarningModal.close();
                        }, mode: "primary" }, lang.use('me_continue')),
                ] },
                React.createElement("div", { className: "ConvoProfileSettings__forwardDisablingWarning" }, lang.use('me_chat_settings_messages_forwarding_disabled_warning_modal_description'))))));
    };
    return (React.createElement("div", { className: "ConvoProfileSettings" },
        React.createElement(AvatarSelector, { isEditing: true, isLoading: isChatPhotoUploading, onSelection: setChatPhoto, onUpload: saveChatPhoto, onRemove: removeChatPhoto, peerId: peer.id, size: 80 }),
        React.createElement("form", { className: "ConvoProfileSettings__form", onSubmit: (e) => {
                // Не даем странице перегружаться.
                e.preventDefault();
                if (!isValidForm) {
                    return;
                }
                save();
            } },
            React.createElement(FormItem, { top: lang.use('me_chat_settings_name'), htmlFor: nameId, status: nameBeyondLimit ? 'error' : 'default', bottom: nameBeyondLimit && (React.createElement(FormattedLangKey, { langkey: "me_chat_channel_name_error_limit", values: {
                        number: React.createElement("span", null, MAX_CHAT_NAME_LENGTH),
                    } })) },
                React.createElement(Input, { type: "text", placeholder: lang.use('me_chat_creation_input_placeholder'), onChange: onNameEdit, value: name, id: nameId, after: name && (React.createElement(IconButton, { hoverMode: "opacity", "aria-label": lang.use('me_clear_field'), onClick: onNameClear },
                        React.createElement(Icon16Clear, null))) })),
            React.createElement(FormItem, { top: lang.use('me_chat_settings_description'), htmlFor: descId },
                React.createElement(Textarea, { id: descId, maxHeight: 96, value: description, onChange: onDescriptionEdit, placeholder: lang.use('me_channel_settings_description_placeholder') }))),
        renderSettings(),
        React.createElement("footer", { className: "ConvoProfileSettings__footer" },
            React.createElement(Button, { size: "s", onClick: save, disabled: !isValidForm }, lang.use('me_save')))));
};
const ConvoProfileSettingsItem = ({ item, onSelect, selected }) => {
    const { lang } = useBrowserEnv();
    return (React.createElement(SettingsListItem, { name: lang.use(`me_chat_settings_option_${item.type}`), selectedKey: lang.use(`me_chat_settings_${selected}`), items: item.options.map((option) => (React.createElement(SettingsListSelectItem, { key: option, selected: option === selected, role: "option", "aria-selected": option === selected, onClick: () => onSelect(item.type, option), tabIndex: 0 }, lang.use(`me_chat_settings_${option}`)))) }));
};
function toChatSettings(permissions, isService, isStickersPopupAutoplayDisabled) {
    return {
        ...permissions,
        chat_type: isService ? 'service' : 'regular',
        stickers_popup_autoplay: isStickersPopupAutoplayDisabled ? 'off' : 'on',
    };
}
//# sourceMappingURL=ConvoProfileSettings.js.map