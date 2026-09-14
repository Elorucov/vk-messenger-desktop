import { useBrowserEnv } from '../hooks/misc';
import { IPerfStats } from '../../data/env/IPerfStats';
import { useRef, useEffect, useLayoutEffect, useState } from 'react';
import { Time } from '../../core/utils/time';
export const getMemoryHeapSize = () => {
    if (!window.crossOriginIsolated ||
        !('measureUserAgentSpecificMemory' in window.performance)) {
        if ('memory' in window.performance) {
            return Promise.resolve(window.performance.memory
                .usedJSHeapSize);
        }
        return;
    }
    return window.performance.measureUserAgentSpecificMemory().then(({ bytes }) => bytes);
};
export const useMemoryStats = (state) => {
    const { perfStats } = useBrowserEnv();
    const $state = useRef(state);
    $state.current = state;
    const $3MinutesTimeoutId = useRef();
    const $15MinutesTimeoutId = useRef();
    const $1HourTimeoutId = useRef();
    const $3HoursTimeoutId = useRef();
    const $12HoursTimeoutId = useRef();
    /**
     * Pts лонгполла на старте приложения.
     * Нужен при подсчете событий для определения power-пользователей.
     */
    const $startConvoLpConnPts = useRef(state.convoConn.pts);
    const $startChannelLpConnTs = useRef(state.channelConn.ts);
    // LP каналов получает ts и коннектится после старта приложения, поэтому
    // для нескольких первых рендеров $startChannelLpConnTs.current будет равен 0.
    // Для этого будем обновлять ts каналов с расчетом, что он будет получен
    // раньше, чем вызовется интервал сбора статистики ниже.
    if ($startChannelLpConnTs.current === 0) {
        $startChannelLpConnTs.current = state.channelConn.ts;
    }
    const $mbytesOnStart = useRef();
    useEffect(() => {
        if (perfStats === undefined) {
            return;
        }
        const getMemoryHeapShapshotEventData = async () => {
            const bytes = await getMemoryHeapSize();
            if (!bytes || !$mbytesOnStart.current) {
                return;
            }
            return {
                mbytes: Math.round(bytes / 1024 ** 2),
                mbytesOnStart: $mbytesOnStart.current,
                convosCount: $state.current.convos.size,
                peersCount: $state.current.peers.size,
                channelsCount: $state.current.channels.size,
                messagesCount: [...$state.current.convos.values()].reduce((result, convo) => result + convo.history.confirmed.length, 0),
                LPEvents: {
                    convos: $state.current.convoConn.pts - $startConvoLpConnPts.current,
                    channels: $state.current.channelConn.ts - $startChannelLpConnTs.current,
                },
            };
        };
        const logMemoryHeapShapshotEvent = async (sessionDuration) => {
            const data = await getMemoryHeapShapshotEventData();
            if (data === undefined) {
                return;
            }
            const event = {
                type: IPerfStats.EventType.memoryHeap,
                sessionDuration,
                data,
            };
            perfStats.logEvent(event);
        };
        $3MinutesTimeoutId.current = window.setTimeout(async () => {
            const bytes = await getMemoryHeapSize();
            if (bytes === undefined) {
                return;
            }
            $mbytesOnStart.current = Math.round(bytes / 1024 ** 2);
            // Ждем 3 минуты, чтобы дать вызваться garbage collector'у
        }, Time.Hour / 20);
        $15MinutesTimeoutId.current = window.setTimeout(() => {
            logMemoryHeapShapshotEvent('15m');
        }, Time.Hour / 4);
        $1HourTimeoutId.current = window.setTimeout(() => {
            logMemoryHeapShapshotEvent('1h');
        }, Time.Hour);
        $3HoursTimeoutId.current = window.setTimeout(() => {
            logMemoryHeapShapshotEvent('3h');
        }, 3 * Time.Hour);
        $12HoursTimeoutId.current = window.setTimeout(() => {
            logMemoryHeapShapshotEvent('12h');
        }, 12 * Time.Hour);
        return () => {
            window.clearTimeout($3MinutesTimeoutId.current);
            window.clearTimeout($15MinutesTimeoutId.current);
            window.clearTimeout($1HourTimeoutId.current);
            window.clearTimeout($3HoursTimeoutId.current);
            window.clearTimeout($12HoursTimeoutId.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
};
export const usePerformanceObserver = (state) => {
    const { perfStats, logger, idle } = useBrowserEnv();
    const $stateUpdatesCount = useRef({
        all: 0,
        peers: 0,
        convos: 0,
    });
    const $longTasksCount = useRef({
        under100: 0,
        under250: 0,
        over250: 0,
    });
    const $LpConnTs = useRef({
        convos: state.convoConn.pts,
        channels: state.channelConn.ts,
    });
    $LpConnTs.current = {
        convos: state.convoConn.pts,
        channels: state.channelConn.ts,
    };
    const $prevLpConnTs = useRef({
        convos: state.convoConn.pts,
        channels: state.channelConn.ts,
    });
    // LP каналов получает ts и коннектится после старта приложения, поэтому
    // для нескольких первых рендеров $prevLpConnTs.current.channels будет равен 0.
    // Для этого будем обновлять ts каналов с расчетом, что он будет получен
    // раньше, чем вызовется интервал сбора статистики ниже.
    if ($prevLpConnTs.current.channels === 0) {
        $prevLpConnTs.current.channels = state.channelConn.ts;
    }
    useEffect(() => {
        if (!perfStats || idle.isIdle()) {
            return;
        }
        $stateUpdatesCount.current.all += 1;
        // Трекаем апдейты только стейта
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state]);
    useEffect(() => {
        if (!perfStats || idle.isIdle()) {
            return;
        }
        $stateUpdatesCount.current.peers += 1;
        // Трекаем апдейты только пиров
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.peers]);
    useEffect(() => {
        if (!perfStats || idle.isIdle()) {
            return;
        }
        $stateUpdatesCount.current.convos += 1;
        // Трекаем апдейты только чатов
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.convos]);
    useEffect(() => {
        if (!perfStats) {
            return;
        }
        const performanceEventsToTrack = ['longtask'];
        const observer = new PerformanceObserver((list) => {
            if (idle.isIdle()) {
                return;
            }
            for (const entry of list.getEntries()) {
                if (entry.duration < 100) {
                    $longTasksCount.current.under100 += 1;
                }
                else if (entry.duration < 250) {
                    $longTasksCount.current.under250 += 1;
                }
                else {
                    $longTasksCount.current.over250 += 1;
                }
            }
        });
        observer.observe({
            entryTypes: performanceEventsToTrack,
        });
        return () => {
            observer.disconnect();
        };
    }, [perfStats, idle]);
    useEffect(() => {
        if (!perfStats) {
            return;
        }
        const intervalId = setInterval(() => {
            const LPEventsCount = {
                convos: $LpConnTs.current.convos - $prevLpConnTs.current.convos,
                channels: $LpConnTs.current.channels - $prevLpConnTs.current.channels,
            };
            $prevLpConnTs.current = $LpConnTs.current;
            if ([
                ...Object.values($stateUpdatesCount.current),
                ...Object.values($longTasksCount.current),
            ].every((value) => value === 0) &&
                LPEventsCount.channels === 0 &&
                LPEventsCount.convos === 0) {
                return;
            }
            perfStats.logEvent({
                type: IPerfStats.EventType.longTasks,
                data: {
                    stateUpdates: $stateUpdatesCount.current,
                    longTasks: $longTasksCount.current,
                    LPEvents: LPEventsCount,
                },
            });
            $stateUpdatesCount.current = {
                all: 0,
                peers: 0,
                convos: 0,
            };
            $longTasksCount.current = {
                under100: 0,
                under250: 0,
                over250: 0,
            };
        }, Time.Hour / 2);
        return () => clearInterval(intervalId);
    }, [perfStats, logger]);
};
export const useCollectAppStartEvent = () => {
    const { perfStats, stats } = useBrowserEnv();
    const collectLCPEvent = () => {
        /**
         * Раскомментить код ниже, чтобы понять, насколько точную стату собираем.
         */
        // window.performance.mark('reforged__LCP')
        if (perfStats === undefined) {
            return;
        }
        perfStats.addEventData(IPerfStats.EventType.appStart, {
            LCP: perfStats.getCurrentTime(),
        });
    };
    useNextPaint(collectLCPEvent, []);
    useEffect(() => perfStats?.subscribeOnChanges((name) => {
        if (name !== IPerfStats.EventType.appStart) {
            return;
        }
        const startEvent = perfStats.getEvent(IPerfStats.EventType.appStart);
        if (startEvent === undefined) {
            return;
        }
        const { TTFB, FCP, LCP } = startEvent.data;
        if (!(TTFB && FCP && LCP)) {
            return;
        }
        perfStats.logEvent(startEvent);
        perfStats.removeEvent(IPerfStats.EventType.appStart);
    }), [perfStats, stats]);
};
export const useCollectChatOpenEvent = (historySlice) => {
    const { perfStats } = useBrowserEnv();
    const { topGap, bottomGap, nodes = [], pendingNodes = [], } = historySlice ?? {};
    const messagesCount = nodes.length + pendingNodes.length;
    const isHistoryLoadedEnough = historySlice &&
        (messagesCount > 10 || (topGap === undefined && bottomGap === undefined));
    const collectStats = () => {
        if (perfStats === undefined) {
            return;
        }
        if (!isHistoryLoadedEnough) {
            /**
             * Раскомментить код ниже, чтобы понять, насколько точную стату собираем.
             */
            // const openMark = window.performance
            //   .getEntriesByName('reforged__start_open_chat')
            //   .at(-1)
            // if (
            //   openMark === undefined ||
            //   !(openMark instanceof PerformanceMark)
            // ) {
            //   return
            // }
            // window.performance.mark('reforged__initial_open_chat')
            // window.performance.measure(
            //   'reforged__initial_open_chat',
            //   'reforged__start_open_chat',
            //   'reforged__initial_open_chat',
            // )
            perfStats.addEventData(IPerfStats.EventType.openChat, {
                initialMessagesCount: messagesCount,
                initialHistoryShown: perfStats.getCurrentTime(),
            });
            return;
        }
        /**
         * Раскомментить код ниже, чтобы понять, насколько точную стату собираем.
         */
        // window.performance.mark('reforged__end_open_chat')
        perfStats.addEventData(IPerfStats.EventType.openChat, {
            messageCount: messagesCount,
            historyShown: perfStats.getCurrentTime(),
        });
        const event = perfStats.getEvent(IPerfStats.EventType.openChat);
        if (event !== undefined) {
            perfStats.logEvent(event);
            perfStats.removeEvent(IPerfStats.EventType.openChat);
        }
    };
    useNextPaint(collectStats, [isHistoryLoadedEnough]);
};
export const useCollectChannelOpenEvent = (historySlice) => {
    const { perfStats } = useBrowserEnv();
    const { nodes = [], pendingNodes = [], topGap, bottomGap, } = historySlice ?? {};
    const postsCount = nodes.length + pendingNodes.length;
    const isHistoryLoadedEnough = historySlice &&
        (postsCount > 10 || (topGap === undefined && bottomGap === undefined));
    const collectStats = () => {
        if (perfStats === undefined) {
            return;
        }
        if (!isHistoryLoadedEnough) {
            perfStats.addEventData(IPerfStats.EventType.openChannel, {
                initialPostsCount: postsCount,
                initialHistoryShown: perfStats.getCurrentTime(),
            });
            return;
        }
        perfStats.addEventData(IPerfStats.EventType.openChannel, {
            postsCount: postsCount,
            historyShown: perfStats.getCurrentTime(),
        });
        const event = perfStats.getEvent(IPerfStats.EventType.openChannel);
        if (event !== undefined) {
            perfStats.logEvent(event);
            perfStats.removeEvent(IPerfStats.EventType.openChannel);
        }
    };
    useNextPaint(collectStats, [isHistoryLoadedEnough]);
};
export const useCollectMessageReceivedEvent = (selectedPeerId) => {
    const { perfStats } = useBrowserEnv();
    const [updatesCount, setUpdatesCount] = useState(0);
    useEffect(() => {
        return perfStats?.subscribeOnChanges((name) => {
            setUpdatesCount((updatesCount) => name === 'receive_message' ? ++updatesCount : updatesCount);
        });
    }, [perfStats]);
    const collectMessageReceivedEvent = () => {
        /**
         * Раскомментить код ниже, чтобы понять, насколько точную стату собираем.
         */
        // if (
        //   window.performance.getEntriesByName('reforged__message_received__LP')
        //     .length !== 0
        // ) {
        //   window.performance.mark('reforged__message_received__shown')
        //   window.performance.measure(
        //     'reforged__message_received',
        //     'reforged__message_received__LP',
        //     'reforged__message_received__shown',
        //   )
        //   window.performance.clearMarks('reforged__message_received__LP')
        // }
        if (perfStats === undefined) {
            return;
        }
        const event = perfStats.getEvent(IPerfStats.EventType.receiveMessage);
        if (event?.data.LP === undefined) {
            return;
        }
        perfStats.addEventData(IPerfStats.EventType.receiveMessage, {
            isInOpenedChat: selectedPeerId !== undefined && event.peerIds.includes(selectedPeerId),
            shown: perfStats.getCurrentTime(),
        });
        const finishedEvent = perfStats.getEvent(IPerfStats.EventType.receiveMessage);
        perfStats.removeEvent(IPerfStats.EventType.receiveMessage);
        if (finishedEvent) {
            perfStats.logEvent(finishedEvent);
        }
    };
    useNextPaint(collectMessageReceivedEvent, [updatesCount]);
};
export const useNextPaint = (callback, deps) => {
    useLayoutEffect(() => {
        requestAnimationFrame(callback);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
};
//# sourceMappingURL=usePerfStats.js.map