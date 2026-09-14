import { useBrowserEnv } from '../hooks/misc';
import { useRouter } from '../ui/Router/Router';
import { useApiFetch } from '../hooks/useApiFetch';
export const MINI_APP_WIDGET_REFERER = 'im_app_action';
export const useMiniAppWidgetActions = ({ cmid, }) => {
    const { logger } = useBrowserEnv();
    const { screenRoute, rightPanel } = useRouter();
    const apiFetch = useApiFetch();
    const updateMiniAppWidgetFooter = async () => {
        try {
            const peerId = (screenRoute.kind === 'ConvoRoute' && screenRoute.peerId) ||
                (rightPanel?.kind === 'PeerPanel' && rightPanel.peerId);
            if (!peerId) {
                throw new Error('Not found peerId');
            }
            await apiFetch('apps.addInMessengerAppAction', {
                peer_id: peerId,
                message_id: cmid,
            });
        }
        catch (error) {
            logger.info('Error in apps.addInMessengerAppAction', error);
        }
    };
    return { updateMiniAppWidgetFooter };
};
//# sourceMappingURL=useMiniAppWidgetActions.js.map