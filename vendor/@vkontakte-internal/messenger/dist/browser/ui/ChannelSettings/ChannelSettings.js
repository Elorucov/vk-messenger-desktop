import '../../ui/ChannelSettings/ChannelSettings.css';
import React, { useState } from 'react';
import { Button, FormItem, IconButton, Input, Switch, Textarea, } from '@vkontakte/vkui';
import { useBrowserEnv, useDispatch, useFeatureFlags, useViewer, } from '../../hooks/misc';
import { useSnackbar } from '../../hooks/useSnackbar';
import { getLengthWithEmoji, hasEmoji } from '../../../core/utils/emoji';
import { MAX_CHANNEL_NAME_LENGTH } from '../../ui/ChannelCreation/ChannelCreation';
import { Icon20CheckCircleOutline, Icon16Clear } from '@vkontakte/icons';
import * as Channel from '../../../core/model/Channel';
import { IApi } from '../../../data/env/IApi';
import { API_ERROR_PARAM } from '@vkontakte-internal/api-schema-typescript';
import { ChannelAvatarSelector } from '../../ui/ChannelAvatarSelector/ChannelAvatarSelector';
import * as TextChunk from '../../../core/model/TextChunk';
import * as Viewer from '../../../core/model/Viewer';
import { useRouter } from '../../ui/Router/Router';
import { FormattedLangKey } from '../../ui/FormattedLangKey/FormattedLangKey';
import { FieldGroupItem } from '../../ui/FieldGroup/FieldGroup';
import { useApiFetch } from '../../hooks/useApiFetch';
const MAX_CHANNEL_DESCRIPTION_LENGTH = 3999;
export const ChannelSettings = ({ channel, }) => {
    const { lang, uploader } = useBrowserEnv();
    const apiFetch = useApiFetch();
    const { viewer, profileType } = useViewer();
    const { replace } = useRouter();
    const dispatch = useDispatch();
    const rawDescription = TextChunk.toRawText(channel.description);
    const [name, setName] = useState(channel.name);
    const [description, setDescription] = useState(rawDescription);
    const featureFlags = useFeatureFlags();
    const [canMessage, setCanMessage] = useState(channel.canMessage);
    const [nameBeyondLimit, setNameBeyondLimit] = useState(false);
    const [file, setFile] = useState(null);
    const [photo, setPhoto] = useState(null);
    const isUploadingImage = file && !photo;
    const nameHasEmoji = hasEmoji(name);
    const [photoIsChanged, setPhotoIsChanged] = useState(false);
    const channelNameIsChanged = channel.name !== name;
    const channelDescriptionIsChanged = rawDescription !== description;
    const channelCanMessageIsChanged = canMessage !== channel.canMessage;
    const isEdu = Viewer.isEdu(profileType);
    const descriptionHasOnlySpaces = /^\s*$/.test(description);
    const descriptionIsValid = description.length > 0 ? !descriptionHasOnlySpaces : true;
    const isValidForm = name.trim().length &&
        !isUploadingImage &&
        !nameHasEmoji &&
        !nameBeyondLimit &&
        descriptionIsValid &&
        (photoIsChanged ||
            channelNameIsChanged ||
            channelDescriptionIsChanged ||
            channelCanMessageIsChanged);
    let inputBottom;
    if (nameBeyondLimit) {
        inputBottom = (React.createElement(FormattedLangKey, { langkey: "me_chat_channel_name_error_limit", values: {
                number: React.createElement("span", null, MAX_CHANNEL_NAME_LENGTH),
            } }));
    }
    if (nameHasEmoji) {
        inputBottom = lang.use('me_channel_creation_restricted_symbol_error');
    }
    const onDescriptionEdit = (event) => {
        const length = getLengthWithEmoji(event.target.value);
        if (length <= MAX_CHANNEL_DESCRIPTION_LENGTH) {
            setDescription(event.target.value);
        }
    };
    const snackbar = useSnackbar();
    const [uploadErrorTrackId, setUploadErrorTrackId] = useState(null);
    const [isPhotoSaving, setPhotoSaving] = useState(false);
    const [isChatInfoSaving, setChatInfoSaving] = useState(false);
    const onNameChange = (event) => {
        const length = getLengthWithEmoji(event.target.value);
        setName(event.target.value);
        setNameBeyondLimit(length > MAX_CHANNEL_NAME_LENGTH);
    };
    const onNameClear = () => {
        setName('');
        setNameBeyondLimit(false);
    };
    const onCreateButtonClick = () => {
        if (uploadErrorTrackId) {
            uploader.retryUpload(uploadErrorTrackId);
        }
        else {
            editChannel();
        }
    };
    const showSnackbarOnSuccess = () => {
        snackbar({
            message: lang.use('me_channel_settings_success'),
            before: (React.createElement(Icon20CheckCircleOutline, { fill: "var(--vkui--color_icon_accent)" })),
        });
        replace({
            kind: 'ChannelPanel',
            channelId: channel.id,
            section: undefined,
        });
    };
    const showSnackBarOnError = () => {
        snackbar({
            message: lang.use('me_channel_settings_failed'),
        });
    };
    const editChannel = async () => {
        try {
            if (channelNameIsChanged ||
                channelDescriptionIsChanged ||
                channelCanMessageIsChanged) {
                setChatInfoSaving(true);
                const cleanedUpName = name.trim();
                const cleanedUpDescription = description.trim();
                await apiFetch('groups.edit', {
                    group_id: Channel.toRealGroupId(channel.id),
                    ...(channelNameIsChanged && { title: cleanedUpName }),
                    ...(channelDescriptionIsChanged && {
                        description: cleanedUpDescription,
                    }),
                    ...(channelCanMessageIsChanged && {
                        messages: canMessage ? 1 : 0,
                    }),
                });
                dispatch({
                    type: 'UserUpdateChannelInfo',
                    channelId: channel.id,
                    name: cleanedUpName,
                    canMessage,
                    description: TextChunk.fromClientText(cleanedUpDescription),
                });
                setDescription(cleanedUpDescription);
                setName(cleanedUpName);
                setChatInfoSaving(false);
            }
            if (file && photo) {
                uploader.uploadFiles([file], { asChannelPhoto: true }, {
                    viewerId: viewer.id,
                    targetPeerId: channel.id,
                    isChannel: true,
                }, {
                    onUploadStart: () => {
                        setPhotoSaving(true);
                    },
                    onUploadFinish: () => {
                        setPhotoSaving(false);
                        setUploadErrorTrackId(null);
                        dispatch({
                            type: 'UserSetChannelPhoto',
                            channelId: channel.id,
                            photo,
                        });
                        setPhotoIsChanged(false);
                        showSnackbarOnSuccess();
                    },
                    onError: (trackId) => {
                        setPhotoSaving(false);
                        setUploadErrorTrackId(trackId);
                        showSnackBarOnError();
                    },
                });
            }
            else if (channelNameIsChanged || channelDescriptionIsChanged) {
                showSnackbarOnSuccess();
            }
        }
        catch (err) {
            setChatInfoSaving(false);
            if (err instanceof IApi.RequestError && err.code === API_ERROR_PARAM) {
                const errorText = String(err.apiError?.error_text || '');
                snackbar({
                    message: errorText,
                });
            }
            else {
                showSnackBarOnError();
            }
        }
    };
    return (React.createElement("div", { className: "ChannelSettings" },
        React.createElement("div", { className: "ChannelSettings__form" },
            React.createElement("div", { className: "ChannelSettings__image" },
                React.createElement(ChannelAvatarSelector, { size: 80, isEditing: true, onSelection: setFile, onUpload: (photo) => {
                        setPhoto(photo);
                        setPhotoIsChanged(true);
                    }, channel: channel })),
            React.createElement("div", { className: "ChannelSettings__fieldset" },
                React.createElement("form", { onSubmit: (e) => {
                        // Не даем странице перегружаться.
                        e.preventDefault();
                        if (!isValidForm) {
                            return;
                        }
                        editChannel();
                    } },
                    React.createElement(FormItem, { className: "ChannelSettings__row", status: nameBeyondLimit || nameHasEmoji ? 'error' : 'default', bottom: inputBottom, top: lang.use('me_channel_settings_name'), topComponent: "span" },
                        React.createElement(Input, { placeholder: lang.use('me_channel_creation_input_placeholder'), onChange: onNameChange, value: name, after: name && (React.createElement(IconButton, { hoverMode: "opacity", "aria-label": lang.use('me_clear_field'), onClick: onNameClear },
                                React.createElement(Icon16Clear, null))) })),
                    React.createElement(FormItem, { top: lang.use('me_chat_settings_description'), topComponent: "span" },
                        React.createElement(Textarea, { maxHeight: 96, value: description, placeholder: lang.use('me_channel_settings_description_placeholder'), onChange: onDescriptionEdit })),
                    featureFlags.me_community_messages_enabled && (React.createElement(FormItem, null,
                        React.createElement(FieldGroupItem, { id: "canMessage", className: "ChannelSettings__canMessage", subtitle: !isEdu && featureFlags.vkm_channel_name_to_community
                                ? lang.use('me_channel_community_settings_message_description')
                                : lang.use('me_channel_settings_message_description'), after: React.createElement("div", { className: "ChannelSettings__canMessageSwitch" },
                                React.createElement(Switch, { checked: canMessage, "aria-labelledby": "canMessage", onChange: (e) => setCanMessage(e.target.checked) })) }, !isEdu && featureFlags.vkm_channel_name_to_community
                            ? lang.use('me_channel_community_settings_can_message')
                            : lang.use('me_channel_settings_can_message'))))))),
        React.createElement("div", { className: "ChannelSettings__footer" },
            React.createElement(Button, { disabled: !isValidForm, onClick: onCreateButtonClick, loading: isPhotoSaving || isChatInfoSaving }, lang.use('me_channel_settings_save')))));
};
//# sourceMappingURL=ChannelSettings.js.map