import { useRef, useEffect } from 'react';
import SiriWave from 'siriwave';
import { usePixelDensity } from '../../hooks/misc';
export class Wave {
    volumeRange;
    maxVisibleAmp;
    wave;
    cache = null;
    constructor(volumeRange, maxVisibleAmp, waveParams) {
        this.volumeRange = volumeRange;
        this.maxVisibleAmp = maxVisibleAmp;
        this.wave = new SiriWave(waveParams);
    }
    start() {
        this.wave.start();
    }
    stop() {
        this.wave.stop();
    }
    dispose() {
        this.wave.stop();
        this.wave.dispose();
    }
    update(analyser) {
        if (!this.cache) {
            this.cache = new Uint8Array(analyser.frequencyBinCount);
        }
        analyser.getByteFrequencyData(this.cache);
        const volume = Wave.getAverageVolume(this.cache);
        const amp = this.getAlignedVolume(volume) * 10;
        this.wave.setAmplitude(amp > this.maxVisibleAmp ? this.maxVisibleAmp : amp);
    }
    getAlignedVolume(volume) {
        const { min, max } = this.volumeRange;
        volume = volume < min ? min : volume > max ? max : volume;
        return (volume - min) / (max - min);
    }
    static getAverageVolume(data) {
        return data.reduce((acc, cur) => acc + cur, 0) / data.length;
    }
}
export const useMarusiaWave = () => {
    const waveRef = useRef();
    const containerRef = useRef(null);
    const isDense = usePixelDensity();
    useEffect(() => {
        const container = containerRef.current;
        if (!container) {
            return;
        }
        const size = isDense ? 36 : 42;
        waveRef.current = new Wave({
            min: 0,
            max: 128,
        }, 1.2, {
            container,
            width: size,
            height: size,
            amplitude: 0.2,
            autostart: false,
            cover: true,
            curveDefinition: [
                {
                    attenuation: 1,
                    lineWidth: isDense ? 4 : 2,
                    opacity: 1,
                },
            ],
        });
        return () => {
            waveRef.current?.dispose();
        };
    }, [isDense]);
    return {
        waveRef,
        containerRef,
        isDense,
    };
};
//# sourceMappingURL=useMarusiaWave.js.map