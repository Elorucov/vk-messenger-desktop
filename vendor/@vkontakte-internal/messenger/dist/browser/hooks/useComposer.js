import { useCallback, useEffect, useRef, useState } from 'react';
import * as Peer from '../../core/model/Peer';
import { getOwnerGroupId } from '../../data/store/State';
import { useBrowserEnv, useFeatureFlags, useOwner, useViewer, } from '../hooks/misc';
import { noop } from '../../core/utils/misc';
import { TYPING_EXPIRATION_TIME } from '../../core/config/config';
import { massMentionRegexElement } from '../../core/model/Tokenizer/RegexMassMention';
// Минимальное количество участников беседы при котором будет появляться предупреждение пользователю
const WARNING_MIN_MEMBERS = 10;
export function useMassMentionWarning({ message, membersCount, }) {
    const { vkm_regex_parser } = useFeatureFlags();
    const [visible, setVisibility] = useState(false);
    // Флаг, закрыл ли пользователь предупреждение самостоятельно
    const [hasClosed, setClosed] = useState(false);
    useEffect(() => {
        let hasMention;
        if (vkm_regex_parser) {
            hasMention = Boolean(massMentionRegexElement.exec(message)?.length);
        }
        else {
            // @todo Сделано поведение максимально совпадающее с vk.com, но нужна спека для консистентности с BE
            hasMention = /@(?:all|everyone|все)(?:\s|$)/.test(message);
        }
        const newVisible = membersCount >= WARNING_MIN_MEMBERS && hasMention;
        if (!visible && newVisible) {
            /*
               Если меншен не был виден, и теперь должен быть отображен, то сбрасываем флаг
               форсированного скрытия меншена, поскольку пользователь уже самостяотельно стер
               его ранее и мог забыть про предупреждение, надо напомнить еще раз
             */
            setClosed(false);
        }
        // Показываем предупреждение только если в беседе действительно много участников
        setVisibility(newVisible);
    }, [
        message,
        visible,
        setClosed,
        setVisibility,
        membersCount,
        vkm_regex_parser,
    ]);
    const onClose = () => setClosed(true);
    return {
        visible: visible && !hasClosed,
        onClose,
    };
}
export function useSendUserActivity(peerId, isDisabled) {
    const { api } = useBrowserEnv();
    const { viewer } = useViewer();
    const owner = useOwner();
    const activityLock = useRef();
    useEffect(() => {
        return () => {
            if (activityLock.current) {
                clearTimeout(activityLock.current);
            }
        };
    }, []);
    return useCallback((activityType = 'typing') => {
        if (isDisabled) {
            /**
             * Иногда нам временно не нужно слать активность пользователя.
             * Например, когда он что-то делает на экране отложек.
             */
            return;
        }
        if (activityLock.current) {
            return;
        }
        const lock = (delay) => {
            if (activityLock.current) {
                clearTimeout(activityLock.current);
            }
            activityLock.current = window.setTimeout(() => {
                activityLock.current = undefined;
            }, delay);
        };
        /**
         * По дефолту залокаем на 2 минуты на случай ошибки
         * или медленного ответа.
         *
         * В случае успешного выполнения поменяем лок на более короткий.
         *
         * Задержка взята из https://jira.mvk.com/browse/ME-23494
         */
        const TWO_MINS = 1000 * 60 * 2;
        lock(TWO_MINS);
        api
            .fetch('messages.setActivity', {
            user_id: Peer.toRealId(viewer.id),
            peer_id: peerId,
            type: activityType,
            group_id: getOwnerGroupId(owner.id),
        })
            .then(() => {
            lock(TYPING_EXPIRATION_TIME);
        })
            .catch(noop);
    }, [isDisabled, api, viewer.id, peerId, owner.id]);
}
//# sourceMappingURL=useComposer.js.map