export function applyContentStyles(options) {
    return {
        width: options['overflowX'] === 'hidden' ? '100%' : 'min-content',
        height: options['overflowY'] === 'hidden' ? '100%' : 'min-content',
    };
}
