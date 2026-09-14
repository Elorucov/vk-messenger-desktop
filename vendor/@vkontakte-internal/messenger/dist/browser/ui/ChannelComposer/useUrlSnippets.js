import * as Attach from '../../../core/model/Attach';
import * as TextChunk from '../../../core/model/TextChunk';
import { useEffect, useMemo, useRef } from 'react';
import { useDebounced, useDispatch, useStoreState } from '../../hooks/misc';
const DEBOUNCED_INPUT_TEXT_DELAY = 500;
export const useUrlSnippets = ({ text, attaches, initialText, onAttachesAdd, }) => {
    const urlSnippetsCache = useStoreState('urlSnippetsCache');
    const dispatch = useDispatch();
    const { debounced: debouncedText } = useDebounced(text, DEBOUNCED_INPUT_TEXT_DELAY);
    const hasLinkAttach = !!attaches.link;
    const attachIds = useMemo(() => new Set(Attach.ids(attaches)), [attaches]);
    const $ignoreUrls = useRef(new Set());
    useEffect(() => {
        const initialUrls = getUrlsFromText(initialText);
        $ignoreUrls.current = initialUrls;
    }, [initialText]);
    useEffect(() => {
        const urlsSet = getUrlsFromText(debouncedText);
        $ignoreUrls.current.forEach((url, _, self) => {
            if (urlsSet.has(url)) {
                urlsSet.delete(url);
            }
            else {
                self.delete(url);
            }
        });
        const urls = Array.from(urlsSet.values());
        const [urlsToFetch, attachesToAdd] = urls.reduce((acc, url) => {
            const attach = urlSnippetsCache.get(url);
            if (!attach) {
                acc[0].push(url);
                return acc;
            }
            const attachId = Attach.ids(Attach.fromAddableAttach(attach))[0] || '';
            if (attachIds.has(attachId)) {
                return acc;
            }
            if ((attach.kind === 'Link' && !hasLinkAttach && !acc[1].link) ||
                attach.kind !== 'Link') {
                Attach.addAttach(acc[1], Attach.fromAddableAttach(attach));
            }
            return acc;
        }, [[], {}]);
        if (urlsToFetch.length !== 0) {
            dispatch({
                type: 'UserLoadedUrlSnippets',
                urls: urlsToFetch,
            });
            return;
        }
        onAttachesAdd(attachesToAdd);
        /**
         * Зависим только от debouncedText и urlSnippetsCache,
         * так как хотим отслеживать только изменение текста и обновление информации о ссылках в кеше.
         */
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedText, urlSnippetsCache]);
    return;
};
const getUrlsFromText = (text) => new Set(TextChunk.fromClientText(text)
    .filter((chunk) => chunk.kind === 'Url')
    .map(({ href }) => href));
//# sourceMappingURL=useUrlSnippets.js.map