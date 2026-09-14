const initialConfig = {
    bufferLength: 4096,
    encoderApplication: 2049,
    encoderFrameSize: 20,
    encoderSampleRate: 48000,
    maxFramesPerPage: 40,
    mediaTrackConstraints: true,
    monitorGain: 0,
    numberOfChannels: 1,
    recordingGain: 1,
    resampleQuality: 3,
    streamPages: true,
    wavBitDepth: 16,
    /**
     * При попытке использовать здесь просто строку, а не ESM модуль на vkcom
     * возникает ошибка при загрузке страницы: https://github.com/webpack/webpack/issues/6475
     */
    encoderPath: new URL('opus-recorder/dist/encoderWorker.min.js', import.meta.url).href,
    reuseWorker: true,
};
const FFT_SIZE = 64;
const MIN_VOLUME = 0.1;
export class Recorder {
    logger;
    sourceNode;
    state = 'inactive';
    config = initialConfig;
    audioContext;
    monitorGainNode;
    recordingGainNode;
    initialize;
    encoder;
    encoderNode;
    stream;
    recordedPages = [];
    totalLength = 0;
    constructor(config = {}, logger) {
        this.logger = logger;
        this.config = { ...initialConfig, ...config };
        try {
            this.audioContext = new (window.AudioContext ||
                window.webkitAudioContext)();
            /**
             * В электроне по умолчанию state === 'running'
             * Дополнительно убираем "The AudioContext was not allowed to start."
             */
            this.suspendAudioContext.call(this);
            /**
             * На некоторых устройствах (боты в Firefox) воспроизводится ошибка
             * TypeError: undefined is not a constructor
             * ME-45532
             *
             * Шумит в Sentry - ловим и обрабатываем
             */
        }
        catch (e) {
            this.logger.info(`[VoiceRecorder]: new AudioContext ERROR: ${e}`);
            this.audioContext = {
                createGain() { },
            };
        }
        this.monitorGainNode = this.audioContext.createGain();
        if (this.monitorGainNode && this.audioContext) {
            this.monitorGainNode.gain.setTargetAtTime(this.config.monitorGain, this.audioContext.currentTime, 0.01);
        }
        this.recordingGainNode = this.audioContext.createGain();
        if (this.recordingGainNode && this.audioContext) {
            this.recordingGainNode.gain.setTargetAtTime(this.config.recordingGain, this.audioContext.currentTime, 0.01);
        }
        this.initialize = this.initWorklet().then(() => this.initEncoder());
    }
    initWorklet() {
        if (this.audioContext.audioWorklet) {
            return this.audioContext.audioWorklet.addModule(this.config.encoderPath);
        }
        return Promise.resolve();
    }
    initEncoder() {
        if (!this.audioContext.audioWorklet) {
            return;
        }
        try {
            this.encoderNode = new AudioWorkletNode(this.audioContext, 'encoder-worklet', { numberOfOutputs: 0 });
            this.encoder = this.encoderNode.port;
        }
        catch (e) {
            this.logger.info(`[VoiceRecorder]: new AudioWorkletNode ERROR: ${e}`);
        }
    }
    storePage(page) {
        this.recordedPages.push(page);
        this.totalLength += page.length;
    }
    streamPage(page) {
        this.onDataAvailable(page);
    }
    clearStream() {
        if (this.stream && this.stream.getTracks) {
            this.stream.getTracks().forEach((track) => track.stop());
        }
    }
    suspendAudioContext() {
        if (this.audioContext.state !== 'suspended') {
            try {
                this.audioContext.suspend();
            }
            catch { }
        }
    }
    finish() {
        if (!this.config.streamPages) {
            const outputData = new Uint8Array(this.totalLength);
            this.recordedPages.reduce((offset, page) => {
                outputData.set(page, offset);
                return offset + page.length;
            }, 0);
            this.onDataAvailable(outputData);
            this.recordedPages = [];
            this.totalLength = 0;
        }
        this.onStop();
    }
    initWorker() {
        const onPage = (this.config.streamPages ? this.streamPage : this.storePage).bind(this);
        this.recordedPages = [];
        this.totalLength = 0;
        return new Promise((resolve) => {
            const callback = ({ data }) => {
                switch (data['message']) {
                    case 'ready':
                        resolve();
                        break;
                    case 'page':
                        onPage(data['page']);
                        break;
                    case 'done':
                        this.encoder?.removeEventListener('message', callback);
                        this.finish();
                        break;
                    default:
                        break;
                }
            };
            this.encoder?.addEventListener('message', callback);
            if (this.encoder?.start) {
                this.encoder.start();
            }
            this.encoder?.postMessage(Object.assign({
                command: 'init',
                originalSampleRate: this.audioContext.sampleRate,
                wavSampleRate: this.audioContext.sampleRate,
            }, this.config));
        });
    }
    initSourceNode() {
        return window.navigator.mediaDevices
            .getUserMedia({ audio: this.config.mediaTrackConstraints })
            .then((stream) => {
            this.stream = stream;
            this.sourceNode = this.audioContext.createMediaStreamSource(stream);
        });
    }
    start() {
        if (this.state === 'inactive') {
            this.state = 'loading';
            return this.audioContext
                .resume()
                .then(() => this.initialize)
                .then(() => Promise.all([this.initSourceNode(), this.initWorker()]))
                .then(() => {
                if (this.sourceNode && this.encoderNode) {
                    this.state = 'recording';
                    this.encoder?.postMessage({ command: 'getHeaderPages' });
                    this.sourceNode?.connect(this.monitorGainNode);
                    this.sourceNode?.connect(this.recordingGainNode);
                    this.monitorGainNode.connect(this.audioContext.destination);
                    this.recordingGainNode.connect(this.encoderNode);
                    this.onStart();
                }
                else {
                    this.state = 'inactive';
                }
            })
                .catch((error) => {
                this.suspendAudioContext();
                this.state = 'inactive';
                throw error;
            });
        }
        return Promise.resolve();
    }
    pause() {
        if (this.state === 'recording') {
            this.state = 'paused';
            this.recordingGainNode.disconnect();
            return new Promise((resolve) => {
                const callback = ({ data }) => {
                    if (data['message'] === 'flushed') {
                        this.encoder?.removeEventListener('message', callback);
                        this.onPause();
                        resolve();
                    }
                };
                this.encoder?.addEventListener('message', callback);
                this.encoder?.start();
                this.encoder?.postMessage({ command: 'flush' });
            });
        }
        this.onPause();
        return Promise.resolve();
    }
    resume() {
        if (this.state === 'paused' && this.encoderNode) {
            this.state = 'recording';
            this.recordingGainNode.connect(this.encoderNode);
            this.onResume();
        }
    }
    stop() {
        this.resume();
        if (this.state === 'recording') {
            this.state = 'inactive';
            this.monitorGainNode.disconnect();
            this.clearStream();
            this.suspendAudioContext();
            return new Promise((resolve) => {
                const callback = ({ data }) => {
                    if (data['message'] === 'done') {
                        this.encoder?.removeEventListener('message', callback);
                        resolve();
                    }
                };
                this.encoder?.addEventListener('message', callback);
                this.encoder?.start();
                this.encoder?.postMessage({ command: 'done' });
            });
        }
        this.onStop();
        return Promise.resolve();
    }
    subscribeToAnalyzer(cb) {
        const source = this.sourceNode;
        const analyser = source.context.createAnalyser();
        analyser.fftSize = FFT_SIZE;
        source.connect(analyser);
        const dataLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(dataLength);
        let isPaused = false;
        function tick() {
            if (isPaused) {
                return;
            }
            analyser.getByteFrequencyData(dataArray);
            const sum = dataArray.reduce((acc, current) => acc + current, 0);
            const mean = sum / dataLength;
            const volume = mean / 255;
            cb(volume < MIN_VOLUME ? 0 : volume);
            requestAnimationFrame(tick);
        }
        tick();
        return [
            () => {
                isPaused = true;
            },
            () => {
                isPaused = false;
                tick();
            },
        ];
    }
    /**
     * Освободить ресурсы
     */
    dispose() {
        // пока здесь нечего подчищать
    }
    /**
     * Метод, позволяющий считывать Uint8Array текущей записи
     */
    onDataAvailable = function (_) { };
    onStart = function () { };
    onPause = function () { };
    onResume = function () { };
    onStop = function () { };
}
//# sourceMappingURL=Recorder.js.map