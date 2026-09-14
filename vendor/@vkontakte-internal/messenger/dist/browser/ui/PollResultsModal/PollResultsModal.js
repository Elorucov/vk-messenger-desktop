import '../../ui/PollResultsModal/PollResultsModal.css';
import React, { useCallback, useEffect, useMemo, useState, } from 'react';
import cx from 'classnames';
import * as Peer from '../../../core/model/Peer';
import { useApiFetch } from '../../hooks/useApiFetch';
import { ModalView } from '../../ui/ModalView/ModalView';
import { ModalBackdrop } from '../../ui/ModalBackdrop/ModalBackdrop';
import { Spinner } from '@vkontakte/vkui';
import { fromApiPoll } from '../../../data/converter/AttachConverter';
import { isDev } from '../../../core/utils/misc';
import { useBrowserEnv } from '../../hooks/misc';
import { ModalInterface } from '../../ui/ModalInterface/ModalInterface';
import { Icon16Done, Icon20GlobeCrossOutline } from '@vkontakte/icons';
import InfiniteLoader from 'react-window-infinite-loader';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList as VirtualList } from 'react-window';
import { OptimizedSpinner } from '../../ui/OptimizedSpinner/OptimizedSpinner';
import { Link } from '../../ui/Link/Link';
import { UsersStack } from '../../ui/UsersStack/UsersStack';
import { useSnackbar } from '../../hooks/useSnackbar';
import { fromApiPollVoter } from '../../../data/converter/PollVoterConverter';
import { BasicAvatar } from '../../ui/BasicAvatar/BasicAvatar';
const VOTERS_FIELDS = 'photo_50,photo_100';
export const PollResultsModal = ({ pollRoute, }) => {
    const { router } = useBrowserEnv();
    const { lang } = useBrowserEnv();
    const apiFetch = useApiFetch();
    const snackbar = useSnackbar();
    const [poll, setPoll] = useState();
    const [voters, setVoters] = useState(new Map());
    const [selectedAnswerId, setSelectedAnswerId] = useState(undefined);
    const closeModal = useCallback(() => router.pop(), [router]);
    const closeVoters = useCallback(() => {
        setSelectedAnswerId(undefined);
    }, []);
    const loadPollAndVoters = useCallback(async () => {
        let apiPoll;
        try {
            apiPoll = await apiFetch('polls.getById', {
                poll_id: pollRoute.pollId,
                owner_id: pollRoute.ownerId,
                extended: 0,
            });
        }
        catch (err) {
            if (isDev) {
                throw err;
            }
            snackbar({
                message: lang.use('me_poll_results_error_loading'),
                before: (React.createElement(Icon20GlobeCrossOutline, { fill: "var(--vkui--color_icon_negative)" })),
            });
            return closeModal();
        }
        let apiVoters = undefined;
        try {
            apiVoters = await apiFetch('polls.getVoters', {
                poll_id: pollRoute.pollId,
                owner_id: pollRoute.ownerId,
                count: 3,
                fields: VOTERS_FIELDS,
                answer_ids: apiPoll.answers.map((answer) => answer.id).join(','),
            });
        }
        catch (err) { }
        setPoll(fromApiPoll(apiPoll));
        if (apiVoters) {
            setVoters(apiVoters.reduce((acc, apiVote) => {
                if (!apiVote.answer_id || !apiVote.users?.items) {
                    return acc;
                }
                acc.set(apiVote.answer_id, apiVote.users.items.map(fromApiPollVoter));
                return acc;
            }, new Map()));
        }
    }, [
        apiFetch,
        closeModal,
        lang,
        pollRoute.ownerId,
        pollRoute.pollId,
        snackbar,
    ]);
    useEffect(() => {
        void loadPollAndVoters();
    }, [loadPollAndVoters]);
    const loadMoreVoters = useCallback(async () => {
        if (!poll || !selectedAnswerId) {
            return;
        }
        const offset = voters.get(selectedAnswerId)?.length;
        if (offset === undefined) {
            return;
        }
        try {
            const apiVoters = await apiFetch('polls.getVoters', {
                poll_id: poll.id,
                owner_id: poll.ownerId,
                count: 30,
                fields: VOTERS_FIELDS,
                answer_ids: `${selectedAnswerId}`,
                offset,
            });
            // Обновляем список проголосовавших пользователей
            setVoters((prev) => {
                prev.set(selectedAnswerId, [
                    ...(prev.get(selectedAnswerId) || []),
                    ...(apiVoters[0]?.users?.items?.map(fromApiPollVoter) || []),
                ]);
                return new Map(prev);
            });
            // Обновляем кол-во проголосовавших пользователей
            setPoll((prev) => prev && {
                ...prev,
                answers: prev.answers.map((answer) => answer.id !== selectedAnswerId
                    ? answer
                    : { ...answer, votes: apiVoters[0]?.users?.count || 0 }),
            });
        }
        catch (err) { }
    }, [apiFetch, poll, selectedAnswerId, voters]);
    if (!poll) {
        return (React.createElement(ModalView, { onEscape: closeModal },
            React.createElement(ModalBackdrop, { onClick: closeModal },
                React.createElement(Spinner, null))));
    }
    const votersList = selectedAnswerId !== undefined ? voters.get(selectedAnswerId) : undefined;
    const selectedAnswer = poll.answers.find((answer) => answer.id === selectedAnswerId);
    if (votersList !== undefined && selectedAnswer !== undefined) {
        return (React.createElement(ModalInterface, { backLabel: lang.use('me_back'), onBack: closeVoters, closeLabel: lang.use('me_close'), onClose: closeModal, contextClass: "MEAppConfig", title: `${selectedAnswer.text} (${selectedAnswer.votes})`, panelClass: "PollResultsModal__votersList", withCustomLayout: true },
            React.createElement(VotersList, { hasMore: votersList.length !== selectedAnswer.votes, onLoadMore: loadMoreVoters, voters: votersList })));
    }
    return (React.createElement(ModalInterface, { closeLabel: lang.use('me_close'), onClose: closeModal, contextClass: "MEAppConfig", title: poll.title, panelClass: "PollResultsModal", withCustomLayout: true },
        React.createElement("div", { className: "PollResultsModal__wrapper" }, poll.answers.map((answer) => (React.createElement(PollResultsAnswer, { key: answer.id, voters: voters.get(answer.id) || [], answer: answer, onClick: () => {
                if (answer.votes) {
                    setSelectedAnswerId(answer.id);
                }
            } }))))));
};
const PollResultsAnswer = ({ answer, voters, onClick }) => {
    const { lang } = useBrowserEnv();
    const photos = useMemo(() => voters.map((voter) => voter.photo).filter((photo) => photo !== undefined), [voters]);
    return (React.createElement("div", { className: cx('PollResultsAnswer', {
            'PollResultsAnswer--voted': answer.selected,
        }), onClick: onClick },
        React.createElement("div", { className: "PollResultsAnswer__header" },
            React.createElement("span", { className: "PollResultsAnswer__answerText" }, answer.text),
            React.createElement("div", { className: "PollResultsAnswer__votePercent" },
                answer.selected && (React.createElement(Icon16Done, { className: "PollResultsAnswer__votedIcon" })),
                answer.rate,
                "%")),
        React.createElement("div", { className: "PollResultsAnswer__bar" },
            React.createElement("div", { className: "PollResultsAnswer__barInner", style: {
                    transform: `scaleX(${answer.rate / 100})`,
                    borderRadius: `calc(var(--pollResultsAnswerBarBorderRadius) / ${answer.rate / 100}) / var(--pollResultsAnswerBarBorderRadius)`,
                } })),
        React.createElement("div", { className: "PollResultsAnswer__footer" },
            React.createElement(UsersStack, { count: answer.votes, photos: photos }),
            React.createElement("span", { className: "PollResultsAnswer__footerCount" }, lang.use('me_n_votes', {
                num: answer.votes,
                formatted: 'short',
            })))));
};
const ROW_HEIGHT = 56;
const OVERSCAN_COUNT = 5;
const VotersList = ({ voters, hasMore, onLoadMore, }) => {
    const isItemLoaded = useCallback((index) => !!voters[index], [voters]);
    const itemsCount = hasMore ? voters.length + 1 : voters.length;
    return (React.createElement("div", { className: "VotersList" },
        React.createElement(AutoSizer, null, (size) => (React.createElement(InfiniteLoader, { isItemLoaded: isItemLoaded, itemCount: itemsCount, loadMoreItems: onLoadMore }, ({ onItemsRendered, ref }) => (React.createElement(VirtualList, { ref: ref, className: "VotersList__list", onItemsRendered: onItemsRendered, height: size.height || 0, width: size.width || 0, innerElementType: "ul", itemData: {
                voters,
            }, itemCount: itemsCount, itemSize: ROW_HEIGHT, overscanCount: OVERSCAN_COUNT }, RowRenderer)))))));
};
const RowRenderer = React.memo(({ index, style, data: { voters } }) => {
    if (index === voters.length) {
        return (React.createElement("li", { style: style },
            React.createElement(OptimizedSpinner, { className: "VotersList__loader" })));
    }
    const voter = voters[index];
    if (!voter) {
        // Невозможный сценарий
        return null;
    }
    return (React.createElement(Link, { key: voter.id, className: "VotersList__rowItem", style: style, to: {
            kind: 'PeerPanel',
            peerId: Peer.resolveId(voter.id),
            screenName: voter.screenName,
        } },
        React.createElement(BasicAvatar, { size: 40, content: `${voter.firstName} ${voter.lastName}`, picture: voter.photo }),
        React.createElement("span", { className: "VotersList__rowItemTitle" },
            voter.firstName,
            " ",
            voter.lastName)));
});
//# sourceMappingURL=PollResultsModal.js.map