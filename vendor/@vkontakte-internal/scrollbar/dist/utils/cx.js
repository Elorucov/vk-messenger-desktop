export const cx = (...args) => {
    return args.filter(Boolean).join(' ');
};
