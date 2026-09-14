export function applyScrollableStyles(barWidth, { overflowX, overflowY }) {
    return {
        WebkitOverflowScrolling: 'touch',
        msOverflowStyle: '-ms-autohiding-scrollbar',
        width: overflowY !== 'hidden' && barWidth > 0
            ? `calc(100% + ${barWidth}px)`
            : '100%',
        height: overflowX !== 'hidden' && barWidth > 0
            ? `calc(100% + ${barWidth}px)`
            : '100%',
        maxWidth: 'inherit',
        maxHeight: 'inherit',
        overflowX: overflowX || 'auto',
        overflowY: overflowY || 'auto',
    };
}
