import { useState, useCallback } from 'react';
import { checkImageDimensions } from '../utils';
export const useFileReader = ({ $inputEl, onSubmit }) => {
    const [fileData, setFileData] = useState({});
    const [error, setError] = useState(false);
    const onClick = useCallback(() => {
        if ($inputEl.current) {
            $inputEl.current.onchange = (ev) => {
                setError(false);
                const target = ev.target;
                const file = target.files?.[0];
                if (!file) {
                    return;
                }
                const fileReader = new FileReader();
                fileReader.onload = () => {
                    const image = new Image();
                    image.onload = () => {
                        if (!checkImageDimensions(image)) {
                            setError(true);
                            return;
                        }
                        setFileData({ file, image });
                        if (onSubmit) {
                            onSubmit(file);
                        }
                    };
                    image.onerror = () => setError(true);
                    image.src = fileReader.result;
                };
                fileReader.onerror = () => setError(true);
                fileReader.readAsDataURL(file);
            };
            $inputEl.current.click();
        }
    }, []);
    return {
        error,
        fileData,
        onClick,
    };
};
//# sourceMappingURL=useFileReader.js.map