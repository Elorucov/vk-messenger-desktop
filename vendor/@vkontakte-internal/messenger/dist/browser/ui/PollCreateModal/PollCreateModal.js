import '../../ui/PollCreateModal/PollCreateModal.css';
import { useApiFetch } from '../../hooks/useApiFetch';
import React, { useCallback, useEffect, useMemo, useRef, useState, } from 'react';
import { Icon20RadioOff, Icon20RadioOn, Icon24AddOutline, Icon24Cancel, Icon24DotsVertical, } from '@vkontakte/icons';
import { Button, CellButton, Checkbox, DateInput, FormItem, Group, Input, Spinner, Subhead, Touch, useAdaptivityWithJSMediaQueries, } from '@vkontakte/vkui';
import cx from 'classnames';
import { useBrowserEnv, useOwner, usePrevious } from '../../hooks/misc';
import { HorizontalScroll } from '../../ui/HorizontalScroll/HorizontalScroll';
import { ModalInterface } from '../../ui/ModalInterface/ModalInterface';
import * as Attach from '../../../core/model/Attach';
import { fromApiPoll, fromApiPollBackgroundGradient, } from '../../../data/converter/AttachConverter';
import { SortableList, useSortable } from '../../ui/ReorderList/ReorderList';
import { onElementKeyDownFactory } from '../../utils/elementKeyDown';
import { Time } from '../../../core/utils/time';
const POLL_TITLE_LETTERS_LIMIT = 80;
const MAX_ANSWERS_COUNT = 10;
const ONE_MONTH = 1000 * 60 * 60 * 24 * 30;
const defaultBackground = {
    id: -1,
    angle: 0,
    points: [
        'var(--vkui--color_background_modal)',
        'var(--vkui--color_background_modal)',
    ],
};
export const PollCreateModal = ({ onClose, onCreate, onError, pollDraft, }) => {
    const { lang } = useBrowserEnv();
    const apiFetch = useApiFetch();
    const owner = useOwner();
    const lastIdRef = useRef(0);
    const getNextId = () => --lastIdRef.current;
    const [title, setTitle] = useState(pollDraft?.title || '');
    const isPollEditing = !!pollDraft;
    const [answers, setAnswers] = useState(() => {
        if (isPollEditing) {
            return pollDraft.answers.map(({ id, text }) => ({ id, text }));
        }
        return [
            { id: getNextId(), text: '' },
            { id: getNextId(), text: '' },
        ];
    });
    const answersOrder = useMemo(() => answers.map((answer) => answer.id), [answers]);
    const [currentBackground, setCurrentBackground] = useState(pollDraft?.backgroundGradient?.id || defaultBackground.id);
    const [pollBackgrounds, setPollBackgrounds] = useState(() => [defaultBackground]);
    const [isLoadBackgroundsFailed, setLoadBackgroundsFailed] = useState(false);
    const [pollSettings, setPollSettings] = useState(() => {
        if (isPollEditing) {
            return {
                anonymous: pollDraft.anonymous,
                multiple: pollDraft.multiple,
                disableUnvote: !pollDraft.canChangeVote,
                hasEndDate: !!pollDraft.endDate,
            };
        }
        return {
            anonymous: false,
            multiple: false,
            disableUnvote: false,
            hasEndDate: false,
        };
    });
    const [endDate, setEndDate] = useState(() => {
        // Текущее время + 1 час
        const possibleEndDate = new Date().getTime() + Time.Hour;
        return pollDraft?.endDate || possibleEndDate;
    });
    const [isLoading, setLoading] = useState(false);
    const isInvalidForm = !title.trim() || answers.every(({ text }) => !text);
    const answersRefs = useRef({});
    const titleRef = useRef(null);
    useEffect(() => {
        titleRef.current?.focus();
    }, []);
    const loadBackgrounds = useCallback(() => {
        apiFetch('polls.getBackgrounds', {})
            .then((backgrounds) => {
            setPollBackgrounds([
                defaultBackground,
                ...backgrounds
                    .map(fromApiPollBackgroundGradient)
                    .filter((item) => item !== undefined),
            ]);
        })
            .catch(() => setLoadBackgroundsFailed(true));
    }, [apiFetch]);
    useEffect(() => {
        loadBackgrounds();
    }, [loadBackgrounds]);
    const onSave = async () => {
        setLoading(true);
        const nonEmptyAnswers = answers.filter(({ text }) => text);
        const backgroundId = currentBackground > 0 ? currentBackground : undefined;
        if (isPollEditing) {
            const { addAnswers, editAnswers, deleteAnswers } = getAnswersDiff(pollDraft.answers, nonEmptyAnswers);
            const actualEndDate = pollSettings.hasEndDate
                ? Math.floor(fitEndDateToAcceptable(endDate) / 1000)
                : 0;
            try {
                await apiFetch('polls.edit', {
                    owner_id: pollDraft.ownerId,
                    poll_id: pollDraft.id,
                    question: title,
                    add_answers: JSON.stringify(addAnswers),
                    edit_answers: JSON.stringify(editAnswers),
                    delete_answers: JSON.stringify(deleteAnswers),
                    end_date: actualEndDate,
                    // @ts-expect-error см. причину в polls.create чуть ниже
                    background_id: backgroundId,
                }, { retries: 3 });
            }
            catch {
                setLoading(false);
                onError('me_poll_edit_error');
                return;
            }
            try {
                const apiPoll = await apiFetch('polls.getById', {
                    owner_id: pollDraft.ownerId,
                    poll_id: pollDraft.id,
                    extended: 0,
                }, { retries: 3 });
                onCreate(fromApiPoll(apiPoll));
            }
            catch {
                /**
                 * Сохраняем старый драфт опроса, так как не получилось получить новый.
                 * На время отправки сообщения отобразится опрос в старом состоянии,
                 * но после того, как сообщение отправится, опрос сразу же обновится
                 */
                onCreate(pollDraft);
            }
            setLoading(false);
            onClose();
        }
        else {
            try {
                const actualEndDate = pollSettings.hasEndDate
                    ? Math.floor(fitEndDateToAcceptable(endDate) / 1000)
                    : undefined;
                const apiPoll = await apiFetch('polls.create', {
                    question: title,
                    add_answers: JSON.stringify(nonEmptyAnswers.map(({ text }) => text)),
                    /**
                     * polls.getBackgrounds возвращает список фонов с типом id: number,
                     * а этот метод требует определенное число из списка: 1 | 2 | ...
                     *
                     * Все безопасно, потому что мы сюда возвращаем ровно тот же айдишник,
                     * который получили из polls.getBackgrounds
                     */
                    // @ts-expect-error
                    background_id: backgroundId,
                    is_anonymous: pollSettings.anonymous ? 1 : 0,
                    is_multiple: pollSettings.multiple ? 1 : 0,
                    disable_unvote: pollSettings.disableUnvote ? 1 : 0,
                    end_date: actualEndDate,
                    owner_id: owner.id,
                });
                setLoading(false);
                onCreate(fromApiPoll(apiPoll));
                onClose();
            }
            catch (err) {
                setLoading(false);
                onError('me_poll_create_error');
                return;
            }
        }
    };
    const updateAnswerText = useCallback((text, answerId) => {
        setAnswers((prevAnswers) => {
            return prevAnswers.map((answer) => {
                if (answer.id === answerId) {
                    return {
                        id: answer.id,
                        text,
                    };
                }
                return answer;
            });
        });
    }, []);
    const removeAnswer = useCallback((answerId) => {
        setAnswers((answers) => {
            // Если остался единственный вариант, то просто опустошаем его
            if (answers.length === 1) {
                return [{ id: getNextId(), text: '' }];
            }
            const answerIndex = answers.findIndex(({ id }) => id === answerId);
            if (answerIndex !== -1) {
                const newAnswers = answers.slice();
                newAnswers.splice(answerIndex, 1);
                return newAnswers;
            }
            return answers;
        });
    }, []);
    const addAnswer = useCallback(() => {
        setAnswers((prevAnswers) => {
            if (prevAnswers.length === MAX_ANSWERS_COUNT) {
                return prevAnswers;
            }
            return [...prevAnswers, { id: getNextId(), text: '' }];
        });
    }, []);
    /**
     * Автоматическая фокусировка на созданный через addAnswer вариант ответа
     */
    const previousAnswers = usePrevious(answers);
    useEffect(() => {
        // Был добавлен новый вариант ответа в конец (т.е. вызван addAnswer)
        if (previousAnswers && answers.length > previousAnswers.length) {
            const answerRef = answersRefs.current[answers.length - 1];
            answerRef?.focus();
        }
    }, [previousAnswers, answers]);
    const onAnswerKeyDown = useCallback((event, answerIndex) => onElementKeyDownFactory((keyCombo, event) => {
        if (!keyCombo || !['ArrowUp', 'ArrowDown'].includes(keyCombo)) {
            return;
        }
        event.stopPropagation();
        const answerIndexToFocus = keyCombo === 'ArrowUp' ? answerIndex - 1 : answerIndex + 1;
        // Значит был ArrowUp на первом варианте ответа
        if (answerIndexToFocus === -1) {
            titleRef.current?.focus();
            return;
        }
        const answerRef = answersRefs.current[answerIndexToFocus];
        if (answerRef) {
            answerRef.focus();
        }
        else {
            addAnswer();
        }
    })(event), [addAnswer]);
    const onOrderChange = useCallback((answerIds) => {
        setAnswers((prevAnswers) => {
            return answerIds.reduce((newAnswers, id) => {
                const answer = prevAnswers.find((answer) => answer.id === id);
                if (answer) {
                    newAnswers.push(answer);
                }
                return newAnswers;
            }, []);
        });
    }, []);
    const toggleSetting = useCallback((key) => {
        setPollSettings((prevSettings) => ({
            ...prevSettings,
            [key]: !prevSettings[key],
        }));
    }, []);
    return (React.createElement(ModalInterface, { title: isPollEditing
            ? lang.use('voting_editing')
            : lang.use('me_voting_create_poll_title'), onClose: onClose, closeLabel: lang.use('me_close'), contextClass: "MEConfig", withCustomLayout: true, panelClass: "PollCreateModal__wrapper", buttons: React.createElement(Button, { disabled: isInvalidForm, onClick: onSave, loading: isLoading }, lang.use('me_save')) },
        React.createElement("form", { onSubmit: (e) => {
                // Не даем странице перегружаться.
                e.preventDefault();
                if (isInvalidForm || isLoading) {
                    return;
                }
                onSave();
            } },
            React.createElement(Group, { mode: "plain" },
                React.createElement(FormItem, { top: React.createElement(FormItem.Top, null,
                        React.createElement(FormItem.TopLabel, { Component: "h5" },
                            React.createElement("span", { className: "PollCreateModal__titleSubhead" },
                                React.createElement("span", null, lang.use('voting_topic')),
                                React.createElement("span", null,
                                    title.length,
                                    " / ",
                                    POLL_TITLE_LETTERS_LIMIT)))) },
                    React.createElement(Input, { value: title, onChange: (event) => setTitle(event.target.value.slice(0, POLL_TITLE_LETTERS_LIMIT)), onKeyDown: onElementKeyDownFactory((keyCombo, event) => {
                            if (keyCombo === 'Enter' || keyCombo === 'ArrowDown') {
                                event.stopPropagation();
                                const firstAnswerRef = answersRefs.current[0];
                                firstAnswerRef?.focus();
                            }
                        }), getRef: titleRef }))),
            React.createElement(Group, { mode: "plain", header: React.createElement(Subhead, { className: "PollCreateModal__groupSubhead" }, lang.use('voting_variants')) },
                React.createElement(SortableList, { items: answersOrder, onChange: onOrderChange }, answers.map((answer) => (React.createElement(AnswerItem, { key: answer.id, answer: answer, refs: answersRefs, onTextChange: updateAnswerText, onKeyDown: onAnswerKeyDown, onRemove: removeAnswer })))),
                React.createElement(CellButton, { before: React.createElement(Icon24AddOutline, { style: { marginRight: 8 } }), disabled: answers.length === MAX_ANSWERS_COUNT, onClick: addAnswer }, lang.use('voting_variants_add'))),
            React.createElement(Group, { mode: "plain", header: React.createElement(Subhead, { className: "PollCreateModal__groupSubhead" }, lang.use('voting_selector_background')) },
                React.createElement(HorizontalScroll, { arrowScrollStep: 120, showArrows: true, arrowSize: "s" },
                    React.createElement("div", { className: "PollCreateModal__pollBackgrounds" },
                        pollBackgrounds.map((background) => (React.createElement("div", { className: "PollCreateModal__pollBackground", key: background.id, onClick: () => setCurrentBackground(background.id) },
                            React.createElement(PollBackgroundDemo, { background: background }),
                            background.id === currentBackground ? (React.createElement(Icon20RadioOn, { fill: "var(--vkui--color_icon_accent)" })) : (React.createElement(Icon20RadioOff, { fill: "var(--vkui--color_icon_secondary)" }))))),
                        pollBackgrounds.length === 1 && !isLoadBackgroundsFailed && (React.createElement(Spinner, null)),
                        isLoadBackgroundsFailed && (React.createElement(Button, { mode: "secondary", onClick: () => {
                                setLoadBackgroundsFailed(false);
                                loadBackgrounds();
                            } }, lang.use('me_voting_retry_backgrounds_loading')))))),
            React.createElement(Group, { mode: "plain", header: React.createElement(Subhead, { className: "PollCreateModal__groupSubhead" }, lang.use('voting_settings')) },
                React.createElement(Checkbox, { checked: pollSettings.anonymous, onChange: () => toggleSetting('anonymous'), disabled: isPollEditing }, lang.use('voting_anonymous')),
                React.createElement(Checkbox, { checked: pollSettings.multiple, onChange: () => toggleSetting('multiple'), disabled: isPollEditing }, lang.use('voting_multiple')),
                React.createElement(Checkbox, { checked: pollSettings.disableUnvote, onChange: () => toggleSetting('disableUnvote'), disabled: isPollEditing }, lang.use('voting_settings_disable_unvote')),
                React.createElement(Checkbox, { checked: pollSettings.hasEndDate, onChange: () => toggleSetting('hasEndDate') }, lang.use('me_voting_limited_time')),
                pollSettings.hasEndDate && (React.createElement(DateInput, { className: "PollCreateModal__dateInput", enableTime: true, disablePast: true, closeOnChange: true, disablePickers: true, showNeighboringMonth: true, value: new Date(endDate), onChange: (value) => setEndDate(fitEndDateToAcceptable(value ? value.getTime() : 0)), shouldDisableDate: limitDateByOneMonth }))))));
};
const AnswerItem = ({ answer, refs, onTextChange, onKeyDown, onRemove, }) => {
    const { hasPointer } = useAdaptivityWithJSMediaQueries();
    const { index, attrs, styles, onStart, onMove, onEnd, setNodeRef } = useSortable({
        id: answer.id,
    });
    return (React.createElement("div", { ref: setNodeRef, style: styles, ...attrs, onKeyDown: (event) => onKeyDown(event, index), className: "PollCreateModal__answer" },
        React.createElement(Touch, { Component: "button", onStart: onStart, onEnd: onEnd, onMove: onMove, className: cx('PollCreateModal__answerDragButton', {
                PollCreateModal__answerTapDragButton: !hasPointer,
            }) },
            React.createElement(Icon24DotsVertical, null),
            !hasPointer && (React.createElement("div", { className: "PollCreateModal__answerTapDragButtonArea" }))),
        React.createElement(Input, { className: "PollCreateModal__answerInput", value: answer.text, onChange: (event) => onTextChange(event.target.value, answer.id), getRef: (ref) => {
                if (ref) {
                    refs.current[index] = ref;
                }
                else {
                    delete refs.current[index];
                }
            } }),
        React.createElement("button", { className: "PollCreateModal__answerRemoveButton", onClick: () => onRemove(answer.id) },
            React.createElement(Icon24Cancel, null))));
};
export function getAnswersDiff(prevAnswers, newAnswers) {
    const addAnswers = [];
    const editAnswers = {};
    const deleteAnswers = [];
    let outOfSequenceStartIndex = null;
    /**
     * Обрабатываем неперенесенные варианты ответа относительно оригинала опроса
     *
     * Если наткнемся на созданный вариант ответа или обнаружим, что
     * раньше на текущем месте был другой вариант ответа, то выходим из цикла
     */
    for (let index = 0; index < newAnswers.length; index++) {
        const answer = newAnswers[index];
        if (!answer) {
            break;
        }
        const isAnswerFromServer = answer.id > 0;
        if (isAnswerFromServer) {
            const initialAnswer = prevAnswers[index];
            if (!initialAnswer || initialAnswer.id !== answer.id) {
                outOfSequenceStartIndex = index;
                break;
            }
            if (answer.text !== initialAnswer.text) {
                editAnswers[answer.id] = answer.text;
            }
        }
        else {
            outOfSequenceStartIndex = index;
            break;
        }
    }
    if (outOfSequenceStartIndex !== null) {
        /**
         * Возникла одна (или несколько) из ситуаций:
         * - варианты ответов поменяны местами
         * - варианты ответов между другими вариантами удалены
         * - были добавлены новые варианты ответов
         *
         * Удаляем уже существующие варианты ответа (если есть) и создаем новые
         */
        for (const answer of newAnswers.slice(outOfSequenceStartIndex)) {
            const isAnswerFromServer = answer.id > 0;
            if (isAnswerFromServer) {
                deleteAnswers.push(answer.id);
            }
            addAnswers.push(answer.text);
        }
    }
    /**
     * Находим удаленные варианты ответа
     */
    for (let i = outOfSequenceStartIndex || 0; i < prevAnswers.length; i++) {
        const answer = prevAnswers[i];
        if (!answer) {
            continue;
        }
        if (!(answer.id in editAnswers) &&
            !deleteAnswers.includes(answer.id) &&
            !newAnswers.some(({ id }) => id === answer.id)) {
            deleteAnswers.push(answer.id);
        }
    }
    return {
        addAnswers,
        editAnswers,
        deleteAnswers,
    };
}
function fitEndDateToAcceptable(endDate) {
    // Дата окончания не может быть раньше, чем сейчас.
    // Прибавляем 5 секунд, чтобы успело отправиться на сервер
    endDate = Math.max(endDate, Date.now() + 5 * 1000);
    // Дата окончания не может быть позже, чем через месяц
    endDate = Math.min(endDate, Date.now() + ONE_MONTH);
    return endDate;
}
function limitDateByOneMonth(date) {
    const minimumDate = new Date();
    minimumDate.setHours(0, 0, 0, 0);
    const maximumDate = new Date();
    maximumDate.setTime(maximumDate.getTime() + ONE_MONTH);
    // Можно выставлять дату только в течение месяца
    return !(date >= minimumDate && date <= maximumDate);
}
const PollBackgroundDemo = ({ background, }) => {
    const isDefaultBackground = background.id === -1;
    const styles = {
        '--fill': isDefaultBackground
            ? 'var(--vkui--color_background_secondary_alpha)'
            : 'var(--vkui--color_text_contrast)',
        '--opacity': isDefaultBackground ? 1 : 0.4,
        backgroundImage: Attach.generatePollBackgroundGradientStyle(background),
    };
    return (React.createElement("svg", { className: "PollBackgroundDemoSvg", xmlns: "http://www.w3.org/2000/svg", width: "100", height: "80", viewBox: "0 0 100 80", fill: "none", style: styles },
        React.createElement("rect", { x: "8", y: "33", width: "84", height: "8", rx: "2", fill: "var(--fill)", fillOpacity: "var(--opacity)" }),
        React.createElement("rect", { x: "8", y: "44", width: "84", height: "8", rx: "2", fill: "var(--fill)", fillOpacity: "var(--opacity)" }),
        React.createElement("rect", { x: "8", y: "55", width: "84", height: "8", rx: "2", fill: "var(--fill)", fillOpacity: "var(--opacity)" }),
        React.createElement("rect", { x: "34", y: "71", width: "32", height: "3", rx: "1.5", fill: "var(--fill)", fillOpacity: "var(--opacity)" }),
        React.createElement("rect", { x: "22", y: "12", width: "56", height: "3", rx: "1.5", fill: "var(--fill)", fillOpacity: "var(--opacity)" }),
        React.createElement("rect", { x: "32", y: "18", width: "36", height: "3", rx: "1.5", fill: "var(--fill)", fillOpacity: "var(--opacity)" }),
        React.createElement("rect", { x: "0.5", y: "0.5", width: "99", height: "79", rx: "5.5", stroke: "black", strokeOpacity: "0.12" })));
};
//# sourceMappingURL=PollCreateModal.js.map