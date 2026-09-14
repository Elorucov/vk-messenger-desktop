import { useCallback, useEffect, useRef } from 'react';
import { throttle } from '@vkontakte/vkjs';
import { GRID_SCROLL_NUMBER_OF_VISIBLE } from '@vkontakte-internal/calls-core';
import { SAUSAGE_PARTICIPANT_HEIGHT, SAUSAGE_PARTICIPANT_MARGIN, } from '../../components/CallOrator/constants';
import { useConfig } from '../../services/config';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { getIsOratorMode, getInCallChatOpened } from '../../selectors';
const INITIAL_ORATOR_VISIBLE_COUNT = 5;
const MAX_PARTICIPANTS_IN_ORATOR_LINE = 1;
const MAX_PARTICIPANTS_IN_GRID_LINE = 5;
const MAX_PARTICIPANTS_IN_GRID_LINE_WITH_CHAT = 3;
export const useDevicesScroll = ({ roomId, setDevicesVisibleCount, setFirstVisibleDevice, }) => {
    const refCurrentParticipantsAmount = useRef(0);
    const containerRef = useRef(null);
    const { refContent, refContentHeight } = useCallContentHeight();
    const isOratorMode = useTypedSelector(getIsOratorMode);
    const isInCallChatOpened = useTypedSelector(getInCallChatOpened);
    const config = useConfig();
    const participantOratorHeight = !!refCurrentParticipantsAmount.current
        ? SAUSAGE_PARTICIPANT_HEIGHT + SAUSAGE_PARTICIPANT_MARGIN
        : Infinity;
    const participantGridHeight = document.querySelectorAll('[data-calls-id="grid-item"]')[0]?.offsetHeight || Infinity;
    const participantHeight = isOratorMode ? participantOratorHeight : participantGridHeight;
    const participantsInLine = useParticipantsInLine();
    const onScroll = useCallback(throttle((scrollPosition) => {
        const currentLine = Math.floor(scrollPosition / participantHeight);
        const firstVisibleParticipant = currentLine * participantsInLine;
        const oratorVisibleCount = refContentHeight.current
            ? refContentHeight.current / participantHeight + 3
            : INITIAL_ORATOR_VISIBLE_COUNT;
        const visibleCount = isOratorMode
            ? Math.min(config.videoSlotsCount, oratorVisibleCount)
            : GRID_SCROLL_NUMBER_OF_VISIBLE;
        setFirstVisibleDevice(firstVisibleParticipant);
        setDevicesVisibleCount(Math.floor(visibleCount));
    }, 100), [config.videoSlotsCount, participantHeight, isOratorMode, participantsInLine]);
    useEffect(() => {
        onScroll(0);
        containerRef.current?.scrollTo(0, 0);
    }, [roomId, isOratorMode]);
    useEffect(() => {
        const scroll = () => {
            if (containerRef.current !== null) {
                onScroll(containerRef.current.scrollTop);
            }
        };
        if (containerRef.current) {
            containerRef.current.addEventListener('scroll', scroll);
        }
        return () => {
            if (containerRef.current) {
                containerRef.current.removeEventListener('scroll', scroll);
            }
        };
    }, [isOratorMode, onScroll, containerRef.current]);
    useEffect(() => {
        if (!isOratorMode && isInCallChatOpened && containerRef.current) {
            onScroll(containerRef.current.scrollTop);
        }
    }, [isOratorMode, isInCallChatOpened]);
    return {
        onScroll,
        containerRef,
        refContent,
        refContentHeight,
        refCurrentParticipantsAmount,
    };
};
function useParticipantsInLine() {
    const isOratorMode = useTypedSelector(getIsOratorMode);
    const isInCallChatOpened = useTypedSelector(getInCallChatOpened);
    switch (true) {
        case isOratorMode: {
            return MAX_PARTICIPANTS_IN_ORATOR_LINE;
        }
        case isInCallChatOpened: {
            return MAX_PARTICIPANTS_IN_GRID_LINE_WITH_CHAT;
        }
        default: {
            return MAX_PARTICIPANTS_IN_GRID_LINE;
        }
    }
}
function useCallContentHeight() {
    const refContent = useRef(null);
    const refContentHeight = useRef(0);
    useEffect(() => {
        if (!refContent.current || !refContentHeight) {
            return;
        }
        const ro = new ResizeObserver((entries) => {
            for (const entry of entries) {
                refContentHeight.current = entry.contentRect.height;
            }
        });
        ro.observe(refContent.current);
        return () => ro.disconnect();
    }, []);
    return { refContentHeight, refContent };
}
//# sourceMappingURL=useScroll.js.map