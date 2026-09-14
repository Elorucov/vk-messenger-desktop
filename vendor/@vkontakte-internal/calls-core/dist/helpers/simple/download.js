export const download = (url, filename, blank = false) => {
    const link = document.createElement('a');
    if (blank) {
        link.target = '_blank';
    }
    link.download = filename;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    link.remove();
};
//# sourceMappingURL=download.js.map