import * as Attach from '../../core/model/Attach';
import { VideoFormat, VideoQuality, } from '@vkontakte/videoplayer-core';
import { registerPlayerWebComponent, } from '@vkontakte/videoplayer';
import { isNumber } from '@vkontakte/vkjs';
export class VideoPlayer {
    video;
    liveChecker;
    initialized = false;
    player = null;
    /**
     * Статус фулскрина. Работает только в ВК плеере
     */
    fullScreen = false;
    constructor(video, liveChecker) {
        this.video = video;
        this.liveChecker = liveChecker;
        this.initPlayer = this.initPlayer.bind(this);
        this.onFullscreenChange = this.onFullscreenChange.bind(this);
    }
    get isFullScreen() {
        return this.fullScreen;
    }
    initPlayer(videoPlayerElement) {
        if (!videoPlayerElement || this.initialized) {
            return;
        }
        this.initialized = true;
        this.player = this.choosePlayer(videoPlayerElement);
        if (!this.player) {
            return;
        }
        try {
            this.player.start(this.video);
        }
        catch (e) {
            /**
             * Некоторые вьюверы обладают автоплеем.
             * Если юзер открыл видео по ссылке и никуда не кликнул при этом,
             * то тогда вылетит ошибка. Обрабатываем.
             */
            console.error(e);
        }
    }
    destroy() {
        this.initialized = false;
        if (!this.player) {
            return;
        }
        this.player.destroy();
    }
    choosePlayer(videoPlayerElement) {
        if (!this.video.files?.external) {
            return new VKPlayer(videoPlayerElement, this.onFullscreenChange, this.liveChecker);
        }
        const url = this.video.files?.external;
        /**
         * Ссылка для встраивания с апи
         */
        const playerUrl = this.video.player;
        if (playerUrl) {
            return new Player(videoPlayerElement);
        }
        /**
         * Фоллбечимся на кастомные плееры только в случае отсутствия
         * ссылки на пхпшный iframe-плеер из апи
         */
        const youTubeVideoId = parseYouTubeLink(url);
        if (youTubeVideoId) {
            return new YouTubePlayer(videoPlayerElement, youTubeVideoId);
        }
        if (isCoubEmbedLink(url)) {
            return new CoubPlayer(videoPlayerElement, url);
        }
        const vimeoVideoId = parseVimeoLink(url);
        if (vimeoVideoId) {
            return new VimeoPlayer(videoPlayerElement, vimeoVideoId);
        }
        return null;
    }
    onFullscreenChange(flag) {
        this.fullScreen = flag;
    }
}
class Player {
    videoPlayerElement;
    height;
    width;
    constructor(videoPlayerElement) {
        this.videoPlayerElement = videoPlayerElement;
        const { offsetWidth, offsetHeight } = videoPlayerElement;
        this.width = offsetWidth;
        this.height = offsetHeight;
    }
    appendPlayer(player) {
        if (!this.videoPlayerElement.hasChildNodes()) {
            this.videoPlayerElement.appendChild(player);
        }
    }
    createIframe(src) {
        const playerIframe = document.createElement('iframe');
        Object.assign(playerIframe, {
            src,
            allowFullscreen: 'true',
            width: '100%',
            height: '100%',
            frameBorder: '0',
            allow: 'autoplay; fullscreen; encrypted-media',
            preventHide: '1',
            type: 'text/html',
            scrolling: 'no',
            allowTransparency: 'true',
        });
        return playerIframe;
    }
    start(video) {
        if (!video || !video.player) {
            return;
        }
        const player = this.createIframe(video.player);
        this.appendPlayer(player);
    }
    destroy() {
        const player = this.videoPlayerElement.children[0];
        player && player.remove();
    }
}
class VKPlayer extends Player {
    videoPlayerElement;
    onFullscreenChange;
    liveChecker;
    player;
    constructor(videoPlayerElement, onFullscreenChange, liveChecker) {
        super(videoPlayerElement);
        this.videoPlayerElement = videoPlayerElement;
        this.onFullscreenChange = onFullscreenChange;
        this.liveChecker = liveChecker;
        this.registerPlayer();
        this.player = document.createElement('vk-video-player');
        this.appendPlayer.call(this, this.player);
        this.constructVideoData = this.constructVideoData.bind(this);
    }
    registerPlayer() {
        if (!window.customElements.get('vk-video-player')) {
            registerPlayerWebComponent();
        }
    }
    start(video) {
        const isLiveWaiting = Boolean(video.liveStatus) && this.liveChecker;
        const videoData = this.constructVideoData(video);
        this.player.initPlayer({
            videos: videoData ? [videoData] : [],
            preload: !isLiveWaiting,
            autoplay: true,
            canDownload: isNumber(video.canDownload)
                ? !!(video.canDownload & 2)
                : false,
            callbacks: {
                onFullscreenEnter: () => {
                    this.onFullscreenChange(true);
                },
                onFullscreenExit: () => {
                    this.onFullscreenChange(false);
                },
            },
        }, {});
        if (isLiveWaiting) {
            this.liveChecker?.init({
                video,
                constructVideoData: this.constructVideoData,
                callbacks: {
                    onLiveStart: (sources) => this.player.setLiveStart(sources),
                    onLiveEnd: (data) => this.player.setLiveEnd(data),
                    setLiveWaitingRecord: () => this.player.setLiveWaitingRecord(),
                },
            });
        }
    }
    destroy() {
        super.destroy();
        if (this.liveChecker?.initialized) {
            this.liveChecker.destroy();
        }
    }
    constructVideoData(video) {
        if (!video) {
            return;
        }
        const sources = convertFilesToSources(video.files);
        const live = {
            status: video.liveStatus, // ошибка типизации
            startTime: video.liveStartTime,
        };
        return {
            ...(Object.keys(sources).length > 0 ? { sources } : { live }),
            title: video.title || '',
            thumbUrl: Attach.preview(video, this.width, this.height)?.url || '',
            duration: video.duration || 0,
            unitedVideoId: video.id,
            previewThumbsData: video.timelineThumbs,
            videoEpisodes: video.videoEpisode,
        };
    }
}
/**
 * Ошибка скрипта с невозможностью засетить allow-presentation
 * https://github.com/tjallingt/react-youtube/issues/384
 * (ошибка в скрипте YT - как будет фикс, добавить его сюда TODO)
 */
class YouTubePlayer extends Player {
    videoPlayerElement;
    videoId;
    player;
    isScriptEvaluating = true;
    constructor(videoPlayerElement, videoId) {
        super(videoPlayerElement);
        this.videoPlayerElement = videoPlayerElement;
        this.videoId = videoId;
        this.installYoutubeScript();
        this.start = this.start.bind(this);
    }
    installYoutubeScript() {
        if (window.YT) {
            this.isScriptEvaluating = false;
            return;
        }
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
        window.onYouTubeIframeAPIReady = () => {
            this.isScriptEvaluating = false;
        };
    }
    start() {
        if (this.isScriptEvaluating) {
            window.onYouTubeIframeAPIReady = () => {
                this.isScriptEvaluating = false;
                this.start();
            };
            return;
        }
        this.player = new window.YT.Player(this.videoPlayerElement, {
            videoId: this.videoId,
            events: {
                onReady: this.onReady.bind(this),
                onStateChange: this.onStateChange.bind(this),
            },
            height: this.height,
            width: this.width,
        });
    }
    onReady(event) {
        if (!event) {
            return;
        }
        event.target.playVideo();
    }
    onStateChange(event) {
        if (!event) {
            return;
        }
        /**
         * Из документации ютуб: конец видео != стопу видео
         * Поэтому ставим видео на стоп после конца через 6с
         */
        if (event.data === YT.PlayerState.ENDED) {
            setTimeout(this.stopVideo, 6000);
        }
    }
    stopVideo() {
        if (this.player) {
            this.player.stopVideo();
        }
    }
}
class CoubPlayer extends Player {
    videoPlayerElement;
    url;
    player;
    isScriptEvaluating = true;
    script = null;
    constructor(videoPlayerElement, url) {
        super(videoPlayerElement);
        this.videoPlayerElement = videoPlayerElement;
        this.url = url;
        this.player = this.createIframe(url + '?autostart=true');
        this.installCoubScript.call(this);
    }
    installCoubScript() {
        if (document.querySelector('#coub-player')) {
            this.isScriptEvaluating = false;
            return;
        }
        this.script = document.createElement('script');
        this.script.src = '//c-cdn.coub.com/embed-runner.js';
        this.script.async = true;
        this.script.id = 'coub-player';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag?.parentNode?.insertBefore(this.script, firstScriptTag);
        this.script.onload = () => {
            this.isScriptEvaluating = false;
        };
    }
    start() {
        if (this.isScriptEvaluating && this.script) {
            this.script.onload = () => {
                this.isScriptEvaluating = false;
                this.start();
            };
            return;
        }
        this.appendPlayer(this.player);
    }
}
class VimeoPlayer extends Player {
    videoPlayerElement;
    url;
    player;
    constructor(videoPlayerElement, url) {
        super(videoPlayerElement);
        this.videoPlayerElement = videoPlayerElement;
        this.url = url;
        this.player = this.createIframe(url + '?title=0&byline=0&portrait=0');
    }
    start() {
        this.appendPlayer(this.player);
    }
}
function convertFilesToSources(files) {
    const result = {};
    if (!files) {
        return result;
    }
    if (files.external) {
        return {
            external: files.external,
        };
    }
    const filesToSourcesMap = new Map([
        ['dash_webm_av1', VideoFormat.DASH_WEBM_AV1],
        ['dash_live_playback', VideoFormat.DASH_LIVE],
        ['hls', VideoFormat.HLS],
        ['hls_live_playback', VideoFormat.HLS_LIVE],
        ['hls_ondemand', VideoFormat.HLS_ONDEMAND],
        ['dash_uni', VideoFormat.DASH],
        ['dash_sep', VideoFormat.DASH_SEP],
        ['dash_ondemand', VideoFormat.DASH_ONDEMAND],
    ]);
    filesToSourcesMap.forEach((sourcesKey, filesKey) => {
        const url = files[filesKey];
        if (url) {
            result[sourcesKey] = {
                type: 'url',
                url: updateUrlForLocalhost(url),
            };
        }
    });
    const MPEGsFilesToSourcesMap = new Map([
        ['mp4_144', VideoQuality.Q_144P],
        ['mp4_240', VideoQuality.Q_240P],
        ['mp4_360', VideoQuality.Q_360P],
        ['mp4_480', VideoQuality.Q_480P],
        ['mp4_720', VideoQuality.Q_720P],
        ['mp4_1080', VideoQuality.Q_1080P],
        ['mp4_1440', VideoQuality.Q_1440P],
        ['mp4_2160', VideoQuality.Q_2160P],
    ]);
    const MPEG = {};
    MPEGsFilesToSourcesMap.forEach((sourcesKey, filesKey) => {
        const url = files[filesKey];
        if (url) {
            MPEG[sourcesKey] = updateUrlForLocalhost(url);
        }
    });
    if (Object.keys(MPEG).length) {
        result.MPEG = MPEG;
    }
    return result;
}
function parseYouTubeLink(url) {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?(?<hash>[^#&?]*).*/;
    const { hash } = regExp.exec(url)?.groups || {};
    return hash?.length === 11 ? hash : '';
}
function isCoubEmbedLink(url) {
    const regExp = /^(https?:)?\/\/(.+\.)?coub\.com\/embed\/.+/;
    return regExp.test(url);
}
function parseVimeoLink(url) {
    const regeExp = /^(https?:)?\/\/vimeo\.com\/(?<videoId>\d+)(\?|$)/;
    const { videoId } = regeExp.exec(url)?.groups || {};
    return videoId ? `//player.vimeo.com/video/${videoId}` : '';
}
/**
 * Vk-видео не будет загружаться на localhost'е по причине корсов.
 * Детектим локалхост и проксируем все ассеты через прокси в вебпаке.
 */
function updateUrlForLocalhost(url) {
    const { host, origin } = window.location;
    if (host === 'localhost') {
        return `${origin}/anyUrlProxy/${url}`;
    }
    return url;
}
//# sourceMappingURL=VideoPlayer.js.map