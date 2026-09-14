export const formatCount = (count, options) => {
    const separator = options?.separator || '.';
    const maximumFractionDigits = options?.maximumFractionDigits ?? 1;
    const roundingMode = options?.roundingMode || undefined;
    const kLimit = options?.kLimit || 1000;
    const mLimit = options?.mLimit || 10e5;
    const bLimit = options?.bLimit || 10e8;
    // если есть конфиг локали, то берем информацию из него
    const locale = globalThis.langConfig?.locale || 'ru';
    const getFormattedCount = (countValue, sign) => {
        if (roundingMode === 'floor') {
            countValue =
                Math.floor(countValue * Math.pow(10, maximumFractionDigits)) / Math.pow(10, maximumFractionDigits);
        }
        let formattedCount = countValue.toFixed(maximumFractionDigits);
        return Number(formattedCount).toLocaleString(locale).replace(/\./, separator) + sign;
    };
    // Не обрабатываем числа в интервале (-kLimit, kLimit)
    if (count > -kLimit && count < kLimit) {
        return count.toLocaleString(locale);
    }
    const billions = count / bLimit;
    if (billions >= 1 || billions <= -1) {
        return getFormattedCount(count / 10e8, 'B');
    }
    const millions = count / mLimit;
    if (millions >= 1 || millions <= -1) {
        return getFormattedCount(count / 10e5, 'M');
    }
    const thousands = count / kLimit;
    if (thousands >= 1 || thousands <= -1) {
        return getFormattedCount(count / 1000, 'K');
    }
    return String(count);
};
//# sourceMappingURL=index.js.map