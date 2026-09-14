import { ColorScheme } from '@vkontakte/vkui';
import { VK_API_VERSION, LOGIN_HOST } from '../../constants/index.js';
import { MiniAppIntegration, MiniAppBackButton, MiniAppAdaptivity } from '../../types/index.js';

const GroupActions={JOIN:"join",LEAVE:"leave"};const Scheme={BRIGHT_LIGHT:"bright_light",SPACE_GRAY:"space_gray"};const DefaultMiniAppProps={iframeProps:{},loginUrl:LOGIN_HOST,apiVersion:VK_API_VERSION,featureToggles:{},featureEnabled:()=>false,locale:"ru",config:{adaptivity:MiniAppAdaptivity.AUTO,backButton:MiniAppBackButton.CLOSE,integration:MiniAppIntegration.FULLSCREEN,appearance:ColorScheme.LIGHT,scrollTarget:document.documentElement}};

export { DefaultMiniAppProps, GroupActions, Scheme };
