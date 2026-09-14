import { useCommunityTemplates } from '../../hooks/misc';
import { useState } from 'react';
export const useTemplateModalForm = (templateId) => {
    const template = useCommunityTemplates()?.find((template) => template.id === templateId);
    const [name, setName] = useState(template?.name || '');
    const [text, setText] = useState(template?.text || '');
    const [isLoading, setIsLoading] = useState(false);
    return {
        template,
        name,
        text,
        setName,
        setText,
        isLoading,
        setIsLoading,
    };
};
//# sourceMappingURL=useTemplateModalForm.js.map