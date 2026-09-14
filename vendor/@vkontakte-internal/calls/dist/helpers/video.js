export function createVideoTag(stream) {
    const video = document.createElement('video');
    const onVisible = () => {
        video.classList.add('Video--visible');
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
    try {
        video.disablePictureInPicture = true;
        video.setAttribute('pip', 'false');
    }
    catch (err) { }
    return video;
}
//# sourceMappingURL=video.js.map