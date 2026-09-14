import * as Channel from '../../core/model/Channel';
import { useBrowserEnv } from '../hooks/misc';
/**
 * Генерирует `lang` с кол-вом подписчиков на канал.
 * - Для новых возвращает кол-во подписчиков только на канал (только для
 * Редактор+).
 * - Для старых возвращает кол-во подписчиков на само сообщество.
 */
export function useChannelSubscribersCountLang(channel) {
    const { lang } = useBrowserEnv();
    if (Channel.isCommunityChannel(channel)) {
        if (!channel.subscribersCount) {
            return;
        }
        return lang.use('me_channel_subscribers_count', {
            num: channel.subscribersCount,
            formatted: 'short',
        });
    }
    return channel.membersCount
        ? lang.use('me_channel_subscribers_count', {
            num: channel.membersCount,
            formatted: 'short',
        })
        : lang.use('me_channel');
}
//# sourceMappingURL=useChannelSubscribersCountLang.js.map