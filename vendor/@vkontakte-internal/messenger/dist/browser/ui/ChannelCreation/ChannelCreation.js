import '../../ui/ChannelCreation/ChannelCreation.css';
import React, { useState } from 'react';
import { AvatarSelector } from '../../ui/AvatarSelector/AvatarSelector';
import { Button, FormItem, IconButton, Input } from '@vkontakte/vkui';
import { Icon16Clear } from '@vkontakte/icons';
import { useBrowserEnv, useDispatch, useViewer } from '../../hooks/misc';
import { getLengthWithEmoji, hasEmoji } from '../../../core/utils/emoji';
import * as Viewer from '../../../core/model/Viewer';
import * as Channel from '../../../core/model/Channel';
import { ExternalLink } from '../../ui/Link/Link';
import { FormattedLangKey } from '../../ui/FormattedLangKey/FormattedLangKey';
import { VK_TERMS_URL } from '../../../core/config/config';
import { useSnackbar } from '../../hooks/useSnackbar';
import { useApiFetch } from '../../hooks/useApiFetch';
export const MAX_CHANNEL_NAME_LENGTH = 128;
export const ChannelCreation = ({ onCreate, }) => {
    const { lang, uploader } = useBrowserEnv();
    const apiFetch = useApiFetch();
    const { viewer, profileType } = useViewer();
    const dispatch = useDispatch();
    const isEdu = Viewer.isEdu(profileType);
    const [name, setName] = useState('');
    const [nameBeyondLimit, setNameBeyondLimit] = useState(false);
    const [file, setFile] = useState(null);
    const [photo, setPhoto] = useState(null);
    const isUploadingImage = file && !photo;
    const nameHasEmoji = hasEmoji(name);
    const isValidForm = name.trim().length && !isUploadingImage && !nameHasEmoji && !nameBeyondLimit;
    let inputBottom = lang.use('me_channel_creation_input_footnote');
    if (nameBeyondLimit) {
        inputBottom = (React.createElement(FormattedLangKey, { langkey: "me_chat_channel_name_error_limit", values: {
                number: React.createElement("span", null, MAX_CHANNEL_NAME_LENGTH),
            } }));
    }
    if (nameHasEmoji) {
        inputBottom = lang.use('me_channel_creation_restricted_symbol_error');
    }
    const snackbar = useSnackbar();
    const [uploadErrorTrackId, setUploadErrorTrackId] = useState(null);
    const [isPhotoSaving, setPhotoSaving] = useState(false);
    const onNameChange = (event) => {
        const length = getLengthWithEmoji(event.target.value);
        setName(event.target.value);
        setNameBeyondLimit(length > MAX_CHANNEL_NAME_LENGTH);
    };
    const clearImage = () => {
        setFile(null);
        setPhoto(null);
    };
    const [isCreatingChannel, setCreatingChannel] = useState(false);
    const createChannel = async () => {
        try {
            setCreatingChannel(true);
            const result = await apiFetch('channels.create', {
                title: name,
                create_type: 'public',
            });
            const resultId = result?.items?.[0]?.channel.channel_id;
            if (!resultId) {
                throw Error('Сервер не вернул идентификатор созданного канала');
            }
            const channelId = Channel.resolveId(resultId);
            if (file && photo) {
                uploader.uploadFiles([file], { asChannelPhoto: true }, {
                    viewerId: viewer.id,
                    targetPeerId: channelId,
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
                            channelId,
                            photo,
                        });
                        onCreate(channelId);
                    },
                    onError: (trackId) => {
                        setPhotoSaving(false);
                        setUploadErrorTrackId(trackId);
                    },
                });
            }
            else {
                onCreate(channelId);
            }
        }
        catch (err) {
            snackbar({
                message: lang.use('me_channel_creation_error'),
            });
            console.error(err);
        }
        finally {
            setCreatingChannel(false);
        }
    };
    const onCreateButtonClick = () => {
        if (uploadErrorTrackId) {
            uploader.retryUpload(uploadErrorTrackId);
        }
        else {
            createChannel();
        }
    };
    return (React.createElement("div", { className: "ChannelCreation" },
        React.createElement("div", { className: "ChannelCreation__form" },
            React.createElement("div", { className: "ChannelCreation__image" },
                React.createElement(AvatarSelector, { size: 72, onSelection: setFile, onUpload: setPhoto, onRemove: clearImage })),
            React.createElement("div", { className: "ChannelCreation__fieldset" },
                React.createElement("form", { onSubmit: (e) => {
                        // Не даем странице перегружаться.
                        e.preventDefault();
                        if (!isValidForm || isCreatingChannel) {
                            return;
                        }
                        createChannel();
                    } },
                    React.createElement(FormItem, { className: "ChannelCreation__row", status: nameBeyondLimit || nameHasEmoji ? 'error' : 'default', bottom: inputBottom },
                        React.createElement(Input, { placeholder: lang.use('me_channel_creation_input_placeholder'), onChange: onNameChange, value: name, autoFocus: true, after: name && (React.createElement(IconButton, { hoverMode: "opacity", onClick: () => {
                                    setName('');
                                    setNameBeyondLimit(false);
                                } },
                                React.createElement(Icon16Clear, null))) }))))),
        !isEdu && (React.createElement("div", { className: "ChannelCreation__policy" },
            React.createElement(FormattedLangKey, { values: {
                    link1: (text) => (React.createElement(ExternalLink, { href: VK_TERMS_URL, target: "_blank", className: "ChannelCreation__link" }, text)),
                }, langkey: "me_channel_creation_notice" }))),
        React.createElement("div", { className: "ChannelCreation__footer" },
            React.createElement(Button, { disabled: !isValidForm || isCreatingChannel, onClick: onCreateButtonClick, loading: isPhotoSaving }, lang.use('me_channel_creation_button')))));
};
//# sourceMappingURL=ChannelCreation.js.map