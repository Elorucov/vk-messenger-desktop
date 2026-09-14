import { MiniAppEvents } from '../../constants/events.js';

const MiniAppEventsDryRunProhibited=[MiniAppEvents.Init,MiniAppEvents.SetSupportedHandlers,MiniAppEvents.ActionDone,MiniAppEvents.Alert,MiniAppEvents.AuthByExchangeToken,MiniAppEvents.CallApiMethod,MiniAppEvents.CheckAllowedScopes,MiniAppEvents.Close,MiniAppEvents.CreateHash,MiniAppEvents.GetAuthToken,MiniAppEvents.GetClientVersion,MiniAppEvents.GetConfig,MiniAppEvents.GetEmail,MiniAppEvents.GetGeodata,MiniAppEvents.GetGroupInfo,MiniAppEvents.GetLaunchParams,MiniAppEvents.GetPhoneNumber,MiniAppEvents.GetSilentToken,MiniAppEvents.GetUserInfo,MiniAppEvents.ResizeWindow,MiniAppEvents.Scroll,MiniAppEvents.ShowSlidesSheet,MiniAppEvents.StorageGet,MiniAppEvents.StorageGetKeys,MiniAppEvents.TrackEvent,MiniAppEvents.Translate];

export { MiniAppEventsDryRunProhibited };
