import { useBrowserEnv } from '../../hooks/misc';
import { useInView } from 'react-intersection-observer';
export const ChannelItemViewAnalytics = ({ children, trackCode, source, screen }) => {
    const { stats } = useBrowserEnv();
    const { ref } = useInView({
        triggerOnce: true,
        delay: 300, // чтобы при быстром скролле не тригерить показ
        onChange: (inView) => {
            if (inView) {
                stats.logEvent({
                    type: 'type_view',
                    screen,
                    type_view: {
                        type: 'type_channel_item',
                        item: {
                            type: 'channel',
                            track_code: trackCode,
                        },
                        position: 0,
                        start_view: '',
                        end_view: '',
                        type_channel_item: {
                            source,
                        },
                    },
                });
            }
        },
    });
    return children(ref);
};
//# sourceMappingURL=ChannelItemViewAnalytics.js.map