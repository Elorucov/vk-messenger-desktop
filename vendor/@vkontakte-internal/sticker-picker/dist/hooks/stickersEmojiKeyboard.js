import { useStore } from 'effector-react';
import { createContext, useContext } from 'react';
import { TabbarItemIndicator } from '../components/TabbarItem/TabbarItem';
import { $storeNewItemsCount } from '../model/stickers/storeNewItemsCount';
export const StickersEmojiKeyboardContext = createContext({});
export function useStickersEmojiKeyboard() {
    const stickersEmojiKeyboardContext = useContext(StickersEmojiKeyboardContext);
    const storeNewItemsCount = useStore($storeNewItemsCount);
    const shopIndicatorMode = storeNewItemsCount ? TabbarItemIndicator.DESTRUCTIVE : undefined;
    return {
        ...stickersEmojiKeyboardContext,
        shopIndicatorMode,
    };
}
//# sourceMappingURL=stickersEmojiKeyboard.js.map