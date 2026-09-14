export const dataAttrKeyToDatasetKey = (dataAttr) => {
    return dataAttr
        .slice(5)
        .split('-')
        .map((word, i) => (i !== 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word))
        .join('');
};
//# sourceMappingURL=dataAttrKeyToDatasetKey.js.map