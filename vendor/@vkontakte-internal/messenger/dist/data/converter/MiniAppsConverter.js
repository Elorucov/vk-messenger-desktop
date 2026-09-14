import * as Attach from '../../core/model/Attach';
export const fromApiPickerApp = (pickerApp) => {
    const { app } = pickerApp;
    if (!app) {
        return;
    }
    const id = Attach.resolveMiniAppId(app.id);
    return {
        id,
        title: app.title,
        webviewUrl: app.webview_url || '',
        icon75: app?.icon_75 || '',
        icon139: app?.icon_139,
        icon150: app?.icon_150,
    };
};
export const fromApiPickerApps = (pickerApps) => {
    return pickerApps
        .map((pickerApp) => {
        const { action_title, action_hash } = pickerApp;
        const app = fromApiPickerApp(pickerApp);
        if (!app) {
            return null;
        }
        return {
            actionTitle: action_title,
            actionHash: action_hash,
            app,
        };
    })
        .filter((payload) => payload !== null);
};
export const fromApiPickerList = (apiPickerList) => {
    const { send_widget, open_app } = apiPickerList;
    const pickerList = {
        apps: fromApiPickerApps(open_app),
        widgets: fromApiPickerApps(send_widget),
    };
    return pickerList;
};
//# sourceMappingURL=MiniAppsConverter.js.map