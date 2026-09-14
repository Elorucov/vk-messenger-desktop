import { IMAGE_TYPES } from '../../data/env/Uploader';
/**
 * Функция проходит по файлам и папкам через драг-н-дроп или буфер обмена,
 * вытаскивает оттуда всё и возвращает как файлы
 */
export async function getFilesFromDataTransferItems(dataTransferItems) {
    const files = [];
    await Promise.all(Array.from(dataTransferItems).map(async (item) => {
        if (item.kind !== 'file') {
            return;
        }
        const entry = item.webkitGetAsEntry();
        if (entry) {
            const entryContent = await readEntryContentAsync(entry, item);
            files.push(...entryContent);
            return;
        }
        const file = item.getAsFile();
        if (file) {
            files.push(file);
        }
    }));
    function readEntryContentAsync(entry, item) {
        return new Promise((resolve) => {
            let reading = 0;
            const contents = [];
            readEntry(entry);
            function readEntry(entry) {
                if (isFile(entry)) {
                    reading++;
                    const itemFile = item.getAsFile();
                    entry.file((file) => {
                        reading--;
                        contents.push(file);
                        if (reading === 0) {
                            resolve(contents);
                        }
                    }, () => {
                        if (itemFile) {
                            reading--;
                            contents.push(itemFile);
                        }
                        if (reading === 0) {
                            resolve(contents);
                        }
                    });
                    /**
                     * Рекурсивный проход по директориям с файлами
                     */
                }
                else if (isDirectory(entry)) {
                    readReaderContent(entry.createReader());
                }
            }
            function readReaderContent(reader) {
                reading++;
                reader.readEntries((entries) => {
                    reading--;
                    for (const entry of entries) {
                        readEntry(entry);
                    }
                    if (reading === 0) {
                        resolve(contents);
                    }
                });
            }
        });
    }
    return files.map(addLostVideoType);
}
// Есть баг с .mov & .3gp расширением, они не всегда имеют тип
function addLostVideoType(file) {
    if (file.type) {
        return file;
    }
    const ext = file.name.split('.').pop();
    if (!ext) {
        return file;
    }
    let type = '';
    switch (ext.toLowerCase()) {
        case 'mov':
            type = 'video/quicktime';
            break;
        case '3gp':
            type = 'video/3gpp';
            break;
        default:
            break;
    }
    if (type) {
        return new File([file], file.name, { type });
    }
    return file;
}
function isDirectory(entry) {
    return entry.isDirectory;
}
function isFile(entry) {
    return entry.isFile;
}
export function blobToImageUrl({ blob }) {
    return URL.createObjectURL(blob);
}
export function getImageSizeByFile(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);
        img.onload = () => {
            resolve({ width: img.width, height: img.height });
            URL.revokeObjectURL(objectUrl);
            img.remove();
        };
        img.onerror = (event) => {
            reject(event);
            img.remove();
        };
        img.src = objectUrl;
    });
}
export function isImageLoaded(src) {
    const image = new Image();
    image.src = src;
    return image.complete || image.width + image.height > 0;
}
/**
 * Возвращает Data URL картинки. Для GIF вернёт первый кадр в формате PNG
 * Полезно для аватарок, куда можно загрузить GIF, но будет использоваться только первый кадр
 */
export function fileToStaticImageUrl(file) {
    return new Promise((resolve, reject) => {
        if (!IMAGE_TYPES.includes(file.type)) {
            return reject();
        }
        if (file.type !== 'image/gif') {
            return resolve(blobToImageUrl({ blob: file }));
        }
        const img = new Image();
        img.onload = async () => {
            const { width, height } = await getImageSizeByFile(file);
            const canvas = document.createElement('canvas');
            canvas.height = height;
            canvas.width = width;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                return reject();
            }
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png', 1));
            canvas.remove();
            img.remove();
        };
        img.onerror = () => {
            reject();
            img.remove();
        };
        img.src = blobToImageUrl({ blob: file });
    });
}
export function getFilenameFromURL(url) {
    try {
        const parsedUrl = new URL(url);
        return parsedUrl.pathname.split('/').pop();
    }
    catch { }
    return undefined;
}
export async function downloadImage(imageSrc) {
    const image = await fetch(imageSrc);
    const imageBlog = await image.blob();
    const imageURL = URL.createObjectURL(imageBlog);
    const link = document.createElement('a');
    link.href = imageURL;
    link.download = getFilenameFromURL(imageSrc) || 'download.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
//# sourceMappingURL=files.js.map