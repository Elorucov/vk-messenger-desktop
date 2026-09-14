import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"Link":["@vkontakte-internal/vkcom-kit",{"className":2}]} */
import { useCallback, useEffect, useState } from 'react';
import { Button, DropdownActionSheet, FormItem, getColorClass, Input, Link, Text, Textarea, TextClamp, VideoCard, List, Cell, RichAvatar, Div, FormLayout, Group, Spacing, FormStatus, Subhead, InterpunctSeparator, } from '@vkontakte-internal/vkcom-kit';
import { TranslationCreateModal } from '../TranslationCreateModal';
import { getGroupsForStreaming, getUpcomingLives, getVideos, loadUsers, sendVideoEdit, } from '../../services/backend';
import { VoiceRoomMode, ETranslationPrivacy, peerIdToVkId, } from '@vkontakte-internal/calls-core';
import { getVoiceRoomGroup, getVoiceRoomMode, getVoiceRoomName, getVoiceRoomOwnerId, } from '../../features/voiceRoom';
import { GroupsGroupIsClosedEnumNames, } from '@vkontakte-internal/api-schema-typescript';
import { handlePromiseError } from '../../helpers/logger';
import { decodeHTMLEntities } from '@vkontakte-internal/vkjs/lib/emoji/HTMLEntities';
import { useLang } from '../../hooks/useLang';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { getGroupId, getMeGroup, getMyId, getParticipants } from '../../selectors';
import { RecordCreateModal as VoiceRoomRecordCreateModal } from '../../features/voiceRoom/RecordCreateModal/RecordCreateModal';
import { useConfig } from '../../services/config';
import { getUserName, getVideoStartTime } from '../../utils/video';
import { Icon24ChevronRight, Icon24ClockOutline, Icon24Lock } from '@vkontakte/icons';
import styles from './TranslationCreateForm.module.css';
import { TranslationCreateProvider, useTranslationCreateModel } from './TranslationCreateModel';
import { createWidget } from '@vkontakte-internal/di';
import { observer } from 'mobx-react-lite';
const TranslationCreateForm = observer(function TranslationCreateForm() {
    const { roomId, props } = useTranslationCreateModel();
    const { onSubmit, onClose, isRecord, isVoiceRoom } = props.current;
    const { sferum: isSferum } = useConfig();
    const { getLang, langShortDateTime } = useLang();
    const participants = useTypedSelector(getParticipants);
    const me = useTypedSelector(getMyId);
    const groupId = useTypedSelector(getGroupId);
    const meGroup = useTypedSelector(getMeGroup);
    const group = useTypedSelector(getVoiceRoomGroup);
    const voiceRoomMode = useTypedSelector(getVoiceRoomMode);
    const voiceRoomName = useTypedSelector(getVoiceRoomName);
    const voiceRoomOwnerId = useTypedSelector(getVoiceRoomOwnerId);
    const getDefaultVideoTitle = () => {
        if (isVoiceRoom && voiceRoomName) {
            return voiceRoomName;
        }
        const dateString = new Date().toISOString().split('T')[0];
        const defaultTitle = isVoiceRoom
            ? getLang('voicerooms_create_record_form_name_default_value')
            : getLang('calls_translation_title_default_value');
        return defaultTitle.replace('%s', dateString);
    };
    const getAsShortOwner = (id, name = '', photo = '') => {
        return {
            id: id,
            name: name,
            photo: photo,
            isGroup: id < 0,
        };
    };
    const getPrivacyOptions = (needAll, isGroup) => {
        if (isGroup || isVoiceRoom) {
            const result = [{ value: ETranslationPrivacy.Members, label: getLang('calls_call_community_members') }];
            if (isVoiceRoom) {
                if (group?.is_closed === GroupsGroupIsClosedEnumNames.OPEN) {
                    result.unshift({
                        value: ETranslationPrivacy.All,
                        label: getLang('calls_translation_privacy_all_users'),
                    });
                }
                result.push({
                    value: ETranslationPrivacy.Editors,
                    label: getLang('voicerooms_record_privacy_editors'),
                });
                result.push({ value: ETranslationPrivacy.ByLink, label: getLang('calls_those_who_have_link') });
            }
            return result;
        }
        let options = [
            { value: ETranslationPrivacy.OnlyMe, label: getLang('calls_translation_privacy_only_me_and_chat') },
        ];
        if (!isSferum) {
            options.push({
                value: ETranslationPrivacy.Friends,
                label: getLang('calls_translation_privacy_friends_and_chat'),
            });
        }
        if (needAll) {
            options.push({ value: ETranslationPrivacy.All, label: getLang('calls_translation_privacy_all_users') });
            options.push({ value: ETranslationPrivacy.ByLink, label: getLang('calls_those_who_have_link') });
        }
        return options;
    };
    const meUser = participants[me];
    const [name, setName] = useState(getDefaultVideoTitle());
    const [description, setDescription] = useState('');
    const [privacyView, setPrivacyView] = useState(isVoiceRoom
        ? voiceRoomMode === VoiceRoomMode.VOICE_ROOM
            ? ETranslationPrivacy.OnlyMe
            : ETranslationPrivacy.Editors
        : groupId
            ? ETranslationPrivacy.Members
            : ETranslationPrivacy.OnlyMe);
    const [privacyViewOptions, setPrivacyViewOptions] = useState(() => getPrivacyOptions(!meUser.isClosed, Boolean(groupId)));
    const [selectedOwner, setSelectedOwner] = useState(() => {
        if (isVoiceRoom && voiceRoomOwnerId && voiceRoomMode === VoiceRoomMode.TRIBUNE) {
            return getAsShortOwner(voiceRoomOwnerId);
        }
        else if (groupId) {
            return getAsShortOwner(groupId, meGroup?.name, meGroup?.photo);
        }
        else {
            return getAsShortOwner(peerIdToVkId(meUser.peerId), meUser.name, meUser.photo);
        }
    });
    const [shouldSelectPostponed, setShouldSelectPostponed] = useState(false);
    const [upcomingVideo, setUpcomingVideo] = useState({});
    const [groupsForSelector, setGroupsForSelector] = useState(() => {
        if (isVoiceRoom) {
            return [];
        }
        else if (groupId && meGroup) {
            return [{ value: peerIdToVkId(meGroup.peerId), label: decodeHTMLEntities(meGroup.name) }];
        }
        else {
            return [{ value: peerIdToVkId(meUser.peerId), label: decodeHTMLEntities(meUser.name) }];
        }
    });
    const [groups, setGroups] = useState([]);
    const [hasUpcomingLives, setHasUpcomingLives] = useState(false);
    const [upcomingLives, setUpcomingLives] = useState([]);
    const [upcomingVideoOwnerNames, setUpcomingVideoOwnerNames] = useState([]);
    const onChangeName = (e) => {
        setName(e.target.value);
    };
    const onChangeDescription = (e) => {
        setDescription(e.target.value);
    };
    const onPrivacyViewSelectChange = (value) => {
        setPrivacyView(value);
    };
    const onGroupSelectChange = (groupId) => {
        if (typeof groupId === 'number' && groupId < 0) {
            groups.forEach((group) => {
                if (group.id == -groupId) {
                    setPrivacyView(ETranslationPrivacy.Members);
                    setPrivacyViewOptions(getPrivacyOptions(true, true));
                    setSelectedOwner(getAsShortOwner(-group.id, group.name, group.photo_100));
                }
            });
        }
        else {
            setPrivacyViewOptions(getPrivacyOptions(!meUser.isClosed, false));
            setPrivacyView(ETranslationPrivacy.OnlyMe);
            setSelectedOwner(getAsShortOwner(peerIdToVkId(meUser.peerId), meUser.name, meUser.photo));
        }
    };
    const onSelectUpcomingVideoListItemClick = () => {
        if (hasUpcomingLives) {
            setShouldSelectPostponed(true);
        }
    };
    const closeSelectPostponed = () => setShouldSelectPostponed(false);
    const onUpcomingVideoListItemClick = (video) => {
        if (video.owner_id > 0) {
            getVideos(video.owner_id, [video.owner_id + '_' + video.id], true).then((response) => {
                if (response.count > 0) {
                    let fullUpcomingVideos = response.items.filter((videoItem) => {
                        return videoItem.id == video.id;
                    });
                    if (fullUpcomingVideos.length > 0) {
                        video.privacy_view = fullUpcomingVideos[0].access_key
                            ? { category: ETranslationPrivacy.ByLink }
                            : fullUpcomingVideos[0].privacy_view;
                        setUpcomingVideo(video);
                        if (video.privacy_view) {
                            setPrivacyView(video.privacy_view.category);
                        }
                    }
                }
            });
        }
        setUpcomingVideo(video);
        closeSelectPostponed();
        setName(video.title);
        setDescription(video.description);
    };
    const onResetUpcomingVideoClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setUpcomingVideo({});
        setName(getDefaultVideoTitle());
        setDescription('');
    };
    const handleSubmit = useCallback(() => {
        let nameToSend = name.trim();
        let descriptionToSend = description.trim();
        let streamParams = {};
        if (Object.keys(upcomingVideo).length > 0) {
            if (!nameToSend) {
                nameToSend = upcomingVideo.title;
            }
            if (!descriptionToSend) {
                descriptionToSend = upcomingVideo.description;
            }
            let needEdit = descriptionToSend != upcomingVideo.title || nameToSend != upcomingVideo.description;
            if (!needEdit) {
                needEdit = selectedOwner.id > 0 && upcomingVideo.privacy_view.category != privacyView;
            }
            if (needEdit) {
                sendVideoEdit(selectedOwner.id, upcomingVideo.id, nameToSend, descriptionToSend, privacyView).catch((e) => console.error(e));
            }
            const upcomingStreamParams = {
                ovId: upcomingVideo.ov_id,
                ownerId: upcomingVideo.owner_id,
                id: upcomingVideo.id,
                roomId,
            };
            if (upcomingVideo.live_start_time) {
                upcomingStreamParams.startTime = upcomingVideo.live_start_time;
            }
            streamParams.upcomingStreamParams = upcomingStreamParams;
        }
        else {
            streamParams.streamParams = {
                name: nameToSend ? nameToSend : getDefaultVideoTitle(),
                description: descriptionToSend,
                privacy_view: privacyView,
                call: 1,
            };
            const groupId = selectedOwner.id < 0 ? -selectedOwner.id : 0;
            if (groupId !== 0) {
                streamParams.streamParams.group_id = groupId;
            }
        }
        onSubmit(streamParams);
    }, [name, description, privacyView, selectedOwner, upcomingVideo, roomId]);
    useEffect(() => {
        if (isVoiceRoom || groupId) {
            return;
        }
        // TODO: xak, window.vkApi.api(method, methodParams) перестал принимал methodParams = null и у нас все взорвалось.
        try {
            getGroupsForStreaming()
                .then((responseGroups) => {
                const groups = [...groupsForSelector];
                if (responseGroups.length > 0) {
                    responseGroups.forEach((item) => {
                        groups.push({ value: -item.id, label: item.name || '' });
                    });
                    setGroupsForSelector(groups);
                    setGroups(responseGroups);
                }
            })
                .catch(handlePromiseError);
        }
        catch (e) {
            console.log(e);
        }
    }, []);
    useEffect(() => {
        setUpcomingVideo({});
        setHasUpcomingLives(false);
        setUpcomingLives([]);
        getUpcomingLives([selectedOwner.id])
            .then((response) => {
            let upcoming = [];
            if (response.count > 0) {
                upcoming = response.items.filter((video) => {
                    return video.ov_id !== '';
                });
            }
            let hasUpcoming = upcoming.length > 0;
            setHasUpcomingLives(hasUpcoming);
            setUpcomingLives(upcoming);
            if (hasUpcoming) {
                let userIds = [];
                upcoming.forEach((value) => {
                    if (value.owner_id && value.owner_id > 0) {
                        userIds.push(value.owner_id.toString());
                    }
                });
                if (userIds) {
                    loadUsers({ user_ids: userIds.join(',') })
                        .then((response) => {
                        const userNames = [];
                        response.forEach((value) => {
                            const { first_name, last_name } = value;
                            userNames.push({
                                id: value.id,
                                name: (first_name ? `${first_name} ` : '') + (last_name ?? ''),
                            });
                        });
                        setUpcomingVideoOwnerNames(userNames);
                    })
                        .catch(handlePromiseError);
                }
            }
        })
            .catch(handlePromiseError);
    }, [selectedOwner]);
    if (shouldSelectPostponed) {
        return (_jsx(_Fragment, { children: _jsx(TranslationCreateModal, { title: getLang('calls_translation_select_upcoming_box_title'), isWithBackButton: true, onBackClick: closeSelectPostponed, onClose: closeSelectPostponed, children: _jsx("div", { children: upcomingLives.length > 0 && (_jsx(List, { gap: 8, children: upcomingLives.map((value) => {
                            return (
                            // eslint-disable-next-line @vkontakte-internal/vkcom-plugins/check-required-props-usage
                            _jsx(VideoCard, { noAvatar: true, noPlayIcon: true, direction: "horizontal", size: "s", selectMode: "card", onSelect: () => onUpcomingVideoListItemClick(value), onAuthorClick: (e) => {
                                    e.preventDefault();
                                }, selectButtonAriaLabel: getLang('calls_translation_select_video_link'), video: {
                                    title: value.title,
                                    owner: {
                                        name: decodeHTMLEntities(getUserName(value.owner_id, upcomingVideoOwnerNames, selectedOwner)),
                                        href: '',
                                    },
                                    additionalInfo: getVideoStartTime(value, langShortDateTime),
                                    thumbSrc: getPreviewUrl(value),
                                } }, value.id));
                        }) })) }) }) }));
    }
    const isOwnerOptionsAvailable = !!groupsForSelector.length;
    const isUpcomingLivesAvailable = hasUpcomingLives && !isRecord;
    const isPrivacyViewOptionsAvailable = !isVoiceRoom || voiceRoomMode !== VoiceRoomMode.VOICE_ROOM;
    const authorButtonLink = (_jsx(Link, { className: styles.longSelect, "data-testid": `calls_${isRecord ? 'record' : 'translation'}_modal_author_name`, children: _jsx(TextClamp, { lines: 1, children: selectedOwner.name }) }));
    const authorSelect = groupsForSelector.length > 1 ? (_jsx(DropdownActionSheet, { maxHeight: 350, width: 200, trigger: "click", content: groupsForSelector.map(({ label, value }) => (_jsx(DropdownActionSheet.Item, { onClick: () => onGroupSelectChange(value), children: _jsx(Text, { weight: "3", className: getColorClass('color_text_link'), children: label }) }, value))), children: authorButtonLink })) : (authorButtonLink);
    const content = isOwnerOptionsAvailable || isUpcomingLivesAvailable || isPrivacyViewOptionsAvailable
        ? [
            _jsx(Div, { children: _jsxs(List, { children: [isOwnerOptionsAvailable && (_jsx(Cell, { before: _jsx(RichAvatar, { src: selectedOwner.photo, alt: selectedOwner.name, size: 28 }), after: authorSelect, hasHover: false, children: isRecord ? getLang('calls_record_owner_title') : getLang('calls_translation_owner_title') })), isUpcomingLivesAvailable && (_jsxs(Cell, { onClick: onSelectUpcomingVideoListItemClick, before: _jsx(Icon24ClockOutline, {}), after: _jsx(Icon24ChevronRight, {}), children: [getLang('calls_translation_postponed_title'), Object.keys(upcomingVideo).length > 0 && (_jsxs("span", { children: [_jsx(InterpunctSeparator, {}), _jsx(Button, { mode: "link", onClick: onResetUpcomingVideoClick, children: getLang('calls_translation_postponed_reset') })] }))] })), isPrivacyViewOptionsAvailable && (_jsx(Cell, { hasHover: false, before: _jsx(Icon24Lock, {}), after: _jsx(DropdownActionSheet, { maxHeight: 350, width: 200, trigger: "click", content: privacyViewOptions.map(({ label, value }) => (_jsx(DropdownActionSheet.Item, { onClick: () => onPrivacyViewSelectChange(value), children: _jsx(Text, { weight: "3", className: getColorClass('color_text_link'), children: label }) }, value))), children: _jsx(Link, { className: styles.longSelect, children: _jsx(TextClamp, { lines: 1, children: privacyViewOptions.find(({ value }) => value === privacyView)?.label ??
                                            privacyView }) }) }), children: isVoiceRoom
                                ? getLang('voicerooms_create_record_form_who_can_see_video_property_label')
                                : getLang('calls_translation_who_can_see_video_privacy') }))] }) }, "link"),
        ]
        : [];
    content.push(_jsx(Group, { mode: "plain", children: _jsx(Div, { paddingTop: 0, children: _jsxs(FormLayout, { mode: "vertical", onSubmit: handleSubmit, children: [isPrivacyViewOptionsAvailable && (_jsxs(FormItem, { children: [_jsx(Subhead, { weight: "3", Component: "p", className: getColorClass('color_text_secondary'), children: isRecord
                                    ? isVoiceRoom
                                        ? getLang('voicerooms_create_record_form_who_can_see_video_property_hint')
                                        : getLang('calls_record_who_can_see_video_privacy_hint')
                                    : getLang('calls_translation_who_can_see_video_privacy_hint') }), _jsx(Spacing, { size: 16 })] })), _jsx(FormItem, { top: getLang('calls_translation_title'), children: _jsx(Input, { value: name, onChange: onChangeName, placeholder: getLang('calls_translation_name_placeholder'), "data-testid": `calls_${isRecord ? 'record' : 'translation'}_modal_${isRecord ? 'record' : 'translation'}_name` }) }), !isRecord && (_jsx(FormItem, { top: getLang('calls_translation_description'), children: _jsx(Textarea, { placeholder: getLang('calls_translation_description_placeholder'), value: description, onChange: onChangeDescription }) })), _jsx(Spacing, { size: 16 }), _jsx(Div, { children: _jsx(FormStatus, { children: isRecord
                                ? isVoiceRoom
                                    ? getLang('voicerooms_create_record_form_warning_message')
                                    : getLang('calls_record_notification_warning')
                                : getLang('calls_translation_notification_warning') }) })] }, "main") }) }));
    return (_jsx(_Fragment, { children: isVoiceRoom ? (_jsx(VoiceRoomRecordCreateModal, { header: getLang('voicerooms_create_record_form_header'), onClose: onClose, onSubmit: handleSubmit, children: content })) : (_jsx(TranslationCreateModal, { onClose: onClose, onSubmit: handleSubmit, title: isRecord ? getLang('calls_record_box_title') : getLang('calls_translation_box_title'), isRecord: isRecord, children: content })) }));
});
export const TranslationCreateWidget = createWidget(TranslationCreateProvider, TranslationCreateForm);
/**
 * Для каждого VideoItem должно быть поле image, которое содержит массив картинок
 * по возрастанию размеры, с шириной 130, 160, 320, 800
 */
function getPreviewUrl(value) {
    const neededImageWidth = 320;
    if (!value.image) {
        return '';
    }
    const neededPicture = value.image.find((image) => image.width === neededImageWidth);
    if (neededPicture) {
        return neededPicture.url;
    }
    // Если не нашли нужную ширину, вернем по умолчанию
    return value.image[0]?.url ?? '';
}
//# sourceMappingURL=TranslationCreateForm.js.map