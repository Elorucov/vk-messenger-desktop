import { useCallback } from 'react';
import { useCallsSDK } from '../../../providers/CallsSdkProvider';
import { useTypedDispatch } from '../../../hooks/useTypedDispatch';
import { setLocalDevice } from '../../../actions';
export const useReactionClick = () => {
    const dispatch = useTypedDispatch();
    const SDK = useCallsSDK();
    return useCallback((reaction) => {
        // делаем оптимистичный апдейт
        dispatch(setLocalDevice({ lastChosenReaction: { key: reaction, ts: Date.now() } }));
        SDK.feedback(reaction).then(() => {
            // todo отправвить стату
            // в случае успеха, отправляем выбранную реакцию в статистику
            // sendStatsData(ECallActionEventType.REACTION_SENT, {
            //   reaction_type: reaction,
            //   session_id: state.callData.callId,
            // });
        });
    }, []);
};
//# sourceMappingURL=useReactionClick.js.map