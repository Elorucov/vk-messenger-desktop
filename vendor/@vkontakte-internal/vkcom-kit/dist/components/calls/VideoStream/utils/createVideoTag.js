export function createVideoTag(stream, className) {
    const video = document.createElement('video');
    const onVisible = () => {
        video.classList.add(className);
        video.removeEventListener('loadeddata', onVisible);
    };
    video.addEventListener('loadeddata', onVisible);
    video.autoplay = true;
    video.controls = false;
    video.crossOrigin = 'anonymous';
    video.playsInline = true;
    video.preload = 'metadata';
    video.srcObject = stream;
    video.volume = 0;
    video.defaultMuted = true;
    video.muted = true;
    return video;
}
//# sourceMappingURL=createVideoTag.js.map