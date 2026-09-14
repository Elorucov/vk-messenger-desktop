export const timeFormat = new Intl.DateTimeFormat('ru-RU', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
});
export const isSameDate = (a, b) => {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
};
//# sourceMappingURL=utils.js.map