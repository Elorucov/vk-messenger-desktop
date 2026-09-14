import { createContext, useContext } from 'react';
export const AvatarStackItemSizeContext = createContext(0);
export const AvatarStackItemSizeContextProvider = AvatarStackItemSizeContext.Provider;
export const useAvatarStackItemSizeContext = () => useContext(AvatarStackItemSizeContext);
//# sourceMappingURL=AvatarStackContext.js.map