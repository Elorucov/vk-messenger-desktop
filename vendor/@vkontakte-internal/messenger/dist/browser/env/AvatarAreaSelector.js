import React from 'react';
import { createRoot } from 'react-dom/client';
import { ImageAreaSelectorApp } from '../ui/ImageAreaSelectorApp/ImageAreaSelectorApp';
export class AvatarAreaSelector {
    node = document.createElement('div');
    root;
    store;
    env;
    constructor() {
        document.body.append(this.node);
        this.root = createRoot(this.node, {
            identifierPrefix: 'me-avatar-area-selector',
        });
    }
    setEnv(env, store) {
        this.env = env;
        this.store = store;
    }
    open(params) {
        return new Promise((resolve, reject) => {
            if (!this.env || !this.store) {
                return reject('Для AvatarAreaSelector нужны store и env');
            }
            const handleClose = () => {
                resolve(null);
                this.root.unmount();
            };
            const handleSubmit = (blob) => {
                resolve(blob);
                this.root.unmount();
            };
            this.root.render(React.createElement(ImageAreaSelectorApp, { env: this.env, store: this.store, viewportHeight: params.cropArea.height, viewportWidth: params.cropArea.width, src: params.imageSrc, mode: params.mode, onSubmit: handleSubmit, onClose: handleClose }));
        });
    }
    /**
     * Освободить ресурсы
     */
    dispose() {
        this.root.unmount();
        this.node.remove();
    }
}
//# sourceMappingURL=AvatarAreaSelector.js.map