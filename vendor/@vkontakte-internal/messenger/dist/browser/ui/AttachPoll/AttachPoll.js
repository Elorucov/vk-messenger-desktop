import '../../ui/AttachPoll/AttachPoll.css';
import cx from 'classnames';
import React, { useCallback, useEffect, useMemo, useRef, useState, } from 'react';
import { Button, Spinner } from '@vkontakte/vkui';
import { Icon16Done, Icon20CheckBoxOff, Icon20CheckBoxOn, Icon24MoreHorizontal, } from '@vkontakte/icons';
import { fromApiPoll } from '../../../data/converter/AttachConverter';
import * as Attach from '../../../core/model/Attach';
import * as Peer from '../../../core/model/Peer';
import { useInView } from 'react-intersection-observer';
import { debounce, noop, throttle } from '../../../core/utils/misc';
import { useBrowserEnv, useDispatch, useInsertIntoCache, useOwner, usePeers, usePixelDensity, } from '../../hooks/misc';
import { Link } from '../../ui/Link/Link';
import { ActionsMenu, ActionsMenuAction, } from '../../ui/ActionsMenu/ActionsMenu';
import { Dropdown } from '../../ui/Dropdown/Dropdown';
import { UsersStack } from '../../ui/UsersStack/UsersStack';
import { getExpectedAttachWidth } from '../../utils/misc';
import { useNow } from '../../hooks/useNow';
import { useApiFetch, useApiFetchSeq } from '../../hooks/useApiFetch';
export const AttachPoll = ({ poll: storedPoll, isCompact, forwardLevel = 0, peerId, cmid, channelId, postCmid, }) => {
    const { lang, router } = useBrowserEnv();
    const apiFetch = useApiFetch();
    const apiFetchSeq = useApiFetchSeq();
    const dispatch = useDispatch();
    const peers = usePeers();
    const now = useNow();
    const viewer = useOwner();
    const insertIntoCache = useInsertIntoCache();
    const isDense = usePixelDensity();
    const [selectedAnswers, setSelectedAnswers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [optimisticPoll, setOptimisticPoll] = useState(null);
    const poll = optimisticPoll || storedPoll;
    const [cancelVoteLoading, setCancelVoteLoading] = useState(false);
    const [updatePollLoading, setUpdatePollLoading] = useState(false);
    const isPollEnded = !!poll.endDate && poll.endDate <= now;
    const author = peers.get(poll.authorId);
    const groupId = Peer.isGroupPeerId(viewer.id)
        ? Peer.toRealId(viewer.id)
        : undefined;
    useEffect(() => {
        const requiredIds = [poll.authorId, ...poll.friends].filter((id) => !peers.has(id));
        if (!requiredIds.length) {
            return;
        }
        const userIds = requiredIds.filter((id) => Peer.isUserPeerId(id)).join(',');
        const groupIds = requiredIds
            .filter((id) => Peer.isGroupPeerId(id))
            .map((groupId) => Peer.toRealId(groupId))
            .join(',');
        async function fetchProfilesAndGroups() {
            const [profiles, groups] = await apiFetchSeq([
                userIds.length !== 0 && {
                    method: 'users.get',
                    params: { user_ids: userIds, extended: 1 },
                },
                groupIds.length !== 0 && {
                    method: 'groups.getById',
                    params: { group_ids: groupIds, extended: 1 },
                },
            ], { retries: 3 });
            insertIntoCache({
                profiles: profiles || [],
                groups: groups?.groups || [],
            });
        }
        // В useEffect нельзя передать асинхронную функцию
        fetchProfilesAndGroups().catch(noop);
        // Делаем загрузку недостающих пиров при первом рендере
        // или при обновлении опроса
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [poll]);
    const highestAnswerRate = useMemo(() => {
        return poll.answers.slice().sort((a, b) => b.rate - a.rate)[0]?.rate;
    }, [poll]);
    const pollInfo = useMemo(() => {
        const parts = [];
        const nonBreakingSpace = '\u00A0';
        if (poll.anonymous) {
            parts.push(lang.use('voting_anonymous_lowercase'));
        }
        else {
            parts.push(lang.use('voting_public_lowercase'));
        }
        if (poll.endDate && poll.endDate <= now) {
            parts.push(lang.use('voting_ended'));
        }
        else {
            if (!poll.canChangeVote) {
                parts.push(lang.use('voting_disabled_unvote_lowercase'));
            }
            if (poll.endDate) {
                parts.push(formatEndDate(poll.endDate, now, lang));
            }
        }
        return parts.map((part) => part.replace(/ /g, nonBreakingSpace)).join(' ⋅ ');
    }, [poll, now, lang]);
    const backgroundStyles = useMemo(() => {
        if (poll.backgroundPhoto) {
            return {
                backgroundColor: poll.backgroundPhoto.color,
            };
        }
        if (poll.backgroundGradient) {
            return {
                backgroundImage: Attach.generatePollBackgroundGradientStyle(poll.backgroundGradient),
            };
        }
        return undefined;
    }, [poll]);
    const updateMessage = useCallback(() => {
        /**
         * Note: эти действия нужны только пока не реализовано обновление
         * опросов в реалтайме через queue
         *
         * После голосования в опросе нужно обновить данные в объекте
         * опроса, но просто так это не получится сделать, потому что
         * вложение опроса может быть глубоко в сообщении
         *
         * Например, внутри записи на стене, которая находится внутри
         * пересланного сообщения
         *
         * Подобных кейсов может быть очень много, да и было бы неприятно
         * подменять вложение руками, поэтому мы просто получаем сообщение
         * через АПИ и подменяем его в истории сообщений
         */
        if (cmid) {
            dispatch({
                type: 'UserChangedMessageAttachment',
                peerId,
                cmid,
                groupId,
            });
        }
        else if (postCmid) {
            dispatch({
                type: 'UserChangedPostAttachment',
                channelId,
                cmid: postCmid,
            });
        }
    }, [cmid, postCmid, dispatch, peerId, groupId, channelId]);
    const performVote = useCallback(async (answerIds) => {
        setLoading(true);
        try {
            const [, apiPoll] = await apiFetchSeq([
                {
                    method: 'polls.addVote',
                    params: {
                        owner_id: poll.ownerId,
                        poll_id: poll.id,
                        answer_ids: answerIds.join(','),
                    },
                },
                {
                    method: 'polls.getById',
                    params: {
                        owner_id: poll.ownerId,
                        poll_id: poll.id,
                        extended: 0,
                    },
                },
            ]);
            setOptimisticPoll(fromApiPoll(apiPoll));
            setSelectedAnswers([]);
            updateMessage();
        }
        catch (err) { }
        setLoading(false);
    }, [apiFetchSeq, poll.ownerId, poll.id, updateMessage]);
    const cancelVote = useCallback(async () => {
        setCancelVoteLoading(true);
        try {
            const [, apiPoll] = await apiFetchSeq([
                {
                    method: 'polls.deleteVote',
                    params: {
                        owner_id: poll.ownerId,
                        poll_id: poll.id,
                    },
                },
                {
                    method: 'polls.getById',
                    params: {
                        owner_id: poll.ownerId,
                        poll_id: poll.id,
                        extended: 0,
                    },
                },
            ]);
            setOptimisticPoll(fromApiPoll(apiPoll));
            updateMessage();
        }
        catch (err) { }
        setCancelVoteLoading(false);
    }, [apiFetchSeq, poll.id, poll.ownerId, updateMessage]);
    const onAnswerClick = useCallback((answerId) => {
        if (!poll.canVote || loading) {
            return;
        }
        if (poll.multiple) {
            setSelectedAnswers((selectedAnswers) => {
                return selectedAnswers.includes(answerId)
                    ? selectedAnswers.filter((id) => id !== answerId)
                    : [...selectedAnswers, answerId];
            });
        }
        else {
            void performVote([answerId]);
        }
    }, [poll.canVote, poll.multiple, loading, performVote]);
    const updatePoll = useCallback(async () => {
        setUpdatePollLoading(true);
        try {
            const apiPoll = await apiFetch('polls.getById', {
                poll_id: poll.id,
                owner_id: poll.ownerId,
                extended: 0,
            });
            setOptimisticPoll(fromApiPoll(apiPoll));
            updateMessage();
        }
        catch { }
        setUpdatePollLoading(false);
    }, [apiFetch, poll.id, poll.ownerId, updateMessage]);
    const openPollModal = useCallback(() => {
        if (poll.voted) {
            router.push({
                kind: 'PollModal',
                ownerId: poll.ownerId,
                pollId: poll.id,
            });
        }
    }, [poll.id, poll.ownerId, poll.voted, router]);
    const ref = useAttachPollShortPolling(updatePoll);
    return (React.createElement("div", { className: cx('AttachPoll MEAppThemeStylesContrastDisable', {
            'AttachPoll--canVote': poll.canVote,
            'AttachPoll--voted': poll.voted,
            'AttachPoll--customBackground': poll.backgroundPhoto || poll.backgroundGradient,
            'AttachPoll--hasPhoto': poll.backgroundPhoto,
        }), style: backgroundStyles, onClick: openPollModal, ref: ref },
        React.createElement("div", { className: "AttachPoll__header" },
            poll.backgroundPhoto && (React.createElement("div", { className: "AttachPoll__headerPhoto" },
                React.createElement("div", { className: "AttachPoll__headerPhotoGradient", style: {
                        background: poll.backgroundPhoto &&
                            `linear-gradient(0, ${poll.backgroundPhoto.color} 0, ${poll.backgroundPhoto.color}00 50%)`,
                    } }),
                React.createElement("img", { className: "AttachPoll__headerPhotoImage", src: Attach.preview(poll.backgroundPhoto, getExpectedAttachWidth(isDense, !!isCompact, forwardLevel, 232)[1])?.url || '', alt: "" }))),
            (poll.voted || isPollEnded) && (React.createElement(Dropdown, { classNames: { wrapper: 'AttachPoll__moreWrapper' }, align: "right", position: "bottom", forceUpdateContent: true, adaptive: true, hideOnClick: true, content: React.createElement(ActionsMenu, null,
                    poll.canChangeVote && !isPollEnded && (React.createElement(ActionsMenuAction, { title: React.createElement("span", { className: cx(cancelVoteLoading && 'AttachPoll__action--loading') },
                            cancelVoteLoading && (React.createElement(Spinner, { size: "s", className: "AttachPoll__actionSpinner" })),
                            lang.use('voting_revote')), onClick: cancelVote })),
                    React.createElement(ActionsMenuAction, { title: React.createElement("span", { className: cx(updatePollLoading && 'AttachPoll__action--loading') },
                            updatePollLoading && (React.createElement(Spinner, { size: "s", className: "AttachPoll__actionSpinner" })),
                            lang.use('me_voting_update_poll')), onClick: updatePoll })) },
                React.createElement(Icon24MoreHorizontal, { className: "AttachPoll__more" }))),
            React.createElement("div", { className: "AttachPoll__title" }, poll.title),
            React.createElement(Link, { to: {
                    kind: 'PeerPanel',
                    peerId: poll.authorId,
                    screenName: author && Peer.screenName(author),
                }, className: "AttachPoll__author" }, author ? Peer.name(author) : '...'),
            React.createElement("div", { className: "AttachPoll__info" }, pollInfo)),
        React.createElement("div", { className: "AttachPoll__answers" }, poll.answers.map((answer) => (React.createElement(PollAnswer, { key: answer.id, poll: poll, answer: answer, highestAnswerRate: highestAnswerRate, isSelectedToVote: selectedAnswers.includes(answer.id), now: now, onClick: onAnswerClick })))),
        React.createElement(PollFooterContent, { poll: poll, isCompact: isCompact, selectedAnswers: selectedAnswers, performVote: performVote, loading: loading, peers: peers, lang: lang }),
        React.createElement("div", { className: "AttachPoll__fade" }),
        React.createElement("div", { className: "AttachPoll__widthFiller" })));
};
function formatEndDate(endDate, now, lang) {
    const diffSecs = Math.floor((endDate - now) / 1000);
    switch (true) {
        case diffSecs < 60: {
            return lang.use('voting_time_until_less_minute');
        }
        case diffSecs < 60 * 60: {
            const mins = Math.floor(diffSecs / 60);
            return lang
                .use('voting_time_until_N_minutes', { num: mins })
                .toLowerCase();
        }
        case diffSecs < 60 * 60 * 6: {
            const hours = Math.floor(diffSecs / 60 / 60);
            return lang.use('voting_time_until_N_hours', { num: hours }).toLowerCase();
        }
        /**
         * Опрос можно отложить максимум на 1 месяц, поэтому вариант с
         * окончанием в следующем году излишен.
         */
        default: {
            return lang.use('voting_time_until', {
                now,
                date: endDate,
            });
        }
    }
}
const PollAnswer = ({ poll, answer, highestAnswerRate, isSelectedToVote, now, onClick, }) => {
    if (!poll.voted && (!poll.endDate || poll.endDate > now)) {
        const checkbox = isSelectedToVote ? (React.createElement(Icon20CheckBoxOn, { className: "AttachPoll__answerCheckbox AttachPoll__answerCheckbox--on" })) : (React.createElement(Icon20CheckBoxOff, { className: "AttachPoll__answerCheckbox AttachPoll__answerCheckbox--off" }));
        const onAnswerClick = (event) => {
            event.stopPropagation();
            onClick(answer.id);
        };
        return (React.createElement("div", { className: cx('AttachPoll__answer', {
                'AttachPoll__answer--selected': isSelectedToVote,
            }), onClick: onAnswerClick },
            React.createElement("div", { className: "AttachPoll__answerBar" }),
            React.createElement("div", { className: "AttachPoll__answerContent" },
                answer.text,
                React.createElement("div", { className: "AttachPoll__answerRight" }, poll.multiple && checkbox))));
    }
    const answerRatePercent = (answer.rate / 100).toFixed(2);
    return (React.createElement("div", { className: "AttachPoll__answer AttachPoll__answer--voted" },
        React.createElement("div", { className: cx('AttachPoll__answerBar', {
                'AttachPoll__answerBar--leader': answer.rate === highestAnswerRate,
            }), style: {
                transform: `scaleX(${answerRatePercent})`,
                /**
                 * scaleX аффектит не только ширину, но и скругления.
                 *
                 * Чтобы скругление в R пикселей при scaleX(N) не менялось,
                 * нужно указать
                 * border-radius: calc(R / N) / R;
                 * где '/' после calc() позволяет указать разные скругления
                 * для обеих сторон угла.
                 *
                 * Подробнее:
                 * https://css-tricks.com/various-methods-for-expanding-a-box-while-preserving-the-border-radius/#aa-changing-scale
                 */
                borderRadius: `calc(var(--pollAnswerBorderRadius) / ${answerRatePercent}) / var(--pollAnswerBorderRadius)`,
            } }),
        React.createElement("div", { className: "AttachPoll__answerContent" },
            React.createElement("span", null,
                answer.text,
                answer.votes !== 0 && (React.createElement("span", { className: "AttachPoll__answerVotes" },
                    ' ⋅ ',
                    answer.votes))),
            React.createElement("div", { className: "AttachPoll__answerRight" },
                answer.selected && (React.createElement(Icon16Done, { className: "AttachPoll__answerVotedIcon" })),
                answer.rate,
                "%"))));
};
const PollFooterContent = ({ poll, isCompact, selectedAnswers, performVote, loading, peers, lang, }) => {
    const votedFriendsPhotos = useMemo(() => {
        return poll.friends
            .map((userId) => peers.get(userId)?.photo)
            .filter((photo) => photo !== undefined);
    }, [poll, peers]);
    const hasCustomBackground = !!poll.backgroundPhoto || !!poll.backgroundGradient;
    const hasSelectedAnswers = selectedAnswers.length !== 0;
    const withUsersStack = !hasSelectedAnswers &&
        !loading &&
        !isCompact &&
        votedFriendsPhotos.length !== 0;
    const onVoteClick = (event) => {
        event.stopPropagation();
        performVote(selectedAnswers);
    };
    return (React.createElement("div", { className: "AttachPoll__footer" },
        React.createElement("div", { className: cx('AttachPoll__votedUsersInfo', {
                'AttachPoll__votedUsersInfo--hidden': loading || hasSelectedAnswers,
            }) },
            withUsersStack && (React.createElement(UsersStack, { count: poll.friends.length, photos: votedFriendsPhotos, className: "AttachPoll__usersStack" })),
            !!poll.votes && lang.use('voting_N_voted', { num: poll.votes }),
            !poll.votes &&
                poll.canVote &&
                lang.use('voting_vote_first_gender', { sex: 'unknown' }),
            !poll.votes && !poll.canVote && lang.use('voting_nobody_voted')),
        hasSelectedAnswers && !loading && (React.createElement(Button, { mode: hasCustomBackground ? 'secondary' : 'primary', appearance: hasCustomBackground ? 'overlay' : 'accent', size: "s", onClick: onVoteClick, className: "AttachPoll__voteButton" }, lang.use('voting_vote'))),
        loading && React.createElement(Spinner, { className: "AttachPoll__spinner" })));
};
const useAttachPollShortPolling = (onUpdate) => {
    const { ref, inView } = useInView();
    const MIN_TIME_IN_VIEW = 2000;
    const EXPIRATION_TIME_IN_VIEW = 60000;
    const onUpdateRef = useRef(onUpdate);
    onUpdateRef.current = onUpdate;
    const inViewRef = useRef(inView);
    inViewRef.current = inView;
    const intervalRef = useRef(null);
    const { idle } = useBrowserEnv();
    const idleRef = useRef(idle);
    idleRef.current = idle;
    const stopPollByInterval = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
    };
    const onInView = useMemo(() => {
        const startPollByInterval = () => {
            stopPollByInterval();
            intervalRef.current = window.setInterval(() => {
                if (idleRef.current.isIdle()) {
                    return;
                }
                onUpdateRef.current();
            }, EXPIRATION_TIME_IN_VIEW);
        };
        const throttled = throttle(() => {
            onUpdateRef.current();
            startPollByInterval();
        }, EXPIRATION_TIME_IN_VIEW);
        return debounce(() => {
            if (!inViewRef.current) {
                return;
            }
            throttled();
        }, MIN_TIME_IN_VIEW, false);
    }, []);
    const onInViewRef = useRef(onInView);
    onInViewRef.current = onInView;
    useEffect(() => {
        if (inView) {
            onInViewRef.current();
        }
        return () => {
            onInViewRef.current.cancel();
            stopPollByInterval();
        };
    }, [inView]);
    return ref;
};
//# sourceMappingURL=AttachPoll.js.map