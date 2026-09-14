import '../../ui/ChatSettings/ChatSettings.css';
import React, { useCallback, useEffect, useState, } from 'react';
import { Icon28AddCircleFillBlue, Icon28ChainCircleFillBlue, Icon28EditCircleFillBlue, Icon28GearCircleFillGray, Icon28MentionCircleFillBlue, Icon28PaletteFillBlue, Icon28PhoneCircleFillGreen, Icon28PinCircleFillBlue, Icon28PopUpStickerCircleFillRaspberryPink, Icon28UserCircleFillBlue, Icon56LockOutline, Icon56SettingsOutline, Icon56UsersOutline, } from '@vkontakte/icons';
import { Button } from '@vkontakte/vkui';
import { useBrowserEnv, useFeatureFlags } from '../../hooks/misc';
import { OptionsListItem } from '../../ui/OptionsListItem/OptionsListItem';
import { OptionsListSelect, OptionsListSelectItem, OptionsListSelectTrigger, } from '../../ui/OptionsListSelect/OptionsListSelect';
import cx from 'classnames';
import { exhaustivenessCheck } from '../../../core/utils/misc';
export const NORMAL_CHAT_SETTINGS = {
    call: 'all',
    change_admins: 'owner',
    change_info: 'all',
    change_pin: 'all',
    change_style: 'all',
    invite: 'all',
    see_invite_link: 'all',
    use_mass_mentions: 'all',
    stickers_popup_autoplay: 'on',
};
export const PRIVATE_CHAT_SETTINGS = {
    call: 'owner',
    change_admins: 'owner',
    change_info: 'owner',
    change_pin: 'owner',
    change_style: 'all',
    invite: 'owner',
    see_invite_link: 'owner',
    use_mass_mentions: 'owner',
    stickers_popup_autoplay: 'on',
};
export const CUSTOM_CHAT_SETTINGS = {
    call: 'all',
    change_admins: 'owner',
    change_info: 'all',
    change_pin: 'all',
    change_style: 'all',
    invite: 'all',
    see_invite_link: 'owner',
    use_mass_mentions: 'all',
    stickers_popup_autoplay: 'on',
};
export const ChatSettings = ({ onClose, onSave, permissions = NORMAL_CHAT_SETTINGS, withPresets, isService, canChangeService, className, }) => {
    const { lang } = useBrowserEnv();
    const featureFlags = useFeatureFlags();
    const toChatSettings = useCallback((permissions) => {
        return {
            ...permissions,
            ...{ chat_type: isService ? 'service' : 'regular' },
        };
    }, [isService]);
    const [currentPermissions, setCurrentPermissions] = useState(toChatSettings(permissions));
    useEffect(() => setCurrentPermissions(toChatSettings(permissions)), [permissions, toChatSettings]);
    const onSelect = useCallback((type, value) => {
        const futurePermissions = { ...currentPermissions, [type]: value };
        setCurrentPermissions(futurePermissions);
    }, [currentPermissions]);
    const save = () => {
        const { chat_type: chatType, ...permissions } = currentPermissions;
        onSave(permissions, chatType);
        onClose();
    };
    const chatSettingsItems = [
        {
            icon: React.createElement(Icon28AddCircleFillBlue, null),
            options: ['owner', 'owner_and_admins', 'all'],
            type: 'invite',
        },
        {
            icon: React.createElement(Icon28EditCircleFillBlue, null),
            options: ['owner', 'owner_and_admins', 'all'],
            type: 'change_info',
        },
        {
            icon: React.createElement(Icon28PinCircleFillBlue, null),
            options: ['owner', 'owner_and_admins', 'all'],
            type: 'change_pin',
        },
        {
            icon: React.createElement(Icon28MentionCircleFillBlue, null),
            options: ['owner', 'owner_and_admins', 'all'],
            type: 'use_mass_mentions',
        },
        {
            icon: React.createElement(Icon28ChainCircleFillBlue, null),
            options: ['owner', 'owner_and_admins', 'all'],
            type: 'see_invite_link',
        },
        {
            icon: React.createElement(Icon28PhoneCircleFillGreen, null),
            options: ['owner', 'owner_and_admins', 'all'],
            type: 'call',
        },
        {
            icon: React.createElement(Icon28UserCircleFillBlue, null),
            options: ['owner', 'owner_and_admins'],
            type: 'change_admins',
        },
        {
            icon: React.createElement(Icon28PaletteFillBlue, null),
            options: ['owner', 'owner_and_admins', 'all'],
            type: 'change_style',
        },
    ];
    if (featureFlags.vkm_stickers_popup) {
        chatSettingsItems.push({
            icon: React.createElement(Icon28PopUpStickerCircleFillRaspberryPink, null),
            options: ['on', 'off'],
            type: 'stickers_popup_autoplay',
        });
    }
    if (canChangeService) {
        chatSettingsItems.push({
            icon: React.createElement(Icon28GearCircleFillGray, null),
            options: ['regular', 'service'],
            type: 'chat_type',
        });
    }
    const onPresetSelection = (permissions) => {
        setCurrentPermissions(toChatSettings(permissions));
    };
    return (React.createElement("div", { className: cx('ChatSettings', className) },
        withPresets && (React.createElement("div", { className: "ChatSettings__presets", role: "radiogroup" },
            React.createElement(ChatSettingsPresets, { onSelection: onPresetSelection, permissions: currentPermissions }))),
        React.createElement("ul", { className: "ChatSettings__options" }, chatSettingsItems.map((item) => (React.createElement(ChatSettingsItem, { key: item.type, item: item, onSelect: onSelect, selected: currentPermissions[item.type] })))),
        React.createElement("footer", { className: "ChatSettings__footer" },
            React.createElement(Button, { size: "m", mode: "tertiary", onClick: onClose, className: "ChatSettings__footerButton" }, lang.use('me_cancel')),
            React.createElement(Button, { size: "m", onClick: save, className: "ChatSettings__footerButton" }, lang.use('me_save')))));
};
const ChatSettingsPresets = ({ permissions, onSelection, }) => {
    const { lang } = useBrowserEnv();
    const isEqualPreset = useCallback((taken, current) => {
        return Object.entries(current).every(([name, value]) => taken[name] === value);
    }, []);
    const getPresetType = useCallback((permissions) => {
        if (isEqualPreset(permissions, NORMAL_CHAT_SETTINGS)) {
            return 'normal';
        }
        if (isEqualPreset(permissions, PRIVATE_CHAT_SETTINGS)) {
            return 'private';
        }
        return 'custom';
    }, [isEqualPreset]);
    const [currentPreset, setCurrentPreset] = useState(getPresetType(permissions));
    const [customPermissions, setCustomPermissions] = useState(currentPreset === 'custom' ? permissions : CUSTOM_CHAT_SETTINGS);
    useEffect(() => {
        const type = getPresetType(permissions);
        setCurrentPreset(type);
        if (type !== 'custom') {
            return;
        }
        setCustomPermissions(permissions);
    }, [permissions, getPresetType, setCurrentPreset, setCustomPermissions]);
    const setPreset = (type) => {
        let futurePermissions;
        switch (type) {
            case 'normal':
                futurePermissions = NORMAL_CHAT_SETTINGS;
                break;
            case 'private':
                futurePermissions = PRIVATE_CHAT_SETTINGS;
                break;
            case 'custom':
                futurePermissions = customPermissions;
                break;
            default:
                exhaustivenessCheck(type);
        }
        setCurrentPreset(type);
        onSelection(futurePermissions);
    };
    return (React.createElement(React.Fragment, null,
        React.createElement(ChatSettingsPreset, { icon: React.createElement(Icon56UsersOutline, { className: "ChatSettings__presetIcon" }), name: lang.use('me_chat_settings_preset_normal'), type: "normal", onSelection: setPreset, active: currentPreset === 'normal' }),
        React.createElement(ChatSettingsPreset, { icon: React.createElement(Icon56LockOutline, { className: "ChatSettings__presetIcon" }), name: lang.use('me_chat_settings_preset_private'), type: "private", onSelection: setPreset, active: currentPreset === 'private' }),
        React.createElement(ChatSettingsPreset, { icon: React.createElement(Icon56SettingsOutline, { className: "ChatSettings__presetIcon" }), name: lang.use('me_chat_settings_preset_custom'), type: "custom", onSelection: setPreset, active: currentPreset === 'custom' })));
};
const ChatSettingsPreset = ({ icon, name, type, onSelection, active, }) => {
    const onPresetSelection = () => {
        onSelection(type);
    };
    return (React.createElement("button", { className: cx('ChatSettings__preset', {
            'ChatSettings__preset--active': active,
        }), onClick: onPresetSelection, role: "radio", "aria-checked": active },
        icon,
        React.createElement("div", { className: "ChatSettings__presetName" }, name)));
};
const ChatSettingsItem = ({ item, onSelect, selected, }) => {
    const { lang } = useBrowserEnv();
    return (React.createElement(OptionsListItem, { icon: item.icon, title: lang.use(`me_chat_settings_option_${item.type}`), aside: React.createElement(OptionsListSelect, { align: "right", position: "bottom", options: React.createElement(React.Fragment, null, item.options.map((option) => (React.createElement(OptionsListSelectItem, { key: option, title: lang.use(`me_chat_settings_${option}`), isSelected: option === selected, onClick: () => onSelect(item.type, option) })))) },
            React.createElement(OptionsListSelectTrigger, { colored: true, selectedKey: lang.use(`me_chat_settings_${selected}`) })) }));
};
//# sourceMappingURL=ChatSettings.js.map