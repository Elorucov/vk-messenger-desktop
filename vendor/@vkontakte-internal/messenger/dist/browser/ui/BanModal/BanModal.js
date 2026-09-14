import { GroupsBanInfoReasonEnumNames, } from '@vkontakte-internal/api-schema-typescript';
import { Button, Cell, Checkbox, CustomSelectOption, FormItem, FormLayoutGroup, Input, Select, } from '@vkontakte/vkui';
import { useBrowserEnv, usePeers } from '../../hooks/misc';
import { useNow } from '../../hooks/useNow';
import { Avatar } from '../../ui/Avatar/Avatar';
import '../../ui/BanModal/BanModal.css';
import { ModalInterface } from '../../ui/ModalInterface/ModalInterface';
import { PeerTitle } from '../../ui/PeerTitle/PeerTitle';
import * as Peer from '../../../core/model/Peer';
import React, { useMemo, useState } from 'react';
const DEFAULT_BAN_FORM_STATE = {
    comment: '',
    reason: 0,
    showComment: false,
    period: Infinity,
};
const MAX_COMMENT_LENGTH = 230;
export const BanModal = ({ peerId, initialState = DEFAULT_BAN_FORM_STATE, onSubmit, onClose, isUserMemberOfChannel, }) => {
    const { lang } = useBrowserEnv();
    const peers = usePeers();
    const now = useNow();
    const peer = Peer.safeGet(peers, peerId);
    const [formState, setFormState] = useState(initialState);
    const banPeriodOptions = useMemo(() => [
        {
            label: lang.use('me_ban_modal_period_forever'),
            value: Infinity,
        },
        {
            label: lang.use('me_ban_modal_period_year'),
            value: 365 * 24 * 3600 * 1000,
        },
        {
            label: lang.use('me_ban_modal_period_month'),
            value: 30 * 24 * 3600 * 1000,
        },
        {
            label: lang.use('me_ban_modal_period_week'),
            value: 7 * 24 * 3600 * 1000,
        },
        {
            label: lang.use('me_ban_modal_period_day'),
            value: 24 * 3600 * 1000,
        },
        {
            label: lang.use('me_ban_modal_period_hour'),
            value: 3600 * 1000,
        },
    ], [lang]);
    const banReasonOptions = useMemo(() => [
        GroupsBanInfoReasonEnumNames.OTHER,
        GroupsBanInfoReasonEnumNames.SPAM,
        GroupsBanInfoReasonEnumNames.VERBAL_ABUSE,
        GroupsBanInfoReasonEnumNames.STRONG_LANGUAGE,
        GroupsBanInfoReasonEnumNames.FLOOD,
    ].map((reason) => ({
        label: lang.use(`me_ban_modal_reason_${reason}`),
        value: reason,
    })), [lang]);
    const handlePeriodChange = (event) => {
        const period = event.target.value === 'Infinity'
            ? Infinity
            : parseInt(event.target.value);
        setFormState((prev) => ({
            ...prev,
            period,
        }));
    };
    const handleReasonChange = (event) => {
        const rawReason = parseInt(event.target.value);
        const reason = Object.values(GroupsBanInfoReasonEnumNames).find((value) => value === rawReason);
        if (reason === undefined) {
            return;
        }
        setFormState((prev) => ({
            ...prev,
            reason,
        }));
    };
    const handleCommentChange = (event) => {
        setFormState((prev) => ({
            ...prev,
            comment: event.target.value,
        }));
    };
    const handleShowCommentChange = () => {
        setFormState((prev) => ({
            ...prev,
            showComment: !prev.showComment,
        }));
    };
    const handleSubmit = () => {
        const { comment, period, reason, showComment } = formState;
        onSubmit({
            reason,
            comment: comment.length ? comment : undefined,
            isCommentVisible: comment.length ? showComment : undefined,
            endDate: period === Infinity ? undefined : now + formState.period,
        });
    };
    return (React.createElement(ModalInterface, { contextClass: "MEConfig", panelClass: "BanModal", title: lang.use('me_ban_modal_title'), closeLabel: lang.use('me_close'), onClose: onClose, withCustomLayout: true, buttons: [
            React.createElement(Button, { key: "cancel", size: "m", mode: "secondary", appearance: "accent", onClick: onClose }, lang.use('me_cancel')),
            React.createElement(Button, { key: "submit", size: "m", mode: "primary", appearance: "accent", onClick: handleSubmit }, lang.use('me_ban_modal_submit_button_title')),
        ] },
        React.createElement("div", { className: "BanModal__wrapper" },
            React.createElement(Cell, { before: React.createElement(Avatar, { peer: peer, size: 40 }), hasHover: false, hasActive: false, subtitle: isUserMemberOfChannel
                    ? lang.use('me_channel_user_is_member_of_channel')
                    : lang.use('me_channel_user_is_not_member_of_channel') },
                React.createElement(PeerTitle, { peer: peer })),
            React.createElement(FormLayoutGroup, { mode: "horizontal" },
                React.createElement(FormItem, { top: lang.use('me_ban_modal_period_title') },
                    React.createElement(Select, { name: "period", required: true, options: banPeriodOptions, value: formState.period, renderOption: ({ option, ...restProps }) => (React.createElement(CustomSelectOption, { ...restProps, description: lang.use('me_ban_modal_unban_after', {
                                values: {
                                    unbanTime: option.value === Infinity
                                        ? lang.use('me_ban_modal_unban_by_admin')
                                        : lang.use('global_date_year_time', {
                                            now,
                                            date: now + option.value,
                                        }),
                                },
                            }) })), onChange: handlePeriodChange })),
                React.createElement(FormItem, { top: lang.use('me_ban_modal_reason_title') },
                    React.createElement(Select, { name: "reason", required: true, options: banReasonOptions, value: formState.reason, onChange: handleReasonChange }))),
            React.createElement(FormItem, { top: React.createElement(FormItem.Top, null,
                    React.createElement(FormItem.TopLabel, null,
                        React.createElement("span", { className: "PollCreateModal__titleSubhead" },
                            React.createElement("span", null, lang.use('me_ban_modal_comment_title')),
                            React.createElement("span", null,
                                formState.comment.length,
                                " / ",
                                MAX_COMMENT_LENGTH)))) },
                React.createElement(Input, { name: "comment", type: "text", placeholder: lang.use('me_ban_modal_comment_placeholder'), maxLength: MAX_COMMENT_LENGTH, value: formState.comment, onChange: handleCommentChange })),
            React.createElement(Checkbox, { name: "showComment", onChange: handleShowCommentChange }, lang.use('me_ban_modal_show_comment_description')))));
};
//# sourceMappingURL=BanModal.js.map