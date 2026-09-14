/**
 * Контроллер для MediaSession, который позволяет иметь несколько разных экземпляров {@link IMediaSessionObject}
 *
 * В каждый момент времени может быть активен лишь один экземпляр {@link IMediaSessionObject},
 * который последним был установлен через {@link MediaSessionController.setCurrent}
 *
 * Изоморфен
 */
export class MediaSessionController {
    constructor() {
        if (typeof window === 'undefined' || !('mediaSession' in window.navigator)) {
            return;
        }
        const native = window.navigator.mediaSession;
        this.#native = native;
        if ('setCameraActive' in native) {
            // @ts-expect-error TS2345: togglecamera нет в списке событий MediaSession
            this.#supportedActions.push('togglecamera');
        }
        if ('setMicrophoneActive' in native) {
            // @ts-expect-error TS2345: togglemicrophone нет в списке событий MediaSession
            this.#supportedActions.push('togglemicrophone');
        }
    }
    #native = null;
    #supportedActions = [
        'nexttrack',
        'pause',
        'play',
        'previoustrack',
        'seekbackward',
        'seekforward',
        'seekto',
        'skipad',
        'stop',
        // @ts-expect-error TS2322: "hangup" нет в списке MediaSessionAction.
        'hangup',
        // @ts-expect-error TS2322: "enterpictureinpicture" нет в списке MediaSessionAction.
        'enterpictureinpicture',
    ];
    #current = null;
    /**
     * Текущий активный экземпляр {@link IMediaSessionObject}
     */
    get current() {
        return this.#current;
    }
    /**
     * Устанавливает экземпляр {@link IMediaSessionObject} в качестве текущего активного
     */
    setCurrent(session) {
        this.#current?.events.off('change', this.#handleChangeCurrentData);
        this.#current = session;
        session.events.on('change', this.#handleChangeCurrentData);
        this.#applyNative(session);
    }
    #unsupportedActions = new Set();
    #setActionHandler(action, handler) {
        const native = this.#native;
        if (!native || this.#unsupportedActions.has(action)) {
            return;
        }
        try {
            native.setActionHandler(action, handler);
        }
        catch (e) {
            /**
             * Могут быть action недоступные в браузере
             * В таких ситуация браузер выбрасывает исключение
             * Нам достаточно проигнорировать это
             */
            if (handler) {
                console.warn(e);
            }
            this.#unsupportedActions.add(action);
        }
    }
    #applyNative(session) {
        const native = this.#native;
        if (!native) {
            return;
        }
        native.metadata = session.metadata;
        native.playbackState = session.playbackState;
        native.setPositionState(session.positionState);
        if ('setCameraActive' in native) {
            // @ts-expect-error TS18046: setCameraActive нет в тайпингах
            native.setCameraActive(session.cameraActive);
        }
        if ('setMicrophoneActive' in native) {
            // @ts-expect-error TS18046: setMicrophoneActive нет в тайпингах
            native.setMicrophoneActive(session.microphoneActive);
        }
        for (const action of this.#supportedActions) {
            const handler = session.actionHandlers.get(action) ?? null;
            this.#setActionHandler(action, handler);
        }
    }
    #handleChangeCurrentData = ({ diff: { metadata, playbackState, actionHandler, positionState, cameraActive, microphoneActive }, }) => {
        const native = this.#native;
        if (!native) {
            return;
        }
        if (typeof metadata !== 'undefined') {
            native.metadata = metadata;
        }
        if (playbackState) {
            native.playbackState = playbackState;
        }
        if (actionHandler) {
            this.#setActionHandler(actionHandler[0], actionHandler[1]);
        }
        if (typeof positionState !== 'undefined') {
            native.setPositionState(positionState ?? undefined);
        }
        if (typeof cameraActive !== 'undefined') {
            if ('setCameraActive' in native) {
                // @ts-expect-error TS18046: setCameraActive нет в тайпингах
                native.setCameraActive(cameraActive);
            }
        }
        if (typeof microphoneActive !== 'undefined') {
            if ('setMicrophoneActive' in native) {
                // @ts-expect-error TS18046: setMicrophoneActive нет в тайпингах
                native.setMicrophoneActive(microphoneActive);
            }
        }
    };
}
//# sourceMappingURL=MediaSessionController.js.map