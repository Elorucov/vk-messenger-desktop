import { BannerPanel } from '../../ui/BannerPanel/BannerPanel';
import React, { useCallback, useEffect, useMemo, useState, } from 'react';
import { calculateAge, useBrowserEnv, useDispatch, useOrganisers, useUserDetails, } from '../../hooks/misc';
import './ConvoUserInfoBanner.css';
import { Button, FormItem, getColorClass, Textarea, } from '@vkontakte-internal/vkcom-kit';
import { useNow } from '../../hooks/useNow';
import cx from 'classnames';
import { AdaptiveItemsLine } from '../../ui/AdaptiveItemsLine';
import './AdaptiveItemsLineTagItem.css';
import { AdaptiveItemsLineTagCounter } from './AdaptiveItemsLineTagCounter';
import { AdaptiveItemsLineTagItem } from './AdaptiveItemsLineTagItem';
import { AdaptiveItemsLineTagSeparator } from './AdaptiveItemsLineTagSeparator';
import { TagBadge } from '../../ui/TagBadge/TagBadge';
import { Icon24CheckCircleOutline, Icon24ChevronDown, Icon24ChevronUp, Icon24ErrorCircleOutline, } from '@vkontakte/icons';
import { useModal } from '../../hooks/useModal';
import { ModalInterface } from '../../ui/ModalInterface/ModalInterface';
import { useSnackbar } from '../../hooks/useSnackbar';
import { useLayoutData } from '../../ui/LayoutDataProvider/LayoutDataProvider';
export const ConvoUserInfoBanner = ({ peer, groupId, convo, handleOpenTagManager, }) => {
    const { lang } = useBrowserEnv();
    const dispatch = useDispatch();
    const userInfo = useUserDetails(peer.id);
    const organisers = useOrganisers();
    const now = useNow();
    const noteModal = useModal();
    const [tagsCollapsed, setTagsCollapsed] = useState(true);
    const hasTagsAndNote = !organisers.tags.isUnavailable;
    const [hasMoreTagsToRender, setHasMoreTagsToRender] = useState(false);
    const onChangeCounterVisibility = useCallback((isCounterVisible) => {
        setHasMoreTagsToRender(isCounterVisible);
    }, []);
    const tags = useMemo(() => {
        if (!hasTagsAndNote && !userInfo?.ad_id) {
            return;
        }
        const tagsIds = convo.tags;
        const tags = [
            ...(userInfo?.ad_id
                ? [
                    {
                        adId: userInfo.ad_id,
                        hasAdAccess: userInfo.has_ad_access,
                        isEasyPromotedMarket: userInfo.is_easy_promoted_market,
                        isMailRuAd: userInfo.is_mail_ru_ad,
                    },
                ]
                : []),
            ...(tagsIds?.size
                ? organisers.tags.items.filter((tag) => tagsIds.has(tag.id))
                : []),
        ];
        return (React.createElement(React.Fragment, null,
            React.createElement("div", { className: "ConvoUserInfoBanner__tagsContainer" },
                !!tags?.length && (React.createElement(React.Fragment, null,
                    tagsCollapsed ? (React.createElement(AdaptiveItemsLine, { Counter: AdaptiveItemsLineTagCounter, Item: AdaptiveItemsLineTagItem, items: tags, separator: React.createElement(AdaptiveItemsLineTagSeparator, null), className: "ConvoUserInfo__tagsCollapsed", onChangeCounterVisibility: onChangeCounterVisibility })) : (React.createElement("div", { className: "ConvoUserInfoBanner__tagsFullsize" }, tags.map((item) => (React.createElement(TagBadge, { key: item.id ? `tag${item.id}` : `ad${item.adId}`, item: item }))))),
                    hasMoreTagsToRender && (React.createElement(Button, { onClick: () => setTagsCollapsed(!tagsCollapsed), mode: "link", className: "ConvoUserInfoBanner__collapseButton" }, tagsCollapsed ? (React.createElement(Icon24ChevronDown, { className: getColorClass('color_icon_secondary') })) : (React.createElement(Icon24ChevronUp, { className: getColorClass('color_icon_secondary') })))))),
                hasTagsAndNote && (React.createElement("div", { className: "ConvoUserInfoBanner__tuneTagsContainer" },
                    React.createElement(Button, { size: "s", mode: "link", onClick: () => handleOpenTagManager(peer.id), appearance: "accent-invariable" }, lang.use('me_convo_user_info_tune_tags_button')))))));
    }, [
        convo.tags,
        hasTagsAndNote,
        lang,
        organisers.tags.items,
        handleOpenTagManager,
        peer.id,
        tagsCollapsed,
        setTagsCollapsed,
        userInfo?.ad_id,
        userInfo?.has_ad_access,
        userInfo?.is_easy_promoted_market,
        userInfo?.is_mail_ru_ad,
        hasMoreTagsToRender,
        onChangeCounterVisibility,
    ]);
    const info = useMemo(() => {
        const age = calculateAge(peer.bdate);
        return (React.createElement(React.Fragment, null,
            peer.city?.title && React.createElement(React.Fragment, null,
                peer.city.title,
                "\u00A0\u00B7\u00A0"),
            age && age > 0 && (React.createElement(React.Fragment, null,
                lang.use('me_convo_user_info_years', {
                    values: {
                        years: age.toString(),
                    },
                    num: age,
                }),
                "\u00A0\u00B7\u00A0")),
            lang.use('me_convo_user_info_sex', {
                sex: peer.sex,
            })));
    }, [lang, peer]);
    const onSaveNote = useCallback((note, requestCompletedUICallback) => {
        dispatch({
            type: 'SetUserNote',
            note,
            groupId,
            userId: peer.id,
            requestCompletedUICallback,
        });
    }, [groupId, peer.id, dispatch]);
    const note = useMemo(() => {
        if (!hasTagsAndNote) {
            return;
        }
        if (!userInfo?.note) {
            return (React.createElement(Button, { size: "s", mode: "link", onClick: noteModal.open, appearance: "accent-invariable" }, lang.use('me_convo_user_info_add_note_button')));
        }
        return (React.createElement("div", { className: "ConvoUserInfoBanner__note" },
            React.createElement("div", { className: "ConvoUserInfoBanner__noteText ConvoUserInfoBanner__topPadding" }, userInfo.note),
            React.createElement(Button, { size: "s", mode: "link", onClick: noteModal.open, className: "ConvoUserInfoBanner__editButton", appearance: "accent-invariable" }, lang.use('me_convo_user_info_edit_note_button'))));
    }, [hasTagsAndNote, userInfo?.note, lang, noteModal.open]);
    const joinDate = useMemo(() => {
        if (!userInfo?.join_date) {
            return;
        }
        return lang.formatDate(userInfo.join_date * 1000, {
            now,
            variant: 'time-ago',
            shortMonths: true,
        });
    }, [userInfo?.join_date, lang, now]);
    useEffect(() => {
        !userInfo &&
            dispatch({
                type: 'GetUserDetails',
                userId: peer.id,
                groupId,
            });
    }, [peer.id, dispatch, userInfo, groupId]);
    return (React.createElement(BannerPanel, { isVisible: true, mode: "custom" },
        React.createElement("dl", { className: "ConvoUserInfoBanner__container" },
            tags && (React.createElement(ConvoUserInfoBannerDescription, { title: lang.use('me_convo_user_info_label_tags'), content: tags, noPadding: true })),
            React.createElement(ConvoUserInfoBannerDescription, { title: lang.use('me_convo_user_info_label_information'), content: info }),
            joinDate && (React.createElement(ConvoUserInfoBannerDescription, { title: lang.use('me_convo_user_info_label_join_date'), content: joinDate })),
            note && (React.createElement(ConvoUserInfoBannerDescription, { title: lang.use('me_convo_user_info_label_note'), content: note, noPadding: true }))),
        noteModal.isActive && (React.createElement(UserInfoNoteModal, { onSaveNote: onSaveNote, onClose: noteModal.close, currentNote: userInfo?.note || '' }))));
};
const ConvoUserInfoBannerDescription = ({ title, content, noPadding, }) => {
    return (React.createElement(React.Fragment, null,
        React.createElement("dt", { className: "ConvoUserInfoBannerDescription__title" }, title),
        React.createElement("dd", { className: cx('ConvoUserInfoBannerDescription__content', noPadding && 'ConvoUserInfoBannerDescription__content--noPadding') }, content)));
};
const MAX_NOTE_LENGTH = 96;
const validateNote = (note) => note.length < MAX_NOTE_LENGTH;
const UserInfoNoteModal = ({ onSaveNote, currentNote, onClose, }) => {
    const { lang } = useBrowserEnv();
    const [note, setNote] = useState(currentNote);
    const [loading, setLoading] = useState(false);
    const { isMobileLayout } = useLayoutData();
    const snackbar = useSnackbar();
    const requestCompletedUICallback = useCallback((hasFailed) => {
        setLoading(false);
        if (hasFailed) {
            snackbar({
                before: (React.createElement(Icon24ErrorCircleOutline, { className: getColorClass('color_icon_negative') })),
                message: lang.use('me_convo_user_info_save_note_failed'),
            });
            return;
        }
        onClose();
        snackbar({
            before: (React.createElement(Icon24CheckCircleOutline, { className: getColorClass('color_icon_positive') })),
            message: lang.use('me_convo_user_info_save_note_succeed'),
        });
    }, [snackbar, lang, onClose]);
    return (React.createElement(ModalInterface, { onClose: onClose, closeLabel: lang.use('me_close'), contextClass: cx('MEConfig', 'ConvoUserNoteModal', isMobileLayout && 'ConvoUserNoteModal--mobile'), title: lang.use('me_convo_user_info_note_modal_header'), buttons: React.createElement(React.Fragment, null,
            React.createElement(Button, { mode: "secondary", onClick: onClose, size: "m" }, lang.use('global_cancel')),
            React.createElement(Button, { onClick: () => {
                    onSaveNote(note, requestCompletedUICallback);
                    setLoading(true);
                }, size: "m", disabled: !(note && validateNote(note)) || loading }, lang.use('me_convo_user_info_note_modal_submit'))) },
        React.createElement(FormItem, { status: validateNote(note) ? 'default' : 'error', bottom: !validateNote(note) &&
                lang.use('me_convo_user_info_note_modal_length_warning'), htmlFor: "group-user-info-note" },
            React.createElement(Textarea, { id: "group-user-info-note", value: note, rows: 2, onChange: (e) => setNote(e.target.value), placeholder: lang.use('me_convo_user_info_note_modal_placeholder') }))));
};
//# sourceMappingURL=ConvoUserInfoBanner.js.map