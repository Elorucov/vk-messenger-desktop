export const padVideoArray = (array, getLang, padding) => {
    const padArray = padding.map((id) => ({
        id: Number(id.split('_')[1]),
        title: getLang('calls_broadcast_history_preview_deleted_description'),
        owner: {
            name: '',
            href: '',
        },
        restriction: {
            iconType: 'delete',
            mode: 'hidden',
            title: getLang('calls_broadcast_history_preview_deleted_description'),
        },
        href: undefined,
    }));
    return array.concat(padArray);
};
//# sourceMappingURL=padVideoArray.js.map