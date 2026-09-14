export const isIntersectionObserverSupported = typeof window !== 'undefined' &&
    'IntersectionObserver' in window &&
    'IntersectionObserverEntry' in window &&
    'intersectionRatio' in window.IntersectionObserverEntry.prototype;
//# sourceMappingURL=isIntersectionObserverSupported.js.map