import { getImageSizeByBlob } from './utils';
export class UploadPhoto {
    constructor(config, progressCallback, signal) {
        this.validate = (file) => {
            if (this.signal?.aborted) {
                return Promise.reject();
            }
            const { constraints, allowedTypes } = this.config;
            const isAllowedExtension = allowedTypes?.some(function (type) {
                return type === '*' || type === file.type;
            });
            if (!isAllowedExtension) {
                return Promise.reject({
                    code: 2 /* IUploadPhotoErrorCodes.NOT_ALLOWED_EXTENSION */,
                });
            }
            if (!constraints) {
                return Promise.resolve(null);
            }
            return getImageSizeByBlob(file)
                .then((sizes) => {
                if (this.signal?.aborted) {
                    return Promise.reject();
                }
                const { maxWidth, minWidth, maxHeight, minHeight, maxAspectRatio, minAspectRatio } = constraints;
                const [width, height] = sizes;
                const ratio = width / height;
                if (width > maxWidth || height > maxHeight) {
                    return Promise.reject({
                        code: 4 /* IUploadPhotoErrorCodes.IMAGE_TOO_BIG */,
                    });
                }
                if (width < minWidth || height < minHeight) {
                    return Promise.reject({
                        code: 3 /* IUploadPhotoErrorCodes.IMAGE_TOO_SMALL */,
                    });
                }
                if (minAspectRatio && minAspectRatio > ratio) {
                    return Promise.reject({
                        code: 5 /* IUploadPhotoErrorCodes.BAD_ASPECT_RATIO */,
                    });
                }
                if (maxAspectRatio && ratio > maxAspectRatio) {
                    return Promise.reject({
                        code: 5 /* IUploadPhotoErrorCodes.BAD_ASPECT_RATIO */,
                    });
                }
                return Promise.resolve(null);
            })
                .catch(function (error) {
                if (error && error.text && error.code) {
                    return Promise.reject(error);
                }
                return Promise.reject({
                    code: 0 /* IUploadPhotoErrorCodes.UNKNOWN */,
                });
            });
        };
        this.upload = (file, uploadURL, fieldName = 'file') => {
            return this.validate(file).then(() => {
                if (this.signal?.aborted) {
                    return Promise.reject();
                }
                return new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    const data = new FormData();
                    data.append(fieldName, file);
                    xhr.open('POST', uploadURL || this.config.url, true);
                    xhr.onreadystatechange = () => {
                        if (xhr.readyState !== XMLHttpRequest.DONE || xhr.status !== 200) {
                            return;
                        }
                        let data = undefined;
                        try {
                            if (xhr.responseText) {
                                data = JSON.parse(xhr.responseText);
                            }
                        }
                        catch (e) {
                            reject({
                                code: 0 /* IUploadPhotoErrorCodes.UNKNOWN */,
                            });
                        }
                        if (data) {
                            resolve(data);
                        }
                        else {
                            reject({
                                code: 0 /* IUploadPhotoErrorCodes.UNKNOWN */,
                            });
                        }
                    };
                    xhr.onerror = () => {
                        reject({
                            code: 1 /* IUploadPhotoErrorCodes.UPLOAD */,
                        });
                    };
                    xhr.upload.onprogress = (e) => {
                        if (this.signal && this.signal.aborted) {
                            xhr.abort();
                        }
                        if (this.progressCallback) {
                            this.progressCallback(e.loaded, e.total);
                        }
                    };
                    xhr.send(data);
                });
            });
        };
        this.config = {
            allowedTypes: ['*'],
            ...config,
        };
        this.signal = signal;
        this.progressCallback = progressCallback;
    }
}
//# sourceMappingURL=uploadPhoto.js.map