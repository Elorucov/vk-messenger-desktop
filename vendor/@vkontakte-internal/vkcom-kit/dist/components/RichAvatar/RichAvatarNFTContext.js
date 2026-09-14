import { createContext, useContext } from 'react';
const RichAvatarNFTContext = createContext(false);
export const RichAvatarNFTContextProvider = RichAvatarNFTContext.Provider;
export const useRichAvatarNFTContext = () => useContext(RichAvatarNFTContext);
//# sourceMappingURL=RichAvatarNFTContext.js.map