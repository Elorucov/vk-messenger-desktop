import './GroupBanUserModal.css';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import * as Peer from '../../../core/model/Peer';
import { Button, Checkbox, CustomSelect, CustomSelectOption, FormItem, FormItemLabel, FormLayoutGroup, Interpolate, RichAvatar, ScreenSpinner, Select, SimpleCell, Textarea, getColorClass, } from '@vkontakte-internal/vkcom-kit';
import { ModalInterface } from '../../ui/ModalInterface/ModalInterface';
import { useBrowserEnv, useGroupBannedUser, usePeers, useViewer, } from '../../hooks/misc';
import { useNow } from '../../hooks/useNow';
import { getFutureTime } from '../../../core/utils/time';
import { useApiFetch } from '../../hooks/useApiFetch';
import { parseReason } from '../../../data/converter/GroupConverter';
import { Link } from '../../ui/Link/Link';
import cx from 'classnames';
import { useLayoutData } from '../../ui/LayoutDataProvider/LayoutDataProvider';
import { useSnackbar } from '../../hooks/useSnackbar';
import { Icon24ErrorCircleOutline } from '@vkontakte/icons';
import { useConvoAttachesGetMissedPeers } from '../../hooks/useConvoAttaches';
const MAX_COMMENT_LENGTH = 206;
const validateComment = (comment) => comment.length < MAX_COMMENT_LENGTH;
export const GroupBanUserModal = ({ onClose, onSubmit, peer, owner, canWriteToConvo, }) => {
    const { lang } = useBrowserEnv();
    const bannedInfo = useGroupBannedUser(peer);
    const isTuneBan = (peer.isBlacklistedByMe || !canWriteToConvo) && bannedInfo;
    const now = useNow();
    const { isMobileLayout } = useLayoutData();
    const snackbar = useSnackbar();
    const { fetchProfilesAndGroups: fetchAdmin } = useConvoAttachesGetMissedPeers(bannedInfo?.adminId ? [bannedInfo.adminId] : []);
    const [banPeriod, setBanPeriod] = useState(isTuneBan && bannedInfo.endDate ? bannedInfo.endDate : -1);
    const [reason, setReason] = useState(isTuneBan && bannedInfo.reason ? bannedInfo.reason : 0);
    const [comment, setComment] = useState(isTuneBan && bannedInfo.comment ? bannedInfo.comment : '');
    const [isMember, setIsMember] = useState();
    const [isCommentVisible, setIsCommentVisible] = useState(isTuneBan && bannedInfo.isCommentVisible
        ? bannedInfo.isCommentVisible
        : false);
    const viewer = useViewer();
    const peers = usePeers();
    const apiFetch = useApiFetch();
    const fetchIsMember = useCallback(async () => {
        try {
            const response = await apiFetch('groups.isMember', {
                group_id: Peer.toRealId(owner.id),
                user_id: peer.id,
                extended: 0,
            });
            setIsMember(!!response);
        }
        catch {
            snackbar({
                before: (React.createElement(Icon24ErrorCircleOutline, { className: getColorClass('color_icon_negative') })),
                message: lang.use('me_ban_info_request_error_snackbar_text'),
            });
            setIsMember(null);
        }
    }, [apiFetch, lang, owner.id, peer.id, snackbar]);
    const [adminCached, setAdminCached] = useState(() => !(isTuneBan && bannedInfo?.adminId && !peers.has(bannedInfo.adminId)) ||
        undefined);
    useEffect(() => {
        if (!isTuneBan) {
            fetchIsMember();
        }
        // Делаем загрузку недостающих пиров при первом рендере
        if (adminCached === undefined) {
            fetchAdmin()
                .then(() => setAdminCached(true))
                .catch(() => setAdminCached(false));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const submit = () => {
        onSubmit({
            comment,
            reason,
            isCommentVisible,
            endDate: banPeriod > 0 ? banPeriod : undefined,
        });
    };
    const reasonOptions = useMemo(() => [
        {
            value: 0,
            label: lang.use('me_group_ban_modal_reason_option_other'),
        },
        {
            value: 1,
            label: lang.use('me_group_ban_modal_reason_option_spam'),
        },
        {
            value: 2,
            label: lang.use('me_group_ban_modal_reason_option_insult'),
        },
        {
            value: 3,
            label: lang.use('me_group_ban_modal_reason_option_obscene'),
        },
        {
            value: 4,
            label: lang.use('me_group_ban_modal_reason_option_offtop'),
        },
    ], [lang]);
    const banPeriodSelectOptions = useMemo(() => {
        const getText = (date) => {
            return lang.use('me_group_ban_date_with_year', {
                now,
                date: +date,
            });
        };
        const futureTime = {
            forever: -1,
            year: getFutureTime('year'),
            month: getFutureTime('month'),
            week: getFutureTime('day', 7),
            day: getFutureTime('day'),
            hour: getFutureTime('hour'),
        };
        const existingBanPeriod = isTuneBan &&
            bannedInfo?.endDate !== undefined &&
            bannedInfo.endDate !== -1 &&
            bannedInfo.endDate !== 0 && {
            value: bannedInfo.endDate,
            label: getText(bannedInfo.endDate),
            description: '',
        };
        return [
            ...(existingBanPeriod ? [existingBanPeriod] : []),
            {
                value: futureTime.forever,
                label: lang.use('me_group_ban_modal_period_option_forever'),
                description: lang.use('me_group_ban_forever'),
            },
            {
                value: futureTime.year.getTime(),
                label: lang.use('me_group_ban_modal_period_option_year'),
                description: getText(futureTime.year),
            },
            {
                value: futureTime.month.getTime(),
                label: lang.use('me_group_ban_modal_period_option_month'),
                description: getText(futureTime.month),
            },
            {
                value: futureTime.week.getTime(),
                label: lang.use('me_group_ban_modal_period_option_week'),
                description: getText(futureTime.week),
            },
            {
                value: futureTime.day.getTime(),
                label: lang.use('me_group_ban_modal_period_option_day'),
                description: getText(futureTime.day),
            },
            {
                value: futureTime.hour.getTime(),
                label: lang.use('me_group_ban_modal_period_option_hour'),
                description: getText(futureTime.hour),
            },
        ];
    }, [lang, now, isTuneBan, bannedInfo]);
    const userSubtitle = useMemo(() => {
        if (isTuneBan) {
            const adminId = bannedInfo?.adminId;
            if (!adminId)
                return '';
            const bannedAtDate = bannedInfo?.date !== undefined
                ? lang.use('me_group_ban_modal_admin_ban_at', {
                    now,
                    date: bannedInfo.date,
                })
                : '';
            if (adminId === viewer.id) {
                return `${lang.use('me_group_ban_modal_viewer_name', {
                    sex: Peer.sex(peer),
                })}${bannedAtDate}`;
            }
            else {
                const admin = adminCached && Peer.isUserPeerId(adminId)
                    ? Peer.safeGet(peers, adminId)
                    : null;
                return (React.createElement(React.Fragment, null,
                    admin && (React.createElement(Interpolate, { values: {
                            adminName: `${admin.firstNameIns} ${admin.lastNameIns}`,
                            link: ({ children }) => (React.createElement(Link, { to: {
                                    kind: 'PeerPanel',
                                    peerId: admin.id,
                                    screenName: Peer.screenName(admin),
                                }, className: "GroupBanUserModal__adminLink" }, children)),
                        } }, lang.use('me_group_ban_modal_admin_name_link', {
                        values: {
                            adminName: '{adminName}',
                            link: (children) => `<link>${children}</link>`,
                        },
                        sex: Peer.sex(peer),
                    }))),
                    bannedAtDate));
            }
        }
        if (isMember === undefined || isMember === null) {
            return null;
        }
        return isMember
            ? lang.use('me_group_ban_modal_user_is_member')
            : lang.use('me_group_ban_modal_user_is_not_member');
    }, [
        isMember,
        lang,
        isTuneBan,
        bannedInfo,
        now,
        peers,
        viewer.id,
        peer,
        adminCached,
    ]);
    if ((!isTuneBan && isMember === undefined) ||
        (isTuneBan && adminCached === undefined)) {
        return React.createElement(ScreenSpinner, null);
    }
    return (React.createElement(ModalInterface, { onClose: onClose, closeLabel: lang.use('me_close'), contextClass: cx('MEConfig', 'GroupBanUserModal', isMobileLayout && 'GroupBanUserModal--mobile'), title: lang.use('me_group_ban_modal_title'), buttons: React.createElement(React.Fragment, null,
            React.createElement(Button, { mode: "secondary", onClick: onClose, size: "m" }, lang.use('global_cancel')),
            React.createElement(Button, { onClick: submit, size: "m", disabled: !validateComment(comment) }, isTuneBan
                ? lang.use('me_group_ban_modal_tune_submit')
                : lang.use('me_group_ban_modal_submit'))) },
        React.createElement(SimpleCell, { before: React.createElement(RichAvatar, { size: 44, src: peer.photo?.photo50 }), subtitle: userSubtitle, className: "GroupBanUserModal__userInfo" }, Peer.name(peer)),
        React.createElement(FormLayoutGroup, { mode: "horizontal" },
            React.createElement(FormItem, { top: React.createElement(FormItemLabel, null, lang.use('me_group_ban_modal_period')), htmlFor: "ban-period-select" },
                React.createElement(CustomSelect, { id: "ban-period-select", options: banPeriodSelectOptions, value: banPeriod, onChange: (e) => setBanPeriod(+e.target.value), renderOption: ({ option, ...restProps }) => (React.createElement(CustomSelectOption, { description: option.description, ...restProps })) })),
            React.createElement(FormItem, { top: React.createElement(FormItemLabel, null, lang.use('me_group_ban_modal_reason')), htmlFor: "ban-reason-select" },
                React.createElement(Select, { id: "ban-reason-select", options: reasonOptions, value: reason, onChange: (e) => setReason(parseReason(e.target.value)) }))),
        React.createElement(FormItem, { top: React.createElement(FormItemLabel, null, lang.use('me_group_ban_modal_comment')), bottom: !validateComment(comment) &&
                lang.use('me_group_ban_modal_comment_length_warning'), status: validateComment(comment) ? 'default' : 'error', htmlFor: "ban-comment-select" },
            React.createElement(Textarea, { id: "ban-comment-select", value: comment, rows: 1, onChange: (e) => setComment(e.target.value), placeholder: lang.use('me_group_ban_modal_comment_placeholder') })),
        React.createElement(Checkbox, { stretched: true, checked: isCommentVisible, onChange: () => setIsCommentVisible(!isCommentVisible) }, lang.use('me_group_ban_modal_comment_visible_checkbox'))));
};
//# sourceMappingURL=GroupBanUserModal.js.map