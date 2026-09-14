import { isNonEmptyArray, isDev } from '../../core/utils/misc';
// чтобы избежать assertion используем эту ф-цию
// не может быть такого, что массив пуст, так как алгоритм используется для аттачей фотографий (видео) - то есть как минимум один аттач должен быть (это проверяется в компонентах отвечающих за рендер аттачей).
// второй кейс использования applyIsNonEmptyArrayValidation - использование в цепочках преобразования массива элементов (вызовы методов Array). Ни в одном из них мы не удаляем никаких элементов, то есть кол-во элементов остаётся постоянным.
// но на случай апокалипсиса в computeAttachePhotosLayout есть try/catch
function applyIsNonEmptyArrayValidation(array) {
    if (!isNonEmptyArray(array)) {
        if (isDev) {
            throw new Error('not an NonEmptyArray');
        }
        return [[]];
    }
    else {
        return array;
    }
}
/**
 * Масштабируем по допустимой ширине
 */
function scaleToWidth(width, images) {
    const totalImagesWidth = images.reduce((acc, image) => acc + image.width, 0);
    const ratio = width / totalImagesWidth;
    const scaledImages = images.map((image) => {
        const { height, width } = image;
        return { ...image, height: height * ratio, width: width * ratio };
    });
    return applyIsNonEmptyArrayValidation(scaledImages);
}
/**
 * Масштабируем по допустимой высоте
 */
function scaleToHeight(height, image) {
    const { height: imgHeight, width } = image;
    const ratio = height / imgHeight;
    return { ...image, height: height, width: width * ratio };
}
/**
 * Отдаёт диапазон значений от min до max с шагом step
 */
function getRange(min, max, step) {
    const range = [max];
    let nextValueInRange = min;
    do {
        nextValueInRange = range[range.length - 1] - max * step;
        if (nextValueInRange < min) {
            nextValueInRange = min;
        }
        range.push(nextValueInRange);
    } while (nextValueInRange !== min);
    return range;
}
/**
 * Отдаёт диапазон значений LayoutImageEdgeSizes для расчёта layout
 */
function getAllPossibleLayoutImageEdgeSizes(height, layoutImageEdgeSizes) {
    const { minHeight } = layoutImageEdgeSizes;
    const STEP = 0.05;
    const minHeightRange = getRange(minHeight, height, STEP);
    const allPossibleLayoutImageEdgeSizes = [];
    for (let i = 0; i < minHeightRange.length; i++) {
        const minH = minHeightRange[i];
        if (minH) {
            allPossibleLayoutImageEdgeSizes.push({
                minHeight: minH,
            });
        }
    }
    return allPossibleLayoutImageEdgeSizes;
}
/**
 * Отдаёт соотношение сторон, которое получилось для конкретного layout
 */
function getLayoutRatio(layout) {
    let height = 0;
    let width = 0;
    const row0 = layout[0];
    for (const img of row0) {
        width += img.width;
    }
    for (const row of layout) {
        if (row[0]) {
            height += row[0].height;
        }
    }
    return width / height;
}
/**
 * Отдаёт ближайшее допустимое соотношение относительно желаемого соотношения сторон preferredRatio
 */
function getClosestRatioInRange(preferredRatio, ratios) {
    let mostFitRatio = ratios[0];
    const ratiosSortedAscending = [...ratios, preferredRatio].sort((a, b) => a - b);
    const preferredRatioIndex = ratiosSortedAscending.findIndex((ratio) => ratio === preferredRatio);
    const closestLessRatio = ratiosSortedAscending[preferredRatioIndex - 1];
    const closestMoreRatio = ratiosSortedAscending[preferredRatioIndex + 1];
    if (!closestLessRatio && closestMoreRatio) {
        mostFitRatio = closestMoreRatio;
    }
    else if (!closestMoreRatio && closestLessRatio) {
        mostFitRatio = closestLessRatio;
    }
    else if (closestMoreRatio && closestLessRatio) {
        const moreDiff = closestMoreRatio / preferredRatio;
        const lessDiff = preferredRatio / closestLessRatio;
        if (moreDiff > lessDiff) {
            mostFitRatio = closestLessRatio;
        }
        else {
            mostFitRatio = closestMoreRatio;
        }
    }
    return mostFitRatio;
}
/**
 * Нормализует соотношения сторон изображений согласно допустимым значениям из avaliableRatios
 */
function normalizeImagesRatio(images, avaliableRatios) {
    return applyIsNonEmptyArrayValidation(images.map((img) => {
        const originalImgRatio = img.width / img.height;
        const normalizedRatio = getClosestRatioInRange(originalImgRatio, avaliableRatios);
        if (img.width > img.height) {
            return {
                ...img,
                width: normalizedRatio * img.height,
            };
        }
        else {
            return {
                ...img,
                height: img.width / normalizedRatio,
            };
        }
    }));
}
/**
 * Алгоритм создания layout
 */
function applyPhotoAttachesLayout(layoutWidth, { minHeight }, images) {
    return applyIsNonEmptyArrayValidation(images
        // распределяем изображения по рядам
        .reduceRight((acc, image) => {
        const lastRow = acc[acc.length - 1];
        const img = scaleToHeight(minHeight, image);
        // проверяем: можем ли мы добавить текущее изображение в крайний ряд
        const { width: imgWidth } = img;
        const rowWidth = lastRow
            ? lastRow.reduce((acc, img) => acc + img.width, 0)
            : 0;
        const commonWidth = imgWidth + rowWidth;
        // если ширина позволяет, то добавляем
        if (commonWidth <= layoutWidth) {
            lastRow ? lastRow.push(img) : acc.push([img]);
            // иначе создаём новый ряд и добавляем в него
        }
        else {
            acc.push([img]);
        }
        return acc;
    }, [])
        .reverse()
        .map((row) => row.reverse())
        // на этом этапе мы производим подгонку по ширине, чтобы изображения заполнили пробелы в своих рядах
        .map((row) => scaleToWidth(layoutWidth, applyIsNonEmptyArrayValidation(row))));
}
/**
 * Расчёт и выбор максимально подходящего по соотношению сторон layout
 */
export function computeAttachePhotosLayout(preferredRatio, layoutWidth, layoutImageEdgeSizes, images) {
    try {
        const ratios = [];
        const layouts = {};
        const avaliableRatios = [
            9 / 16,
            3 / 4,
            1,
            4 / 3,
            16 / 9,
        ];
        const layoutHeight = layoutWidth / preferredRatio;
        const sizes = getAllPossibleLayoutImageEdgeSizes(layoutHeight, layoutImageEdgeSizes);
        const normalizedImages = normalizeImagesRatio(images, avaliableRatios);
        for (const size of sizes) {
            const layout = applyLayoutRatioOptimization(applyPhotoAttachesLayout(layoutWidth, size, normalizedImages));
            const ratio = getLayoutRatio(layout);
            ratios.push(ratio);
            layouts[ratio] = layout;
        }
        const mostFitRatio = getClosestRatioInRange(preferredRatio, applyIsNonEmptyArrayValidation(ratios));
        const layout = mostFitRatio && layouts[mostFitRatio];
        return (layout ||
            applyPhotoAttachesLayout(layoutWidth, layoutImageEdgeSizes, images));
    }
    catch {
        return [images];
    }
}
// если это последнее фото - тоже "впихиваем в ряд" чтобы оно не создавало отдельный ряд и не портило пропорции
function applyMergeLastRowWithTheOnlyImage(layout) {
    const rowsCount = layout.length;
    const lastRow = applyIsNonEmptyArrayValidation(layout[layout.length - 1]);
    const isLastRowContainsTheOnlyImage = lastRow.length === 1;
    const MIN_ROWS_COUNT = 2;
    if (rowsCount <= MIN_ROWS_COUNT || !isLastRowContainsTheOnlyImage) {
        return layout;
    }
    const preLastRow = layout[layout.length - 2];
    if (!preLastRow) {
        return layout;
    }
    const width = preLastRow?.reduce((acc, img) => acc + img.width, 0);
    preLastRow.push(lastRow[0]);
    const preLastRowScaledByHeight = applyIsNonEmptyArrayValidation(preLastRow.map((img) => scaleToHeight(1, img)));
    layout[layout.length - 2] = scaleToWidth(width, preLastRowScaledByHeight);
    return applyIsNonEmptyArrayValidation(layout.splice(0, layout.length - 1));
}
function applyLayoutRatioOptimization(layout) {
    return applyMergeLastRowWithTheOnlyImage(layout);
}
//# sourceMappingURL=imagesLayout.js.map