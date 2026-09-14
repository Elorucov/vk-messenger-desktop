export function applyRefValueMutation(ref, value) {
    if (!ref) {
        return;
    }
    if (typeof ref === 'function') {
        ref(value);
    }
    else {
        ref.current = value;
    }
}
