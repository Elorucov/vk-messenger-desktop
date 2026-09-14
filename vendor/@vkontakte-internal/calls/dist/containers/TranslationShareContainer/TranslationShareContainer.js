import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect } from 'react';
import { E_ACTION } from '../../constants';
import { useTypedDispatch } from '../../hooks/useTypedDispatch';
import { CallManagementModal } from '../../components/CallManagementModal/CallManagementModal';
import { TranslationLink } from '../../components/TranslationLink/TranslationLink';
import { useLang } from '../../hooks/useLang';
import { useFetchData } from '../../hooks/useFetchData';
import { getCallTranslationLink } from '../../services/backend';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { getCallId, getIsMeAdmin, getMyId, getTranslation } from '../../selectors';
import { noop } from '@vkontakte/vkjs';
import { getBroadcastLink } from '../../helpers/url';
import { peerIdToVkId } from '@vkontakte-internal/calls-core';
import { useCloseModal } from '../../hooks/useCloseModal';
import { useConfig } from '../../services/config';
import { createWidget } from '@vkontakte-internal/di';
import { observer } from 'mobx-react-lite';
import { TranslationShareProvider, useTranslationShareModel } from './model';
const TranslationShareView = observer(function TranslationShareView() {
    const dispatch = useTypedDispatch();
    const { getLang } = useLang();
    const closeModal = useCloseModal();
    const { sferum } = useConfig();
    const { roomId, onBack, linkExtractor } = useTranslationShareModel();
    const { fetchData, loading } = useFetchData({ cb: getCallTranslationLink });
    const stream = useTypedSelector(getTranslation);
    const callId = useTypedSelector(getCallId);
    const myId = useTypedSelector(getMyId);
    const isMeAdmin = useTypedSelector(getIsMeAdmin);
    useEffect(() => {
        if (stream.ownerId !== peerIdToVkId(myId) && !isMeAdmin) {
            // Если я не админ или хотя бы не создатель трансляции/записи, то у меня не будет доступа
            return;
        }
        fetchData(callId, roomId)
            .then((res) => {
            const broadcastId = `${res?.owner_id}_${res?.video_id}_${res?.access_key ? res?.access_key : ''}`;
            const accessKey = res?.access_key;
            dispatch({
                type: E_ACTION.SET_TRANSLATION,
                data: {
                    link: getBroadcastLink(broadcastId, sferum) || undefined,
                    accessKey: accessKey,
                },
            });
        })
            .catch(noop);
    }, [stream.ownerId, myId, isMeAdmin, roomId]);
    return (_jsx(CallManagementModal, { title: getLang('calls_translation_link'), onCloseModal: closeModal, isWithBackButton: !!onBack, onBackClick: onBack, dataTestId: "calls_translation_share_modal_root", children: _jsx(TranslationLink, { isLoading: loading, link: linkExtractor?.(stream) ?? stream.link }) }));
});
export const TranslationShareWidget = createWidget(TranslationShareProvider, TranslationShareView);
//# sourceMappingURL=TranslationShareContainer.js.map