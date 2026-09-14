export function handleVKWebAppCustomMessage(params, router, dispatch) {
    const { action, payload } = params;
    const channelId = router.screenRoute.kind === 'ChannelRoute' && router.screenRoute.channelId;
    if (channelId && action === 'ord_data') {
        dispatch({
            type: 'UserChangedChannelComposerDraft',
            kind: 'text',
            channelId,
            ads: payload,
        });
    }
    return Promise.resolve({
        type: 'VKWebAppCustomMessageResult',
        data: {
            result: true,
        },
    });
}
//# sourceMappingURL=miniApps.js.map