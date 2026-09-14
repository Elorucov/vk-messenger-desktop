import * as TextChunk from '../../core/model/TextChunk';
export function fromApiConvoBanner(apiBanner) {
    return {
        icon: apiBanner.icon ?? '',
        name: apiBanner.name,
        title: apiBanner.title ?? '',
        chunks: TextChunk.fromServerText(apiBanner.text),
        canHide: apiBanner.can_hide ?? true,
        buttons: (apiBanner.buttons || []).map((button) => {
            return {
                callbackData: button?.callback_data ?? '',
                mode: button.layout,
                appearance: fromApiConvoBannerButtonAppearance(button.style),
                link: button?.link ?? '',
                text: button.text,
                hideOnAction: !!button.hide_on_action,
                type: button.type,
            };
        }),
        cardInfo: apiBanner.card_info,
        text: apiBanner.text ?? '',
    };
}
function fromApiConvoBannerButtonAppearance(buttonStyle) {
    if (buttonStyle === 'destructive') {
        return 'negative';
    }
    if (buttonStyle === 'regular') {
        return 'accent';
    }
    return buttonStyle;
}
//# sourceMappingURL=ConvoBannerConverter.js.map