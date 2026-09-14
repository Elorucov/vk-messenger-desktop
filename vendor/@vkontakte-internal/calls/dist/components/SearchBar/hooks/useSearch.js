import { useState, useEffect, useRef } from 'react';
export const useSearch = ({ onSearchMovies }) => {
    const [text, setText] = useState('');
    const [lastText, setLastText] = useState(text);
    const timeoutRef = useRef(null);
    useEffect(() => {
        let ac;
        if (onSearchMovies && text.length > 2) {
            timeoutRef.current = setTimeout(() => {
                ac = new AbortController();
                onSearchMovies(text, ac.signal);
                setLastText(text);
            }, 500);
        }
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            ac?.abort();
        };
    }, [text, onSearchMovies]);
    return {
        text,
        lastText,
        setText,
    };
};
//# sourceMappingURL=useSearch.js.map